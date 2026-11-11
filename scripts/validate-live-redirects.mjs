#!/usr/bin/env node
import assert from 'node:assert/strict';

const timeoutMs = 15000;
const request = async (url, redirect = 'manual') => {
  return fetch(url, {
    redirect,
    signal: AbortSignal.timeout(timeoutMs),
    headers: { 'user-agent': 'ZemTools-Live-Smoke-Test/1.0' }
  });
};

const expectRedirect = async (label, source, expectedStatus, expectedTarget) => {
  const response = await request(source, 'manual');
  const location = response.headers.get('location');
  assert.equal(response.status, expectedStatus,
    `${label}: expected HTTP ${expectedStatus}, received ${response.status}`);
  assert.ok(location, `${label}: redirect response has no Location header`);

  const actual = new URL(location, source).toString();
  assert.equal(actual, expectedTarget,
    `${label}: expected Location ${expectedTarget}, received ${actual}`);
  console.log(`PASS ${label}: HTTP ${response.status} -> ${actual}`);
};

const expectOk = async (label, url, contentCheck) => {
  const response = await request(url, 'manual');
  assert.equal(response.status, 200,
    `${label}: expected HTTP 200, received ${response.status}`);
  const body = await response.text();
  assert.ok(body.length > 0, `${label}: response body is empty`);
  if (contentCheck) assert.ok(contentCheck(body), `${label}: response content check failed`);
  console.log(`PASS ${label}: HTTP 200 (${body.length} bytes)`);
};

await expectRedirect(
  'HTTP apex to HTTPS apex',
  'http://zemtools.com/',
  301,
  'https://zemtools.com/'
);

await expectRedirect(
  'WWW to apex',
  'https://www.zemtools.com/',
  301,
  'https://zemtools.com/'
);

await expectRedirect(
  'Legacy HTML to clean URL with query preserved',
  'https://zemtools.com/pilot-hole-calculator.html?redirect_test=1',
  301,
  'https://zemtools.com/pilot-hole-calculator/?redirect_test=1'
);

await expectOk(
  'Canonical pilot-hole calculator page',
  'https://zemtools.com/pilot-hole-calculator/',
  body => /<title[^>]*>.*pilot hole/i.test(body)
);

await expectOk(
  'robots.txt',
  'https://zemtools.com/robots.txt',
  body => /sitemap/i.test(body)
);

await expectOk(
  'sitemap.xml',
  'https://zemtools.com/sitemap.xml',
  body => /<urlset[\s>]/i.test(body) && body.includes('https://zemtools.com/')
);

console.log('ZemTools live redirect and endpoint smoke tests passed.');
