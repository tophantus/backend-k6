import { check, sleep } from 'k6';
import { post } from '../../helpers/httpClient.js';
import { getAdminToken, getHeader } from '../../helpers/auth.js';
import { API_ENDPOINT } from '../../constants/endpoint.js';
import { generateRandomCategory } from '../../utils/category.js';

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
  const headers = getHeader(data.token);
  const payload = generateRandomCategory()

  const res = post(API_ENDPOINT.CATEGORY.ADD, payload, headers);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'success true': (r) => r.json('success') === true,
    'has category id': (r) => !!r.json('category._id'),
  });

  sleep(0.1);
}
