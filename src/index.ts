import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
	cors: {
		origin: "*",
	}
});

type setToggle = {
	isSet: boolean,
	toggle: number,
};

// Middleware
app.use(express.json());

// Serve a simple route
app.get('/', (req, res) => {
	res.send('WebSocket server is running');
});

// Socket.io connection
io.on('connection', (socket: Socket) => {
	console.log(`User connected: ${socket.handshake.address}`);

	socket.on('setToggle', (message: setToggle) => {
		console.log(message);
		io.emit('setToggle', message);
	});

	socket.on('disconnect', () => {
		console.log(`User disconnected: ${socket.id}`);
	});
});

const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});

