import { check, sleep } from 'k6';
import { get } from '../../helpers/httpClient.js';
import { getAdminToken, getHeader } from '../../helpers/auth.js';
import { API_ENDPOINT } from '../../constants/endpoint.js';

export const options = {
  vus: 10,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<1000'],
  },
};

export function setup() {
  return { token: getAdminToken() };
}

export default function (data) {
  const headers = getHeader(data.token);
  const res = get(`${API_ENDPOINT.PRODUCT.SELECT}?page=1&limit=40`, headers);

  check(res, {
    'status 200': (r) => r.status === 200,
    'products list returned': (r) => Array.isArray(r.json('products')),
  });

  sleep(0.2);
}
