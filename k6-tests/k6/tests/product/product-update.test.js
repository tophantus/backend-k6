import { check, sleep } from 'k6';
import { post, put } from '../../helpers/httpClient.js';
import { getHeader } from '../../helpers/auth.js';
import { API_ENDPOINT } from '../../constants/endpoint.js';

export const options = {
  vus: 3,
  duration: '20s',
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<1200'],
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
  const productId = prodRes.json('product._id');

  return { token, productId };
}

export default function (data) {
  const headers = getHeader(data.token);

  const updatePayload = {
    product: {
      name: `UpdatedName_${__VU}_${__ITER}`,
      description: 'Updated by K6',
      price: 150000,
    },
  };

  const res = put(API_ENDPOINT.PRODUCT.UPDATE(data.productId), updatePayload, headers);

  check(res, {
    'status 200': (r) => r.status === 200,
    'update success': (r) => r.json('success') === true,
  });

  sleep(0.2);
}
