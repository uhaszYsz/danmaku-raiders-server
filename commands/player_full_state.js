module.exports = {
    execute(server, player, data) {
        let room = player.getCurrentRoom();
        if (!room) return;
        // Data to be sent
        let stateData = {
            type: "player_full_state",
            player_id: player.id,
            state: data.state
        };
        // Send to everyone if id is -1
        if (data.player_id == -1) {
            player.sendDataToRoom(stateData, room);
        }
        // Otherwise, send only to the player with the given id
        else {
            let destPlayer = room.getPlayer(data.player_id);
            destPlayer?.sendData(stateData);
        }
    }
}