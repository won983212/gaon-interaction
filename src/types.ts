export interface UserIdentifier {
    userId: string;
    token: string;
}

export type IStatus = 'online' | 'offline' | 'missed';

export interface IUser {
    userId: string;
    username: string;
    name: string;
    email: string;
    status: IStatus;
    job: string;
}

export interface IConnectedUser {
    socketId: string;
    username: string;
    mute: boolean;
}

export interface IMessage {
    sender: string;
    message: string;
    date: number;
}
