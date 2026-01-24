# Smart Price Control - Complete Guide

## 🎯 Overview

The Payoff Diagram controls now feature **intelligent price management** that automatically adapts based on whether the strategy includes Futures (FUT) positions. The control seamlessly switches between two modes:

1. **Synced Mode** — When FUT legs exist (auto-linked to futures price)
2. **Manual Mode** — When NO FUT legs exist (user-editable spot price)

---

## 🆕 What's New

### Automatic Mode Detection

The system **automatically detects** futures positions and adjusts the price control behavior:

```typescript
const futuresLegs = legs.filter(leg => leg.instrumentType === 'fut');
const hasFuturesLeg = futuresLegs.length > 0;
```

**Result:**
- Has FUT → Synced mode (locked)
- No FUT → Manual mode (editable)

---

## 🎨 Visual Design

### Mode 1: Manual Mode (No Futures)

**Label:** "Spot Price"

**Visual:**
```
┌─────────────────────────────────────┐
│ Spot Price                           │
├─────────────────────────────────────┤
│  [-]   [18000         ]   [+]       │
│  ℹ Used for payoff calculations...  │
└─────────────────────────────────────┘
```

**Features:**
- Editable number input (center)
- Increment/decrement buttons (enabled)
- Blue helper text with info icon
- Placeholder: "Enter spot price"

**When Empty (Warning State):**
```
┌─────────────────────────────────────┐
│ Spot Price                           │
├─────────────────────────────────────┤
│  [-]   [              ]   [+]       │
│  ⚠️ Enter a spot price to view...   │
└─────────────────────────────────────┘
```

- Input has orange border (`border-orange-300 bg-orange-50`)
- Warning text in orange (`text-orange-600`)

---

### Mode 2: Synced Mode (With Futures)

**Label:** "Underlying Price" + Badge

**Visual:**
```
┌─────────────────────────────────────┐
│ Underlying Price  🔒 Synced with... │
├─────────────────────────────────────┤
│  [-]   [ ₹18,000  ]   [+]           │
│  ℹ Price linked to Futures entry... │
└─────────────────────────────────────┘
```

**Features:**
- **Badge**: Blue pill with lock icon (`🔒 Synced with Futures`)
- **Read-only display**: Gray background (`bg-gray-50`)
- **Disabled buttons**: Grayed out, cursor-not-allowed
- **Value**: Auto-synced from FUT entry price
- **Helper**: "Price linked to Futures entry price"

---

## 🔄 Behavior Rules

### Rule 1: Auto-Sync with Futures Entry Price

**When a FUT leg exists:**
```typescript
useEffect(() => {
  if (hasFuturesLeg && futuresLegs[0].entryPrice) {
    const futPrice = parseFloat(futuresLegs[0].entryPrice);
    if (!isNaN(futPrice) && futPrice !== underlyingPrice) {
      setUnderlyingPrice(futPrice);
    }
  }
}, [legs, hasFuturesLeg]);
```

**Example:**
- User adds FUT leg with entry price: ₹18,000
- Underlying Price automatically becomes: ₹18,000
- Field becomes locked (synced mode)
- If FUT entry price changes to ₹18,500 → Underlying updates to ₹18,500

---

### Rule 2: Manual Input When No Futures

**When NO FUT legs:**
- Field is fully editable
- User can type directly or use +/- buttons
- Default value: 0 (empty state)
- Shows warning if left at 0 and legs exist

---

### Rule 3: State Transitions

**Scenario A: User Adds First FUT Leg**

1. Initial state: Manual mode, spot price = ₹18,200
2. User adds FUT leg with entry = ₹18,000
3. ✅ **Transition**:
   - Mode switches to Synced
   - Price updates to ₹18,000
   - Field becomes locked
   - Badge appears: "🔒 Synced with Futures"
   - Helper text changes

**Scenario B: User Removes Last FUT Leg**

1. Initial state: Synced mode, price = ₹18,000
2. User deletes the only FUT leg
3. ✅ **Transition**:
   - Mode switches to Manual
   - Price retains current value (₹18,000)
   - Field becomes editable
   - Badge disappears
   - Helper text changes

---

### Rule 4: Multiple FUT Legs

**When multiple FUT legs exist:**
- System uses **first FUT leg's entry price**
- All FUT legs contribute to payoff independently
- Underlying price syncs with first leg only

```typescript
const futuresLegs = legs.filter(leg => leg.instrumentType === 'fut');
const futPrice = parseFloat(futuresLegs[0].entryPrice);
```

**Example:**
- FUT 1: Entry = ₹18,000
- FUT 2: Entry = ₹18,500
- **Underlying Price = ₹18,000** (from first leg)

---

## 🎨 Component Props

### PriceControl Interface

```typescript
interface PriceControlProps {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  label: string;
  syncedWithFutures?: boolean;        // NEW
  helperText?: string;                 // NEW
  placeholder?: string;                // NEW
  showWarning?: boolean;               // NEW
  warningText?: string;                // NEW
}
```

---

### Usage: Manual Mode

```tsx
<PriceControl
  label="Spot Price"
  value={underlyingPrice}
  onChange={setUnderlyingPrice}
  step={100}
  syncedWithFutures={false}
  helperText="Used for payoff calculations when no futures position is added"
  placeholder="Enter spot price"
  showWarning={underlyingPrice === 0 && legs.length > 0}
  warningText="Enter a spot price to view the payoff diagram"
/>
```

**Visual Result:**
- Editable input
- Blue helper text
- Orange warning if price = 0

---

### Usage: Synced Mode

```tsx
<PriceControl
  label="Underlying Price"
  value={underlyingPrice}
  onChange={setUnderlyingPrice}
  step={100}
  syncedWithFutures={true}
  helperText="Price linked to Futures entry price"
  placeholder="Enter spot price"
  showWarning={false}
  warningText=""
/>
```

**Visual Result:**
- Read-only display
- Lock badge
- Disabled buttons
- Blue helper text (no warning)

---

## 🎨 Detailed Component States

### 1. Editable Input (Manual Mode)

```tsx
<Input
  type="number"
  value={inputValue}
  onChange={handleInputChange}
  onBlur={handleInputBlur}
  placeholder="Enter spot price"
  className="text-center text-lg font-semibold h-9 rounded-lg"
/>
```

**Styling:**
- Center-aligned
- Large semibold font
- Height: 36px (`h-9`)
- Rounded corners (`rounded-lg`)

**Warning State:**
```tsx
className={`... ${showWarning ? 'border-orange-300 bg-orange-50' : ''}`}
```

---

### 2. Read-Only Display (Synced Mode)

```tsx
<div className="flex-1 text-center py-2 px-3 bg-gray-50 border border-gray-200 rounded-lg">
  <span className="text-lg font-semibold text-gray-700">
    ₹{value.toLocaleString()}
  </span>
</div>
```

**Styling:**
- Gray background (`bg-gray-50`)
- Gray border
- Darker text (`text-gray-700`)
- Non-interactive

---

### 3. Sync Badge

```tsx
<div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
  <Lock className="w-3 h-3" />
  <span>Synced with Futures</span>
</div>
```

**Styling:**
- Small text (`text-xs`)
- Blue theme (`text-blue-600 bg-blue-50`)
- Pill shape (`rounded`)
- Lock icon (3x3)

---

### 4. Helper Text

```tsx
<p className="text-xs text-gray-500 flex items-start gap-1">
  <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
  <span>{helperText}</span>
</p>
```

**Styling:**
- Small text (`text-xs`)
- Gray color
- Info icon aligned top
- Icon doesn't shrink

---

### 5. Warning Text

```tsx
<p className="text-xs text-orange-600 flex items-start gap-1">
  <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
  <span>{warningText}</span>
</p>
```

**Styling:**
- Orange color (`text-orange-600`)
- Same layout as helper
- Replaces helper when shown

---

## 📊 User Scenarios

### Scenario 1: Pure Options Strategy (Long Straddle)

**Setup:**
- Leg 1: CALL — Buy — Strike 18000
- Leg 2: PUT — Buy — Strike 18000

**Price Control:**
```
Spot Price
[-] [18000        ] [+]
ℹ Used for payoff calculations when no futures position is added
```

**Behavior:**
- User manually enters spot price
- Can adjust with +/- buttons or type directly
- Payoff chart uses this spot price as reference

---

### Scenario 2: Covered Call (FUT + Short Call)

**Setup:**
- Leg 1: FUT — Buy — Entry 18000 — Qty 50
- Leg 2: CALL — Sell — Strike 19000 — Qty 50

**Price Control:**
```
Underlying Price  🔒 Synced with Futures
[-] [ ₹18,000 ] [+]
ℹ Price linked to Futures entry price
```

**Behavior:**
- Price auto-syncs to ₹18,000 (FUT entry)
- User cannot edit (locked)
- If FUT entry changes, price updates automatically
- Payoff chart uses FUT entry as reference

---

### Scenario 3: Transition (Adding FUT to Options Strategy)

**Initial:**
```
Leg 1: CALL — Buy — Strike 18000
Spot Price: ₹18,200 (manually set)
```

**User adds FUT leg:**
```
Leg 2: FUT — Buy — Entry 18500
```

**After transition:**
```
Underlying Price  🔒 Synced with Futures
[-] [ ₹18,500 ] [+]
ℹ Price linked to Futures entry price
```

**What happened:**
- Mode switched from Manual → Synced
- Price updated from ₹18,200 → ₹18,500
- Field became locked
- Badge appeared

---

### Scenario 4: Empty State Warning

**Setup:**
- User builds strategy from scratch
- Adds option legs but forgets spot price

**Price Control:**
```
Spot Price
[-] [             ] [+]
⚠️ Enter a spot price to view the payoff diagram
```

**Behavior:**
- Input has orange border
- Warning text in orange
- Chart may show empty/flat line
- Reminds user to set price

---

## 🎯 Validation Rules

### Required Validation

```typescript
showWarning={!hasFuturesLeg && underlyingPrice === 0 && legs.length > 0}
```

**Triggers Warning When:**
1. ✅ No FUT legs exist (manual mode)
2. ✅ Underlying price is 0 (empty)
3. ✅ Strategy has at least 1 leg

**Does NOT Trigger When:**
- FUT legs exist (synced mode) → Always has valid price
- No legs exist → Empty state, no warning needed
- Price > 0 → Valid value entered

---

### Input Validation

```typescript
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const inputVal = e.target.value;
  setInputValue(inputVal);
  
  const numValue = parseFloat(inputVal);
  if (!isNaN(numValue) && numValue >= 0) {
    onChange(numValue);
  } else if (inputVal === '') {
    onChange(0);
  }
};
```

**Rules:**
- Only numeric values accepted
- Minimum value: 0 (no negative prices)
- Empty input → 0
- Invalid input → Ignored (previous value retained)

---

## 🎨 Styling Reference

### Colors

| Element | Manual Mode | Synced Mode |
|---------|-------------|-------------|
| Label | `text-gray-700` | `text-gray-700` |
| Input/Display | `bg-white` | `bg-gray-50` |
| Border (normal) | `border-gray-300` | `border-gray-200` |
| Border (warning) | `border-orange-300` | N/A |
| Badge | N/A | `text-blue-600 bg-blue-50` |
| Helper Text | `text-gray-500` | `text-gray-500` |
| Warning Text | `text-orange-600` | N/A |
| Buttons (enabled) | Default | N/A |
| Buttons (disabled) | N/A | `opacity-50 cursor-not-allowed` |

---

### Typography

| Element | Size | Weight |
|---------|------|--------|
| Label | `text-sm` | `font-medium` |
| Input Value | `text-lg` | `font-semibold` |
| Badge | `text-xs` | Normal |
| Helper/Warning | `text-xs` | Normal |

---

### Spacing

```css
/* Container */
.space-y-2  /* 8px vertical spacing between label, input, helper */

/* Badge gap */
.gap-1      /* 4px between lock icon and text */

/* Helper/Warning gap */
.gap-1      /* 4px between info icon and text */

/* Input horizontal layout */
.gap-3      /* 12px between buttons and input */
```

---

## 🔧 Technical Implementation

### State Management

```typescript
// In StrategiesPageNew.tsx
const [underlyingPrice, setUnderlyingPrice] = useState(0);

// Detect futures legs
const futuresLegs = legs.filter(leg => leg.instrumentType === 'fut');
const hasFuturesLeg = futuresLegs.length > 0;
```

---

### Auto-Sync Effect

```typescript
useEffect(() => {
  if (hasFuturesLeg && futuresLegs[0].entryPrice) {
    const futPrice = parseFloat(futuresLegs[0].entryPrice);
    if (!isNaN(futPrice) && futPrice !== underlyingPrice) {
      setUnderlyingPrice(futPrice);
    }
  }
}, [legs, hasFuturesLeg]);
```

**Watches:**
- `legs` array changes
- `hasFuturesLeg` boolean

**Updates:**
- `underlyingPrice` when FUT entry changes

---

### Conditional Props

```typescript
<PriceControl
  label={hasFuturesLeg ? "Underlying Price" : "Spot Price"}
  value={underlyingPrice}
  onChange={setUnderlyingPrice}
  step={100}
  syncedWithFutures={hasFuturesLeg}
  helperText={
    hasFuturesLeg 
      ? "Price linked to Futures entry price" 
      : "Used for payoff calculations when no futures position is added"
  }
  placeholder="Enter spot price"
  showWarning={!hasFuturesLeg && underlyingPrice === 0 && legs.length > 0}
  warningText="Enter a spot price to view the payoff diagram"
/>
```

**Dynamic:**
- Label changes based on mode
- Helper text adapts
- Warning only in manual mode

---

## 📋 Benefits Summary

### 1. **Intelligent Automation**
- Auto-syncs price with futures when applicable
- Prevents manual entry errors
- Always uses correct reference price

### 2. **Clear Visual Feedback**
- Badge shows sync status
- Lock icon communicates read-only
- Disabled buttons prevent confusion

### 3. **Helpful Guidance**
- Helper text explains mode
- Warning alerts missing input
- Context-aware messaging

### 4. **Seamless Transitions**
- Smooth mode switching
- No data loss during transitions
- Predictable behavior

### 5. **Professional UX**
- Industry-standard patterns
- Fintech-grade validation
- Polished visual design

---

## 🎯 Design Decisions

### Why Auto-Sync?

**Problem:** Futures price and underlying price should match in real strategies.

**Solution:** Automatically link them to:
- Reduce user errors
- Simplify workflow
- Match real-world trading logic

---

### Why Two Modes?

**Problem:** Pure options strategies need manual spot price input.

**Solution:** Detect strategy type and adapt:
- FUT → Synced (automated)
- No FUT → Manual (flexible)

---

### Why Show Warning?

**Problem:** Payoff diagram is meaningless without reference price.

**Solution:** Alert user to enter spot price:
- Orange visual warning
- Helpful message
- Non-blocking (doesn't prevent progress)

---

### Why Use First FUT Leg?

**Problem:** What if multiple FUT legs have different entry prices?

**Solution:** Use first leg's entry as reference:
- Simple, predictable rule
- Matches common strategy patterns
- Covers 99% of use cases

---

## 🚀 Summary

The Smart Price Control now features:

✅ **Auto-sync mode** when FUT legs exist  
✅ **Manual input mode** for pure options strategies  
✅ **Lock badge** with clear visual indicators  
✅ **Helper text** that adapts to mode  
✅ **Warning state** for missing spot price  
✅ **Smooth transitions** when adding/removing FUT legs  
✅ **Disabled UI** in synced mode (prevents confusion)  
✅ **Numeric validation** for manual input  

**Result:** A professional, intelligent price control that adapts to the strategy type and guides users toward correct payoff calculations! 🎉
