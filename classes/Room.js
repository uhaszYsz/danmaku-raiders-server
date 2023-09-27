const Player = require("./Player");

module.exports = class Room {
    constructor(id, server, name, playerLimit) {
        this.id = id;
        this.server = server;
        this.name = name;
        this.playerLimit = playerLimit;
        this.players = [];
    }
    /** Is the room full of players? */
    isPlayerListFull() {
        return this.players.length >= this.playerLimit;
    }
    /** Get Info for Room List */
    getPreviewInfo() {
        return {
            id: this.id,
            name: this.name,
            player_limit: this.playerLimit,
            player_total: this.players.length
        };
    }
    /** Get players in this room */
    getPlayers(exceptPlayerID = null) {
        return this.players.filter(p => p.id != exceptPlayerID);
    }
    /** Add Player to this room */
    addPlayer(player) {
        this.players.push(player);
    }
    /** Get player with this id */
    getPlayer(id) {
        return this.players.find(p => p.id === id);
    }
    /** Send data to players in this room */
    sendDataToPlayers(data) {
        let json = JSON.stringify(data);
        this.players.forEach(player => player.send(json));
    }
}