import { check, sleep } from 'k6';
import { post } from '../../helpers/httpClient.js';
import { getAdminToken, getHeader } from '../../helpers/auth.js';
import { API_ENDPOINT } from '../../constants/endpoint.js';
import { generateRandomBrand } from '../../utils/brand.js';
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

  const brandPayload = generateRandomBrand();

  const brandRes = post(API_ENDPOINT.BRAND.ADD, brandPayload, headers);

  check(brandRes, {
    'brand created': (r) => r.status === 200 && r.json('success') === true,
  });

  const brandId = brandRes.json('brand._id');
  return { token, brandId };
}

export default function (data) {
  const headers = getHeader(data.token);

  const payload = generateRandomProduct(data.brandId);
  
  const res = post(API_ENDPOINT.PRODUCT.ADD, payload, headers);

  check(res, {
    'status 200': (r) => r.status === 200,
    'product created': (r) => r.json('success') === true,
  });

  sleep(0.3);
}
