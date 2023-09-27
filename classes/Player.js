module.exports = class Player {
    constructor(server, client) {
        this.server = server;
        this.client = client;
        this.lobby = null;
        this.quest = null;
        this.id = client.id;
        this.client.player = this;
    }
    /** Get the current room this player is in */
    getCurrentRoom() {
        if (this.lobby)
            return this.lobby;
        if (this.quest)
            return this.quest;
        return null;
    }
    /** Check if this player is owner of a quest */
    isQuestOwner() {
        if (!this.quest) return false;
        return this.quest.owner.id === this.id;
    }
    /** Send error message to this player */
    sendError(message) {
        return this.sendData({
            type: "error",
            text: message
        });
    }
    /** Send data to this player */
    sendData(data) {
        return this.client.sendData(data);
    }
    /** Send text */
    send(text) {
        return this.client.send(text);
    }
    /** Send data to all players in the same lobby */
    sendDataToLobby(json) {
        return this.sendDataToRoom(json, this.lobby);
    }
    /** Send data to all players in the same quest */
    sendDataToQuest(json) {
        return this.sendDataToRoom(json, this.quest);
    }
    /** Send data to all players in the same room (Lobby/Quest) */
    sendDataToRoom(data, room) {
        if (room == null) return;
        let json = JSON.stringify(data);
        return room.getPlayers(this.id).forEach(p => p.send(json));
    }
    /** Leave quest, notify player and everyone else */
    leaveQuest() {
        if (!this.quest) return;
        let questLobby = this.quest.lobby;
        let questIndex = questLobby.quests.indexOf(this.quest);
        // If this player has created a quest, select new owner
        if (questIndex != -1 && this.quest.owner.id === this.id) {
            // Players in this quest
            let questPlayers = this.quest.getPlayers(this.id);
            if (questPlayers.length == 0) {
                questLobby.quests.splice(questIndex, 1);
                this.server.log(`The quest ${this.quest.id} (${this.quest.name}) has been deleted!`);
            } else {
                this.quest.owner = questPlayers[0];
            }
        }
        if (this.quest) {
            this.sendLeftQuest();
            let playerIndex = this.quest.players.findIndex(p => p.id == this.id);
            this.quest.players.splice(playerIndex, 1);
            this.quest.sendPlayerListToOwner();
            this.server.log(`Player ${this.id} left the quest ${this.quest.id} (${this.quest.name}).`);
        }
        if (!this.lobby && questLobby)
            questLobby.addPlayer(this);
        this.quest = null;
    }
    /** Leave lobby, notify player and everyone else */
    leaveLobby() {
        if (!this.lobby) return;
        let playerIndex = this.lobby.players.findIndex(p => p.id == this.id);
        this.sendLeftLobby();
        this.lobby.players.splice(playerIndex, 1);
        this.lobby = null;
    }
    /** Send player ID to this player */
    sendID() {
        this.sendData({
            type: "player_id",
            player_id: this.id
        });
    }
    /** Send lobby confirmation to this player */
    sendLobbyConfirmation() {
        this.sendData({
            type: "joined_lobby",
            lobby_id: this.lobby.id
        });
    }
    /** Send quest confirmation to this player*/
    sendQuestConfirmation() {
        this.sendData({
            type: "joined_quest",
            quest_id: this.quest.id,
            square: this.quest.square
        });
    }
    /** Send to quest players that this player left the quest */
    sendLeftQuest() {
        this.sendData({
            type: "left_quest"
        });
        this.sendDataToQuest({
            type: "player_left_quest",
            player_id: this.id
        });
    }
    /** Send to lobby players that this player left the lobby */
    sendLeftLobby() {
        this.sendDataToLobby({
            type: "player_left_lobby",
            player_id: this.id
        });
    }
}