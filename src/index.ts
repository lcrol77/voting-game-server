import { log } from 'console';
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

type User = {
    name: string,
    id: UserId,
    socketId: SocketId | null
    currentVote: UserId | null,
    previousVote: UserId | null,
    numberOfVotes: number,
};

type UserId = string;
type SocketId = string;

app.use(express.json());
app.get('/', (_, res) => {
    res.send('WebSocket server is running');
});

const users = new Map<UserId, User>();

function getUsersList(): User[] {
    const userList: User[] = []
    users.forEach((user: User) => {
        userList.push(user);
    });
    return userList
}

function getIdFromSocketId(socketId: String): UserId {
    const users: User[] = getUsersList().filter((user) => user.socketId === socketId)
    return users.length > 0 ? users[0].id : "";
}

// Socket.io connection
io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('userJoined', (user: User) => {
        const newUser: User = {
            ...user,
            socketId: socket.id
        }
        users.set(newUser.id, newUser);
        io.emit('updateUsers', getUsersList())
    })
    socket.on("vote", ({ currentUser, votedForUser }: { currentUser: User | null, votedForUser: User | null }): void => {
        if (currentUser == null || votedForUser == null) {
            return
        }
        let prev: User | undefined;
        const curr: User | undefined = users.get(currentUser.id)
        const next: User | undefined = users.get(votedForUser.id)
        if (curr == null || next == null) { return }
        if (curr.currentVote) {
            prev = users.get(curr.currentVote);
        }
        if (prev != null) {
            prev.numberOfVotes--;
        }
        curr.currentVote = next.id
        next.numberOfVotes++;
        io.emit('updateUsers', getUsersList())
    });
    socket.on('disconnect', () => {
        const user: User | undefined = users.get(getIdFromSocketId(socket.id));
        if (user != null && user.currentVote != null) {
            users.get(user.currentVote)!.numberOfVotes--;
        }
        users.delete(getIdFromSocketId(socket.id))
        io.emit('updateUsers', getUsersList())
        console.log(`User disconnected: ${socket.id}`);
    });
});

const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

