# Options Strategy Builder - Complete Strategy Guide

## Overview
The Options Strategy Builder now supports 7 different options trading strategies with comprehensive forms, real-time payoff diagrams, and profit/loss calculations.

---

## Supported Strategies

### 1. **Covered Call** 📈
**Type:** Income/Neutral Strategy
**Description:** Long futures position + Short call option

**When to Use:**
- Moderately bullish on the underlying
- Generate income from premium
- Willing to cap upside potential

**Form Fields:**
- Entry Details:
  - Futures Entry Price
  - Lot Size
- Option Legs:
  - Call Strike Price
  - Premium Received (per lot)

**Payoff Characteristics:**
- **Max Profit:** Limited to (Strike - Entry) × Lot + Premium
- **Max Loss:** Unlimited downside (futures position)
- **Break-even:** Entry Price - Premium Received

---

### 2. **Bull Call Spread** 📊
**Type:** Bullish Strategy
**Description:** Long lower strike call + Short higher strike call

**When to Use:**
- Moderately bullish outlook
- Limited capital/risk
- Expecting gradual price increase

**Form Fields:**
- Entry Details:
  - Lot Size
- Option Legs:
  - Long Call Strike
  - Long Call Premium Paid
  - Short Call Strike
  - Short Call Premium Received

**Payoff Characteristics:**
- **Max Profit:** (Short Strike - Long Strike) × Lot - Net Premium
- **Max Loss:** Net Premium Paid
- **Break-even:** Long Strike + Net Premium

---

### 3. **Iron Condor** 🦅
**Type:** Neutral Strategy
**Description:** Sell OTM call & put spreads

**When to Use:**
- Expect low volatility
- Range-bound market
- Collect premium income

**Form Fields:**
- Entry Details:
  - Lot Size
- Put Spread:
  - Buy Put Strike
  - Buy Put Premium Paid
  - Sell Put Strike
  - Sell Put Premium Received
- Call Spread:
  - Sell Call Strike
  - Sell Call Premium Received
  - Buy Call Strike
  - Buy Call Premium Paid

**Payoff Characteristics:**
- **Max Profit:** Net Premium Received
- **Max Loss:** Width of Spread - Net Premium
- **Break-even:** Two points (near both short strikes)

---

### 4. **Long Straddle** ⚡
**Type:** Volatility Strategy
**Description:** Long call + Long put at same strike

**When to Use:**
- Expect high volatility
- Uncertain about direction
- Before major events/announcements

**Form Fields:**
- Entry Details:
  - Strike Price (ATM)
  - Lot Size
- Option Legs:
  - Call Premium Paid
  - Put Premium Paid

**Payoff Characteristics:**
- **Max Profit:** Unlimited (both directions)
- **Max Loss:** Total Premium Paid
- **Break-even:** Strike ± Total Premium

---

### 5. **Protective Put** 🛡️
**Type:** Insurance/Hedge Strategy
**Description:** Long futures + Long put option

**When to Use:**
- Protect long position
- Bearish insurance
- Limit downside risk

**Form Fields:**
- Entry Details:
  - Futures Entry Price
  - Lot Size
- Option Legs:
  - Put Strike Price
  - Premium Paid (per lot)

**Payoff Characteristics:**
- **Max Profit:** Unlimited upside (futures)
- **Max Loss:** Limited to (Entry - Put Strike) - Premium
- **Break-even:** Entry Price + Premium Paid

---

### 6. **Butterfly Spread** 🦋
**Type:** Neutral Strategy
**Description:** Buy 1 lower + Sell 2 middle + Buy 1 higher strike

**When to Use:**
- Expect minimal price movement
- Target specific price level
- Low-risk, low-reward

**Form Fields:**
- Entry Details:
  - Lot Size
- Option Legs:
  - Lower Strike (Buy 1) + Premium Paid
  - Middle Strike (Sell 2) + Premium Received
  - Higher Strike (Buy 1) + Premium Paid

**Payoff Characteristics:**
- **Max Profit:** At middle strike
- **Max Loss:** Net Premium Paid
- **Break-even:** Two points around middle strike

---

### 7. **Custom Strategy** ✏️
**Type:** User-Defined
**Description:** Build your own custom options strategy

**When to Use:**
- Advanced traders
- Unique market views
- Combination strategies

**Form Fields:**
- Flexible configuration
- Multiple legs support
- Custom parameters

---

## Common Features Across All Strategies

### Entry Details Section
Configure basic position parameters:
- Lot size
- Entry prices
- Strike prices

### Option Legs Section
Define each option component:
- Strike prices
- Premium paid/received
- Multiple legs for complex strategies

### Exit Conditions (Optional)
Set exit parameters for P&L tracking:
- Exit Futures Price
- Exit Call Price
- Exit Put Price

### Notes Section
Document strategy details:
- Risk management rules
- Entry/exit criteria
- Market conditions
- Personal observations

### Real-Time Calculations
- **Max Profit:** Maximum potential gain
- **Max Loss:** Maximum potential loss
- **Break-Even:** Price point(s) for zero P&L
- **Payoff Diagram:** Visual representation across price range

---

## UI Components

### Strategy Selection Panel (Left)
- **Strategy Cards** with:
  - Strategy name
  - Brief description
  - Icon representation
  - Hover and selected states
  - Color-coded backgrounds

### Strategy Builder Panel (Right)
- **Form Sections** with:
  - Clear section headers
  - Descriptive subtitles
  - Grouped input fields
  - Validation states
  
- **Summary Cards** displaying:
  - Max Profit (green badge)
  - Max Loss (red badge)
  - Break Even (orange badge)
  
- **Payoff Chart** showing:
  - Interactive line chart
  - Price range on X-axis
  - Profit/Loss on Y-axis
  - Zero reference line
  - Responsive container

### Save Functionality
- Save to localStorage
- User-specific strategies
- Toast notifications
- Strategy metadata stored

---

## Design System

### Color Palette
- **Primary Gradients:** Blue to Purple
- **Success:** Green (#10b981)
- **Warning:** Orange (#f59e0b)
- **Error:** Red (#ef4444)
- **Neutral:** Gray scale

### Card Styles
- White backgrounds
- Subtle borders
- Rounded corners (8px, 12px)
- Soft shadows on hover
- Smooth transitions

### Form Elements
- Labeled inputs with placeholders
- Grid layouts (responsive)
- Grouped related fields
- Clear visual hierarchy

### Icons
- Lucide React library
- Contextual icons for each strategy
- Consistent sizing
- Color-coded backgrounds

---

## Calculations Reference

### Covered Call
```
Futures P&L = (Current Price - Entry Price) × Lot Size
Call P&L = max(0, Strike - Current Price) × Lot + Premium × Lot
Total P&L = Futures P&L + Call P&L
```

### Bull Call Spread
```
Long Call P&L = max(0, Price - Long Strike) × Lot - Long Premium × Lot
Short Call P&L = -max(0, Price - Short Strike) × Lot + Short Premium × Lot
Total P&L = Long Call P&L + Short Call P&L
```

### Iron Condor
```
Buy Put P&L = max(0, Buy Put Strike - Price) × Lot - Buy Put Premium × Lot
Sell Put P&L = -max(0, Sell Put Strike - Price) × Lot + Sell Put Premium × Lot
Sell Call P&L = -max(0, Price - Sell Call Strike) × Lot + Sell Call Premium × Lot
Buy Call P&L = max(0, Price - Buy Call Strike) × Lot - Buy Call Premium × Lot
Total P&L = Sum of all legs
```

### Long Straddle
```
Call P&L = max(0, Price - Strike) × Lot - Call Premium × Lot
Put P&L = max(0, Strike - Price) × Lot - Put Premium × Lot
Total P&L = Call P&L + Put P&L
```

### Protective Put
```
Futures P&L = (Price - Entry Price) × Lot
Put P&L = max(0, Put Strike - Price) × Lot - Put Premium × Lot
Total P&L = Futures P&L + Put P&L
```

### Butterfly Spread
```
Lower P&L = max(0, Price - Lower Strike) × Lot - Lower Premium × Lot
Middle P&L = -2 × max(0, Price - Middle Strike) × Lot + 2 × Middle Premium × Lot
Higher P&L = max(0, Price - Higher Strike) × Lot - Higher Premium × Lot
Total P&L = Lower P&L + Middle P&L + Higher P&L
```

---

## Best Practices

### Strategy Selection
1. Match strategy to market outlook
2. Consider risk tolerance
3. Account for capital requirements
4. Understand payoff profiles

### Position Sizing
1. Use consistent lot sizes
2. Consider portfolio allocation
3. Manage position limits
4. Monitor margin requirements

### Risk Management
1. Set max loss limits
2. Use stop losses
3. Monitor break-even points
4. Document exit criteria

### Notes & Documentation
1. Record entry rationale
2. Track market conditions
3. Note adjustments made
4. Review past trades

---

## Keyboard Shortcuts & Tips

### Quick Navigation
- Click strategy card to switch
- Forms auto-update calculations
- Sticky payoff chart stays visible
- Scroll independently in sections

### Data Entry
- Tab through form fields
- Number inputs accept decimals
- Optional fields can be left empty
- Real-time validation feedback

### Saving Strategies
- Save button at bottom
- Strategies tied to user account
- View saved strategies in Dashboard
- Edit anytime from Strategies page

---

## Mobile Responsiveness

### Layout Adaptations
- Strategy panel collapses to dropdown
- Forms stack vertically
- Charts resize responsively
- Touch-friendly interactions

### Optimizations
- Larger touch targets
- Simplified navigation
- Condensed summaries
- Swipeable sections

---

## Future Enhancements

### Potential Features
- Strategy comparison tool
- Historical backtesting
- Greeks calculator (Delta, Gamma, Theta, Vega)
- Portfolio view
- Risk analytics
- Alerts and notifications
- Export to PDF/CSV
- Strategy templates library
- Multi-leg custom builder
- Real-time market data integration

---

## Technical Stack

- **Framework:** React 18 with TypeScript
- **Charts:** Recharts library
- **Forms:** React controlled components
- **State:** React hooks (useState)
- **Storage:** localStorage (user-specific)
- **Styling:** Tailwind CSS 4
- **Icons:** Lucide React
- **Notifications:** Sonner (toast)
- **Routing:** React Router

---

## Developer Notes

### Component Structure
```
/src/app/pages/StrategiesPage.tsx
  - Main page component
  - Strategy selection logic
  - Form rendering by type
  - Payoff calculations
  - Save functionality

/src/app/components/StrategyCard.tsx
  - Individual strategy selector
  - Hover/selected states
  - Icon display

/src/app/components/FormSection.tsx
  - Reusable form container
  - Section headers
  - Description text

/src/app/components/ProfitLossCard.tsx
  - Summary badges
  - Color-coded by type
  - Formatted numbers
```

### Adding New Strategies
1. Add to `strategyDefinitions` array
2. Add new state variables
3. Implement calculation logic in `calculatePayoff()`
4. Create form section in `renderStrategyForm()`
5. Update type definitions

### Customization
- Modify color schemes in component styles
- Adjust chart settings in Recharts config
- Update form layouts in grid systems
- Add validation rules as needed
