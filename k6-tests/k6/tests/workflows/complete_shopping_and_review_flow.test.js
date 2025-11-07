import { check, sleep } from 'k6';
import { del, get, post } from '../../helpers/httpClient.js';
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

  const keyword = "shopping_and_review";

  const productPayload = { ...generateRandomProduct(brandId), name: keyword };

  const productRes = post(API_ENDPOINT.PRODUCT.ADD, productPayload, adminHeaders);
  check(productRes, {
    'product created': (r) => r.status === 200 && r.json('success') === true,
  });
  const productId = productRes.json('product._id');
  const productSlug = productRes.json('product.slug');

  return { adminToken, productId, productSlug, brandId, keyword };
}

export default function(data) {
  const headers = getHeader(getUserToken());

  const searchUrl = API_ENDPOINT.PRODUCT.STORE_SEARCH(data.keyword);
  const searchRes = get(searchUrl);
  const products = searchRes.json('products');
  check(searchRes, {
      [`${data.keyword} - status 200`]: (r) => r.status === 200,
      [`${data.keyword} - has products array`]: (r) => Array.isArray(r.json('products')),
    }
  );

  const productSlug = products[0].slug;

  const reviewRes = get(API_ENDPOINT.REVIEW.GET_BY_SLUG(data.productSlug));
  check(reviewRes, {
    'get reviews by slug success': (r) => r.status === 200 && Array.isArray(r.json('reviews')),
  });

  const productRes = get(API_ENDPOINT.PRODUCT.ITEM(productSlug));
  check(productRes, {
    'product detail status 200': (r) => r.status === 200,
    'product has id': (r) => !!r.json('product._id'),
  });
  const productId = productRes.json('product._id');

  const cartPayload = {
    products: [
      {
        product: productId,
        quantity: 1,
        price: 250000,
        taxable: false,
      },
    ],
  };

  const cartRes = post(API_ENDPOINT.CART.ADD, cartPayload, headers);

  check(cartRes, {
    'cart creation status 200': (r) => r.status === 200,
    'cart creation success': (r) => r.json('success') === true,
    'cartId exists': (r) => !!r.json('cartId'),
  });

  const cartId = cartRes.json('cartId');

  const orderPayload = {
    cartId,
    total: 200000,
  };

  const orderRes = post(API_ENDPOINT.ORDER.ADD, orderPayload, headers);

  check(orderRes, {
    'order created 200': (r) => r.status === 200,
    'success true': (r) => r.json('success') === true,
    'has order id': (r) => !!r.json('order._id'),
  });

  sleep(0.15);
  
}

export function teardown(data) {
  const headers = getHeader(data.adminToken);

  const resProduct = del(API_ENDPOINT.PRODUCT.DELETE(data.productId), headers);
  check(resProduct, { 'deleted product': (r) => r.status === 200 });

  const resBrand = del(API_ENDPOINT.BRAND.DELETE(data.brandId), headers);
  check(resBrand, { 'deleted brand': (r) => r.status === 200 });
}

