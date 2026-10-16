import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../src/App';

describe('App', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'bootstrap', {
      configurable: true,
      value: {
        Modal: class {
          show() {}
          hide() {}
        }
      }
    });
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('loads and displays posts returned by the API', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [{ id: 1, title: 'Test post', body: 'Post content' }]
      })
    );

    render(<App />);

    expect(await screen.findByRole('heading', { name: 'Test post' })).toBeTruthy();
    expect(screen.getByText('API Connected (MySQL)')).toBeTruthy();
  });

  it('shows an alert when the API returns data in an unexpected format', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => [{ id: 'invalid', title: 'Test post', body: 'Post content' }]
      })
    );
    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<App />);

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain(
      'Failed to fetch posts: The posts API returned data in an unexpected format.'
    );
    expect(screen.getByText('API Disconnected')).toBeTruthy();
  });
});
