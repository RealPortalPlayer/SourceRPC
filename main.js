// Purpose: Main entry-point
// Created on: 5/1/24 @ 12:35 PM

// Copyright (c) 2024, PortalPlayer <email@portalplayer.xyz>
// Licensed under MIT <https://opensource.org/licenses/MIT>

const {existsSync, unlinkSync} = require("fs")

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
    // TODO: Parse
    unlinkSync(`${settings.gamePath}/condump000.txt`)
}