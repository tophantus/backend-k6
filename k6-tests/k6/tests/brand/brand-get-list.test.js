import { check, sleep } from 'k6';
import { get } from '../../helpers/httpClient.js';
import { API_ENDPOINT } from '../../constants/endpoint.js';

export const options = {
  stages: [
    { duration: '30s', target: 20 },
    { duration: '1m', target: 60 },
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<1000'],
  },
};

export default function () {
  const res = get(`${API_ENDPOINT.BRAND.LIST}?page=1&limit=30`);

  check(res, {
    'status 200': (r) => r.status === 200,
    'has brands': (r) => Array.isArray(r.json('brands')),
  });

  sleep(0.2);
}
