import { check, sleep } from 'k6';
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

export default function () {
  const res = get(`${API_ENDPOINT.PRODUCT.STORE_LIST}?sortOrder={"createdAt":-1}&rating=4&min=100&max=500&category=shoes&brand=wolff-hand-and-maggio&page=2&limit=40`);

  check(res, {
    'status 200': (r) => r.status === 200,
    'has products': (r) => Array.isArray(r.json('products')),
  });

  sleep(0.2);
}
