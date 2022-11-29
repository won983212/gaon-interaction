import { get } from './client';
import { IUser } from '@/types';

export const getUserInfo = (userId: string, token: string) =>
    get<IUser>('/user/' + encodeURI(userId), { 'x-access-token': token });
