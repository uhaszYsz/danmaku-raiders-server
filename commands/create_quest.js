const Quest = require("../classes/Quest");
const Room = require("../classes/Room");

module.exports = {
    execute(server, player, data) {
        let playerLobby = player.lobby;
        // Reached max number of quests
        if (playerLobby.isQuestListFull())
            return player.sendError(`The lobby has reached the max number of quests: ${lobby.questLimit}`);
        // Player can only create 1 quest
        if (player.isQuestOwner())
            return player.sendError("You have already created a quest!");
        player.leaveQuest();
        // Create quest
        let quest = playerLobby.createQuest(data.name, player, data.square, server.questPlayerLimit, data.qid);
        // Send quest info to player
        player.sendData({
            type: "created_quest",
            quest_id: quest.id,
            player_id: player.id,
            name: data.name,
            limit: quest.playerLimit,
            qid: data.qid
        });
        server.log(`Player ${player.id} created quest ${quest.name} (${quest.id}).`);
    }
}