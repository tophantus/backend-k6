import { check, sleep } from 'k6';
import { getHeader, getAdminToken } from '../../helpers/auth.js';
import { post } from '../../helpers/httpClient.js';
import { API_ENDPOINT } from '../../constants/endpoint.js';
import { generateRandomBrand } from '../../utils/brand.js';

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 50 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<1500'],
  },
};

export function setup() {
  return { token: getAdminToken() };
}

export default function (data) {
  const payload = generateRandomBrand()
  const res = post(API_ENDPOINT.BRAND.ADD, payload, getHeader(data.token));

  check(res, {
    'status 200': (r) => r.status === 200,
    'success true': (r) => r.json('success') === true,
    'brand created': (r) => r.json('brand')?._id !== undefined,
  });

  sleep(0.2);
}
