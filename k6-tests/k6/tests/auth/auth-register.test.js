import { check, sleep } from 'k6';
import { registerUser } from '../../helpers/auth.js';
const users = JSON.parse(open('../../data/users.json'));

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

export default function () {
    const user = users[0];

    const randomEmail = `test${Date.now()}@example.com`;
    const newUser = { ...user, email: randomEmail };

    const res = registerUser(newUser);

    check(res, {
        'status 200': (r) => r.status === 200,
        'has token': (r) => r.json('token') !== undefined,
        'success true': (r) => r.json('success') === true
    });

    sleep(0.15)
}
