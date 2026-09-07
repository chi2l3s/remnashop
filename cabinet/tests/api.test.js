import { test } from 'node:test';
import assert from 'node:assert/strict';
import { api, safeUrl } from '../src/api.js';

test('only HTTP(S) subscription and payment links are accepted', () => {
  assert.equal(safeUrl('javascript:alert(1)'), null);
  assert.equal(safeUrl('data:text/html,hello'), null);
  assert.equal(safeUrl('https://example.com/sub'), 'https://example.com/sub');
});
test('credentials remain same-origin and refresh is shared by concurrent requests', async () => {
  let refreshed = false, refreshCount = 0;
  globalThis.fetch = async (url, options) => {
    assert.equal(options.credentials, 'same-origin');
    if (url.endsWith('/auth/refresh')) {
      refreshCount++;
      await new Promise(resolve => setTimeout(resolve, 10));
      refreshed = true;
      return Response.json({});
    }
    return Response.json(refreshed ? { ok:true } : {}, {status:refreshed?200:401});
  };
  const responses = await Promise.all([api('/subscription/current'), api('/subscription/offers')]);
  assert.equal(refreshCount, 1);
  assert.deepEqual(responses, [{ok:true},{ok:true}]);
});
test('failed refresh stops retries and surfaces an authentication error', async () => {
  let calls = 0;
  globalThis.fetch = async () => { calls++; return Response.json({detail:'Not authenticated'}, {status:401}); };
  await assert.rejects(api('/subscription/current'), {status:401});
  assert.equal(calls, 2);
});
test('server failures never expose upstream HTML', async () => {
  globalThis.fetch = async () => new Response('<html>upstream failure</html>', {status:502});
  await assert.rejects(api('/auth/login', {method:'POST',body:{}}), /Сервер недоступен/);
});
