# Profit/Loss Calculation System

This document describes the centralized P&L calculation engine used throughout the Options Strategy Builder application.

## Overview

All profit/loss calculations in the app use a **single source of truth**: the `/src/utils/calculations.ts` module. This ensures consistency across:

- Strategy Builder preview
- Trade exit calculations  
- Trade History display
- Dashboard metrics
- Payoff diagrams

## Core Calculation Rules

### 1. **Futures P&L**

```typescript
// Long Position
P&L = (Exit Price − Entry Price) × Lot Size

// Short Position  
P&L = (Entry Price − Exit Price) × Lot Size
```

### 2. **Options - Calls**

```typescript
// Long Call
P&L = (Exit Premium − Entry Premium) × Quantity

// Short Call
P&L = (Entry Premium − Exit Premium) × Quantity
```

### 3. **Options - Puts**

```typescript
// Long Put
P&L = (Exit Premium − Entry Premium) × Quantity

// Short Put
P&L = (Entry Premium − Exit Premium) × Quantity
```

### 4. **Multi-leg Strategies**

```typescript
Total Strategy P&L = Sum of P&L across ALL legs
```

### 5. **Intrinsic Value Calculations**

For payoff diagrams at various underlying prices:

```typescript
// Call Intrinsic Value
Intrinsic = Max(0, Underlying Price − Strike Price)

// Put Intrinsic Value  
Intrinsic = Max(0, Strike Price − Underlying Price)
```

## Key Functions

### `calculateOptionLegPnL(leg, exitPremium?)`
Calculates profit/loss for a single option leg.
- Uses exit premium if provided
- Otherwise uses current premium for theoretical P&L

### `calculateFutureLegPnL(leg, exitPrice?)`
Calculates profit/loss for a single futures leg.
- Uses exit price if provided
- Otherwise uses entry price (no P&L)

### `calculateActualExitPnL(legs)`
Calculates realized P&L when a trade is exited.
- Uses actual exit prices/premiums from leg data
- This is what appears in Trade History

### `calculatePayoffAtPrice(legs, underlyingPrice)`
Calculates theoretical P&L at a specific underlying price.
- Used for generating payoff diagrams
- Uses intrinsic value for option legs
- This is the **payoff engine** for charts

### `calculateMaxProfit(legs, underlyingPrice, priceRange)`
Finds the maximum profit across a price range.
- Samples 100+ price points
- Includes all strike prices
- Returns highest P&L found

### `calculateMaxLoss(legs, underlyingPrice, priceRange)`
Finds the maximum loss across a price range.
- Samples 100+ price points  
- Includes all strike prices
- Returns lowest P&L found (most negative)

### `generatePayoffData(legs, underlyingPrice, priceRange?)`
Generates chart data for visualization.
- Returns array of `{price, payoff}` objects
- 100 data points across price range
- Used by Recharts for display

## Usage Examples

### Exit a Trade

```typescript
import { calculateActualExitPnL } from '../../utils/calculations';

// When user exits trade, calculate actual P&L
const legsWithExit = legs.map(leg => ({
  ...leg,
  exitPremium: userEnteredExitPremium, // For options
  exitPrice: userEnteredExitPrice,      // For futures
}));

const actualProfit = calculateActualExitPnL(legsWithExit);

// Save to history
const completedTrade = {
  ...strategy,
  status: 'completed',
  actualProfit: actualProfit,
  exitDate: new Date().toISOString(),
};
```

### Display Payoff Chart

```typescript
import { generatePayoffData } from '../../utils/calculations';

// Generate chart data
const chartData = generatePayoffData(
  strategy.legs,
  underlyingPrice,
  { min: minPrice, max: maxPrice }
);

// Use with Recharts
<LineChart data={chartData}>
  <Line dataKey="payoff" />
</LineChart>
```

### Calculate Max Profit/Loss

```typescript
import { calculateMaxProfit, calculateMaxLoss } from '../../utils/calculations';

const maxProfit = calculateMaxProfit(
  strategy.legs,
  underlyingPrice,
  { min: minPrice, max: maxPrice }
);

const maxLoss = calculateMaxLoss(
  strategy.legs,
  underlyingPrice,
  { min: minPrice, max: maxPrice }
);
```

## Data Structures

### Option Leg

```typescript
interface OptionLeg {
  id: string;
  type: 'call' | 'put';
  position: 'long' | 'short';
  strikePrice: number;
  premium: number;
  quantity: number;
  expiryDate?: string;
  exitPremium?: number;  // Set when trade is exited
}
```

### Future Leg

```typescript
interface FutureLeg {
  id: string;
  type: 'future';
  position: 'long' | 'short';
  entryPrice: number;
  quantity: number;
  lotSize: number;
  exitPrice?: number;  // Set when trade is exited
}
```

## Validation Rules

1. **Exit handling**: If user exits manually, use recorded exit prices. If no exit is entered, mark as "In Progress" instead of calculating.

2. **Sync rule**: Trade History must always display the EXACT result used in the Payoff Chart - NO alternative formulas.

3. **Consistency**: All parts of the app call the same calculation functions - never duplicate P&L logic.

4. **Display format**: Always use `₹` symbol and `.toLocaleString()` for number formatting.

## Test Cases

The calculation engine should handle:

✅ **Covered Call**  
- Long stock/futures + Short call
- Limited upside, unlimited downside protection

✅ **Protective Put**  
- Long stock/futures + Long put  
- Limited downside, unlimited upside

✅ **Iron Condor**  
- Short put spread + Short call spread
- Limited profit and loss

✅ **Bull Call Spread**  
- Long lower strike call + Short higher strike call
- Limited profit and loss

✅ **Long Straddle**  
- Long call + Long put (same strike)
- Unlimited profit both directions, limited loss

✅ **Butterfly Spread**  
- Multiple strikes, symmetrical payoff
- Limited profit and loss

✅ **Custom Multi-leg**  
- Any combination of calls, puts, and futures
- Calculates sum across all legs

## Migration Notes

If you encounter old P&L calculations in the codebase:

1. Import from `'../../utils/calculations'`
2. Replace custom logic with standard functions
3. Ensure leg data structure matches the interfaces
4. Test that History matches Payoff Chart values

## Future Enhancements

Planned features that will use this system:

- **Partial Exits**: Exit individual legs at different times
- **Real-time P&L**: Update current P&L based on market prices
- **Greeks Calculation**: Delta, Gamma, Theta, Vega
- **Probability Analysis**: Chance of profit at expiration
- **Backtesting**: Historical strategy performance

---

**Last Updated**: January 2026  
**Maintained By**: Options Strategy Builder Team
