import type {PageLoad} from './$types';

export const load: PageLoad = async (event) => {
  let error = '';
  if (event.url.searchParams.has('error')) {
    error = 'Authentication failed. Please try again.';
  }
  return {
    heading: 'Login',
    error
  };
};
