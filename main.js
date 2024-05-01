// Purpose: Main entry-point
// Created on: 5/1/24 @ 12:35 PM

// Copyright (c) 2024, PortalPlayer <email@portalplayer.xyz>
// Licensed under MIT <https://opensource.org/licenses/MIT>

const {existsSync, unlinkSync, readFileSync} = require("fs")

const settings = require("./settings.json")

if (!existsSync(settings.gamePath)) {
    console.error(`Path not found: ${settings.gamePath}`)
    process.exit(1)
}

while (true) {
    console.log("Waiting for console dump")
    
    while (!existsSync(`${settings.gamePath}/condump000.txt`))
        continue
    
    console.log("Console dump found")
    
    const contents = readFileSync(`${settings.gamePath}/condump000.txt`).toString()
    
    unlinkSync(`${settings.gamePath}/condump000.txt`)
    
    if (!contents.includes("hostname:")) {
        console.log("State: Not connected")
        // TODO: Update RPC
        continue
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
    
    // TODO: Update RPC
}