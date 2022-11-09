export interface UserIdentifier {
    userId: string;
    token: string;
}

export type UserStatus = 'online' | 'offline' | 'missed';

export interface IUser {
    userId: string;
    username: string;
    name: string;
    email: string;
    status: UserStatus;
    job: string;
}

export interface IConnectedUser {
    socketId: string;
    username: string;
    mute: boolean;
}

export type MessageType = 'text' | 'file';

export interface IMessage {
    type: MessageType;
    sender: string;
    date: number;
}

export interface TextMessage extends IMessage {
    type: 'text';
    message: string;
}

export interface FileMessage extends IMessage {
    type: 'file';
    name: string;
    url: string;
}
