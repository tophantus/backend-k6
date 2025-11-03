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
  return { token: getAdminToken()};
}

export default function (data) {
  const res = get(`${API_ENDPOINT.BRAND.LIST_SELECT}?page=1&limit=30`, getHeader(data.token));

  check(res, {
    'status 200': (r) => r.status === 200,
    'has name only': (r) =>
      Array.isArray(r.json('brands')) &&
      r.json('brands').every((b) => Object.keys(b).includes('name')),
  });

  sleep(0.2);
}
