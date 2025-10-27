function randomString(length = 6) {
  const chars = 'abcdefghijklmnopqrstuvwxyz';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function randomPhone() {
  const prefix = '+84';
  const number = Math.floor(100000000 + Math.random() * 900000000);
  return `${prefix}${number}`;
}

export function generateRandomAddress() {
  const name = `User ${randomString(4)}`;
  const street = `${Math.floor(Math.random() * 999)} ${randomString(5)} Street`;
  const city = ['Hanoi', 'Saigon', 'Danang', 'Hue'][Math.floor(Math.random() * 4)];
  const postal = Math.floor(10000 + Math.random() * 89999).toString();
  const country = 'Vietnam';
  const phone = randomPhone();

  return {
    fullName: name,
    address: street,
    city,
    postalCode: postal,
    country,
    phone,
  };
}
