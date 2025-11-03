import { check, sleep } from 'k6';
import { getHeader, getAdminToken } from '../../helpers/auth.js';
import { post, put } from '../../helpers/httpClient.js';
import { API_ENDPOINT } from '../../constants/endpoint.js';
import { generateRandomBrand } from '../../utils/brand.js';

export const options = {
  stages: [
    { duration: '30s', target: 50 },
    { duration: '1m', target: 70 },
    { duration: '30s', target: 40 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<1500'],
  },
};

export function setup() {
  const token = getAdminToken();
  const headers = getHeader(token);

  const payload = generateRandomBrand();
  const res = post(API_ENDPOINT.BRAND.ADD, payload, headers);

  check(res, {
    'brand created': (r) => r.status === 200 && r.json('success') === true && r.json('brand')?._id !== undefined,
  });

  return { token, brandId: res.json('brand._id') };
}

export default function (data) {
  const headers = getHeader(data.token);

  const updatePayload = {
    brand: {
      name: `UpdatedBrandName_${__VU}_${__ITER}`,
      description: 'Updated description by K6 test',
    },
  };

  const res = put(API_ENDPOINT.BRAND.UPDATE(data.brandId), updatePayload, headers);

  check(res, {
    'status 200': (r) => r.status === 200,
    'success true': (r) => r.json('success') === true,
  });

  sleep(0.1);
}
