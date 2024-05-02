// Purpose: Main entry-point
// Created on: 5/1/24 @ 12:35 PM

// Copyright (c) 2024, PortalPlayer <email@portalplayer.xyz>
// Licensed under MIT <https://opensource.org/licenses/MIT>

const {existsSync, unlinkSync, readFileSync, readdirSync} = require("fs")

const settings = require("./settings.json")
const Information = require("./internal/information")
const Client = require("./internal/client")
const Maps = require("./internal/maps")

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

        const contents = readFileSync(`${fullPath}/${Information.get().consoleDumpName}`).toString()

        unlinkSync(`${fullPath}/${Information.get().consoleDumpName}`)

        if (!contents.includes("hostname:")) {
            console.log("State: Not connected")
            await Client.updatePresence(null, "Idling", "Not connected")
            return
        }

        // TODO: This is very fragile, find a better alternative
        const hostname = contents.split("\n")[0].substring(10)
        const secure = contents.includes(" secure")
        const map = contents.substring(contents.indexOf("map") + 3).trimStart().substring(2).split(" ")[0]
        const realPlayerCount = (contents.match(new RegExp("STEAM", "g")) || []).length
        const botCount = (contents.match(new RegExp("BOT", "g")) || []).length
        const maxPlayers = parseInt(contents.substring(contents.indexOf("players") + 10 + realPlayerCount.toString().length + 9 + botCount.toString().length + 7).split(" ")[0])

        console.log("State: Connected to server\n" +
                    `Hostname: ${hostname}\n` +
                    `VAC secured: ${secure}\n` +
                    `Map: ${Maps.get(map)}\n` +
                    `Map (Raw): ${map}\n` +
                    `Player count: ${realPlayerCount} player(s), ${botCount} bot(s) (${realPlayerCount + botCount}/${maxPlayers})`)
        await Client.updatePresence(`${realPlayerCount + (!Information.get().dontAddBotsToTotal ? botCount : 0)}/${maxPlayers} players`, `Playing on ${Maps.get(map)}`, `${realPlayerCount} player(s), ${botCount} bot(s)`)
    }, 0)
}

main()
