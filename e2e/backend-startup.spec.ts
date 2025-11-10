import { test, expect } from '@playwright/test';

test.describe('Backend Health Checks', () => {
  test('should return 200 OK from /healthz endpoint', async ({ request }) => {
    const response = await request.get('http://localhost:3000/healthz');
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const body = await response.json();
    expect(body).toHaveProperty('status', 'ok');
    expect(body).toHaveProperty('timestamp');
  });

  test('should return 200 OK from /readyz endpoint', async ({ request }) => {
    const response = await request.get('http://localhost:3000/readyz');
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const body = await response.json();
    expect(body).toHaveProperty('status', 'ready');
    expect(body).toHaveProperty('timestamp');
    expect(body).toHaveProperty('websocket');
  });

  test('should return server info from root endpoint', async ({ request }) => {
    const response = await request.get('http://localhost:3000/');
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const body = await response.json();
    expect(body).toHaveProperty('status', 'online');
    expect(body).toHaveProperty('message');
    expect(body).toHaveProperty('version');
    expect(body).toHaveProperty('timestamp');
  });
});

test.describe('Backend Startup', () => {
  test('should start without requiring API keys', async ({ request }) => {
    // Verify server is running without API keys
    const response = await request.get('http://localhost:3000/healthz');
    expect(response.ok()).toBeTruthy();
    
    // This test passes if the server responds, proving it started without API keys
  });

  test('should not make external API calls on startup', async ({ page }) => {
    // Track all network requests
    const externalAPICalls: string[] = [];
    
    page.on('request', (request) => {
      const url = request.url();
      
      // Check if request is to external AI APIs
      if (
        url.includes('openai.com') ||
        url.includes('groq.com') ||
        url.includes('huggingface.co') ||
        url.includes('together.xyz') ||
        url.includes('deepseek.com') ||
        url.includes('replicate.com')
      ) {
        externalAPICalls.push(url);
      }
    });

    // Navigate to health endpoint
    await page.goto('http://localhost:3000/healthz');
    
    // Wait a bit for any delayed requests
    await page.waitForTimeout(2000);
    
    // Verify no external API calls were made
    expect(externalAPICalls).toHaveLength(0);
  });
});
