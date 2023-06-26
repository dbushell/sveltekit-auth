import type {RequestHandler} from './$types';
import type {Token, GitHubToken} from '$lib/server/types';
import {redirect} from '@sveltejs/kit';
import {setToken, validateCSRF} from '$lib/server/auth';
import {PRIVATE_GITHUB_SECRET} from '$env/static/private';
import {PUBLIC_ORIGIN, PUBLIC_GITHUB_CLIENT} from '$env/static/public';

const provider = 'github';

export const GET: RequestHandler = async (event) => {
  // User denied authentication
  if (event.url.searchParams.has('error')) {
    throw redirect(302, `/login?provider=${provider}&error=denied`);
  }

  // Validate state against cookie then delete it
  const state = event.url.searchParams.get('state') ?? '';
  const cookie = event.cookies.get('csrf') ?? '';
  const valid = await validateCSRF(state, cookie);
  event.cookies.delete('csrf', {path: '/'});
  if (!valid) {
    throw redirect(302, `/login?provider=${provider}&error=csrf`);
  }

  // Ensure code has been returned
  const code = event.url.searchParams.get('code');
  if (!code) {
    throw redirect(302, `/login?provider=${provider}&error=code`);
  }

  // Fetch access token
  const response = await event
    .fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      body: new URLSearchParams({
        client_id: PUBLIC_GITHUB_CLIENT,
        client_secret: PRIVATE_GITHUB_SECRET,
        redirect_uri: new URL(`/auth/${provider}/callback`, PUBLIC_ORIGIN).href,
        grant_type: 'authorization_code',
        code
      }),
      headers: {
        accept: 'application/json',
        'content-type': 'application/x-www-form-urlencoded'
      }
    })
    .catch((err) => {
      console.error(err);
      throw redirect(302, `/login?provider=${provider}&error=fetch`);
    });

  if (!response.ok) {
    throw redirect(302, `/login?provider=${provider}&error=response`);
  }

  const githubToken: GitHubToken = await response.json();

  if (!Object.hasOwn(githubToken, 'access_token')) {
    throw redirect(302, `/login?provider=${provider}&error=token`);
  }

  // Normalize token
  let token: Token = {
    provider,
    created_at: Math.floor(Date.now() / 1000),
    access_token: githubToken.access_token,
    access_expires_in: githubToken.expires_in,
    refresh_token: githubToken.refresh_token,
    refresh_expires_in: githubToken.refresh_token_expires_in,
    token_type: githubToken.token_type,
    scope: ''
  };

  await setToken(event.cookies, token);

  throw redirect(302, '/account');
};
