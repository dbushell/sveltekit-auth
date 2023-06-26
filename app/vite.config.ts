import {sveltekit} from '@sveltejs/kit/vite';
import type {UserConfig} from 'vite';

const config: UserConfig = {
  server: {
    host: '0.0.0.0',
    port: 3000
  },
  plugins: [sveltekit()]
};

export default config;
