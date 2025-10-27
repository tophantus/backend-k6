import { get, post } from './httpClient.js';
import http from 'k6/http';
import { BASE_URL, DEFAULT_HEADERS } from '../k6.config.js';

// Add new address
export function addAddress(token, address) {
    return post('/api/address/add', address, {
        Authorization: `Bearer ${token}`,
    });
}

// Get all addresses
export function getAllAddresses(token) {
    return get('/api/address', {
        Authorization: `Bearer ${token}`,
    });
}

// Get single address by ID
export function getAddressById(token, id) {
    return get(`/api/address/${id}`, {
        Authorization: `Bearer ${token}`,
    });
}

// Update address by ID
export function updateAddress(token, id, updatedData) {
    const res = http.put(`${BASE_URL}/api/address/${id}`, JSON.stringify(updatedData), {
        headers: { ...DEFAULT_HEADERS, Authorization: `Bearer ${token}` },
    });
    return res;
}

// Delete address by ID
export function deleteAddress(token, id) {
    const res = http.del(`${BASE_URL}/api/address/delete/${id}`, null, {
        headers: { ...DEFAULT_HEADERS, Authorization: `Bearer ${token}` },
    });
    return res;
}
