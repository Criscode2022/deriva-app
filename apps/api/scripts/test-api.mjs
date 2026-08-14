/**
 * End-to-end smoke test against the Nest + Neon API.
 *
 * Usage (from repo root):
 *   npm run api
 *   npm run test:api
 */
import { randomInt } from 'node:crypto';

const base = (process.env.API_BASE_URL || 'http://localhost:3001/api').replace(
  /\/$/,
  '',
);

function randomEmail() {
  return `user-${randomInt(10_000_000, 99_999_999)}@example.com`;
}

async function req(method, path, body, token) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${base}${path}`, {
    method,
    headers: Object.keys(headers).length ? headers : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    throw new Error(
      `${method} ${path} -> ${res.status}: ${JSON.stringify(data)}`,
    );
  }
  return data;
}

async function expectStatus(method, path, body, token, status) {
  const headers = {};
  if (body) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${base}${path}`, {
    method,
    headers: Object.keys(headers).length ? headers : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status !== status) {
    const text = await res.text();
    throw new Error(
      `${method} ${path} expected ${status}, got ${res.status}: ${text}`,
    );
  }
}

async function main() {
  console.log('Testing API at', base);

  const health = await req('GET', '/health');
  console.log('✓ health', health);

  const email = randomEmail();
  const password = 'correct-horse-battery';
  const created = await req('POST', '/auth/register', { email, password });
  if (!created.token || !created.id || !created.expires_at) {
    throw new Error('register must return id, token, expires_at');
  }
  if (created.password_hash) {
    throw new Error('password_hash must not be returned');
  }
  console.log('✓ register user', created.id);

  await expectStatus('GET', '/auth/me', undefined, undefined, 401);
  console.log('✓ reject unauthenticated me');

  const me = await req('GET', '/auth/me', undefined, created.token);
  if (me.email !== email) throw new Error('me email mismatch');
  console.log('✓ me', me.email);

  await req('POST', '/auth/logout', {}, created.token);
  console.log('✓ logout');

  await expectStatus('GET', '/auth/me', undefined, created.token, 401);
  console.log('✓ revoked token rejected');

  const login = await req('POST', '/auth/login', { email, password });
  if (!login.token) throw new Error('login must return token');
  console.log('✓ login');

  await req('DELETE', `/users/${login.id}`, undefined, login.token);
  console.log('✓ delete user');

  await expectStatus(
    'POST',
    '/auth/login',
    { email, password },
    undefined,
    401,
  );
  console.log('✓ deleted user cannot login');

  console.log('\nAll API smoke tests passed.');
}

main().catch((err) => {
  console.error('\nAPI smoke test failed:', err.message);
  process.exit(1);
});
