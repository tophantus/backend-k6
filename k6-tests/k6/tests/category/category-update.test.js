import { check, sleep } from 'k6';
import { post, put } from '../../helpers/httpClient.js';
import { getAdminToken, getHeader } from '../../helpers/auth.js';
import { API_ENDPOINT } from '../../constants/endpoint.js';
import { generateRandomCategory } from '../../utils/category.js';

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
  const token = getAdminToken();
  const headers = getHeader(token);
  
  const resAdd = post(API_ENDPOINT.CATEGORY.ADD, generateRandomCategory(), headers);
  if (resAdd.status !== 200) {
    throw new Error('Failed to create category for testing update');
  }
  const categoryId = resAdd.json('category._id');

  return { token, categoryId };
}

export default function (data) {
  const headers = getHeader(data.token);

  const updatePayload = {
    category: {
      name: `UpdatedName_${__VU}_${__ITER}`,
      description: `Updated description at iteration ${__ITER}`,
      isActive: true,
    },
  };

  const url = API_ENDPOINT.CATEGORY.UPDATE(data.categoryId);

  const res = put(url, updatePayload, headers);

  check(res, {
    'status 200': (r) => r.status === 200,
    'success true': (r) => r.json('success') === true,
  });

  sleep(0.3);
}
