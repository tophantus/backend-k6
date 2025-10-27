import { check } from 'k6';
import { registerUser } from '../../helpers/auth.js';
import users from '../../data/users.json' assert { type: "json" };

export const options = {
    vus: 1,
    iterations: 1
};

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
}
