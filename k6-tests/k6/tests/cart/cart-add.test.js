import { check, sleep } from 'k6';
import { post } from '../../helpers/httpClient.js';
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
    
  const resProd = post(API_ENDPOINT.PRODUCT.ADD, productPayload, adminHeaders);
  
  check(resProd, {
    'product created': (r) => r.status === 200 && r.json('success') === true,
  });

  const productId = resProd.json('product._id');
  const userToken = getUserToken();

  return { userToken, productId };
}

export default function (data) {
  const headers = getHeader(data.userToken);

  const payload = {
    products: [
      {
        product: data.productId,
        quantity: 1,
        price: 250000,
        taxable: false,
      },
    ],
  };

  const res = post(API_ENDPOINT.CART.ADD, payload, headers);

  check(res, {
    'status 200': (r) => r.status === 200,
    'cart created': (r) => r.json('success') === true,
    'cartId exists': (r) => !!r.json('cartId'),
  });

  sleep(0.3);
}
