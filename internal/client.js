// Purpose: Rich Presence client
// Created on: 5/2/24 @ 8:30 AM

// Copyright (c) 2024, PortalPlayer <email@portalplayer.xyz>
// Licensed under MIT <https://opensource.org/licenses/MIT>

const Information = require("./information")
const {Client} = require("discord-rpc")

let client = null
let startedPlaying = null
let root = ""

/**
 * @type {
 *     {
 *         startTimestamp: number,
 *         partySize: number,
 *         partyMax: number,
 *         largeImageKey: string,
 *         state: string|null|undefined,
 *         details: string|null|undefined,
 *         largeImageText: string|null|undefined,
 *         smallImageText: string|null|undefined
 *     } | null
 * }
 */
let lastPresence = null

module.exports.get = async () => {
    if (client == null) {
        client = new Client({
            transport: "ipc"
        })
        
        console.log("Please wait")
        
        await client.login({
            clientId: Information.get().clientId
        })
        
        console.log("Connected")
    }
    
    return client
}

module.exports.updatePresence = async (state, details, hoverText) => {
    if (startedPlaying == null)
        startedPlaying = Date.now()

    const data = {
        startTimestamp: startedPlaying,
        partySize: 0,
        partyMax: 0,
        largeImageKey: "game"
    }

    if (state != null && Information.get().multiplayer)
        data.state = state

    if (details != null)
        data.details = details

    if (hoverText != null && Information.get().multiplayer) {
        data.largeImageText = hoverText
        data.smallImageText = hoverText
    }
    
    if (lastPresence != null &&
        lastPresence.startTimestamp === data.startTimestamp &&
        lastPresence.partySize === data.partySize &&
        lastPresence.partyMax === data.partyMax &&
        lastPresence.largeImageKey === data.largeImageKey &&
        lastPresence.state === data.state &&
        lastPresence.details === data.details &&
        lastPresence.largeImageText === data.largeImageText &&
        lastPresence.smallImageText === data.smallImageText) {
        console.warn("Presence didn't changed, doing nothing")
        return
    }
    
    lastPresence = data

    await (await module.exports.get()).setActivity(data)
}

module.exports.setRoot = path => {
    root = path
}

module.exports.getRoot = () => root

module.exports.clearPresence = async () => {
    await client.clearActivity()
    
    lastPresence = null
}

module.exports.disconnect = async () => {
    await client.destroy()
}

module.exports.getPresence = () => {
    return lastPresence
}
