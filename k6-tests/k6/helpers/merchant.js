import { SharedArray } from 'k6/data';

const merchant = new SharedArray('merchant', () =>
  JSON.parse(open('../data/merchant.json'))
);

export function getTestMerchant() {
  if (!merchant ||  merchant.length === 0) {
    throw new Error('No merchant data found in data/merchant.json');
  }

  return merchant[0];
}
