import { check, sleep } from 'k6';
import { getHeader, loginUser } from '../../helpers/auth.js';
import { post } from '../../helpers/httpClient.js';
import { getTestUser } from '../../helpers/user.js';
import { generateRandomAddress } from '../../utils/address.js';
import { API_ENDPOINT } from '../../constants/enpoint.js';


export const options = { vus: 10, duration: '20s' };

export function setup() {
    const user = getTestUser()
    const loginRes = loginUser(user.email, user.password);
    return { token: loginRes.json('token') };
}

export default function (data) {
    const randomAddress = generateRandomAddress();
    const res = post(API_ENDPOINT.ADDRESS.ADD, randomAddress, getHeader(data.token));

    check(res, {
        'status 200': (r) => r.status === 200,
        'has address': (r) => r.json('address') !== undefined,
        'success true': (r) => r.json('success') === true,
    });

    sleep(1);
}
