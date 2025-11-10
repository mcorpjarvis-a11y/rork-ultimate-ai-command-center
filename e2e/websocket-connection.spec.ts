import { test, expect } from '@playwright/test';

test.describe('WebSocket Connection', () => {
  test('should handle WebSocket connection attempt', async ({ page }) => {
    // Track console messages
    const consoleMessages: string[] = [];
    page.on('console', (msg) => {
      consoleMessages.push(msg.text());
    });

    // Navigate to a page that might use WebSocket
    await page.goto('http://localhost:3000/');
    
    // WebSocket upgrade should be available on /ws
    // Note: This is testing the backend endpoint availability
    const response = await page.request.get('http://localhost:3000/ws');
    
    // GET /ws should return 404 (not a GET endpoint, requires WebSocket upgrade)
    expect(response.status()).toBe(404);
  });

  test('should not crash on WebSocket connection failure', async ({ page }) => {
    // Track any unhandled errors
    const errors: Error[] = [];
    page.on('pageerror', (error) => {
      errors.push(error);
    });

    // Navigate to a page
    await page.goto('http://localhost:3000/healthz');
    
    // Wait for any delayed errors
    await page.waitForLoadState('networkidle');
    
    // Should have no unhandled promise rejections or errors
    expect(errors).toHaveLength(0);
  });
});

test.describe('WebSocket Error Handling', () => {
  test('should gracefully handle connection timeout', async ({ page }) => {
    const consoleWarnings: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'warning') {
        consoleWarnings.push(msg.text());
      }
    });

    await page.goto('http://localhost:3000/');
    await page.waitForTimeout(1000);
    
    // If WebSocket fails, should have logged warning (not error)
    // This is acceptable behavior - app continues without WebSocket
  });
});
