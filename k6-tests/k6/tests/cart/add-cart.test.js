import { check, sleep } from 'k6';
import { post } from '../../helpers/httpClient.js';
import { getAdminToken, getHeader, getUserToken } from '../../helpers/auth.js';
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
  const adminToken = getAdminToken();
  const adminHeaders = getHeader(adminToken);
  
  const brandPayload = generateRandomBrand();
  
  const brandRes = post(API_ENDPOINT.BRAND.ADD, brandPayload, adminHeaders);
  
  check(brandRes, {
    'brand created': (r) => r.status === 200 && r.json('success') === true,
  });
  
  const brandId = brandRes.json('brand._id');

  // Sửa: dùng adminHeaders chứ không phải undefined `headers`
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
