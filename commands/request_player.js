module.exports = {
    execute(server, player, data) {
        let room = player.getCurrentRoom();
        if (!room) return;
        // Get the destination player in the room
        let destPlayer = room.getPlayer(data.player_id);
        // Send a message to this player asking them to send the full state
        destPlayer?.sendData({
            type: "send_full_state",
            player_id: player.id
        });
    }
}