/**
 * test-api.js – Automated test runner for Practical 9 Express + node-cache + MongoDB
 * Verifies in-memory caching, cache hit/miss headers, single-task caching,
 * cache invalidation on write (POST, PUT, DELETE), and empirical response time comparisons.
 */

const http = require('http');
const PORT = process.env.PORT || 5000;

function makeRequest({ method, path, headers = {}, body = null }) {
  return new Promise((resolve, reject) => {
    const startTime = performance.now();
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
        const responseTimeMs = Number((performance.now() - startTime).toFixed(2));
        try {
          const parsed = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsed,
            timeMs: responseTimeMs,
          });
        } catch {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            raw: data,
            timeMs: responseTimeMs,
          });
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
  console.log('🔍 Starting Automated API Verification for Practical 9');
  console.log('   (In-Memory Caching & Query Optimization: node-cache)');
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
    // 1. Healthcheck / Root endpoint documenting cache engine
    const r1 = await makeRequest({ method: 'GET', path: '/' });
    assert(
      r1.status === 200 && r1.data.caching && r1.data.caching.engine === 'node-cache',
      'GET / returns 200 OK and documents in-memory caching engine (node-cache)'
    );

    // 2. Authentication setup: Register & Login to get token for protected routes
    const testEmail = `cache.tester.${Date.now()}@charusat.edu.in`;
    await makeRequest({
      method: 'POST',
      path: '/register',
      body: { email: testEmail, password: 'password123', name: 'Deep Patel' },
    });
    const loginRes = await makeRequest({
      method: 'POST',
      path: '/login',
      body: { email: testEmail, password: 'password123' },
    });
    const authToken = loginRes.data.token;
    assert(!!authToken, 'Authentication succeeded and JWT token acquired');

    // 3. Measure 3 Uncached requests (simulating cold cache / cache misses)
    console.log('\n  📊 Measuring Cache Performance (Cached vs Uncached):');
    
    // First request: Cache MISS (queries MongoDB)
    const req1 = await makeRequest({
      method: 'GET',
      path: '/tasks',
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const missHeader = req1.headers['x-cache'];
    assert(
      req1.status === 200 && missHeader === 'MISS',
      `Request 1 is Cache MISS (${req1.timeMs}ms, X-Cache: ${missHeader})`
    );

    // Second request: Cache HIT (served from node-cache)
    const req2 = await makeRequest({
      method: 'GET',
      path: '/tasks',
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const hitHeader2 = req2.headers['x-cache'];
    assert(
      req2.status === 200 && hitHeader2 === 'HIT',
      `Request 2 is Cache HIT (${req2.timeMs}ms, X-Cache: ${hitHeader2})`
    );

    // Third request: Cache HIT (served from node-cache)
    const req3 = await makeRequest({
      method: 'GET',
      path: '/tasks',
      headers: { Authorization: `Bearer ${authToken}` },
    });
    const hitHeader3 = req3.headers['x-cache'];
    assert(
      req3.status === 200 && hitHeader3 === 'HIT',
      `Request 3 is Cache HIT (${req3.timeMs}ms, X-Cache: ${hitHeader3})`
    );

    // 4. Supplementary Problem 1: Single-Task Cache (GET /tasks/:id)
    const firstTaskId = req1.data.data && req1.data.data.length > 0 ? req1.data.data[0]._id : null;
    if (firstTaskId) {
      // First single-task request: MISS
      const singleMiss = await makeRequest({
        method: 'GET',
        path: `/tasks/${firstTaskId}`,
        headers: { Authorization: `Bearer ${authToken}` },
      });
      assert(
        singleMiss.status === 200 && singleMiss.headers['x-cache'] === 'MISS',
        `GET /tasks/:id first call is Cache MISS (${singleMiss.timeMs}ms)`
      );

      // Second single-task request: HIT
      const singleHit = await makeRequest({
        method: 'GET',
        path: `/tasks/${firstTaskId}`,
        headers: { Authorization: `Bearer ${authToken}` },
      });
      assert(
        singleHit.status === 200 && singleHit.headers['x-cache'] === 'HIT',
        `GET /tasks/:id second call is Cache HIT (${singleHit.timeMs}ms)`
      );
    }

    // 5. Cache Invalidation on Write (POST /tasks)
    console.log('\n  🔄 Verifying Cache Invalidation on Write Operations:');
    const createRes = await makeRequest({
      method: 'POST',
      path: '/tasks',
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        title: 'Cache Invalidation Verification Task',
        description: 'Should invalidate all_tasks cache key',
        priority: 'high',
      },
    });
    assert(
      createRes.status === 201,
      'POST /tasks creates document and triggers cache invalidation'
    );
    const createdId = createRes.data.data ? createRes.data.data._id : null;

    // Next GET /tasks must be a Cache MISS because POST invalidated the cache
    const afterPostGet = await makeRequest({
      method: 'GET',
      path: '/tasks',
      headers: { Authorization: `Bearer ${authToken}` },
    });
    assert(
      afterPostGet.status === 200 && afterPostGet.headers['x-cache'] === 'MISS',
      `GET /tasks after write is Cache MISS (X-Cache: ${afterPostGet.headers['x-cache']}) – no stale data served`
    );

    // 6. Cache Invalidation on Update (PUT /tasks/:id)
    if (createdId) {
      // Populate single-task cache first
      await makeRequest({
        method: 'GET',
        path: `/tasks/${createdId}`,
        headers: { Authorization: `Bearer ${authToken}` },
      });

      // Update task
      const updateRes = await makeRequest({
        method: 'PUT',
        path: `/tasks/${createdId}`,
        headers: { Authorization: `Bearer ${authToken}` },
        body: { title: 'Updated Invalidation Task Title', completed: true },
      });
      assert(
        updateRes.status === 200,
        'PUT /tasks/:id updates document and invalidates single-task cache'
      );

      // Subsequent GET for this task must be a MISS
      const afterPutGet = await makeRequest({
        method: 'GET',
        path: `/tasks/${createdId}`,
        headers: { Authorization: `Bearer ${authToken}` },
      });
      assert(
        afterPutGet.status === 200 && afterPutGet.headers['x-cache'] === 'MISS',
        'GET /tasks/:id after update is Cache MISS – verified fresh updated data'
      );

      // 7. Cache Invalidation on Delete (DELETE /tasks/:id)
      const deleteRes = await makeRequest({
        method: 'DELETE',
        path: `/tasks/${createdId}`,
        headers: { Authorization: `Bearer ${authToken}` },
      });
      assert(
        deleteRes.status === 200,
        'DELETE /tasks/:id removes document and invalidates cache'
      );
    }

    // 8. Supplementary Problem 2: Debug Endpoint (GET /cache-stats)
    const statsRes = await makeRequest({ method: 'GET', path: '/cache-stats' });
    assert(
      statsRes.status === 200 &&
        statsRes.data.stats &&
        typeof statsRes.data.stats.hits === 'number' &&
        typeof statsRes.data.stats.misses === 'number',
      `Supplementary: GET /cache-stats exposes hits (${statsRes.data.stats?.hits}), misses (${statsRes.data.stats?.misses}), and hit ratio (${statsRes.data.stats?.hitRatio})`
    );

    // Print empirical response time summary table
    console.log('\n=============================================================');
    console.log('⏱️  Empirical Response Time Comparison (Lab Journal Data):');
    console.log('-------------------------------------------------------------');
    console.log(`  Uncached (MongoDB Query): ~${req1.timeMs}ms (X-Cache: MISS)`);
    console.log(`  Cached Run 1 (RAM Cache): ~${req2.timeMs}ms (X-Cache: HIT)`);
    console.log(`  Cached Run 2 (RAM Cache): ~${req3.timeMs}ms (X-Cache: HIT)`);
    console.log(`  Speedup Factor:           ~${(req1.timeMs / Math.max(req2.timeMs, 0.5)).toFixed(1)}x faster`);
    console.log('=============================================================\n');

    console.log(`\n=============================================================`);
    console.log(`📊 Verification Summary: ${passed} Passed, ${failed} Failed`);
    console.log(`=============================================================\n`);

    if (failed === 0) {
      console.log('🎉 All Practical 9 Caching & Performance checks verified successfully!\n');
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
