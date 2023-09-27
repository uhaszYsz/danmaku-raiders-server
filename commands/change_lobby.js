const Room = require("../classes/Room");
const Lobby = require("../classes/Lobby");

module.exports = {
    execute(server, player, data) {
        // Lobby ID this player is going to
        let lobbyID = data.lobby_id;
        // Check if it is valid
        if (!Lobby.validateID(lobbyID))
            return player.sendError(`Invalid Lobby ID (${lobbyID})`);
        player.leaveQuest();
        player.leaveLobby();
        let newLobby = server.lobbies[lobbyID];
        // Add player to the lobby
        newLobby.addPlayer(player);
        server.log(`Player ${player.id} joined lobby ${newLobby.id} (${newLobby.name}).`);
    }
}