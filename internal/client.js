// Purpose: Rich Presence client
// Created on: 5/2/24 @ 8:30 AM

// Copyright (c) 2024, PortalPlayer <email@portalplayer.xyz>
// Licensed under MIT <https://opensource.org/licenses/MIT>

const Information = require("./information")

let client = null
let startedPlaying = null
let root = ""

module.exports.get = () => {
    if (client == null)
        client = require("discord-rich-presence")(Information.get().clientId)
    
    return client
}

module.exports.updatePresence = (state, details, hoverText) => {
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

    module.exports.get().updatePresence(data)
}

module.exports.setRoot = path => {
    root = path
}

module.exports.getRoot = () => root
