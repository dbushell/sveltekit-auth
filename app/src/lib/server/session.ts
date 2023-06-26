import type {RequestEvent} from '@sveltejs/kit';
import type {User} from '$lib/types';
import {redirect} from '@sveltejs/kit';
import * as auth from '$lib/server/auth';

export const deleteSession = (event: RequestEvent): void => {
  auth.deleteToken(event.cookies);
  auth.deleteUser(event.cookies);
  event.locals.token = undefined;
  event.locals.user = undefined;
};

export const getSession = async (event: RequestEvent): Promise<void> => {
  // No session for logout
  if (event.url.pathname.startsWith('/auth/logout')) {
    return;
  }

  // Retrieve token from cookie
  event.locals.token = await auth.getToken(event.cookies);
  if (!event.locals.token) {
    return;
  }

  // Go no further if refreshing token
  if (event.url.pathname.match(/^\/auth\/[^\\]+\/refresh/)) {
    return;
  }

  const invalidate = () => {
    deleteSession(event);
    throw redirect(302, '/login');
  };

  const {created_at, access_expires_in, refresh_expires_in, provider} =
    event.locals.token;

  // Logout if refresh token has expired
  const age = Math.floor(Date.now() / 1000) - created_at;
  if (age >= refresh_expires_in) {
    return invalidate();
  }

  // Refresh if access token has expired
  if (age >= access_expires_in) {
    const response = await event.fetch(`/auth/${provider}/refresh`);
    if (!response.ok) {
      return invalidate();
    }
    event.locals.token = await auth.getToken(event.cookies);
    if (!event.locals.token) {
      return invalidate();
    }
  }

  // Prevent infinite loop
  if (event.url.pathname.startsWith('/auth')) {
    return;
  }

  // Retrieve user from cookie
  event.locals.user = await auth.getUser(event.cookies);

  // Retrieve user from provider
  if (!event.locals.user) {
    const response = await event.fetch(`/auth/${provider}/user`);
    if (response.ok) {
      event.locals.user = (await response.json()) as User;
      await auth.setUser(event.cookies, event.locals.user);
    }
  }

  // Logout if user not found
  if (!event.locals.user) {
    return invalidate();
  }
};
