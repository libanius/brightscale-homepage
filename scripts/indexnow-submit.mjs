#!/usr/bin/env node

const urls = process.argv.slice(2).filter(Boolean);

if (urls.length === 0) {
  console.error('Usage: node scripts/indexnow-submit.mjs <url1> [url2] ...');
  process.exit(1);
}

if (typeof fetch !== 'function') {
  console.error('Error: fetch is not available in this Node.js runtime. Use Node 18+ or enable fetch.');
  process.exit(1);
}

const payload = {
  host: 'www.brightscalegroup.com',
  key: 'e46de8e1151a4a81ab249de2a57f89a8',
  keyLocation: 'https://www.brightscalegroup.com/e46de8e1151a4a81ab249de2a57f89a8.txt',
  urlList: urls,
};

try {
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(payload),
  });

  const body = await res.text();
  console.log(`Status: ${res.status}`);
  if (body) {
    console.log(body);
  }

  if (!res.ok) {
    process.exit(1);
  }
} catch (err) {
  console.error('Request failed:', err?.message || err);
  process.exit(1);
}
