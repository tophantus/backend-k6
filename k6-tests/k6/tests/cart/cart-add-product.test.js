import { check, sleep } from 'k6';
import { post } from '../../helpers/httpClient.js';
import { getAdminToken, getHeader, getUserToken } from '../../helpers/auth.js';
import { API_ENDPOINT } from '../../constants/endpoint.js';
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

  const createProduct = () => {
    const payload = generateRandomProduct();
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

  return { userToken, product2, cartId };
}

export default function (data) {
  const headers = getHeader(data.userToken);

  // 🧩 payload thêm 1 sản phẩm mới vào giỏ hiện có
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
