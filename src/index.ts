import express from 'express';
import { createServer } from 'http';
import { disconnect } from 'process';
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
    id: string,
};

type User = {
    name: string,
    id: string,
};

type SocketId = string;



// Middleware
app.use(express.json());

// Serve a simple route
app.get('/', (_, res) => {
    res.send('WebSocket server is running');
});

const users = new Map<SocketId, User>();

function getUserList(): User[] {
    const userList: User[] = []
    users.forEach((user: User) => {
        userList.push(user);
    });
    return userList
}


// Socket.io connection
io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('setToggle', (message: setToggle) => {
        console.log(message);
        io.emit('setToggle', message);
    });

    socket.on('userJoined', (user: User) => {
        users.set(socket.id, user);
        console.log(users);
        io.emit('updateUsers', getUserList())
    })

    socket.on('disconnect', () => {
        users.delete(socket.id)
        io.emit('updateUsers', getUserList())
        console.log(`User disconnected: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

