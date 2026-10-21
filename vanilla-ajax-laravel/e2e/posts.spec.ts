import { expect, test } from '@playwright/test';

const apiUrl = 'http://127.0.0.1:8000/api/posts';

test.beforeEach(async ({ page }) => {
  await page.route('https://cdn.jsdelivr.net/**', (route) => route.abort());
  await page.addInitScript(() => {
    window.bootstrap = {
      Modal: class {
        private element: Element;

        constructor(element: Element) {
          this.element = element;
        }

        show() {
          this.element.classList.add('show');
          this.element.removeAttribute('aria-hidden');
        }

        hide() {
          this.element.classList.remove('show');
          this.element.setAttribute('aria-hidden', 'true');
        }
      }
    };
  });
});

test('creates, edits, and deletes a post through the UI', async ({ page }) => {
  let posts: Array<{ id: number; title: string; body: string }> = [];
  const mutations: Array<{ method: string; url: string; body?: unknown }> = [];

  await page.route(`${apiUrl}**`, async (route) => {
    const request = route.request();
    const method = request.method();
    const url = new URL(request.url());
    const postId = Number(url.pathname.split('/').pop());

    if (method === 'GET') {
      await route.fulfill({ json: posts });
      return;
    }

    if (method === 'POST') {
      const body = request.postDataJSON() as { title: string; body: string };
      mutations.push({ method, url: url.pathname, body });
      posts = [{ id: 43, ...body }, ...posts];
      await route.fulfill({ status: 201, json: posts[0] });
      return;
    }

    if (method === 'PUT') {
      const body = request.postDataJSON() as { title: string; body: string };
      mutations.push({ method, url: url.pathname, body });
      posts = posts.map((post) => (post.id === postId ? { id: postId, ...body } : post));
      await route.fulfill({ json: posts.find((post) => post.id === postId) });
      return;
    }

    if (method === 'DELETE') {
      mutations.push({ method, url: url.pathname });
      posts = posts.filter((post) => post.id !== postId);
      await route.fulfill({ status: 204, body: '' });
      return;
    }

    await route.fulfill({ status: 405 });
  });

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'No posts found in database' })).toBeVisible();
  await expect(page.getByText('API Connected (MySQL)')).toBeVisible();

  await page.getByRole('button', { name: 'New Post' }).click();
  await expect(page.getByRole('heading', { name: 'Create New Post' })).toBeVisible();
  await page.getByLabel('Title').fill('  Added from browser  ');
  await page.getByLabel('Content').fill('  Created with the complete UI flow  ');
  await page.getByRole('button', { name: 'Save Post' }).click();
  await expect(page.getByRole('heading', { name: 'Added from browser' })).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('Post created successfully!');

  await page.getByRole('button', { name: 'Edit' }).first().click();
  await expect(page.getByRole('heading', { name: 'Edit Post #43' })).toBeVisible();
  await page.getByLabel('Title').fill('Updated in browser');
  await page.getByLabel('Content').fill('Updated content');
  await page.getByRole('button', { name: 'Save Post' }).click();
  await expect(page.getByRole('heading', { name: 'Updated in browser' })).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('Post updated successfully!');

  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Delete' }).first().click();
  await expect(page.getByRole('heading', { name: 'Updated in browser' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'No posts found in database' })).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('Post #43 deleted successfully.');

  expect(mutations).toEqual([
    {
      method: 'POST',
      url: '/api/posts',
      body: { title: 'Added from browser', body: 'Created with the complete UI flow' }
    },
    {
      method: 'PUT',
      url: '/api/posts/43',
      body: { title: 'Updated in browser', body: 'Updated content' }
    },
    { method: 'DELETE', url: '/api/posts/43' }
  ]);
});

test('shows an error when the posts API responds with a server error', async ({ page }) => {
  await page.route(`${apiUrl}**`, (route) =>
    route.fulfill({ status: 500, json: { message: 'Internal server error' } })
  );
  page.on('pageerror', (error) => {
    throw error;
  });

  await page.goto('/');

  await expect(page.getByRole('alert')).toContainText('Failed to fetch posts: HTTP 500');
  await expect(page.getByText('API Disconnected')).toBeVisible();
});
