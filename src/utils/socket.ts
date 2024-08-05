import { Socket, Server } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { User } from "../types";
import { getIdFromSocketId, getUsersList } from "./userUtils";
import { gameInfo, prompts, users } from "..";
import { samplePrompts } from "./prompts";

let io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;

export const initEventHandler = (io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) => {
    io.on('connection', (socket: Socket) => {
        console.log(`User connected: ${socket.id}`);
        socket.on('userJoined', userJoined(io, socket));
        socket.on("vote", vote(io, socket));
        socket.on("start", start(io, socket))
        socket.on("end", end(io, socket))
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
};

function userJoined(io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>, socket: Socket): (user: User) => Promise<void> {
    return async (user: User) => {
        const newUser: User = {
            ...user,
            socketId: socket.id
        }
        users.set(newUser.id, newUser);
        io.emit('updateUsers', getUsersList())
    }
}

function vote(io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>, _: Socket) {
    return async ({ currentUser, votedForUser }: { currentUser: User | null, votedForUser: User | null }) => {
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
    }
}

function start(io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>, _: Socket) {
    return async () => {
        console.log("start")
        if (gameInfo.timeout != null) {
            // there is already a round running on this game info
            return
        }
        gameInfo.timeRemaining = 30
        gameInfo.roundNumber += 1
        gameInfo.roundInProgress = true
        gameInfo.prompt = samplePrompts();
        gameInfo.users = getUsersList()
        io.emit("gameInfo", gameInfo);
        gameInfo.timeout = setInterval(function() {
            gameInfo.timeRemaining -= 1
            if (gameInfo.timeRemaining <= 0 && gameInfo.timeout != null) {
                clearInterval(gameInfo.timeout)
                gameInfo.timeout = null
                gameInfo.roundInProgress = false
            }
            io.emit("gameInfo", gameInfo);
        }, 1000)
    }
}

function end(io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>, _: Socket) {
    return async () => {
        if (gameInfo.timeout == null) {
            return
        }
        clearInterval(gameInfo.timeout);
        gameInfo.roundInProgress = false
        gameInfo.timeout = null
        io.emit("gameInfo", gameInfo);
    }
}

