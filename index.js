// Modules
require('dotenv').config();
const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');
const Lobby = require('./classes/Lobby');
const Player = require('./classes/Player');
const config = require('./config.json');

// Create Server
const server = new WebSocket.Server({ port: process.env.PORT || 3000});
// Server variables
server.lobbyID = 0;
server.questID = 0;
server.clientID = 0;    // Increase by 1 when a client connects
server.lobbies = [];
Lobby.maxLimit = Number(config.lobbyNumber);
for (let i = 0; i < Lobby.maxLimit ; i++) { 
    server.lobbies[i] = new Lobby(server, `lobby${i}`, Number(config.lobbyPlayerLimit));
}
server.players = []; // List of Players
server.questPlayerLimit = Number(config.questPlayerLimit); // Limit of players in quest
server.lobbyQuestLimit = Number(config.lobbyQuestLimit); // Limit of quests in lobby
server.log = (...x) => console.log(...x);
// Load Commands
server.commands = {};

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {

    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    const commandName = file.slice(0, -3);  // Remove .js from the file name

    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ('execute' in command) {
        server.commands[commandName] = command;
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "execute" property.`);
    }

}

// New Connection
server.on("connection", client => {
    client.id = server.clientID++;
    client.player = null;
    client.frame = 0;
    // Send JSON data
    client.sendData = function (data) {
        client.send(JSON.stringify(data));
    };

    let availableLobby = server.lobbies.find(l => !l.isPlayerListFull());
    let player = new Player(server, client);
    if (!availableLobby) {
        client.close();
        server.log("Disconnected client because all the lobbies were full")
        return;
    }
    availableLobby.addPlayer(player);
    player.sendID();
    server.players.push(player);
    server.awaitingRequest = false;

    // Connected
    console.log(`A new player has connected! ID: ${player.id} Lobby: ${player.lobby.name}`);
    // Receive message
    client.on("message", msg => {
        try {
            let data = JSON.parse(msg);
            if (server.commands.hasOwnProperty(data.type)) {
                server.commands[data.type].execute(server, client.player, data);
            } else {
                console.log(`Invalid message type: ${data.type}`)
            }
        } catch (ex) {
            console.error(ex);
        }
    });

    // Disconnected
    client.on("close", () => {

        let playerIndex = server.players.indexOf(client.player);

        client.player.leaveQuest();
        client.player.leaveLobby();
        
        server.players.splice(playerIndex, 1);
        console.log(`A player has been disconnected! ID: ${client.id}`);
    });

    // Error
    client.onerror = function () {

    }
});

console.log(`The WebSocket Server is running!`);
