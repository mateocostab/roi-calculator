# ROI Calculator - Claude Instructions

## Project Overview
CRO ROI Calculator for ConvertMate. React/Next.js app with i18n (ES/EN), multi-currency support, and revenue projections.

## Tech Stack
- Next.js 16 with App Router
- TypeScript strict mode
- Vitest for testing
- Recharts for visualizations

## Key Files
- `src/lib/calculations.ts` - Core revenue/ROI calculation logic
- `src/lib/constants.ts` - Configuration (scenarios, currencies, ranges)
- `src/lib/i18n/es.ts` & `en.ts` - Translation files
- `src/hooks/useCalculator.ts` - Calculator state management
- `src/components/calculator/Calculator.tsx` - Main UI component

## Workflow Principles

### 1. Test-Driven Development
- Write failing test FIRST, watch it fail, then implement
- Never write production code without a failing test
- Run `npm test` after every change

### 2. Verification Before Done
- Never claim "fixed" or "complete" without running tests
- `npm test && npm run build` before any completion claim
- Check actual values match expected (don't trust assumptions)

### 3. Debug with Real Values
When calculations seem wrong:
```bash
npx tsx -e "
import { calculateScaledState } from './src/lib/calculations';
const result = calculateScaledState(metrics, 'expected', 50, 6);
console.log(result);
"
```

### 4. Currency Handling
- All monetary inputs (aov, adSpend, croInvestment) stored in LOCAL currency
- When user changes currency, ALL monetary values convert together
- ROI ratios should stay consistent across currencies (~5-10x is realistic)
- If ROI > 500x, inputs are inconsistent - show "—" instead

### 5. Translation Keys
- Spanish file (`es.ts`) is the source of truth for `TranslationKey` type
- English file must have all the same keys
- Use `t('key')` function - returns empty string for empty values (not the key)
- Never use `.split()` on translated strings - create separate keys instead

### 6. Chart Overlays
- Position overlays AFTER `<ResponsiveContainer>` for proper z-index
- Use `overflow: hidden` on container to clip overlays
- Chart area starts at ~80px from left (Y-axis width)

## Common Bugs & Fixes

### ROI Explodes to 1000x+
**Cause**: Monetary values in different currencies (AOV in COP, investment in USD)
**Fix**: Ensure all monetary values convert together when currency changes

### Translation Shows Key Instead of Value
**Cause**: Using `||` fallback which treats empty string as falsy
**Fix**: Use `value !== undefined ? value : key`

### Chart Overlay Outside Bounds
**Cause**: Absolute positioning without overflow control
**Fix**: Add `overflow: hidden` to chart container

## Testing Checklist
- [ ] `npm test` passes (all 112+ tests)
- [ ] `npm run build` succeeds
- [ ] ROI with defaults is 5-10x (not 1000x+)
- [ ] Both ES and EN translations work
- [ ] Currency conversion maintains ROI ratio

## Business Logic

### Scenarios
- Conservative: +15% CVR
- Expected: +25% CVR
- Optimistic: +40% CVR

### Implementation Curve
- Month 1: 25% of improvement
- Month 2: 60% of improvement
- Month 3+: 100% of improvement

### Ongoing Optimization
- After month 3: +2% CVR improvement per month (linear for scaled, compound for improved)

### Scaling Model
- Visitor scaling: `sqrt(adSpendRatio)` (diminishing returns)
- CVR degradation: `pow(visitorRatio, -0.3)` (new visitors less qualified)
