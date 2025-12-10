import http from 'k6/http';
import { BASE_URL, DEFAULT_HEADERS } from '../k6.config.js';

function convertTag(tagString, method) {
    if (!tagString) return undefined;

    return { name: `${method} ${tagString}` };
}

export function get(path, headers = {}, tag = "") {
    return http.get(`${BASE_URL}${path}`, {
        headers: { ...DEFAULT_HEADERS, ...headers },
        tags: convertTag(tag, "GET")
    });
}

export function post(path, body = {}, headers = {}, tag = "") {
    return http.post(`${BASE_URL}${path}`, JSON.stringify(body), {
        headers: { ...DEFAULT_HEADERS, ...headers },
        tags: convertTag(tag, "POST")
    });
}

export function put(path, body = {}, headers = {}, tag = "") {
    return http.put(`${BASE_URL}${path}`, JSON.stringify(body), {
        headers: { ...DEFAULT_HEADERS, ...headers },
        tags: convertTag(tag, "PUT")
    });
}

export function del(path, headers = {}, tag = "", data = null) {
    return http.del(`${BASE_URL}${path}`, data ? JSON.stringify(data) : null, {
        headers: { ...DEFAULT_HEADERS, ...headers },
        tags: convertTag(tag, "DELETE")
    });
}