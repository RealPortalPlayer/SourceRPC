// Purpose: Main entry-point
// Created on: 5/1/24 @ 12:35 PM

// Copyright (c) 2024, PortalPlayer <email@portalplayer.xyz>
// Licensed under MIT <https://opensource.org/licenses/MIT>

const {existsSync, unlinkSync, readFileSync, readdirSync} = require("fs")

const settings = require("./settings.json")
const Information = require("./internal/information")
const Client = require("./internal/client")
const Maps = require("./internal/maps")
const ConDump = require("./internal/condump")

const main = async () => {
    let name = settings.name

    if (process.argv.length >= 3)
        name = process.argv[2].toLowerCase()

    Client.setRoot(__dirname)
    Information.load(name)
    await Client.get()
    Maps.load(name)

    const fullPath = `${settings.steamApplicationsRoot}/${Information.get().path}`

    if (!existsSync(fullPath)) {
        console.error(`Path not found: ${fullPath}`)
        process.exit(1)
    }
    
    process.on("SIGUSR1", async () => {
        console.log("Signal detected: clearing presence")
        await Client.clearPresence()
    })
    
    let interval = null
    
    process.on("SIGINT", async () => {
        console.log("Disconnecting")
        clearInterval(interval)
        await Client.disconnect()
    })
    
    process.on("SIGINFO",  () => {
        const presenceData = Client.getPresence()
        
        if (presenceData == null) {
            console.error("There is no presence data")
            return
        }
        
        console.log("Presence data:\n" +
                    `Start Timestamp: ${presenceData.startTimestamp}\n` +
                    `Party Size: ${presenceData.partySize}\n` +
                    `Party Max: ${presenceData.partyMax}\n` +
                    `State: ${presenceData.state}\n` +
                    `Details: ${presenceData.details}\n` +
                    `Large Image Text: ${presenceData.largeImageText}\n` +
                    `Small Image Text: ${presenceData.smallImageText}`)
    })

    let alreadySaid = false
    
    interval = setInterval(async () => {
        if (!alreadySaid)
            console.log("Waiting for console dump")

        alreadySaid = true

        if (!existsSync(`${fullPath}/${Information.get().consoleDumpName}`))
            return

        alreadySaid = false

        console.log("Console dump found")

        let gameInformation

        {
            const contents = readFileSync(`${fullPath}/${Information.get().consoleDumpName}`).toString()

            unlinkSync(`${fullPath}/${Information.get().consoleDumpName}`)
            
            gameInformation = ConDump.parse(contents)
        }

        if (gameInformation == null) {
            console.log("State: Not connected")
            await Client.updatePresence(null, "Idling", "Not connected")
            return
        }
        
        console.log("State: Connected to server\n" +
                    `Hostname: ${gameInformation.hostname}\n` +
                    `VAC secured: ${gameInformation.secure}\n` +
                    `Map: ${Maps.get(gameInformation.map)}\n` +
                    `Map (Raw): ${gameInformation.map}\n` +
                    `Player count: ${gameInformation.playerCount} player(s), ${gameInformation.botCount} bot(s) (${gameInformation.totalPlayerCount}/${gameInformation.maxPlayers})`)
        await Client.updatePresence(`${gameInformation.totalPlayerCount}/${gameInformation.maxPlayers} players`, `Playing on ${Maps.get(gameInformation.map)}`, `${gameInformation.playerCount} player(s), ${gameInformation.botCount} bot(s)`)
    }, 0)
}

main()
