import { User, UserId } from "../types";
import { users } from "..";

export function getUsersList(): User[] {
    const userList: User[] = []
    users.forEach((user: User) => {
        userList.push(user);
    });
    return userList
}

export function getIdFromSocketId(socketId: String): UserId {
    const users: User[] = getUsersList().filter((user) => user.socketId === socketId)
    return users.length > 0 ? users[0].id : "";
}
