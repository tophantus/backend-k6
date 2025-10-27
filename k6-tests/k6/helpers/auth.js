import { post } from './httpClient.js';

export function getHeader(token) {
    return { Authorization: token }
}

export function registerUser(user) {
    return post('/api/auth/register', user);
}

export function loginUser(email, password) {
    return post('/api/auth/login', { email, password });
}

