import { check, sleep } from 'k6';
import { post } from '../../helpers/httpClient.js';
import { getAdminToken, getHeader, getUserToken } from '../../helpers/auth.js';
import { API_ENDPOINT } from '../../constants/endpoint.js';
import { generateRandomProduct } from '../../utils/product.js';
import { generateRandomBrand } from '../../utils/brand.js';

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

  const createProduct = () => {
    const payload = generateRandomProduct(brandId);
    const res = post(API_ENDPOINT.PRODUCT.ADD, payload, adminHeaders);
    check(res, { 'product created': (r) => r.status === 200 });
    return res.json('product._id');
  };

  const product1 = createProduct();
  const product2 = createProduct();

  const userToken = getUserToken()
  const userHeaders = getHeader(userToken);

  const createCartPayload = {
    products: [
      {
        product: product1,
        quantity: 1,
        price: 200000,
        taxable: false,
      },
    ],
  };
  const resCart = post(API_ENDPOINT.CART.ADD, createCartPayload, userHeaders);
  check(resCart, { 'cart created 200': (r) => r.status === 200 });

  const cartId = resCart.json('cartId');

  return { userToken, product2, product1, brandId, cartId };
}

export default function (data) {
  const headers = getHeader(data.userToken);

  const addProductPayload = {
    product: {
      product: data.product2,
      quantity: 2,
      price: 250000,
      taxable: false,
    },
  };

  const url = API_ENDPOINT.CART.ADD_PRODUCT(data.cartId);
  const res = post(url, addProductPayload, headers);

  check(res, {
    'status 200': (r) => r.status === 200,
    'success true': (r) => r.json('success') === true,
  });

  sleep(0.3);
}

export function teardown(data) {
  const headers = getHeader(data.adminToken);
  const resCart = del(API_ENDPOINT.CART.DELETE(data.cartId), headers);
  check(resCart, { 'deleted cart': (r) => r.status === 200 });

  const resProduct1 = del(API_ENDPOINT.PRODUCT.DELETE(data.product1), headers);
  check(resProduct1, { 'deleted product1': (r) => r.status === 200 });

  const resProduct2 = del(API_ENDPOINT.PRODUCT.DELETE(data.product2), headers);
  check(resProduct2, { 'deleted product2': (r) => r.status === 200 });


  const resBrand = del(API_ENDPOINT.BRAND.DELETE(data.brandId), headers);
  check(resBrand, { 'deleted brand': (r) => r.status === 200 });
}

