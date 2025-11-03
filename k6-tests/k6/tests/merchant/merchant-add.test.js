import { check, sleep } from 'k6';
import { post } from '../../helpers/httpClient.js';
import { API_ENDPOINT } from '../../constants/endpoint.js';
import { generateMerchant } from '../../utils/merchant.js';

export const options = {
  stages: [
    { duration: '20s', target: 10 },
    { duration: '40s', target: 30 },
    { duration: '20s', target: 0 },
  ],
  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<2000'],
  },
};


export default function () {
  const merchant = generateMerchant();
  const res = post(API_ENDPOINT.MERCHANT.ADD, merchant);

  check(res, {
    'status 200': (r) => r.status === 200,
    'success true': (r) => r.json('success') === true,
    'has merchant id': (r) => r.json('merchant')?._id !== undefined,
  });

  sleep(0.3);
}
