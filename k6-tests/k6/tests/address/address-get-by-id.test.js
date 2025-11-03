import { check, sleep } from 'k6';
import { getHeader } from '../../helpers/auth.js';
import { get, post } from '../../helpers/httpClient.js';
import { generateRandomAddress } from '../../utils/address.js';
import { API_ENDPOINT } from '../../constants/endpoint.js';

export const options = {
  stages: [
    { duration: '20s', target: 5 }, 
    { duration: '40s', target: 20 }, 
    { duration: '20s', target: 0 },  
  ],
};


export function setup() {
    const token = getUserToken()

    const addRes = post(API_ENDPOINT.ADDRESS.ADD, generateRandomAddress(), getHeader(token));

    return { token, addressId: addRes.json('address')._id };
}

export default function (data) {
    const res = get(API_ENDPOINT.ADDRESS.GET_ONE(data.addressId), getHeader(data.token));

    check(res, {
        'status 200': (r) => r.status === 200,
        'is JSON': (r) => typeof r.json() === 'object'
    });

    sleep(0.2);
}
