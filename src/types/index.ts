export type User = {
    name: string,
    id: UserId,
    socketId: SocketId | null
    currentVote: UserId | null,
    previousVote: UserId | null,
    numberOfVotes: number,
};

export type GameInfo = {
    roundInProgress: boolean
    timeout: NodeJS.Timeout | null
    roundNumber: number
    timeRemaining: number
}

export type UserId = string;
export type SocketId = string;

