/**
 * Backend-safe shim for expo-web-browser
 * 
 * Provides stub implementations that throw descriptive errors.
 * Web browser operations are frontend-only.
 */

export function maybeCompleteAuthSession(): void {
  // No-op in backend
}

export async function openBrowserAsync(url: string, options?: any): Promise<any> {
  throw new Error('[expo-web-browser shim] openBrowserAsync should not be called in backend. Browser operations are frontend-only.');
}

export async function dismissBrowser(): Promise<void> {
  // No-op in backend
}

export async function warmUpAsync(browserPackage?: string): Promise<any> {
  // No-op in backend
  return { type: 'cancel' };
}

export async function coolDownAsync(browserPackage?: string): Promise<any> {
  // No-op in backend
  return { type: 'cancel' };
}
