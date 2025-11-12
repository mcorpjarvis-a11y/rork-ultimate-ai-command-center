// ESM-safe proxy for Metro on Node 22
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const config = require('./metro.config.cjs');
export default config;
