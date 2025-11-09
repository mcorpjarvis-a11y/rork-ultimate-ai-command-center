/**
 * Backend-safe shim for expo-auth-session
 * 
 * Provides stub implementations that throw descriptive errors.
 * OAuth flows should not run in backend; they're frontend-only.
 */

export const ResponseType = {
  Code: 'code',
  Token: 'token',
};

export const CodeChallengeMethod = {
  Plain: 'plain',
  S256: 'S256',
};

export const Prompt = {
  None: 'none',
  Login: 'login',
  Consent: 'consent',
  SelectAccount: 'select_account',
};

export function makeRedirectUri(options?: any): string {
  // Return a safe default for backend context
  // This won't be used since OAuth flows don't run in backend
  return 'http://localhost:3001/oauth/callback';
}

export class AuthRequest {
  constructor(config: any) {
    throw new Error('[expo-auth-session shim] AuthRequest should not be instantiated in backend. OAuth flows are frontend-only.');
  }
}

export function useAuthRequest(config: any, discovery: any): any {
  throw new Error('[expo-auth-session shim] useAuthRequest should not be called in backend. OAuth flows are frontend-only.');
}

export function useAutoDiscovery(issuerOrDiscoveryUrl: string): any {
  throw new Error('[expo-auth-session shim] useAutoDiscovery should not be called in backend. OAuth flows are frontend-only.');
}
