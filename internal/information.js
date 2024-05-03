// Purpose: Game information
// Created on: 5/2/24 @ 8:28 AM

// Copyright (c) 2024, PortalPlayer <email@portalplayer.xyz>
// Licensed under MIT <https://opensource.org/licenses/MIT>

const {existsSync} = require("fs")

const Client = require("./client")

let information = {
    "clientId": "1235352829053501470",
    "multiplayer": true,
    "consoleDumpName": "condump000.txt",
    "path": "",
    "dontAddBotsToTotal": false,
    "includeAllMaps": true,
    "engine": 1
}

module.exports.get = () => information

module.exports.load = name => {
    if (existsSync(`${Client.getRoot()}/games/${name}.json`)) {
        try {
            information = require(`${Client.getRoot()}/games/${name}.json`)
        } catch (error) {
            console.error("Failed to load game information:\n", error)
        }
    } else
        console.warn("Game information does not exist")
}

module.exports.getEngineName = () => {
    switch (information.engine) {
        case 0: return "GoldSrc"
        case 1: return "Source"
        case 2: return "Source 2"
        default: return "Unknown"
    }
}
