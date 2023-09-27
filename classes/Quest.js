const Player = require("./Player");
const Room = require("../classes/Room");

module.exports = class Quest extends Room {
    constructor(lobby, name, owner, square, limit) {
        super(lobby.server.questID++, lobby.server, name, limit)
        this.owner = owner;
        this.lobby = lobby;
        this.state = "waiting";
        this.stageName = "1";
        this.square = square;
    }
    /** Get Info for quest List */
    getPreviewInfo() {
        return {
            quest_id: this.id,
            name: this.name,
            owner_id: this.owner.id,
            limit: this.limit,
            player_total: this.players.length
        };
    }
    /** Add Player */
    addPlayer(player) {
        player.quest = this;
        super.addPlayer(player);
        player.sendQuestConfirmation();
        this.sendPlayerListToOwner();
    }
    /** Send player list to owner */
    sendPlayerListToOwner() {
        if (this.players.length == 0) return;
        this.owner.sendData({
            type: "quest_player_list",
            player_list: this.getPlayers().map(player => player.id)
        })
    }
    /** Start quest and notify all players */
    start() {
        this.sendDataToPlayers({
            type: "start_quest",
            stage_name: this.stageName
        });
        this.state = "active";
        this.players.concat().forEach(player => player.leaveLobby())
    }
}