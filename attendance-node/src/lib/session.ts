import crypto from 'crypto';

const encodeHexLowerCase = (data: Uint8Array) => {
  return Array.from(data)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
};

const BASE32_ALPHABET = 'abcdefghijklmnopqrstuvwxyz234567';

const encodeBase32LowerCaseNoPadding = (
  bytes: string | any[] | Buffer<ArrayBufferLike>,
) => {
  let bits = 0;
  let value = 0;
  let output = '';

  for (let i = 0; i < bytes.length; i++) {
    value = (value << 8) | bytes[i];
    bits += 8;

    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
};

export const generateRandomSessionToken = () => {
  const bytes = crypto.randomBytes(20);
  return encodeBase32LowerCaseNoPadding(bytes);
};

export const fromSessionTokenToSessionId = (sessionToken: string) => {
  const hash = crypto.createHash('sha256').update(sessionToken).digest();
  return encodeHexLowerCase(new Uint8Array(hash));
};
