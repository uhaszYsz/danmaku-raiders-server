module.exports = {
    execute(server, player, data) {
        // Must be in a lobby
        if (!player.lobby)
            return player.sendError("You are not in a lobby!");
        player.sendData({
            type: "quest_list",
            quest_list: player.lobby.getAvailableQuests().map(quest => quest.getPreviewInfo())
        });
    }
}