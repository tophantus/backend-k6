import { SharedArray } from 'k6/data';

const users = new SharedArray('users', () =>
  JSON.parse(open('../data/users.json'))
);

export function getTestUser(index = 0) {
  if (!users || users.length === 0) {
    throw new Error('❌ No users found in data/users.json');
  }

  if (index < 0 || index >= users.length) {
    throw new Error(`❌ Invalid user index: ${index}`);
  }

  return users[index];
}
