import { get } from './client';
import { IPermission, IUser } from '@/types';

export const getUserInfo = (userId: string, token: string) =>
    get<IUser>('/user/' + encodeURI(userId), { 'x-access-token': token });

export const getPermission = (workspaceId: number, userId: number) =>
    get<IPermission>(`/user/admin/permission?userId=${userId}&projectId=${workspaceId}`);