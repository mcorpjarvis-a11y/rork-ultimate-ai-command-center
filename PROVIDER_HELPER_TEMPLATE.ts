
// Generic types for provider helpers
export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
  scope?: string;
  profile?: any;
  expires_at?: number;
  scopes?: string[];
}

export async function startAuth(): Promise<AuthResponse> {
  throw new Error('Implement provider-specific startAuth (PKCE or Device Flow)');
}

export async function refreshToken(refresh_token: string): Promise<AuthResponse> {
  throw new Error('Implement provider-specific refreshToken');
}

export async function revokeToken(token: string): Promise<void> {
  // optional
}
