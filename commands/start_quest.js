module.exports = {
    execute(server, player, data) {
        // Only owner can start the quest
        if (!player.isQuestOwner()) return;
        // Ignore if it is already active
        if (player.quest.state === "active") return;
        // Set stage and start
        player.quest.stageName = data.stage_name;
        player.quest.start();
    }
}