
import { resolveSymbol } from './src/lib/stock-analysis/services/symbol-resolver';

async function test() {
  try {
    console.log("Testing search for 'Google' (should resolve to GOOG or GOOGL)...");
    const result = await resolveSymbol('Google'); 
    console.log('Result for Google:', result);
    
    console.log("Testing search for 'Iron' (should resolve to something)...");
    const result2 = await resolveSymbol('Iron');
    console.log('Result for Iron:', result2);
  } catch (e) {
    console.error('Error:', e);
  }
}

test();
