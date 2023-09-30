var timer = 0
setInterval(function() {timer++; console.log(timer)}, 2)
module.exports = {
    execute(server, player, data) {
        let dts = {type: 'ping', timer: timer}
        player.sendData(dts);
        console.log(dts)
    }
}
