# Futures (FUT) Support - Complete Guide

## 🎯 Overview

The Strategy Builder now supports **Futures (FUT)** positions alongside Options (Call/Put), enabling users to build comprehensive hedged strategies that combine derivatives with underlying positions.

---

## 🆕 What's New

### 1. Instrument Type Selector - Segmented Control

The Add New Leg dialog now features a **segmented control** at the top:

```
┌────────────────────────────────────┐
│  [ Call ] [ Put ] [ 📈 FUT ]      │
└────────────────────────────────────┘
```

**Design:**
- Clean, modern segmented control with gray background
- Active state: white background with shadow
- Color coding:
  - Call: Blue (`text-blue-700`)
  - Put: Purple (`text-purple-700`)
  - FUT: Orange (`text-orange-700`) with TrendingUp icon

**Behavior:**
- Default: Call selected
- Click to switch between Call, Put, or FUT
- Conditionally shows/hides fields based on selection

---

## 📋 FUT Leg Fields

When "FUT" is selected, the dialog shows **futures-specific fields**:

### Field 1: Position Type
```
Position
[Buy ▼]  or  [Sell ▼]
```
- Dropdown selector
- Options: Buy | Sell
- Same as options legs

### Field 2: Futures Entry Price
```
Futures Entry Price
[e.g., 18000                    ]
```
- Number input
- Required field
- Placeholder: "e.g., 18000"
- Large rounded input (`h-11 rounded-lg`)

### Field 3: Exit Price (Optional)
```
Exit Price (Optional)
[e.g., 18500                    ]
```
- Number input
- **Optional field**
- Placeholder: "e.g., 18500"
- Helper text: "Leave empty for current market price"
- If empty, uses current underlying price from payoff calculation

### Field 4: Lot Size
```
Lot Size
[e.g., 50                       ]
```
- Number input
- Required field
- Equivalent to "Quantity" in options
- Placeholder: "e.g., 50"

---

## 🎨 Visual Design

### Add Leg Dialog - FUT Selected

```
┌──────────────────────────────────────┐
│  Add New Leg                    ✕   │
├──────────────────────────────────────┤
│                                      │
│  Instrument Type                     │
│  ┌────────────────────────────────┐ │
│  │ Call │ Put │ 📈 FUT (active) │ │
│  └────────────────────────────────┘ │
│                                      │
│  Position                            │
│  [Buy ▼]                            │
│                                      │
│  Futures Entry Price                 │
│  [18000                          ]  │
│                                      │
│  Exit Price (Optional)               │
│  [                               ]  │
│  Leave empty for current market      │
│                                      │
│  Lot Size                            │
│  [50                             ]  │
│                                      │
├──────────────────────────────────────┤
│              [Cancel] [Add Leg]      │
└──────────────────────────────────────┘
```

---

## 🃏 FUT Leg Card Display

Futures legs display with a distinctive orange badge:

```
┌─────────────────────────────────────┐
│  [BUY] [📈 FUT]            ✏️ 🗑️   │
│                                      │
│  Entry Price: ₹18,000                │
│  Lot Size: 50                        │
└─────────────────────────────────────┘
```

**With Exit Price:**
```
┌─────────────────────────────────────┐
│  [SELL] [📈 FUT]           ✏️ 🗑️   │
│                                      │
│  Entry Price: ₹18,500                │
│  Exit Price: ₹18,000                 │
│  Lot Size: 50                        │
└─────────────────────────────────────┘
```

**Badge Colors:**
- Position: Buy (green) | Sell (red)
- Instrument: FUT (orange) with TrendingUp icon
- Border: Orange (`bg-orange-50 text-orange-700`)

**Grid Layout:**
- 3 columns for Entry / Exit / Lot Size
- 2 columns if no exit price

---

## 📊 Payoff Calculation

### Futures P&L Formula

**Buy Position:**
```
P&L = (Exit Price - Entry Price) × Lot Size
```

**Sell Position:**
```
P&L = (Entry Price - Exit Price) × Lot Size
```

### Code Implementation

```typescript
if (leg.instrumentType === 'fut') {
  const entryPrice = parseFloat(leg.entryPrice || '0');
  const exitPrice = leg.exitPrice ? parseFloat(leg.exitPrice) : price;
  
  if (leg.position === 'buy') {
    legPayoff = (exitPrice - entryPrice) * quantity;
  } else {
    legPayoff = (entryPrice - exitPrice) * quantity;
  }
}
```

### Key Behaviors:

1. **Dynamic Exit Price**: If no exit price specified, uses current price from chart X-axis
2. **Linear Payoff**: Unlike options, futures have unlimited profit/loss potential
3. **Chart Integration**: Futures legs contribute to total payoff curve
4. **Break-even Calculation**: Works seamlessly with combined FUT + Options strategies

---

## 🎯 Example Strategies with Futures

### 1. Covered Call (Futures + Short Call)

**Legs:**
```
1. FUT — Buy — Entry: 18000 — Qty: 50
2. CALL — Sell — Strike: 19000 — Premium: 200 — Qty: 50
```

**Payoff Characteristics:**
- Max Profit: Limited to (Strike - Entry + Premium) × Qty = ₹60,000
- Max Loss: Unlimited downside below entry price
- Break-even: Entry Price - Premium = ₹17,800

**Use Case:** Generate income from upside while holding futures position

---

### 2. Protective Put (Futures + Long Put)

**Legs:**
```
1. FUT — Buy — Entry: 18000 — Qty: 50
2. PUT — Buy — Strike: 17500 — Premium: 150 — Qty: 50
```

**Payoff Characteristics:**
- Max Profit: Unlimited upside
- Max Loss: Limited to (Entry - Strike + Premium) × Qty = ₹32,500
- Break-even: Entry Price + Premium = ₹18,150

**Use Case:** Protect downside while maintaining upside potential

---

### 3. Synthetic Long (Buy FUT Only)

**Legs:**
```
1. FUT — Buy — Entry: 18000 — Qty: 50
```

**Payoff Characteristics:**
- Max Profit: Unlimited
- Max Loss: Unlimited
- Break-even: Entry Price = ₹18,000

**Chart:** Straight diagonal line through entry price

---

### 4. Box Spread with Futures

**Legs:**
```
1. FUT — Buy — Entry: 18000 — Qty: 50
2. CALL — Sell — Strike: 18500 — Premium: 300 — Qty: 50
3. PUT — Buy — Strike: 17500 — Premium: 200 — Qty: 50
```

**Use Case:** Collar strategy with defined risk range

---

## 🔄 Updated Templates

The **Quick Start Templates** now include futures:

### Covered Call Template
```typescript
{
  name: 'Covered Call',
  description: 'Long futures + Short call',
  legs: [
    { instrumentType: 'fut', position: 'buy', entryPrice: '18000', quantity: '50' },
    { instrumentType: 'call', position: 'sell', strike: '19000', premium: '200', quantity: '50' },
  ],
}
```

### Protective Put Template
```typescript
{
  name: 'Protective Put',
  description: 'Long futures + Long put',
  legs: [
    { instrumentType: 'fut', position: 'buy', entryPrice: '18000', quantity: '50' },
    { instrumentType: 'put', position: 'buy', strike: '17500', premium: '150', quantity: '50' },
  ],
}
```

---

## 🎨 Component Updates

### 1. OptionLeg Interface (LegCard.tsx)

```typescript
export interface OptionLeg {
  id: string;
  instrumentType: 'call' | 'put' | 'fut';  // ← NEW
  position: 'buy' | 'sell';
  
  // For options
  strike?: string;
  premium?: string;
  
  // For futures
  entryPrice?: string;  // ← NEW
  exitPrice?: string;   // ← NEW
  
  // Common
  quantity: string;
}
```

**Breaking Change:** `type` renamed to `instrumentType` for clarity

---

### 2. AddLegDialog.tsx

**New Features:**
- Segmented control for instrument selection
- Conditional field rendering
- FUT-specific validation
- Icon integration (TrendingUp for FUT)

**State Management:**
```typescript
const [instrumentType, setInstrumentType] = useState<'call' | 'put' | 'fut'>('call');
const [entryPrice, setEntryPrice] = useState('');
const [exitPrice, setExitPrice] = useState('');
```

**Validation:**
```typescript
const isValid = instrumentType === 'fut' 
  ? entryPrice && quantity 
  : strike && premium && quantity;
```

---

### 3. LegCard.tsx

**New Display Logic:**
```typescript
const isFutures = leg.instrumentType === 'fut';

{isFutures ? (
  <div className="grid grid-cols-3 gap-4">
    <div>Entry Price: ₹{leg.entryPrice}</div>
    {leg.exitPrice && <div>Exit Price: ₹{leg.exitPrice}</div>}
    <div>Lot Size: {leg.quantity}</div>
  </div>
) : (
  <div className="grid grid-cols-3 gap-4">
    <div>Strike: ₹{leg.strike}</div>
    <div>Premium: ₹{leg.premium}</div>
    <div>Quantity: {leg.quantity}</div>
  </div>
)}
```

**Badge Styling:**
- FUT: `text-orange-700 bg-orange-50`
- Includes TrendingUp icon

---

### 4. StrategiesPageNew.tsx

**Updated Payoff Calculation:**
```typescript
legs.forEach(leg => {
  if (leg.instrumentType === 'fut') {
    // Futures payoff
    const entryPrice = parseFloat(leg.entryPrice || '0');
    const exitPrice = leg.exitPrice ? parseFloat(leg.exitPrice) : price;
    
    if (leg.position === 'buy') {
      legPayoff = (exitPrice - entryPrice) * quantity;
    } else {
      legPayoff = (entryPrice - exitPrice) * quantity;
    }
  } else {
    // Options payoff (existing logic)
    // ...
  }
});
```

---

## 📈 Payoff Diagram Examples

### Example 1: Long Futures Only

**Input:**
- FUT — Buy — Entry: 18000 — Qty: 50

**Chart:**
```
      Payoff
        |
 +50000 |              /
        |            /
        |          /
      0 |________/_______ Price
        |      / 18000
-50000  |    /
        |  /
```
- Straight diagonal line
- Slope = Lot Size (50)
- Crosses zero at Entry Price

---

### Example 2: Covered Call (Long FUT + Short Call)

**Input:**
- FUT — Buy — Entry: 18000 — Qty: 50
- CALL — Sell — Strike: 19000 — Premium: 200 — Qty: 50

**Chart:**
```
      Payoff
        |
 +60000 |___________
        |          /
 +10000 |        /
        |      /
      0 |____/_________ Price
        |  / 18000
-50000  |/
```
- Diagonal line from left
- Flattens at strike (19000)
- Max profit capped
- Break-even at 17800

---

### Example 3: Protective Put (Long FUT + Long Put)

**Input:**
- FUT — Buy — Entry: 18000 — Qty: 50
- PUT — Buy — Strike: 17500 — Premium: 150 — Qty: 50

**Chart:**
```
      Payoff
        |
+100000 |            /
        |          /
 +50000 |        /
        |      /
      0 |____/_________ Price
        |   /18150
-32500  |__/__________ ← Max Loss
        17500
```
- Unlimited upside
- Floor at max loss
- Break-even at 18150

---

## ✅ Validation & Error Handling

### Required Fields (FUT)
1. **Position** — Buy or Sell
2. **Entry Price** — Must be numeric
3. **Lot Size** — Must be numeric

### Optional Fields
1. **Exit Price** — Defaults to current market price if empty

### Validation Messages
- "Please fill in all required fields" (generic)
- Add Leg button disabled until valid
- No separate error states needed

---

## 🎨 Design System

### Colors

| Element | Color |
|---------|-------|
| FUT Badge | `bg-orange-50 text-orange-700` |
| FUT Segmented Control Active | `bg-white text-orange-700 shadow-sm` |
| FUT Icon | TrendingUp from lucide-react |

### Typography
Same as options legs:
- Labels: `text-sm font-medium`
- Values: `font-semibold text-gray-900`
- Helper text: `text-xs text-gray-500`

### Spacing
- Segmented control: `p-1` wrapper, `px-4 py-2` buttons
- Fields: `space-y-5` between
- Cards: `p-4` padding

---

## 🚀 Benefits

1. **Unified Interface** — Same dialog for Options and Futures
2. **Flexibility** — Build any combination of derivatives
3. **Real Templates** — Covered Call and Protective Put now use actual futures
4. **Accurate Payoffs** — Proper linear P&L for futures
5. **Professional** — Industry-standard terminology and UX
6. **Exit Price Option** — Support pre-defined exit scenarios

---

## 📱 Responsive Behavior

### Desktop
- Segmented control: 3 equal-width buttons
- Grid layout: 3 columns for FUT card details

### Mobile
- Segmented control: Stacks horizontally (fits on narrow screens)
- Card details: Responsive grid (collapses to 2 or 1 column)

---

## 🔧 Technical Notes

### TypeScript Changes
```typescript
// Old
type: 'call' | 'put'

// New
instrumentType: 'call' | 'put' | 'fut'
```

### Optional Fields
```typescript
strike?: string;      // Only for options
premium?: string;     // Only for options
entryPrice?: string;  // Only for futures
exitPrice?: string;   // Only for futures (optional)
```

### Backward Compatibility
⚠️ **Breaking change**: Existing strategies using `type` will need migration to `instrumentType`

**Migration Script:**
```typescript
const migratedLeg = {
  ...oldLeg,
  instrumentType: oldLeg.type, // Rename field
};
```

---

## 🎯 Summary

The Strategy Builder now supports **three instrument types**:
1. **Call Options** — Traditional call options
2. **Put Options** — Traditional put options
3. **Futures (FUT)** — Linear derivatives with unlimited risk/reward

**Key Features:**
✅ Segmented control for instrument selection  
✅ Conditional field rendering  
✅ Futures-specific payoff calculation  
✅ Orange badge with TrendingUp icon  
✅ Updated templates (Covered Call, Protective Put)  
✅ Exit price option for scenario planning  
✅ Seamless integration with existing chart/P&L  

**Result:** A comprehensive options strategy builder that supports real-world trading scenarios combining futures hedges with options positions! 🚀
