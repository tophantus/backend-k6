import { SharedArray } from 'k6/data';

const admin = new SharedArray('admin', () =>
  JSON.parse(open('../data/admin.json'))
);

export function getTestAdmin() {
  if (!admin ||  admin.length === 0) {
    throw new Error('No admin data found in data/admin.json');
  }

  return admin[0];
}
