import type {RequestHandler} from './$types';
import {json, error} from '@sveltejs/kit';

const provider = 'github';

export const GET: RequestHandler = async (event) => {
  const unauthorized = error(401, 'Unauthorized');
  if (!event.locals.token) {
    throw unauthorized;
  }
  if (event.locals.token.provider !== provider) {
    throw unauthorized;
  }
  try {
    const response = await event.fetch('https://api.github.com/user', {
      headers: {
        accept: 'application/vnd.github+json',
        authorization: `${event.locals.token.token_type} ${event.locals.token.access_token}`,
        'x-github-api-version': '2022-11-28'
      }
    });
    if (!response.ok) {
      throw new Error();
    }
    const data = await response.json();
    if (!Object.hasOwn(data, 'id')) {
      throw new Error();
    }
    if (!Object.hasOwn(data, 'login')) {
      throw new Error();
    }
    return json({
      provider,
      id: data.id,
      name: data.login
    });
  } catch {
    throw unauthorized;
  }
};
