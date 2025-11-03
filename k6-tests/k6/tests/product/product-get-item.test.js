import { check, sleep } from 'k6';
import { post, get } from '../../helpers/httpClient.js';
import { getHeader, getAdminToken } from '../../helpers/auth.js';
import { API_ENDPOINT } from '../../constants/endpoint.js';
import { generateRandomCategory } from '../../utils/category.js';
import { generateRandomProduct } from '../../utils/product.js';

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
  const token = getAdminToken();
  const headers = getHeader(token);

  const cateRes = post(API_ENDPOINT.CATEGORY.ADD, generateRandomCategory(), headers);
  check(cateRes, { 'category created': (r) => r.status === 200 && r.json('success') });
  const categoryId = cateRes.json('category._id');

  const prodRes = post(API_ENDPOINT.PRODUCT.ADD, generateRandomProduct(null, categoryId), headers);
  check(prodRes, { 'product created': (r) => r.status === 200 && r.json('success') });
  const product = prodRes.json('product');
  const slug = product.slug;

  return { slug };
}

export default function (data) {
  const res = get(API_ENDPOINT.PRODUCT.ITEM(data.slug));

  check(res, {
    'status 200': (r) => r.status === 200,
    'product has name': (r) => !!r.json('product.name'),
  });

  sleep(0.3);
}
