import { check, sleep } from 'k6';
import { getHeader, loginUser } from '../../helpers/auth.js';
import { get } from '../../helpers/httpClient.js';
import { getTestUser } from '../../helpers/user.js';
import { API_ENDPOINT } from '../../constants/enpoint.js';

export const options = {
  stages: [
    { duration: '10s', target: 5 }, 
    { duration: '20s', target: 10 }, 
    { duration: '10s', target: 0 },  
  ],
};

export function setup() {
    const user = getTestUser();
    const loginRes = loginUser(user.email, user.password);
    return { token: loginRes.json('token') };
}

export default function (data) {
    const res = get(API_ENDPOINT.ADDRESS.GET_ALL, getHeader(data.token));

    check(res, {
        'status 200': (r) => r.status === 200,
        'is JSON': (r) => r.headers['Content-Type']?.includes('application/json'),
        'returns address array': (r) => Array.isArray(r.json('addresses')),
    });

    sleep(1);
}
