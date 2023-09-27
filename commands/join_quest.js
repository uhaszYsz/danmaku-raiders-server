module.exports = {
    execute(server, player, data) {
        if (!player.lobby)
            return player.sendError("You can't create a quest outside a lobby!");
        // Get quest
        let quest = player.lobby.getQuest(data.quest_id);
        // Couldn't find the quest
        if (!quest)
            return player.sendError(`Invalid quest! (${data.quest_id})`);
        // Cannot join the quest again
        if (player.quest === quest)
            return player.sendError("You have already joined this quest!");
        // Quest reached max number of players
        if (quest.isPlayerListFull())
            return player.sendError(`The quest has reached the max number of players: ${quest.playerLimit}`);
        // Leave current quest before entering the new one 
        player.leaveQuest();
        // Add player to this quest
        quest.addPlayer(player);
        server.log(`Player ${player.id} joined quest ${quest.id} (${quest.name}).`);
    }
}