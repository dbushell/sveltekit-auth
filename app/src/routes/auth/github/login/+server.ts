import type {RequestHandler} from './$types';
import {redirect} from '@sveltejs/kit';
import {createCSRF} from '$lib/server/auth';
import {PUBLIC_ORIGIN, PUBLIC_GITHUB_CLIENT} from '$env/static/public';

export const POST: RequestHandler = async (event) => {
  const {token, cookie} = await createCSRF();
  event.cookies.set('csrf', cookie, {
    path: '/',
    secure: true,
    httpOnly: true,
    sameSite: 'lax',
    // Expires after 5 minutes
    expires: new Date(Date.now() + 300_000)
  });
  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', PUBLIC_GITHUB_CLIENT);
  url.searchParams.set(
    'redirect_uri',
    new URL('/auth/github/callback', PUBLIC_ORIGIN).href
  );
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('state', token);
  url.searchParams.set('scope', '');
  throw redirect(302, url.href);
};
