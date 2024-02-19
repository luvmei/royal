const io = require('socket.io-client');
const socket = io(process.env.ADMIN_SOCKET_PATH);

module.exports = socket;
