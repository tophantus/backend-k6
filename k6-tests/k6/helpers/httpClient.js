import http from 'k6/http';
import { check } from 'k6';
import { BASE_URL, DEFAULT_HEADERS } from '../k6.config.js';

export function get(path, headers = {}) {
    const res = http.get(`${BASE_URL}${path}`, { headers: { ...DEFAULT_HEADERS, ...headers } });
    return res;
}

export function post(path, body = {}, headers = {}) {
    const res = http.post(`${BASE_URL}${path}`, JSON.stringify(body), { headers: { ...DEFAULT_HEADERS, ...headers } });
    return res;
}

export function put(path, body = {}, headers = {}) {
    return http.put(`${BASE_URL}${path}`, JSON.stringify(body), { headers: { ...DEFAULT_HEADERS, ...headers } });
}

export function del(path, headers = {}) {
    return http.del(`${BASE_URL}${path}`, null, { headers: { ...DEFAULT_HEADERS, ...headers } });
}
