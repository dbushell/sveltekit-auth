import {vitePreprocess} from '@sveltejs/kit/vite';
import adapter from 'sveltekit-adapter-deno';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter(),
    alias: {
      $components: 'src/components'
    },
    csrf: {
      checkOrigin: process.env.NODE_ENV === 'production'
    },
    csp: {
      mode: 'hash',
      directives: {
        'base-uri': ['none'],
        'form-action': ['self'],
        'script-src': ['self'],
        'object-src': ['none'],
        'frame-ancestors': ['self']
      }
    }
  }
};

export default config;
