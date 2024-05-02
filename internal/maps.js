// Purpose: Maps handler
// Created on: 5/2/24 @ 8:32 AM

// Copyright (c) 2024, PortalPlayer <email@portalplayer.xyz>
// Licensed under MIT <https://opensource.org/licenses/MIT>

const {readdirSync, existsSync} = require("fs")

const Information = require("./information")
const Client = require("./client")

let maps = []

module.exports.load = name => {
    if (Information.get().includeAllMaps) {
        for (const file of readdirSync(`${Client.getRoot()}/games/maps`)) {
            try {
                const map = require(`${Client.getRoot()}/games/maps/${file}`)

                maps = {
                    ...maps,
                    ...map
                }
            } catch (error) {
                console.log("Failed to load list of maps:\n", error)
            }
        }
    } else if (existsSync(`${Client.getRoot()}/games/maps/${name}.json`)) {
        try {
            maps = require(`${Client.getRoot()}/games/maps/${name}.json`)
        } catch (error) {
            console.error("Failed to load list of maps:\n", error)
        }
    } else
        console.warn("No pre-defined maps found")
}

module.exports.get = name => maps[name] ?? name
