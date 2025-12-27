# AI Agents System Documentation

## Overview

The Nourelborsa AI Agents system provides comprehensive AI-powered features using Google Gemini. It includes multiple specialized agents for different tasks related to stock analysis, investment advice, and Shariah compliance.

## Architecture

```
src/
├── lib/ai/
│   └── llm.ts              # Core LLM agent implementation
├── actions/
│   └── aiAgents.ts         # Server actions for AI agents
└── hooks/
    └── useAI.ts            # React hooks for client components
```

## Available AI Agents

### 1. Stock Analyst (`stock_analyst`)
Specialized in technical analysis of stocks using data from Investing.com.

**Capabilities:**
- Technical analysis for different timeframes (15m, 1H, 1D)
- RSI, MACD, STOCH, CCI indicators
- Moving averages (MA & EMA)
- Buy/Sell recommendations

**Usage:**
```typescript
import { useStockAnalysis } from '@/hooks/useAI';

const { analyze, loading, analysis, error } = useStockAnalysis();

// Analyze a stock
await analyze('AAPL', 'مدى قصير'); // Short term
await analyze('TSLA', 'مدى متوسط'); // Medium term
await analyze('GOOGL', 'مضارب'); // Day trading
```

### 2. Investment Advisor (`investment_advisor`)
Provides personalized investment advice and portfolio analysis.

**Capabilities:**
- Investment strategy recommendations
- Portfolio diversification analysis
- Risk assessment
- Asset allocation advice

**Usage:**
```typescript
import { useInvestmentAdvice } from '@/hooks/useAI';

const { getAdvice, loading, advice, error } = useInvestmentAdvice();

await getAdvice('ما هي أفضل استراتيجية للاستثمار طويل المدى؟');
```

### 3. Shariah Compliance Checker (`shariah_compliance`)
Evaluates stocks for Islamic compliance.

**Capabilities:**
- Check prohibited revenue percentage
- Evaluate interest-bearing loans
- Assess interest-bearing deposits
- Calculate purification ratio

**Usage:**
```typescript
import { useShariahCompliance } from '@/hooks/useAI';

const { checkCompliance, loading, report, error } = useShariahCompliance();

await checkCompliance({
  name: 'Apple Inc.',
  prohibitedRevenue: 3.5,
  interestLoans: 25,
  interestDeposits: 20,
  liquidAssets: 60,
});
```

### 4. General Assistant (`general_assistant`)
Answers general questions about markets and investing.

**Capabilities:**
- Explain financial concepts
- Answer market-related questions
- Provide educational content
- Help beginners understand investing

**Usage:**
```typescript
import { useAIAssistant } from '@/hooks/useAI';

const { ask, loading, answer, error } = useAIAssistant();

await ask('ما هو الفرق بين السهم والسند؟');
```

### 5. Content Generator (`content_generator`)
Creates financial content and articles.

**Capabilities:**
- Write educational articles
- Generate stock analysis reports
- Create marketing content
- Produce investment guides

**Usage:**
```typescript
import { useContentGenerator } from '@/hooks/useAI';

const { generate, loading, content, error } = useContentGenerator();

await generate('مقال', 'أساسيات الاستثمار في الأسهم', 'للمبتدئين');
```

## Chat Interface with Conversation History

For interactive conversations with any agent:

```typescript
import { useAIChat } from '@/hooks/useAI';

const { sendMessage, clearChat, loading, messages, error } = useAIChat('investment_advisor');

// Send a message
await sendMessage('أريد بناء محفظة استثمارية متنوعة');

// Continue the conversation
await sendMessage('ما هي النسبة المثالية للأسهم؟');

// Clear conversation
clearChat();
```

## Server Actions (Direct Usage)

If you need to call AI agents directly from server components:

```typescript
import {
  analyzeStockAction,
  getInvestmentAdviceAction,
  checkShariahComplianceAction,
  askQuestionAction,
  generateContentAction,
} from '@/actions/aiAgents';

// In a server component or API route
const result = await analyzeStockAction('AAPL', 'مدى قصير');
```

## Core LLM Class (Advanced Usage)

For custom implementations:

```typescript
import { LLMAgent } from '@/lib/ai/llm';

// Create a custom agent
const agent = new LLMAgent('stock_analyst');

// Generate response
const result = await agent.generate('تحليل سهم AAPL');

// With conversation history
const result2 = await agent.generate('ماذا عن TSLA؟', {
  includeHistory: true,
});

// Get conversation history
const history = agent.getHistory();

// Clear history
agent.clearHistory();
```

## Configuration

### Environment Variables

Make sure to set your Gemini API key:

```env
GEMINI_API_KEY=your_api_key_here
```

### AI Models

Two models are available:

- `FLASH` (gemini-2.0-flash-exp): Fast, efficient for most tasks
- `PRO` (gemini-2.0-flash-thinking-exp): More capable, better reasoning

Each agent is pre-configured with the optimal model for its task.

## Best Practices

1. **Error Handling**: Always check the `success` field in responses
2. **Loading States**: Use the `loading` state to show UI feedback
3. **Conversation History**: Use `useAIChat` for multi-turn conversations
4. **Rate Limiting**: Implement rate limiting on the client side
5. **Caching**: Consider caching responses for identical queries

## Example: Complete Stock Analysis Component

```typescript
'use client';

import { useState } from 'react';
import { useStockAnalysis } from '@/hooks/useAI';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function StockAnalyzer() {
  const [symbol, setSymbol] = useState('');
  const [timeframe, setTimeframe] = useState('مدى قصير');
  const { analyze, loading, analysis, error } = useStockAnalysis();

  const handleAnalyze = async () => {
    await analyze(symbol, timeframe);
  };

  return (
    <div className="space-y-4">
      <Input
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
        placeholder="رمز السهم (مثال: AAPL)"
      />
      
      <select
        value={timeframe}
        onChange={(e) => setTimeframe(e.target.value)}
        className="w-full p-2 border rounded"
      >
        <option value="مضارب">مضارب (15 دقيقة)</option>
        <option value="مدى قصير">مدى قصير (ساعة)</option>
        <option value="مدى متوسط">مدى متوسط (يومي)</option>
      </select>

      <Button onClick={handleAnalyze} disabled={loading}>
        {loading ? 'جاري التحليل...' : 'تحليل السهم'}
      </Button>

      {error && (
        <div className="text-red-500 p-4 border border-red-300 rounded">
          {error}
        </div>
      )}

      {analysis && (
        <div className="p-4 border rounded bg-gray-50">
          <pre className="whitespace-pre-wrap">{analysis}</pre>
        </div>
      )}
    </div>
  );
}
```

## Troubleshooting

### Common Issues

1. **"API Key not found"**
   - Ensure `GEMINI_API_KEY` is set in your `.env` file
   - Restart your development server after adding the key

2. **"Rate limit exceeded"**
   - Implement client-side rate limiting
   - Consider caching responses

3. **"Model not found"**
   - Check that you're using the correct model names
   - Verify your Gemini API access level

## Future Enhancements

- [ ] Streaming responses for real-time output
- [ ] Multi-language support
- [ ] Custom agent creation via UI
- [ ] Response caching system
- [ ] Usage analytics and monitoring
- [ ] Fine-tuned models for specific tasks

## Support

For issues or questions, please contact the development team or refer to the [Google Gemini Documentation](https://ai.google.dev/docs).
