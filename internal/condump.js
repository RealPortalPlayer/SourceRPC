// Purpose: Console dump parser
// Created on: 5/3/24 @ 2:04 PM

// Copyright (c) 2024, PortalPlayer <email@portalplayer.xyz>
// Licensed under MIT <https://opensource.org/licenses/MIT>

const Information = require("./information")

/**
 * @param {string} condump
 * @returns {
 *     {
 *         hostname: string,
 *         secure: boolean,
 *         map: string,
 *         playerCount: number,
 *         botCount: number,
 *         totalPlayerCount: number,
 *         maxPlayers: number
 *     } | null
 * }
 */
module.exports.parse = condump => {
    const information = {}
    const returnObject = {}

    for (const line of condump.split("\n")) {
        if (line === "")
            break

        const keyValue = line.split(":")
        const key = keyValue[0].trim()

        keyValue.shift()

        information[key] = keyValue.join(":").substring(1).trim()
    }
    
    if (information.hostname == null)
        return null
    
    returnObject.hostname = information.hostname
    returnObject.secure = information.version.includes(" secure")
    returnObject.map = information.map.split(" ")[0]
    returnObject.playerCount = parseInt(information.players.split(" ")[0])
    returnObject.botCount = (condump.match(new RegExp("BOT", "g")) || []).length
    returnObject.totalPlayerCount = returnObject.playerCount
    
    if (!Information.get().dontAddBotsToTotal)
        returnObject.totalPlayerCount += returnObject.botCount
    
    returnObject.maxPlayers = parseInt(information.players.split("(")[1].split(" ")[0])
    return returnObject
}