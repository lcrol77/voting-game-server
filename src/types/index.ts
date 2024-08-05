export type User = {
    name: string,
    id: UserId,
    socketId: SocketId | null
    currentVote: UserId | null,
    previousVote: UserId | null,
    numberOfVotes: number,
    roundsWon: number
    promptsWon: string[]
    // can do cooler stat tracking once we get data persistance up and running
    // some ideas are somethings like:
    // 1. tracking the number of votes recieved
    //     a. by each player
    //     b. prompt category?
    // 2. who we are voting for a lot
};

export type GameInfo = {
    roundInProgress: boolean
    timeout: NodeJS.Timeout | null
    roundNumber: number
    timeRemaining: number
    prompt: string | null 
    users: User[] // sorted in  descending order from in terms of rounds won

}

export type UserId = string;
export type SocketId = string;

