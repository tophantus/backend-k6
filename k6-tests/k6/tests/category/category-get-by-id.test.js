import { check, sleep } from 'k6';
import { post, get } from '../../helpers/httpClient.js';
import { getAdminToken, getHeader } from '../../helpers/auth.js';
import { API_ENDPOINT } from '../../constants/endpoint.js';
import { generateRandomCategory } from '../../utils/category.js';

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
  const token = getAdminToken()

  const headers = getHeader(token);
  const resAdd = post(API_ENDPOINT.CATEGORY.ADD, generateRandomCategory(), headers);

  return { token, id: resAdd.json('category._id') };
}

export default function (data) {
  const res = get(API_ENDPOINT.CATEGORY.GET_BY_ID(data.id), getHeader(data.token));

  check(res, {
    'status is 200': (r) => r.status === 200,
    'has category name': (r) => !!r.json('category.name'),
  });

  sleep(0.3);
}
