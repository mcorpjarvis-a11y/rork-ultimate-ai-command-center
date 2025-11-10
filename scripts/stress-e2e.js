const { execSync } = require('node:child_process');

const RUNS = parseInt(process.env.RUNS || '3', 10);

console.log(`[stress:e2e] Running test:e2e ${RUNS} time(s)`);

for (let i = 1; i <= RUNS; i += 1) {
  console.log(`[stress:e2e] ▶ Run ${i}/${RUNS}`);
  try {
    execSync('npm run test:e2e', { stdio: 'inherit' });
  } catch (error) {
    console.error(`[stress:e2e] ❌ E2E run ${i} failed`);
    process.exit(1);
  }
}

console.log('[stress:e2e] ✅ All E2E runs completed successfully');
