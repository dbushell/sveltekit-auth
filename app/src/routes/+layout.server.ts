import type {LayoutServerLoad} from './$types';

export const trailingSlash = 'always';

export const load: LayoutServerLoad = async (event) => {
  let user = undefined;
  if (event.locals.user) {
    user = structuredClone(event.locals.user);
  }
  return {
    user
  };
};
