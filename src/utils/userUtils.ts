import { User, UserId } from "../types";
import { users } from "..";

export function getUsersList(): User[] {
    const userList: User[] = []
    users.forEach((user: User) => {
        userList.push(user);
    });
    return userList.sort((a, b)=>{
        if(a.roundsWon === b.roundsWon) {
            return 0;
        } else if (a.roundsWon < b.roundsWon){
            return -1
        }
        return 1
    })
}

export function getIdFromSocketId(socketId: String): UserId {
    const users: User[] = getUsersList().filter((user) => user.socketId === socketId)
    return users.length > 0 ? users[0].id : "";
}
