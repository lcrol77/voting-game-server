import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { GameInfo, User, UserId } from './types';
import { initEventHandler } from './utils/socket';
import fs from "fs";

export const prompts = fs.readFileSync("./prompts")
    .toString()
    .split(/\n/g)
    .filter((el) => el !== "");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
    }
});

app.use(express.json());
app.get('/', (_, res) => {
    res.send('WebSocket server is running');
});

export const users = new Map<UserId, User>();

export const gameInfo: GameInfo = {
    roundInProgress: false,
    timeout: null,
    roundNumber: 0,
    timeRemaining: 0,
    prompt: null,
    users: []
}

initEventHandler(io);

const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

