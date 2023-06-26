// Generic token
export interface Token {
  provider: string;
  created_at: number;
  access_token: string;
  access_expires_in: number;
  refresh_token: string;
  refresh_expires_in: number;
  token_type: string;
  scope: string;
}

// GitHub token
export interface GitHubToken {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  refresh_token_expires_in: number;
  token_type: string;
  scope: string;
}
