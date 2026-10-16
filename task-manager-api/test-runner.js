const { server } = require('./server');
const { runTests } = require('./test-api');

async function main() {
  // Give server time to listen
  await new Promise((resolve) => setTimeout(resolve, 500));
  await runTests();
  server.close(() => {
    console.log('✅ Server closed cleanly.');
    process.exit(0);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
