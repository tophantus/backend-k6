import { check, sleep } from 'k6';
import { getHeader } from '../../helpers/auth.js';
import { post } from '../../helpers/httpClient.js';
import { generateRandomAddress } from '../../utils/address.js';
import { API_ENDPOINT } from '../../constants/endpoint.js';

export const options = {
  stages: [
    { duration: '30s', target: 20 },  
    { duration: '1m', target: 50 },   
    { duration: '1m', target: 100 },   
    { duration: '30s', target: 100 }, 
    { duration: '30s', target: 0 },    
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],   
    http_req_duration: ['p(95)<1500'],  
  },
};

export function setup() {
    return { token: getUserToken() };
}

export default function (data) {
    const randomAddress = generateRandomAddress();
    const res = post(API_ENDPOINT.ADDRESS.ADD, randomAddress, getHeader(data.token));

    check(res, {
        'status 200': (r) => r.status === 200,
        'has address': (r) => r.json('address') !== undefined,
        'success true': (r) => r.json('success') === true,
    });

    sleep(0.2);
}
