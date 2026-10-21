import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
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

  it('deletes the selected post after confirmation', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: 7, title: 'Post to delete', body: 'Content' }]
      })
      .mockResolvedValueOnce({ ok: true })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true));

    render(<App />);

    fireEvent.click(await screen.findByRole('button', { name: 'Delete post #7' }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('http://127.0.0.1:8000/api/posts/7', {
        method: 'DELETE',
        headers: { Accept: 'application/json' }
      });
    });
    expect((await screen.findByRole('alert')).textContent).toContain(
      'Post #7 deleted successfully.'
    );
    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: 'Post to delete' })).toBeNull();
    });
  });

  it('does not send a delete request when confirmation is cancelled', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ id: 8, title: 'Keep this post', body: 'Content' }]
    });
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(false));

    render(<App />);

    fireEvent.click(await screen.findByRole('button', { name: 'Delete post #8' }));

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('heading', { name: 'Keep this post' })).toBeTruthy();
  });

  it('keeps the post visible and shows an alert when deletion fails', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: 9, title: 'Post to keep', body: 'Content' }]
      })
      .mockResolvedValueOnce({ ok: false, status: 500 });
    vi.stubGlobal('fetch', fetchMock);
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<App />);

    fireEvent.click(await screen.findByRole('button', { name: 'Delete post #9' }));

    expect((await screen.findByRole('alert')).textContent).toContain(
      'Failed to delete: HTTP 500'
    );
    expect(screen.getByRole('heading', { name: 'Post to keep' })).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
