import type {Cookies} from '@sveltejs/kit';
import type {Token} from '$lib/server/types';
import type {User} from '$lib/types';
import {hexEncode} from '$lib/utils/hex';
import {sha256Hash, encryptText, decryptText} from '$lib/server/crypto';
import {PRIVATE_COOKIE_KEY, PRIVATE_CSRF_SALT} from '$env/static/private';

const COOKIE_TOKEN = 'app-token';
const COOKIE_USER = 'app-user';

export const deleteToken = (cookies: Cookies) => {
  cookies.delete(COOKIE_TOKEN, {path: '/'});
};

export const deleteUser = (cookies: Cookies) => {
  cookies.delete(COOKIE_USER, {path: '/'});
};

// Retrieve token from cookie
export const getToken = async (
  cookies: Cookies
): Promise<Token | undefined> => {
  try {
    const tokenCookie = cookies.get(COOKIE_TOKEN);
    if (!tokenCookie) {
      return;
    }
    let token: Token;
    const cookieData = await decryptText(tokenCookie, PRIVATE_COOKIE_KEY);
    if (!cookieData) throw Error();
    token = JSON.parse(cookieData);
    if (token && Object.hasOwn(token, 'access_token')) {
      return token;
    }
  } catch (err) {
    return;
  }
  return;
};

// Set encrypted token cookie
export const setToken = async (cookies: Cookies, token: Token) => {
  const encryptToken = await encryptText(
    JSON.stringify(token),
    PRIVATE_COOKIE_KEY
  );
  const expires_in = Math.max(
    token.refresh_expires_in,
    token.access_expires_in
  );
  cookies.set(COOKIE_TOKEN, encryptToken, {
    path: '/',
    secure: true,
    httpOnly: true,
    sameSite: 'lax',
    expires: new Date(Date.now() + expires_in * 1000)
  });
};

// Retrieve user from cookie
export const getUser = async (cookies: Cookies): Promise<User | undefined> => {
  try {
    const userCookie = cookies.get(COOKIE_USER);
    if (!userCookie) {
      return;
    }
    let user: User;
    const cookieData = await decryptText(userCookie, PRIVATE_COOKIE_KEY);
    if (!cookieData) throw Error();
    user = JSON.parse(cookieData);
    if (user && Object.hasOwn(user, 'name')) {
      return user;
    }
  } catch (err) {
    return;
  }
  return;
};

// Set encrypted user cookie
export const setUser = async (cookies: Cookies, user: User) => {
  const encryptUser = await encryptText(
    JSON.stringify(user),
    PRIVATE_COOKIE_KEY
  );
  cookies.set(COOKIE_USER, encryptUser, {
    path: '/',
    secure: true,
    httpOnly: true,
    sameSite: 'lax'
  });
};

// Create a CSRF token and cookie
export const createCSRF = async (): Promise<{
  token: string;
  cookie: string;
}> => {
  const values = globalThis.crypto.getRandomValues(new Uint8Array(32));
  const token = hexEncode(values);
  const tokenHash = await sha256Hash(`${token}${PRIVATE_CSRF_SALT}`);
  const cookie = hexEncode(tokenHash);
  return {token, cookie};
};

// Validate a CSRF token and cookie
export const validateCSRF = async (
  token: string,
  cookie: string
): Promise<boolean> => {
  const tokenHash = await sha256Hash(`${token}${PRIVATE_CSRF_SALT}`);
  const cookieCompare = hexEncode(tokenHash);
  return cookie === cookieCompare;
};
