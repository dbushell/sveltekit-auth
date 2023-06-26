import type {RequestHandler} from './$types';
import {redirect} from '@sveltejs/kit';
import {deleteSession} from '$lib/server/session';

export const POST: RequestHandler = async (event) => {
  deleteSession(event);
  throw redirect(302, '/login');
};
