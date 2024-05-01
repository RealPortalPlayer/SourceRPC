// Purpose: Main entry-point
// Created on: 5/1/24 @ 12:35 PM

// Copyright (c) 2024, PortalPlayer <email@portalplayer.xyz>
// Licensed under MIT <https://opensource.org/licenses/MIT>

const {existsSync, unlinkSync, readFileSync} = require("fs")

const settings = require("./settings.json")
const client = require("discord-rich-presence")("1235280159012032593")
const startedPlaying = Date.now()

const updatePresence = (state, details, hoverText) => {
    const data = {
        startTimestamp: startedPlaying,
        partySize: 0,
        partyMax: 0
    }
    
    if (state != null)
        data.state = state
    
    if (details != null)
        data.details = details
    
    if (hoverText != null) {
        data.largeImageText = hoverText
        data.smallImageText = hoverText
    }
    
    client.updatePresence(data)

}

if (!existsSync(settings.gamePath)) {
    console.error(`Path not found: ${settings.gamePath}`)
    process.exit(1)
}

client.on("connected", () => {
    console.log("Connected")
    
    let alreadySaid = false
    
    setInterval(() => {
        if (!alreadySaid)
            console.log("Waiting for console dump")
        
        alreadySaid = true
        
        if (!existsSync(`${settings.gamePath}/condump000.txt`))
            return
        
        alreadySaid = false

        console.log("Console dump found")

        const contents = readFileSync(`${settings.gamePath}/condump000.txt`).toString()

        unlinkSync(`${settings.gamePath}/condump000.txt`)

        if (!contents.includes("hostname:")) {
            console.log("State: Not connected")
            updatePresence(null, "Idling", "Not connected")
            return
        }

        const hostname = contents.split("\n")[0].substring(10)
        const secure = contents.includes(" secure")
        const map = contents.substring(contents.indexOf("map") + 3).trimStart().substring(2).split(" ")[0]
        const realPlayerCount = (contents.match(new RegExp("STEAM", "g")) || []).length
        const botCount = (contents.match(new RegExp("BOT", "g")) || []).length
        const maxPlayers = parseInt(contents.substring(contents.indexOf("players") + 10 + realPlayerCount.toString().length + 9 + botCount.toString().length + 7).split(" ")[0])

        console.log("State: Connected to server\n" +
                    `Hostname: ${hostname}\n` +
                    `VAC secured: ${secure}\n` +
                    `Map: ${map}\n` +
                    `Player count: ${realPlayerCount} player(s), ${botCount} bot(s) (${realPlayerCount + botCount}/${maxPlayers})`)
        updatePresence(`Playing on ${map}`, `${realPlayerCount + botCount}/${maxPlayers} players`, `${realPlayerCount} player(s), ${botCount} bot(s)`)
    }, 0)
})

console.log("Please wait...")