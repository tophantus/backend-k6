import { check, sleep } from 'k6';
import { loginUser } from '../../helpers/auth.js';
import { Counter, Rate } from 'k6/metrics';

export let loginFailures = new Counter('login_failures');
export let loginSuccessRate = new Rate('login_success_rate');

export const options = {
    stages: [
        { duration: '10s', target: 5 },
        { duration: '20s', target: 10 },
        { duration: '20s', target: 10 },
        { duration: '10s', target: 0 }
    ],
    thresholds: {
        'http_req_duration': ['p(95)<500'],
        'login_success_rate': ['rate>0.95']
    }
};

const users = JSON.parse(open('../../data/users.json')); 

export default function () {
    const user = users[Math.floor(Math.random() * users.length)];
    const res = loginUser(user.email, user.password);

    const success = res.status === 200 && res.json('token') !== undefined;

    if (!success) loginFailures.add(1);
    loginSuccessRate.add(success);

    check(res, {
        'status 200': (r) => r.status === 200,
        'has token': (r) => r.json('token') !== undefined
    });

    sleep(1);
}
