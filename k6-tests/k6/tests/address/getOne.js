import { check, sleep } from 'k6';
import { getHeader, loginUser } from '../../helpers/auth.js';
import { get, post } from '../../helpers/httpClient.js';
import { getTestUser } from '../../helpers/user.js';
import { generateRandomAddress } from '../../utils/address.js';
import { API_ENDPOINT } from '../../constants/enpoint.js';

export const options = {
  stages: [
    { duration: '10s', target: 7 }, 
    { duration: '20s', target: 15 }, 
    { duration: '10s', target: 0 },  
  ],
};

export function setup() {
    const user = getTestUser();
    const loginRes = loginUser(user.email, user.password);
    const token = loginRes.json('token');

    // Tạo 1 address để có id
    const addRes = post(API_ENDPOINT.ADDRESS.ADD, generateRandomAddress(), getHeader(token));

    return { token, addressId: addRes.json('address')._id };
}

export default function (data) {
    const res = get(API_ENDPOINT.ADDRESS.GET_ONE(data.addressId), getHeader(data.token));

    check(res, {
        'status 200': (r) => r.status === 200,
        'is JSON': (r) => typeof r.json() === 'object'
    });

    sleep(1);
}
