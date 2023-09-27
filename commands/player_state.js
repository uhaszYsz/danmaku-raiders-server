module.exports = {
    execute(server, player, data) {
        let room = player.getCurrentRoom();
        if (!room) return;
        player.sendDataToRoom({
            type: "player_state",
            player_id: player.id,
            state: data.state
        }, room);
    }
}