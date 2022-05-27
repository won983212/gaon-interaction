import axios, { AxiosRequestHeaders } from 'axios';
import apiconfig from '@/../config.json';

export function get<T = any>(url: string, headers?: AxiosRequestHeaders) {
    return axios.get<T>(apiUrl(url), {
        headers: headers,
        withCredentials: true
    });
}

export function post<T = void>(
    url: string,
    data?: any,
    headers?: AxiosRequestHeaders
) {
    return axios.post<T>(apiUrl(url), data, {
        headers: headers,
        withCredentials: true
    });
}

export function apiUrl(path: string) {
    return apiconfig.host + path;
}
