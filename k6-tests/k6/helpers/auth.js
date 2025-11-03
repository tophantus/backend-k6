import { getTestAdmin } from './admin.js';
import { post } from './httpClient.js';
import { getTestMerchant } from './merchant.js';
import { getTestUser } from './user.js';

export function getHeader(token) {
    return { Authorization: token }
}

export function registerUser(user) {
    return post('/api/auth/register', user);
}

export function loginUser(email, password) {
    return post('/api/auth/login', { email, password });
}

export function getUserToken() {
  const user = getTestUser();
  const loginRes = loginUser(user.email, user.password);
  return loginRes.json('token');
}

export function getAdminToken() {
  const admin = getTestAdmin();
  const loginRes = loginUser(admin.email, admin.password);
  return loginRes.json('token');
}

export function getMerchantToken() {
  const merchant = getTestMerchant();
  const loginRes = loginUser(merchant.email, merchant.password);
  return loginRes.json('token');
}