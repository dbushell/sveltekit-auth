import {hexEncode, hexDecode} from '$lib/utils/hex';
import * as base64 from '$lib/utils/base64';

const {
  crypto,
  crypto: {subtle}
} = globalThis;

export const sha256Hash = (value: string): Promise<ArrayBuffer> =>
  subtle.digest('SHA-256', new TextEncoder().encode(value));

const randomIV = (length: number): Uint8Array =>
  crypto.getRandomValues(new Uint8Array(length));

export const importKey = async (password: string): Promise<CryptoKey> => {
  const key = await subtle.importKey(
    'raw',
    await sha256Hash(password),
    {name: 'AES-GCM'},
    false,
    ['encrypt', 'decrypt']
  );
  return key;
};

export const encryptText = async (
  value: string,
  key: CryptoKey | string
): Promise<string> => {
  const iv = randomIV(12);
  const theKey = key instanceof CryptoKey ? key : await importKey(key);
  const encryptedValue = await subtle.encrypt(
    {
      name: 'AES-GCM',
      iv
    },
    theKey,
    new TextEncoder().encode(value)
  );
  return `${hexEncode(iv)}:${base64.encode(encryptedValue)}`;
};

export const decryptText = async (
  value: string,
  key: CryptoKey | string
): Promise<string> => {
  const data = value.split(':');
  const iv = hexDecode(data[0]);
  const theKey = key instanceof CryptoKey ? key : await importKey(key);
  const decryptedValue = await subtle.decrypt(
    {
      name: 'AES-GCM',
      iv
    },
    theKey,
    base64.decode(data[1])
  );
  return new TextDecoder().decode(decryptedValue);
};
