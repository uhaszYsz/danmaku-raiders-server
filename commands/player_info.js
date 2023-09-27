const Room = require("../classes/Quest");

module.exports = {
    execute(server, player, data) {
        player.name = data.name;
        server.log(`Player ${player.id} name ${player.name}`);
    }
}