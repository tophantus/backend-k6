import { check, sleep } from 'k6';
import { post, get } from '../../helpers/httpClient.js';
import { getHeader, getAdminToken, getUserToken } from '../../helpers/auth.js';
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

  const brandRes = post(API_ENDPOINT.BRAND.ADD, generateRandomBrand(), adminHeaders);
  const brandId = brandRes.json('brand._id');

  const productRes = post(API_ENDPOINT.PRODUCT.ADD, generateRandomProduct(brandId), adminHeaders);
  const productId = productRes.json('product._id');

  const userToken = getUserToken();
  const headers = getHeader(userToken);

  const cartPayload = { products: [{ product: productId, quantity: 1, price: 200000 }] };
  const cartRes = post(API_ENDPOINT.CART.ADD, cartPayload, headers);
  const cartId = cartRes.json('cartId');

  post(API_ENDPOINT.ORDER.ADD, { cartId, total: 200000 }, headers);

  return { userToken };
}

export default function (data) {
  const headers = getHeader(data.userToken);

  const res = get(API_ENDPOINT.ORDER.MY_ORDERS, headers);

  check(res, {
    'status 200': (r) => r.status === 200,
    'has orders': (r) => Array.isArray(r.json('orders')),
  });

  sleep(0.2);
}
