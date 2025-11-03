import { check, sleep } from 'k6';
import { getAdminToken, getHeader } from '../../helpers/auth.js';
import { get } from '../../helpers/httpClient.js';
import { API_ENDPOINT } from '../../constants/endpoint.js';

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
  const res = get(`${API_ENDPOINT.BRAND.GET_ALL}?page=1&limit=30`, getHeader(data.token));

  check(res, {
    'status 200': (r) => r.status === 200,
    'has brand array': (r) => Array.isArray(r.json('brands')),
  });

  sleep(0.2);
}
