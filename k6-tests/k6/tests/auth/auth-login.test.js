import { check, sleep } from 'k6';
import { loginUser } from '../../helpers/auth.js';
import { Counter, Rate } from 'k6/metrics';

export let loginFailures = new Counter('login_failures');
export let loginSuccessRate = new Rate('login_success_rate');

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

const users = JSON.parse(open('../../data/users.json')); 

export default function () {
    const user = users[0];
    const res = loginUser(user.email, user.password);

    const success = res.status === 200 && res.json('token') !== undefined;

    if (!success) loginFailures.add(1);
    loginSuccessRate.add(success);

    check(res, {
        'status 200': (r) => r.status === 200,
        'has token': (r) => r.json('token') !== undefined
    });

    sleep(0.15);
}
