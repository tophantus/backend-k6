import { check, sleep } from 'k6';
import { get, post, del } from '../../helpers/httpClient.js';
import { getAdminToken, getHeader } from '../../helpers/auth.js';
import { API_ENDPOINT } from '../../constants/endpoint.js';
import { generateRandomBrand } from '../../utils/brand.js';
import { generateRandomProduct } from '../../utils/product.js';

const TEST_TYPE = __ENV.TEST_TYPE || 'smoke';

const testOptions = {
  smoke: {
    vus: 1,
    duration: '10s',
    thresholds: {
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
      http_req_duration: ['p(95)<4000'],
    },
  },
};

export const options = testOptions[TEST_TYPE];

export function setup() {
  const adminToken = getAdminToken();
  const headers = getHeader(adminToken);

  const brand = generateRandomBrand();
  const brandRes = post(API_ENDPOINT.BRAND.ADD, brand, headers);
  const brandId = brandRes.json('brand._id');

  const keywords = ['Phone_Test_123', 'Laptop_Test_123', 'Camera_Test_123'];
  const productIds = [];

  for (const keyword of keywords) {
    const payload = { ...generateRandomProduct(brandId), name: keyword };
    const res = post(API_ENDPOINT.PRODUCT.ADD, payload, headers);

    check(res, {
      [`created product ${keyword}`]: (r) => r.status === 200 && r.json('success') === true,
    });

    productIds.push(res.json('product._id'));
  }

  const fakeKeywords = ['NoResult_XYZ', 'Nothing_ABC'];

  return { adminToken, brandId, productIds, keywords, fakeKeywords };
}


export default function (data) {
  const allKeywords = [...data.keywords, ...data.fakeKeywords];
  const keyword = allKeywords[Math.floor(Math.random() * allKeywords.length)];

  const url = `${API_ENDPOINT.PRODUCT.STORE_SEARCH(keyword)}?page=1&limit=5`;
  const res = get(url);
  const isFake = data.fakeKeywords.includes(keyword);

  if (isFake) {
    check(res, {
      [`${keyword} - returns error`]: (r) => r.status === 400 || r.status === 404,
    });
  } else {
    check(res, {
      [`${keyword} - status 200`]: (r) => r.status === 200,
      [`${keyword} - has products array`]: (r) => Array.isArray(r.json('products')),
    });

    const products = res.json('products') || [];
    check(res, {
      [`${keyword} - found keyword in results`]: () =>
        products.some((p) => p.name && p.name.includes(keyword)),
    });
  }

  sleep(0.2);
}


export function teardown(data) {
  const headers = getHeader(data.adminToken);

  for (const productId of data.productIds) {
    const res = del(API_ENDPOINT.PRODUCT.DELETE(productId), headers);
    check(res, { [`deleted product ${productId}`]: (r) => r.status === 200 });
  }

  const resBrand = del(API_ENDPOINT.BRAND.DELETE(data.brandId), headers);
  check(resBrand, { 'deleted brand': (r) => r.status === 200 });
}
