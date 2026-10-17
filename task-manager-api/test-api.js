/**
 * test-api.js – Automated test runner for Practical 5 Express + MongoDB + Mongoose
 * Verifies all CRUD operations, schema validation, enum restriction, pre-save hook,
 * route-specific ObjectId validation, 404 responses, and centralized error handling.
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
  console.log('\n=============================================================');
  console.log('🔍 Starting Automated API Verification for Practical 5');
  console.log('   (MongoDB Integration & Schema Design with Mongoose)');
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
    // 1. Healthcheck / Root endpoint & DB connection check
    const r1 = await makeRequest({ method: 'GET', path: '/' });
    assert(
      r1.status === 200 && r1.data.database && r1.data.database.engine === 'MongoDB',
      'GET / returns 200 OK with MongoDB & Mongoose database info',
      JSON.stringify(r1.data)
    );

    // 2. POST /tasks – Create new task in MongoDB with Mongoose model
    const r2 = await makeRequest({
      method: 'POST',
      path: '/tasks',
      headers: { 'Content-Type': 'application/json' },
      body: {
        title: 'Mongoose Integration Automated Test Task',
        description: 'Created by automated test suite for Practical 5',
        priority: 'high',
        completed: false,
      },
    });
    assert(
      r2.status === 201 && r2.data.data && r2.data.data._id,
      'POST /tasks returns 201 Created and persists document with MongoDB ObjectId'
    );
    const createdId = r2.data.data ? r2.data.data._id : null;

    // 3. Supplementary Problem 2: Pre-save hook trimming title whitespace
    const r3 = await makeRequest({
      method: 'POST',
      path: '/tasks',
      headers: { 'Content-Type': 'application/json' },
      body: {
        title: '   Untrimmed Title With Extra Spaces   ',
        description: 'Testing pre-save hook whitespace trimming',
        priority: 'low',
      },
    });
    assert(
      r3.status === 201 && r3.data.data && r3.data.data.title === 'Untrimmed Title With Extra Spaces',
      'Supplementary: Pre-save hook automatically trims whitespace from title'
    );
    const trimmedId = r3.data.data ? r3.data.data._id : null;

    // 4. Mongoose Schema Validation: Missing required 'title' field
    const r4 = await makeRequest({
      method: 'POST',
      path: '/tasks',
      headers: { 'Content-Type': 'application/json' },
      body: {
        description: 'Task without title',
      },
    });
    assert(
      r4.status === 400 && r4.data.error === 'Validation Error' && r4.data.errors && r4.data.errors.title,
      'POST /tasks without title returns 400 with structured Mongoose validation JSON'
    );

    // 5. Supplementary Problem 1: Priority restricted to enum ['low', 'medium', 'high']
    const r5 = await makeRequest({
      method: 'POST',
      path: '/tasks',
      headers: { 'Content-Type': 'application/json' },
      body: {
        title: 'Invalid Priority Task',
        priority: 'urgent_invalid_enum',
      },
    });
    assert(
      r5.status === 400 && r5.data.error === 'Validation Error' && r5.data.errors && r5.data.errors.priority,
      'Supplementary: Priority field restricted to enum [low, medium, high] returns structured 400'
    );

    // 6. Content-Type validation middleware rejection
    const r6 = await makeRequest({
      method: 'POST',
      path: '/tasks',
      headers: { 'Content-Type': false },
      body: 'plain text body',
    });
    assert(
      r6.status === 415,
      'POST /tasks without application/json returns 415 Unsupported Media Type'
    );

    // 7. GET /tasks – Retrieve all tasks from MongoDB
    const r7 = await makeRequest({ method: 'GET', path: '/tasks' });
    assert(
      r7.status === 200 && Array.isArray(r7.data.data) && r7.data.count >= 2,
      `GET /tasks returns 200 OK with task array from MongoDB (Count: ${r7.data ? r7.data.count : 0})`
    );

    // 8. GET /tasks with search query parameter
    const r8 = await makeRequest({ method: 'GET', path: '/tasks?search=Untrimmed' });
    assert(
      r8.status === 200 && r8.data.count >= 1,
      'GET /tasks?search=Untrimmed filters tasks by regex query'
    );

    // 9. GET /tasks/:id – Retrieve task by valid MongoDB ObjectId
    if (createdId) {
      const r9 = await makeRequest({ method: 'GET', path: `/tasks/${createdId}` });
      assert(
        r9.status === 200 && r9.data.data && r9.data.data._id === createdId,
        `GET /tasks/:id returns 200 OK for valid MongoDB ObjectId (${createdId})`
      );
    }

    // 10. Supplementary Problem 3: Non-existent MongoDB ObjectId returns 404 JSON
    const nonExistentId = '507f1f77bcf86cd799439011';
    const r10 = await makeRequest({ method: 'GET', path: `/tasks/${nonExistentId}` });
    assert(
      r10.status === 404 && r10.data.error === 'Not Found',
      'Supplementary: GET /tasks/:id returns 404 JSON when MongoDB ObjectId does not exist'
    );

    // 11. GET /tasks/:id with malformed ObjectId format returns 400
    const r11 = await makeRequest({ method: 'GET', path: '/tasks/malformed_id_123' });
    assert(
      r11.status === 400 && r11.data.error === 'Bad Request',
      'GET /tasks/malformed_id_123 returns 400 Bad Request (ObjectId validator)'
    );

    // 12. PUT /tasks/:id – Update task using findByIdAndUpdate
    if (createdId) {
      const r12 = await makeRequest({
        method: 'PUT',
        path: `/tasks/${createdId}`,
        headers: { 'Content-Type': 'application/json' },
        body: {
          title: 'Updated Mongoose Task Title',
          completed: true,
          priority: 'medium',
        },
      });
      assert(
        r12.status === 200 && r12.data.data && r12.data.data.completed === true && r12.data.data.priority === 'medium',
        `PUT /tasks/:id updates document in MongoDB with runValidators enabled`
      );
    }

    // 13. PUT /tasks/:id with invalid priority enum (runValidators: true test)
    if (createdId) {
      const r13 = await makeRequest({
        method: 'PUT',
        path: `/tasks/${createdId}`,
        headers: { 'Content-Type': 'application/json' },
        body: {
          priority: 'invalid_enum_update',
        },
      });
      assert(
        r13.status === 400 && r13.data.error === 'Validation Error',
        'PUT /tasks/:id validates schema updates and rejects invalid priority enum (400)'
      );
    }

    // 14. DELETE /tasks/:id – Delete task using findByIdAndDelete
    if (createdId) {
      const r14 = await makeRequest({ method: 'DELETE', path: `/tasks/${createdId}` });
      assert(
        r14.status === 200 && r14.data.message.includes('deleted successfully'),
        `DELETE /tasks/:id deletes task from MongoDB`
      );
    }

    // Clean up trimmed task
    if (trimmedId) {
      await makeRequest({ method: 'DELETE', path: `/tasks/${trimmedId}` });
    }

    // 15. DELETE /tasks/:id – Non-existent ID returns 404 Not Found
    const r15 = await makeRequest({ method: 'DELETE', path: `/tasks/${nonExistentId}` });
    assert(
      r15.status === 404 && r15.data.error === 'Not Found',
      'DELETE /tasks/:id on non-existent ID returns 404 Not Found'
    );

    // 16. Custom 404 handler for undefined route
    const r16 = await makeRequest({ method: 'GET', path: '/undefined-api-route-test' });
    assert(
      r16.status === 404 && r16.data.error === 'Not Found',
      'GET /undefined-api-route-test returns structured 404 JSON'
    );

    // 17. Centralized Global Error Handler trigger
    const r17 = await makeRequest({ method: 'GET', path: '/test-error' });
    assert(
      r17.status === 500 && r17.data.status === 500,
      'GET /test-error triggers centralized global 500 error handler'
    );

    console.log(`\n=============================================================`);
    console.log(`📊 Verification Summary: ${passed} Passed, ${failed} Failed`);
    console.log(`=============================================================\n`);

    if (failed === 0) {
      console.log('🎉 All Practical 5 API and Mongoose checks verified successfully!\n');
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
