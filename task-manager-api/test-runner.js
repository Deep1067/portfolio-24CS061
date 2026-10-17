process.env.PORT = '5055';
const { server, mongoose } = require('./server');
const { runTests } = require('./test-api');

async function main() {
  // Give Express server and MongoDB connection time to initialize
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const success = await runTests();

  server.close(async () => {
    try {
      await mongoose.connection.close();
      console.log('🔌 MongoDB connection closed cleanly.');
    } catch (e) {
      console.error('Error closing DB connection:', e);
    }
    console.log('✅ Server closed cleanly.');
    process.exit(success ? 0 : 1);
  });
}

main().catch((err) => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
