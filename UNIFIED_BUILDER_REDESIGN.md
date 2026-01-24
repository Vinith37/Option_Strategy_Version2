# Unified Strategy Builder Redesign

## Overview
Complete redesign of the Options Strategy Builder with a unified, dynamic layout that works consistently across ALL strategies. Users now build strategies by adding individual option legs, providing maximum flexibility and a modern fintech UX.

---

## Major Changes

### Before
- **Strategy-specific forms**: Each strategy (Covered Call, Iron Condor, etc.) had different form layouts
- **Left sidebar**: Strategy selector panel
- **Static forms**: Pre-configured forms per strategy type
- **Limited flexibility**: Couldn't customize or mix strategy types

### After
- **Unified builder**: Single page layout for ALL strategies
- **Dynamic leg system**: Build any strategy by adding individual option legs
- **Interactive controls**: Real-time price adjustments and range controls
- **Maximum flexibility**: Create any combination of options (including custom strategies)
- **Consistent UX**: Same layout, same interaction patterns across all scenarios

---

## New Layout Structure

### 1. Page Header
```
Title: "Strategy Builder"
Subtitle: "Configure and visualize your options trading strategies with real-time payoff analysis"
```
- Clean, professional typography
- Centered text with generous top padding

### 2. Two-Column Grid (3:1 ratio)
**Left Column (2/3 width):**
- Strategy Parameters
- Option Legs
- Profit/Loss Summary
- Notes Section
- Save Button

**Right Column (1/3 width, sticky):**
- Payoff Diagram
- Interactive Controls
- Break-even Badge
- Real-time Chart

---

## Component Breakdown

### Strategy Parameters Card
**Location**: Top of left column

**Fields**:
- Entry Date (date picker with calendar icon)
- Expiry Date (date picker with calendar icon)

**Design**:
- White background, rounded-xl, shadow-sm
- Section title: "Strategy Parameters" (text-lg, font-semibold)
- Two-column grid for dates on desktop
- Single column on mobile
- Space-y-5 between fields

---

### Option Legs Section
**Location**: Below Strategy Parameters

**States**:

#### Empty State (No Legs)
```
┌─────────────────────────────────────┐
│  Option Legs      [+ Add New Leg]  │
├─────────────────────────────────────┤
│                                     │
│          ┌─────────┐               │
│          │    +    │               │
│          └─────────┘               │
│                                     │
│     No legs added yet               │
│     Click "Add New Leg" to start    │
│     building your strategy          │
│                                     │
└─────────────────────────────────────┘
```

**Design**:
- Gray dashed border (border-2 border-dashed border-gray-200)
- Centered icon and text
- Large plus icon in gray circle
- Light gray background (bg-gray-50)

#### With Legs Added
```
┌─────────────────────────────────────┐
│  Option Legs      [+ Add New Leg]  │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐   │
│  │ [BUY] [CALL]         ✏️ 🗑️  │   │
│  │                              │   │
│  │ Strike: ₹19,000              │   │
│  │ Premium: ₹200  Qty: 50       │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ [SELL] [PUT]         ✏️ 🗑️  │   │
│  │                              │   │
│  │ Strike: ₹17,500              │   │
│  │ Premium: ₹150  Qty: 50       │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

**Each Leg Card**:
- White background with border
- Hover effect (border-gray-300)
- Position badge: BUY (green) or SELL (red)
- Type badge: CALL (blue) or PUT (purple)
- Grid layout for details: Strike | Premium | Quantity
- Action buttons: Edit (blue hover) | Delete (red hover)
- Space-y-3 between cards

---

### Add New Leg Button
**Design**:
- Gradient background: blue-600 to purple-600
- Plus icon + "Add New Leg" text
- Hover effect: darker gradient
- Located in section header (right side)

---

### Add/Edit Leg Dialog
**Modal Content**:

```
┌──────────────────────────────┐
│  Add New Leg            ✕   │
├──────────────────────────────┤
│                              │
│  Position        Type        │
│  [Buy ▼]        [Call ▼]    │
│                              │
│  Strike Price                │
│  [18000          ]           │
│                              │
│  Premium (per unit)          │
│  [200            ]           │
│                              │
│  Quantity                    │
│  [50             ]           │
│                              │
├──────────────────────────────┤
│           [Cancel] [Add Leg] │
└──────────────────────────────┘
```

**Features**:
- Modal overlay with blur
- Two-column grid for Position/Type dropdowns
- Large rounded inputs (h-11, rounded-lg)
- Validation: "Add Leg" button disabled until all fields filled
- Edit mode: Changes to "Edit Leg" / "Update Leg"

---

### Profit/Loss Summary Cards
**Location**: Below Option Legs (only shows when legs exist)

**Layout**: Two-column grid

#### Max Profit Card
```
┌─────────────────────────┐
│  ┌────┐                 │
│  │ ↗️ │  Max Profit     │
│  └────┘  +₹25,000       │
└─────────────────────────┘
```
- Gradient: green-50 to green-100
- Green border
- Icon: TrendingUp in green circle
- Large number (text-2xl)

#### Max Loss Card
```
┌─────────────────────────┐
│  ┌────┐                 │
│  │ ↘️ │  Max Loss       │
│  └────┘  ₹-10,000       │
└─────────────────────────┘
```
- Gradient: red-50 to red-100
- Red border
- Icon: TrendingDown in red circle
- Large number (text-2xl)

---

### Payoff Diagram (Right Panel)
**Location**: Sticky sidebar (top-8)

**Structure**:
```
┌─────────────────────────────────┐
│  Payoff Diagram                 │
│  Adjust controls to visualize   │
├─────────────────────────────────┤
│  ┌─────────────────────────┐   │
│  │ Break-even: ₹18,500     │   │
│  └─────────────────────────┘   │
├─────────────────────────────────┤
│  Underlying Price               │
│  [ - ]    ₹18,000    [ + ]     │
│                                  │
│  Price Range           ±20%     │
│  [═══════●═══════]              │
├─────────────────────────────────┤
│  ┌─────────────────────────┐   │
│  │                          │   │
│  │      📈 Chart            │   │
│  │                          │   │
│  │                          │   │
│  └─────────────────────────┘   │
└─────────────────────────────────┘
```

**Components**:

1. **Break-even Badge**
   - Blue background (bg-blue-50)
   - Blue border and text
   - Shows first break-even point
   - Only visible when break-even exists

2. **Underlying Price Control**
   - Stepper with minus/plus buttons
   - Large centered price display
   - Step increment: ₹100
   - Rounded button borders

3. **Price Range Slider**
   - Label with current percentage (±20%)
   - Radix UI slider component
   - Range: 10% to 50%
   - Step: 5%

4. **Chart**
   - Recharts LineChart
   - Responsive container (h-80)
   - Gray background (bg-gray-50)
   - Features:
     - Zero line (gray dashed)
     - Current price line (blue dashed with label)
     - Payoff line (blue, strokeWidth 2)
     - Hover tooltip with formatted values
     - Grid lines
     - Axis labels with ₹ symbol

---

### Notes Section
**Location**: Below Profit/Loss Summary

**Design**:
```
┌─────────────────────────────────┐
│  Notes                          │
├─────────────────────────────────┤
│  Add notes about this           │
│  strategy...                    │
│                                  │
│                                  │
└─────────────────────────────────┘
```
- White card with border
- Textarea with min-height
- Rounded-lg border
- Placeholder text in gray

---

### Save Strategy Button
**Location**: Bottom right of left column

**Design**:
- Large size (size="lg")
- Gradient: blue-600 to purple-600
- Save icon + "Save Strategy" text
- Disabled state when no legs added
- Hover effect: darker gradient

---

## Reusable Components Created

### 1. LegCard.tsx
Displays an individual option leg with badges and actions.

**Props**:
```typescript
interface LegCardProps {
  leg: OptionLeg;
  onEdit: (leg: OptionLeg) => void;
  onDelete: (id: string) => void;
}

interface OptionLeg {
  id: string;
  type: 'call' | 'put';
  position: 'buy' | 'sell';
  strike: string;
  premium: string;
  quantity: string;
}
```

**Usage**:
```tsx
<LegCard
  leg={leg}
  onEdit={handleEditLeg}
  onDelete={handleDeleteLeg}
/>
```

---

### 2. EmptyLegsState.tsx
Empty state component for when no legs are added.

**Usage**:
```tsx
{legs.length === 0 ? (
  <EmptyLegsState />
) : (
  // Render leg cards
)}
```

---

### 3. AddLegDialog.tsx
Modal dialog for adding or editing option legs.

**Props**:
```typescript
interface AddLegDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (leg: OptionLeg) => void;
  editingLeg?: OptionLeg;
}
```

**Usage**:
```tsx
<AddLegDialog
  open={isAddLegDialogOpen}
  onOpenChange={setIsAddLegDialogOpen}
  onSave={handleSaveLeg}
  editingLeg={editingLeg}
/>
```

---

### 4. PriceControl.tsx
Interactive price stepper with plus/minus buttons.

**Props**:
```typescript
interface PriceControlProps {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  label: string;
}
```

**Usage**:
```tsx
<PriceControl
  label="Underlying Price"
  value={underlyingPrice}
  onChange={setUnderlyingPrice}
  step={100}
/>
```

---

### 5. RangeSlider.tsx
Slider for adjusting price range percentage.

**Props**:
```typescript
interface RangeSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label: string;
}
```

**Usage**:
```tsx
<RangeSlider
  label="Price Range"
  value={priceRange}
  onChange={setPriceRange}
  min={10}
  max={50}
  step={5}
/>
```

---

## Payoff Calculation Logic

The new system calculates payoffs dynamically based on the legs array:

```typescript
legs.forEach(leg => {
  const strike = parseFloat(leg.strike) || 0;
  const premium = parseFloat(leg.premium) || 0;
  const quantity = parseFloat(leg.quantity) || 0;

  let legPayoff = 0;

  if (leg.type === 'call') {
    const intrinsic = Math.max(0, price - strike);
    if (leg.position === 'buy') {
      legPayoff = (intrinsic - premium) * quantity;
    } else {
      legPayoff = (premium - intrinsic) * quantity;
    }
  } else {
    const intrinsic = Math.max(0, strike - price);
    if (leg.position === 'buy') {
      legPayoff = (intrinsic - premium) * quantity;
    } else {
      legPayoff = (premium - intrinsic) * quantity;
    }
  }

  totalPayoff += legPayoff;
});
```

This allows for:
- Any combination of options
- Custom strategies
- Complex multi-leg setups
- Accurate payoff calculations

---

## Common Strategy Examples

### Covered Call
1. Add Leg: Buy Call at Strike 18000, Premium 0, Qty 50 (simulates futures)
2. Add Leg: Sell Call at Strike 19000, Premium 200, Qty 50

### Iron Condor
1. Add Leg: Buy Put at Strike 17000, Premium 50, Qty 50
2. Add Leg: Sell Put at Strike 17500, Premium 100, Qty 50
3. Add Leg: Sell Call at Strike 18500, Premium 100, Qty 50
4. Add Leg: Buy Call at Strike 19000, Premium 50, Qty 50

### Long Straddle
1. Add Leg: Buy Call at Strike 18000, Premium 300, Qty 50
2. Add Leg: Buy Put at Strike 18000, Premium 300, Qty 50

### Butterfly Spread
1. Add Leg: Buy Call at Strike 17500, Premium 100, Qty 50
2. Add Leg: Sell Call at Strike 18000, Premium 200, Qty 100
3. Add Leg: Buy Call at Strike 18500, Premium 100, Qty 50

---

## Design System

### Colors
- **Primary gradient**: `from-blue-600 to-purple-600`
- **Green (profit)**: `from-green-50 to-green-100`, text: `green-900`
- **Red (loss)**: `from-red-50 to-red-100`, text: `red-900`
- **Blue (info)**: `bg-blue-50`, text: `blue-900`
- **Position badges**:
  - Buy: `text-green-700 bg-green-50`
  - Sell: `text-red-700 bg-red-50`
- **Type badges**:
  - Call: `text-blue-700 bg-blue-50`
  - Put: `text-purple-700 bg-purple-50`

### Spacing
- **Card padding**: `p-6`
- **Section gaps**: `space-y-6`
- **Field spacing**: `space-y-5`
- **Leg card gaps**: `space-y-3`

### Border Radius
- **Cards**: `rounded-xl`
- **Inputs/Buttons**: `rounded-lg`
- **Badges**: `rounded-md`

### Shadows
- **Cards**: `shadow-sm`
- **Modals**: `shadow-lg`

---

## Mobile Responsiveness

- Grid collapses to single column on mobile (`lg:grid-cols-3`)
- Sticky sidebar becomes scrollable
- Touch-friendly button sizes (h-11)
- Date picker popover adjusts to viewport
- Chart remains responsive with ResponsiveContainer

---

## State Management

### Core State
```typescript
const [legs, setLegs] = useState<OptionLeg[]>([]);
const [entryDate, setEntryDate] = useState<Date>();
const [expiryDate, setExpiryDate] = useState<Date>();
const [underlyingPrice, setUnderlyingPrice] = useState(18000);
const [priceRange, setPriceRange] = useState(20);
const [notes, setNotes] = useState('');
```

### Dialog State
```typescript
const [isAddLegDialogOpen, setIsAddLegDialogOpen] = useState(false);
const [editingLeg, setEditingLeg] = useState<OptionLeg | undefined>();
```

---

## Key Features

✅ **Unified Layout**: Same experience for all strategies
✅ **Dynamic Leg System**: Add unlimited legs in any combination
✅ **Real-time Updates**: Payoff diagram updates as you add/edit legs
✅ **Interactive Controls**: Adjust underlying price and range on the fly
✅ **Empty States**: Clear guidance when no legs exist
✅ **Edit Functionality**: Modify existing legs easily
✅ **Delete Functionality**: Remove legs with confirmation
✅ **Break-even Display**: Automatically calculates and displays break-even points
✅ **Validation**: Save button disabled until strategy is valid
✅ **Toast Notifications**: Success/error feedback
✅ **LocalStorage Persistence**: Saves strategies per user
✅ **Responsive Design**: Works beautifully on all screen sizes

---

## Benefits Over Old System

1. **Flexibility**: Build ANY strategy combination
2. **Consistency**: Same UX across all scenarios
3. **Clarity**: Clear visual representation of each leg
4. **Efficiency**: Faster strategy creation with reusable components
5. **Scalability**: Easy to add new features to one unified page
6. **Modern**: Clean fintech aesthetic with interactive controls
7. **User-friendly**: Empty states and clear CTAs guide users

---

## Summary

This unified redesign transforms the Options Strategy Builder into a powerful, flexible tool that maintains a consistent, professional interface across all use cases. The dynamic leg system allows users to create everything from simple Covered Calls to complex custom multi-leg strategies, all within the same intuitive layout.
