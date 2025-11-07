import { check, sleep } from 'k6';
import { del, post, put } from '../../helpers/httpClient.js';
import { getAdminToken, getHeader, getUserToken } from '../../helpers/auth.js';
import { API_ENDPOINT } from '../../constants/endpoint.js';
import { generateRandomBrand } from '../../utils/brand.js';
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
  const adminToken = getAdminToken();
  const adminHeaders = getHeader(adminToken);

  const brandPayload = generateRandomBrand();
  const brandRes = post(API_ENDPOINT.BRAND.ADD, brandPayload, adminHeaders);
  check(brandRes, {
    'brand created': (r) => r.status === 200 && r.json('success') === true,
  });
  const brandId = brandRes.json('brand._id');

  const productPayload = generateRandomProduct(brandId);
  const productRes = post(API_ENDPOINT.PRODUCT.ADD, productPayload, adminHeaders);
  check(productRes, {
    'product created': (r) => r.status === 200 && r.json('success') === true,
  });
  const productId = productRes.json('product._id');

  const userToken = getUserToken();
  const userHeaders = getHeader(userToken);

  const reviewPayload = {
    product: productId,
    title: 'Initial review',
    comment: 'Initial comment',
    rating: 3,
  };
  const reviewRes = post(API_ENDPOINT.REVIEW.ADD, reviewPayload, userHeaders);
  const reviewId = reviewRes.json('review._id');

  return { userToken, reviewId, adminToken, productId, brandId};
}

export default function (data) {
  const headers = getHeader(data.userToken);

  const updatePayload = {
    title: 'Updated review title',
    comment: 'Updated review comment',
    rating: 4,
  };

  const res = put(API_ENDPOINT.REVIEW.UPDATE(data.reviewId), updatePayload, headers);

  check(res, {
    'review updated successfully': (r) => r.status === 200 && r.json('success') === true,
  });

  sleep(0.15)
}

export function teardown(data) {
  const headers = getHeader(data.adminToken);

  const reviewRes = del(API_ENDPOINT.REVIEW.DELETE(data.reviewId), headers);
  check(reviewRes, { 'deleted review': (r) => r.status === 200 });

  const resProduct = del(API_ENDPOINT.PRODUCT.DELETE(data.productId), headers);
  check(resProduct, { 'deleted product': (r) => r.status === 200 });


  const resBrand = del(API_ENDPOINT.BRAND.DELETE(data.brandId), headers);
  check(resBrand, { 'deleted brand': (r) => r.status === 200 });
}
