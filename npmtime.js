const NTPServer = require('ntp-time').Server;
const server = new NTPServer();

// Define your custom handler for requests
server.handle((message, response) => {
	console.log('Server message:', message);

	message.transmitTimestamp = Math.floor(Date.now() / 1000);

	response(message);
});

// Check if node has the necessary permissions
// to listen on ports less than 1024
// https://stackoverflow.com/questions/413807/is-there-a-way-for-non-root-processes-to-bind-to-privileged-ports-on-linux
server.listen(123, err => {
	if (err) throw err;

	console.log('Server listening');
});