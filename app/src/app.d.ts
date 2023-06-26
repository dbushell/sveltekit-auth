import type {Token} from '$lib/server/types';
import type {User} from '$lib/types';

declare global {
  namespace App {
    interface Locals {
      token: Token | undefined;
      user: User | undefined;
    }
    interface PageData {
      user: User | undefined;
    }
    interface Error {
      message: string;
    }
  }
}

export {};
