import { check, sleep } from 'k6';
import { post, get } from '../../helpers/httpClient.js';
import { getAdminToken, getHeader } from '../../helpers/auth.js';
import { API_ENDPOINT } from '../../constants/endpoint.js';
import { generateRandomCategory } from '../../utils/category.js';

export const options = {
  vus: 10,
  duration: '30s',
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
