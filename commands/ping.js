var timer = 0
setInterval(function() {timer+=1; console.log(timer)}, 33)
module.exports = {
    execute(server, player, data) {
        let dts = {type: 'ping', timer: timer}
        player.sendData(dts);
        console.log(dts)
    }
}
