import type {Handle, HandleServerError} from '@sveltejs/kit';
import {redirect} from '@sveltejs/kit';
import {sequence} from '@sveltejs/kit/hooks';
import {getSession} from '$lib/server/session';

const appHandle: Handle = async ({event, resolve}) => {
  await getSession(event);

  // Redirect to login page if not logged in
  const protectedRoutes = ['/account'];
  protectedRoutes.forEach((path) => {
    if (event.url.pathname.startsWith(path)) {
      if (!event.locals.token) {
        throw redirect(302, '/login');
      }
    }
  });

  // Redirect to account page if logged in
  if (event.url.pathname.startsWith('/login')) {
    if (event.locals.token) {
      throw redirect(302, '/account');
    }
  }

  return await resolve(event);
};

export const handle = sequence(appHandle);

export const handleError: HandleServerError = async ({error, event}) => {
  if (globalThis?.process?.env?.NODE_ENV === 'development') {
    console.error(error);
  }
  return {
    message: event.route.id === null ? 'Not Found' : 'Internal Error'
  };
};
