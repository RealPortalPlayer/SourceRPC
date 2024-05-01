// Purpose: Main entry-point
// Created on: 5/1/24 @ 12:35 PM

// Copyright (c) 2024, PortalPlayer <email@portalplayer.xyz>
// Licensed under MIT <https://opensource.org/licenses/MIT>

const {existsSync, unlinkSync, readFileSync} = require("fs")

const settings = require("./settings.json")
let name = settings.name

if (process.argv.length >= 3)
    name = process.argv[2].toLowerCase()

/**
 * @type {
 *     {
 *         clientId: string,
 *         multiplayer: boolean
 *         consoleDumpName: string,
 *         path: string,
 *         dontAddBotsToTotal: boolean
 *     }
 * }
 */
const information = require("./games/information.json")[name] ?? {
    "clientId": "1235352829053501470",
    "multiplayer": true,
    "consoleDumpName": "condump000.txt",
    "path": "",
    "dontAddBotsToTotal": false
}
const client = require("discord-rich-presence")(information.clientId)
let startedPlaying = null
const fullPath = `${settings.steamApplicationsRoot}/${information.path}`

/**
 * @type {{[key: string]: string|null|undefined}}
 */
let maps = {}

const updatePresence = (state, details, hoverText) => {
    if (startedPlaying == null)
        startedPlaying = Date.now()

    const data = {
        startTimestamp: startedPlaying,
        partySize: 0,
        partyMax: 0
    }
    
    if (state != null && information.multiplayer)
        data.state = state
    
    if (details != null)
        data.details = details
    
    if (hoverText != null && information.multiplayer) {
        data.largeImageText = hoverText
        data.smallImageText = hoverText
    }
    
    client.updatePresence(data)
}

if (!existsSync(fullPath)) {
    console.error(`Path not found: ${fullPath}`)
    process.exit(1)
}

if (existsSync(`${__dirname}/games/maps/${name}.json`)) {
    try {
        maps = require(`${__dirname}/games/maps/${name}.json`)
    } catch (error) {
        console.error("Failed to load list of maps:\n", error)
    }
} else
    console.warn("No pre-defined maps found")

client.on("connected", () => {
    console.log("Connected")
    
    let alreadySaid = false
    
    setInterval(() => {
        if (!alreadySaid)
            console.log("Waiting for console dump")
        
        alreadySaid = true
        
        if (!existsSync(`${fullPath}/${information.consoleDumpName}`))
            return
        
        alreadySaid = false

        console.log("Console dump found")

        const contents = readFileSync(`${fullPath}/${information.consoleDumpName}`).toString()

        unlinkSync(`${fullPath}/${information.consoleDumpName}`)

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
                    `Map: ${maps[map] != null ? maps[map] : map}\n` +
                    `Map (Raw): ${map}\n` +
                    `Player count: ${realPlayerCount} player(s), ${botCount} bot(s) (${realPlayerCount + botCount}/${maxPlayers})`)
        updatePresence(`${realPlayerCount + (!information.dontAddBotsToTotal ? botCount : 0)}/${maxPlayers} players`, `Playing on ${maps[map] != null ? maps[map] : map}`, `${realPlayerCount} player(s), ${botCount} bot(s)`)
    }, 0)
})

console.log("Please wait...")