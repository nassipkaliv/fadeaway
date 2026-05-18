import productsData from '../src/data/productsData.js';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const out = join(__dirname, '..', 'backend', 'shop', 'fixtures', 'products.json');

writeFileSync(out, JSON.stringify(productsData, null, 2));
console.log('wrote', productsData.length, 'products to', out);
