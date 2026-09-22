import http from 'node:http';

const page = `<!doctype html><html><head><title>SentinelJS safe demo target</title></head><body><h1>Intentionally misconfigured demo</h1><p>This local service omits recommended headers for scanner testing.</p><img src="http://assets.example.test/demo.png" alt="demo"><form action="http://example.test/submit" method="post"><label>Demo value <input name="demo"></label><button>Submit</button></form></body></html>`;

http
  .createServer((_request, response) => {
    response.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Set-Cookie': 'demo-session=not-sensitive; Path=/',
      'X-Powered-By': 'SentinelJS insecure demo',
    });
    response.end(page);
  })
  .listen(3000, '0.0.0.0', () => console.log('Safe demo target listening on port 3000'));
