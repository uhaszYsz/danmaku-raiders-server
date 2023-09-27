const Player = require("./Player");
const Room = require("../classes/Room");
const Quest = require("../classes/Quest");

module.exports = class Lobby extends Room {
    constructor(server, name, playerLimit) {
        super(server.lobbyID++, server, name, playerLimit)
        this.quests = [];
        this.questLimit = server.lobbyQuestLimit;
    }
    /** Is the lobby full of quests? */
    isQuestListFull() {
        return this.quests.length >= this.questLimit;
    }
    /** Get quest with this id */
    getQuest(id) {
        return this.quests.find(q => q.id === id);
    }
    /** Get list of available quests in this lobby */
    getAvailableQuests() {
        return this.quests.filter(q => q.state == "waiting");
    }
    /** Add player to this lobby */
    addPlayer(player) {
        player.lobby = this;
        super.addPlayer(player);
        player.sendLobbyConfirmation();
    }
    /** Create a quest and add owner to it */
    createQuest(name, owner, square, limit) {
        let quest = new Quest(this, name, owner, square, limit);
        quest.addPlayer(owner);
        quest.sendPlayerListToOwner();
        this.quests.push(quest);
        return quest;
    }
    /** Max number of lobbies in the server */
    static maxLimit = 1;
    /** Return if this lobby id is valid */
    static validateID(id) {
        return id >= 0 && id < Lobby.maxLimit && Number.isInteger(id);
    }
}