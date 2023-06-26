import type {RequestHandler} from './$types';
import type {GitHubToken} from '$lib/server/types';
import {setToken} from '$lib/server/auth';
import {PRIVATE_GITHUB_SECRET} from '$env/static/private';
import {PUBLIC_ORIGIN, PUBLIC_GITHUB_CLIENT} from '$env/static/public';

const provider = 'github';

export const GET: RequestHandler = async (event) => {
  const unauthorized = new Response('Unauthorized', {status: 401});
  if (!event.locals.token) {
    return unauthorized;
  }
  if (event.locals.token.provider !== provider) {
    return unauthorized;
  }

  const {created_at, access_expires_in, refresh_expires_in, refresh_token} =
    event.locals.token;

  // Check token has expired
  const age = Math.floor(Date.now() / 1000) - created_at;
  if (age < access_expires_in || age >= refresh_expires_in) {
    return unauthorized;
  }

  // Fetch refreshed token
  const response = await event
    .fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      body: new URLSearchParams({
        client_id: PUBLIC_GITHUB_CLIENT,
        client_secret: PRIVATE_GITHUB_SECRET,
        redirect_uri: new URL(`/auth/${provider}/callback`, PUBLIC_ORIGIN).href,
        grant_type: 'refresh_token',
        refresh_token
      }),
      headers: {
        accept: 'application/json',
        'content-type': 'application/x-www-form-urlencoded'
      }
    })
    .catch((err) => {
      console.error(err);
      return unauthorized;
    });

  const githubToken: GitHubToken = await response.json();

  if (!Object.hasOwn(githubToken, 'access_token')) {
    return unauthorized;
  }

  event.locals.token = {
    ...event.locals.token,
    created_at: Math.floor(Date.now() / 1000),
    access_token: githubToken.access_token,
    access_expires_in: githubToken.expires_in,
    refresh_token: githubToken.refresh_token,
    refresh_expires_in: githubToken.refresh_token_expires_in
  };

  await setToken(event.cookies, event.locals.token);

  return new Response(null, {status: 200});
};
