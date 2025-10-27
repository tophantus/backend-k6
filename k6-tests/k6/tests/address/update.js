import { check, sleep } from 'k6';
import { getHeader, loginUser } from '../../helpers/auth.js';
import { post, put } from '../../helpers/httpClient.js';
import { getTestUser } from '../../helpers/user.js';
import { generateRandomAddress } from '../../utils/address.js';
import { API_ENDPOINT } from '../../constants/endpoint.js';

export const options = {
  stages: [
    { duration: '20s', target: 5 }, 
    { duration: '40s', target: 20 }, 
    { duration: '20s', target: 0 },  
  ],
};


export function setup() {
    const user = getTestUser();
    const loginRes = loginUser(user.email, user.password);
    const token = loginRes.json('token');

    const addRes = post(API_ENDPOINT.ADDRESS.ADD, generateRandomAddress(), getHeader(token));

    return { token, addressId: addRes.json('address')._id };
}

export default function (data) {
    const res = put(API_ENDPOINT.ADDRESS.UPDATE(data.addressId), {
        fullName: 'New Name',
        address: 'New Street',
        city: 'Hanoi',
        postalCode: '70000',
        country: 'VN',
        phone: '+84987654321',
    }, headers);

    check(res, {
        'status 200': (r) => r.status === 200,
        'update success': (r) => r.json('success') === true,
    });

    sleep(0.2);
}
