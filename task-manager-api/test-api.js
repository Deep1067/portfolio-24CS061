/**
 * test-api.js – Automated test runner for Practical 4 Express REST API
 * Verifies all CRUD endpoints, status codes, and middleware behaviors.
 */

const http = require('http');

function makeRequest({ method, path, headers = {}, body = null }) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        ...headers,
      },
    };

    if (body && typeof body === 'object') {
      body = JSON.stringify(body);
      if (!headers['Content-Type'] && headers['Content-Type'] !== false) {
        options.headers['Content-Type'] = 'application/json';
      }
    }

    if (headers['Content-Type'] === false) {
      delete options.headers['Content-Type'];
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(body);
    }
    req.end();
  });
}

async function runTests() {
  console.log('\n🔍 Starting Automated API Verification for Practical 4...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message, details = '') {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message} - ${details}`);
      failed++;
    }
  }

  try {
    // 1. Healthcheck / Root endpoint
    const r1 = await makeRequest({ method: 'GET', path: '/' });
    assert(r1.status === 200, 'GET / returns 200 OK', JSON.stringify(r1.data));

    // 2. GET /tasks – Retrieve all tasks
    const r2 = await makeRequest({ method: 'GET', path: '/tasks' });
    assert(r2.status === 200 && Array.isArray(r2.data.data), 'GET /tasks returns 200 OK with task array');

    // 3. POST /tasks – Create new task
    const r3 = await makeRequest({
      method: 'POST',
      path: '/tasks',
      headers: { 'Content-Type': 'application/json' },
      body: { title: 'Test Lab Automation Task', description: 'Created by test suite', priority: 'High' },
    });
    assert(r3.status === 201 && r3.data.data.title === 'Test Lab Automation Task', 'POST /tasks returns 201 Created');
    const createdId = r3.data.data ? r3.data.data.id : null;

    // 4. POST /tasks – Validation error (missing title)
    const r4 = await makeRequest({
      method: 'POST',
      path: '/tasks',
      headers: { 'Content-Type': 'application/json' },
      body: { description: 'Missing title' },
    });
    assert(r4.status === 400, 'POST /tasks without title returns 400 Bad Request');

    // 5. POST /tasks – Content-Type validation middleware rejection
    const r5 = await makeRequest({
      method: 'POST',
      path: '/tasks',
      headers: { 'Content-Type': false }, // omit Content-Type
      body: 'raw body text',
    });
    assert(r5.status === 415, 'POST /tasks without application/json returns 415 Unsupported Media Type');

    // 6. GET /tasks/:id – Retrieve created task
    if (createdId) {
      const r6 = await makeRequest({ method: 'GET', path: `/tasks/${createdId}` });
      assert(r6.status === 200 && r6.data.data.id === createdId, `GET /tasks/${createdId} returns 200 OK`);
    }

    // 7. GET /tasks/:id – Route-specific ID validator middleware rejection
    const r7 = await makeRequest({ method: 'GET', path: '/tasks/invalid_abc' });
    assert(r7.status === 400, 'GET /tasks/invalid_abc returns 400 Bad Request (validateTaskId middleware)');

    // 8. GET /tasks/:id – Non-existent ID
    const r8 = await makeRequest({ method: 'GET', path: '/tasks/99999' });
    assert(r8.status === 404, 'GET /tasks/99999 returns 404 Not Found');

    // 9. PUT /tasks/:id – Update task
    if (createdId) {
      const r9 = await makeRequest({
        method: 'PUT',
        path: `/tasks/${createdId}`,
        headers: { 'Content-Type': 'application/json' },
        body: { title: 'Updated Title', status: 'Completed' },
      });
      assert(r9.status === 200 && r9.data.data.status === 'Completed', `PUT /tasks/${createdId} returns 200 OK`);
    }

    // 10. DELETE /tasks/:id – Delete task
    if (createdId) {
      const r10 = await makeRequest({ method: 'DELETE', path: `/tasks/${createdId}` });
      assert(r10.status === 200, `DELETE /tasks/${createdId} returns 200 OK`);
    }

    // 11. 404 Handler for undefined routes
    const r11 = await makeRequest({ method: 'GET', path: '/undefined-api-route-test' });
    assert(r11.status === 404, 'GET /undefined-api-route-test returns 404 Not Found structured JSON');

    // 12. Global Error Handler trigger
    const r12 = await makeRequest({ method: 'GET', path: '/test-error' });
    assert(r12.status === 500, 'GET /test-error triggers 500 Internal Server Error handler');

    console.log(`\n📊 Verification Summary: ${passed} Passed, ${failed} Failed\n`);
    if (failed === 0) {
      console.log('🎉 All Practical 4 API checks verified successfully!\n');
    }
  } catch (err) {
    console.error('Test execution failed:', err);
  }
}

// Allow standalone execution
if (require.main === module) {
  runTests();
}

module.exports = { runTests };
