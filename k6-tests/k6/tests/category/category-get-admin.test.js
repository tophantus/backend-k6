import { check, sleep } from 'k6';
import { get } from '../../helpers/httpClient.js';
import { getAdminToken, getHeader } from '../../helpers/auth.js';
import { API_ENDPOINT } from '../../constants/endpoint.js';

export const options = {
  vus: 10,
  duration: '30s',
};

export function setup() {
  return { token: getAdminToken() };
}

export default function (data) {
  const res = get(API_ENDPOINT.CATEGORY.GET_ALL, getHeader(data.token));

  check(res, {
    'status is 200': (r) => r.status === 200,
    'returns array': (r) => Array.isArray(r.json('categories')),
  });

  sleep(0.3);
}
