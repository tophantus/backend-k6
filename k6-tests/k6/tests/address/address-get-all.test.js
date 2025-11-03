import { check, sleep } from 'k6';
import { getHeader } from '../../helpers/auth.js';
import { get } from '../../helpers/httpClient.js';
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
    const res = get(API_ENDPOINT.ADDRESS.GET_ALL, getHeader(data.token));

    check(res, {
        'status 200': (r) => r.status === 200,
        'is JSON': (r) => r.headers['Content-Type']?.includes('application/json'),
        'returns address array': (r) => Array.isArray(r.json('addresses')),
    });

    sleep(0.2);
}
