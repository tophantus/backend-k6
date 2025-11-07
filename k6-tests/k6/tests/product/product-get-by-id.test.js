import { check, sleep } from 'k6';
import { post, get } from '../../helpers/httpClient.js';
import { getHeader, getAdminToken } from '../../helpers/auth.js';
import { API_ENDPOINT } from '../../constants/endpoint.js';
import { generateRandomCategory } from '../../utils/category.js';
import { generateRandomProduct } from '../../utils/product.js';

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
  const token = getAdminToken();
  const headers = getHeader(token);

  const cateRes = post(API_ENDPOINT.CATEGORY.ADD, generateRandomCategory(), headers);
  check(cateRes, { 'category created': (r) => r.status === 200 && r.json('success') });
  const categoryId = cateRes.json('category._id');

  const prodRes = post(API_ENDPOINT.PRODUCT.ADD, generateRandomProduct(null, categoryId), headers);
  check(prodRes, { 'product created': (r) => r.status === 200 && r.json('success') });
  const productId = prodRes.json('product._id');

  return { token, productId };
}

export default function (data) {
  const headers = getHeader(data.token);
  const res = get(API_ENDPOINT.PRODUCT.GET_BY_ID(data.productId), headers);

  check(res, {
    'status 200': (r) => r.status === 200,
    'product has name': (r) => !!r.json('product.name'),
  });

  sleep(0.3);
}
