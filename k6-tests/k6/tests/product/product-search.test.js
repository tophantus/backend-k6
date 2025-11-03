import { check, sleep } from 'k6';
import { get } from '../../helpers/httpClient.js';
import { API_ENDPOINT } from '../../constants/endpoint.js';

export const options = {
  vus: 10,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<1200'],
  },
};

export default function () {
  const searchName = 'phone'; 
  const url = `${API_ENDPOINT.PRODUCT.STORE_SEARCH}/${encodeURIComponent(searchName)}?page=1&limit=10`;

  const res = get(url);

  check(res, {
    'status 200': (r) => r.status === 200,
    'has products': (r) => Array.isArray(r.json('products')),
    'products not empty': (r) => r.json('products').length > 0,
  });

  sleep(0.2);
}
