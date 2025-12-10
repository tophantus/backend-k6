import { check, sleep } from 'k6';
import { get } from '../../helpers/httpClient.js';
import { getAdminToken, getHeader } from '../../helpers/auth.js';
import { API_ENDPOINT } from '../../constants/endpoint.js';

const TEST_TYPE = __ENV.TEST_TYPE || 'smoke';

const testOptions = {
  smoke: {
    vus: 1,
    duration: '10s',
    thresholds: {
      http_req_failed: ['rate<0.01'],
      http_req_duration: ['p(95)<400'],
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
      http_req_duration: ['p(95)<500'],
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
      http_req_duration: ['p(95)<2000'],
    },
  },
};

export const options = testOptions[TEST_TYPE];

export function setup() {
}

export default function (data) {
  const res = get(API_ENDPOINT.CATEGORY.GET_ALL_PUBLIC, {}, API_ENDPOINT.CATEGORY.GET_ALL_PUBLIC);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'returns array': (r) => Array.isArray(r.json('categories')),
  });

  sleep(0.3);
}

import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";

export function handleSummary(data) {
  const type = TEST_TYPE || "unknown";
  
    return {
      [`/results/get_public_categories_${type}.html`]: htmlReport(data),
    };
}
