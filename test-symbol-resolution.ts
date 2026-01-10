
import { resolveSymbol } from './src/lib/stock-analysis/services/symbol-resolver';

async function test() {
  try {
    // Try a search for something likely not in the top 30 but exists
    console.log("Testing search for 'Iron'...");
    const result = await resolveSymbol('Iron'); 
    console.log('Result:', result);
  } catch (e) {
    console.error('Error:', e);
  }
}

test();
