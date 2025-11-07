import { check, sleep } from 'k6';
import { getHeader, getUserToken } from '../../helpers/auth.js';
import { post, put } from '../../helpers/httpClient.js';
import { generateRandomAddress } from '../../utils/address.js';
import { API_ENDPOINT } from '../../constants/endpoint.js';

const TEST_TYPE = __ENV.TEST_TYPE || 'smoke';

const testOptions = {
  smoke: {
    vus: 1,
    duration: '10s',
    thresholds: {
      http_req_failed: ['rate<0.01'],
      http_req_duration: ['p(95)<1000'],
    },
  },
  load: {
    stages: [
      { duration: '30s', target: 10 },
      { duration: '1m', target: 50 },
      { duration: '30s', target: 0 },
    ],
    thresholds: {
      http_req_failed: ['rate<0.01'],
      http_req_duration: ['p(95)<1500'],
    },
  },
  stress: {
    stages: [
      { duration: '1m', target: 50 },
      { duration: '2m', target: 100 },
      { duration: '2m', target: 200 },
      { duration: '1m', target: 0 },
    ],
    thresholds: {
      http_req_failed: ['rate<0.1'],
      http_req_duration: ['p(95)<4000'],
    },
  },
};

export const options = testOptions[TEST_TYPE];

export function setup() {
    const token = getUserToken()

    const addRes = post(API_ENDPOINT.ADDRESS.ADD, generateRandomAddress(), getHeader(token));

    return { token, addressId: addRes.json('address')._id };
}

export default function (data) {
    const res = put(API_ENDPOINT.ADDRESS.UPDATE(data.addressId), generateRandomAddress(), getHeader(data.token));

    check(res, {
        'status 200': (r) => r.status === 200,
        'update success': (r) => r.json('success') === true,
    });

    sleep(0.1);
}
