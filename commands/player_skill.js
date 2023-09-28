module.exports = {
    execute(server, player, data) {
        player.quest.sendDataToPlayers(data);
    }
}