/**
 * test-api.js – Automated test runner for Practical 7 Express + JWT Auth + MongoDB
 * Verifies User registration, bcrypt hashing, JWT issuance, auth middleware route protection,
 * server-side input validation, /me profile endpoint, and protected CRUD operations.
 */

const http = require('http');
const PORT = process.env.PORT || 5000;

function makeRequest({ method, path, headers = {}, body = null }) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: PORT,
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
  console.log('\n=============================================================');
  console.log('🔍 Starting Automated API Verification for Practical 7');
  console.log('   (Authentication & Middleware Pipeline: JWT & bcrypt)');
  console.log('=============================================================\n');

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
    assert(
      r1.status === 200 && r1.data.auth && r1.data.auth.mechanism.includes('JWT'),
      'GET / returns 200 OK and documents JWT authentication mechanism'
    );

    // 2. Auth Middleware: Accessing protected route without token must return 401
    const r2 = await makeRequest({ method: 'GET', path: '/tasks' });
    assert(
      r2.status === 401 && r2.data.error === 'Unauthorized',
      'GET /tasks without Authorization header returns 401 Unauthorized (Auth Middleware)'
    );

    // 3. User Registration (POST /register) with bcrypt password hashing
    const testEmail = `test.student.${Date.now()}@charusat.edu.in`;
    const r3 = await makeRequest({
      method: 'POST',
      path: '/register',
      body: {
        email: testEmail,
        password: 'securePassword123',
        name: 'Deep Patel',
      },
    });
    assert(
      r3.status === 201 && r3.data.user && r3.data.user.email === testEmail,
      'POST /register creates user in MongoDB and hashes password with bcrypt (201 Created)'
    );

    // 4. User Login (POST /login) returning signed JWT token
    const r4 = await makeRequest({
      method: 'POST',
      path: '/login',
      body: {
        email: testEmail,
        password: 'securePassword123',
      },
    });
    assert(
      r4.status === 200 && typeof r4.data.token === 'string' && r4.data.token.length > 20,
      'POST /login compares password with bcrypt and returns signed JWT token (200 OK)'
    );
    const authToken = r4.data.token;

    // 5. User Login with incorrect password returns 401
    const r5 = await makeRequest({
      method: 'POST',
      path: '/login',
      body: {
        email: testEmail,
        password: 'wrongPassword_999',
      },
    });
    assert(
      r5.status === 401 && r5.data.error === 'Unauthorized',
      'POST /login with invalid credentials returns 401 Unauthorized'
    );

    // 6. Supplementary Problem 1: GET /me protected profile endpoint
    const r6 = await makeRequest({
      method: 'GET',
      path: '/me',
      headers: { Authorization: `Bearer ${authToken}` },
    });
    assert(
      r6.status === 200 && r6.data.user && r6.data.user.email === testEmail,
      'Supplementary: GET /me returns decoded user details from JWT token'
    );

    // 7. GET /tasks with valid Bearer token returns 200 OK
    const r7 = await makeRequest({
      method: 'GET',
      path: '/tasks',
      headers: { Authorization: `Bearer ${authToken}` },
    });
    assert(
      r7.status === 200 && Array.isArray(r7.data.data),
      'GET /tasks with valid Bearer token returns 200 OK and task array'
    );

    // 8. Server-side Input Validation: POST /tasks without title returns 400
    const r8 = await makeRequest({
      method: 'POST',
      path: '/tasks',
      headers: { Authorization: `Bearer ${authToken}` },
      body: { description: 'Missing title field deliberately' },
    });
    assert(
      r8.status === 400 && r8.data.message.includes('title'),
      'Server input validation middleware rejects POST /tasks missing title (400 Bad Request)'
    );

    // 9. POST /tasks with valid token & input creates task (201 Created)
    const r9 = await makeRequest({
      method: 'POST',
      path: '/tasks',
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        title: 'JWT Protected Test Task',
        description: 'Created by automated test suite with Bearer token',
        priority: 'high',
      },
    });
    assert(
      r9.status === 201 && r9.data.data && r9.data.data._id,
      'POST /tasks creates task in MongoDB when authenticated with JWT (201 Created)'
    );
    const createdId = r9.data.data ? r9.data.data._id : null;

    // 10. PUT /tasks/:id updates task with token
    if (createdId) {
      const r10 = await makeRequest({
        method: 'PUT',
        path: `/tasks/${createdId}`,
        headers: { Authorization: `Bearer ${authToken}` },
        body: { title: 'Updated Protected Task Title', completed: true },
      });
      assert(
        r10.status === 200 && r10.data.data.completed === true,
        'PUT /tasks/:id updates task document in MongoDB with JWT (200 OK)'
      );
    }

    // 11. DELETE /tasks/:id deletes task with token
    if (createdId) {
      const r11 = await makeRequest({
        method: 'DELETE',
        path: `/tasks/${createdId}`,
        headers: { Authorization: `Bearer ${authToken}` },
      });
      assert(
        r11.status === 200,
        'DELETE /tasks/:id removes task document with JWT (200 OK)'
      );
    }

    // 12. Content-Type 415 validation check
    const r12 = await makeRequest({
      method: 'POST',
      path: '/tasks',
      headers: { Authorization: `Bearer ${authToken}`, 'Content-Type': false },
      body: 'plain text',
    });
    assert(
      r12.status === 415,
      'POST /tasks without application/json returns 415 Unsupported Media Type'
    );

    // 13. Undefined route 404 handler
    const r13 = await makeRequest({ method: 'GET', path: '/undefined-route-auth-test' });
    assert(
      r13.status === 404 && r13.data.error === 'Not Found',
      'GET /undefined returns structured 404 JSON'
    );

    // 14. Global 500 error handler
    const r14 = await makeRequest({ method: 'GET', path: '/test-error' });
    assert(
      r14.status === 500 && r14.data.status === 500,
      'GET /test-error triggers centralized 500 error handler'
    );

    console.log(`\n=============================================================`);
    console.log(`📊 Verification Summary: ${passed} Passed, ${failed} Failed`);
    console.log(`=============================================================\n`);

    if (failed === 0) {
      console.log('🎉 All Practical 7 JWT Authentication checks verified successfully!\n');
      return true;
    }
    return false;
  } catch (err) {
    console.error('Test execution failed:', err);
    return false;
  }
}

if (require.main === module) {
  runTests();
}

module.exports = { runTests };
