import { check, sleep } from 'k6';
import { get } from '../../helpers/httpClient.js';
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

export default function () {
  const brand = "dietrich-inc";
  const minPrice = randomInt(1, 500);
  const maxPrice = randomInt(minPrice, 1500);
  const res = get(`${API_ENDPOINT.PRODUCT.STORE_LIST}?sortOrder={"createdAt":-1}&min=${minPrice}&max=${maxPrice}&brand=${brand}`);

  check(res, {
    'status 200': (r) => r.status === 200,
    'has products': (r) => Array.isArray(r.json('products')),
  });

  sleep(0.2);
}
