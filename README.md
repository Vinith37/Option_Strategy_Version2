# Options Strategy Builder - Full Platform

A comprehensive options trading platform with authentication, strategy builder, and user dashboard.

## Features

### 🔐 Authentication System
- **Login Page** - Email/password authentication with validation
- **Sign-Up Page** - Full registration with terms acceptance
- **Demo Account** - Quick access with demo@example.com / demo123
- **Protected Routes** - Secure access to authenticated pages
- **User Context** - Centralized state management with React Context

### 📊 Dashboard
- **Welcome Header** - Personalized greeting with user avatar
- **Analytics Cards** - Track your performance metrics:
  - Total Strategies
  - Winning Trades (with win rate %)
  - Losing Trades
  - Last Activity
- **Saved Strategies** - Quick overview of all strategies with:
  - Strategy name and type
  - Max profit/loss display
  - Last updated date
  - Quick edit and delete actions
- **Trade History** - View recent trading activity with profit/loss tracking
- **Trading Notes** - Personal workspace for observations and insights
- **Empty States** - Helpful guidance when starting out

### 🎯 Strategy Builder (Strategies Page)
Full integration of the Options Strategy Builder UI with:

**Left Panel - Strategy Types**
- **7 Available Strategies:**
  - Covered Call - Income strategy with long futures + short call
  - Bull Call Spread - Bullish spread with limited risk/reward
  - Iron Condor - Neutral range-bound strategy
  - Long Straddle - High volatility play
  - Protective Put - Downside protection strategy
  - Butterfly Spread - Precise neutral strategy
  - Custom Strategy - Build your own

**Strategy Selection Cards:**
- Icon representation
- Strategy name and description
- Hover and selected states
- Blue gradient highlight when selected

**Right Panel - Strategy Builder**
- **Strategy Name Input** - Customizable naming
- **Summary Cards** - Real-time calculations:
  - Max Profit (green badge)
  - Max Loss (red badge)
  - Break Even (orange badge)

**Dynamic Form Sections** (varies by strategy):
- **Entry Details:**
  - Futures Entry Price
  - Lot Size
  - Strike Prices
- **Option Legs:**
  - Call/Put Strike Prices
  - Premium Paid/Received
  - Multiple legs for complex strategies
- **Exit Conditions (Optional):**
  - Exit Futures Price
  - Exit Call/Put Price
- **Notes:**
  - Strategy notes and observations
  - Risk management rules

**Payoff Diagram:**
- Interactive recharts visualization
- Real-time updates as inputs change
- Price range on X-axis
- Profit/Loss on Y-axis
- Zero reference line
- Sticky positioning (stays visible while scrolling)

**Save Functionality:**
- Save to localStorage
- User-specific storage
- Toast notifications
- View saved strategies in Dashboard

### 📚 Learning Center
- Educational resource cards:
  - Options Trading Basics
  - Strategy Tutorials
  - Risk Management
  - Market Analysis
- Clean card-based layout with icons

### ⚙️ Settings
- **Profile Settings** - Edit name and email
- **Notifications** - Configure preferences
- **Security** - Password and authentication
- **Billing** - Subscription management
- Card-based interface for easy navigation

### 🎨 Design System

**Visual Style**
- Clean fintech aesthetic
- Soft white cards with subtle shadows
- Rounded corners (rounded-xl, rounded-lg)
- Plenty of white space
- Clear typography hierarchy

**Color Palette**
- Primary: Blue (#3b82f6) to Purple (#9333ea) gradients
- Success: Green (#10b981)
- Warning: Orange (#f59e0b)
- Error: Red (#ef4444)
- Neutral: Gray scale

**Components**
- Gradient buttons (primary actions)
- Outlined buttons (secondary actions)
- Icon badges with colored backgrounds
- Hover effects and transitions
- Responsive grid layouts

**Icons**
- Lucide React icon library
- Color-coded backgrounds (blue, purple, green, orange, yellow)
- Consistent sizing (w-4 h-4, w-5 h-5)

### 🔄 State Management
- **React Context** for authentication
- **localStorage** for data persistence
- **User-specific data** - Each user sees only their strategies
- **Sample data** - Auto-populated for demo purposes

### 📱 Responsive Design
- Mobile-first approach
- Grid layouts with breakpoints
- Flexible sidebar navigation
- Optimized for desktop and mobile

## File Structure

```
/src/app
├── App.tsx                           # Main app with routing
├── contexts/
│   └── AuthContext.tsx              # Authentication context
├── pages/
│   ├── LoginPage.tsx                # Login screen
│   ├── SignupPage.tsx               # Registration screen
│   ├── DashboardPage.tsx            # Main dashboard
│   ├── StrategiesPage.tsx           # Strategy builder (7 strategies)
│   ├── LearnPage.tsx                # Learning resources
│   └── SettingsPage.tsx             # User settings
└── components/
    ├── Sidebar.tsx                  # Navigation sidebar
    ├── StrategyCard.tsx             # Strategy selection card
    ├── FormSection.tsx              # Reusable form container
    ├── ProfitLossCard.tsx           # Summary badge component
    ├── StrategyParameters.tsx       # Legacy parameters form
    ├── PayoffDiagram.tsx           # Legacy interactive chart
    └── ui/                         # Shadcn UI components
        ├── button.tsx
        ├── input.tsx
        ├── label.tsx
        ├── textarea.tsx
        ├── checkbox.tsx
        ├── slider.tsx
        └── sonner.tsx              # Toast notifications
```

## Routes

- `/login` - Login page
- `/signup` - Sign-up page
- `/dashboard` - User dashboard (protected)
- `/strategies` - Strategy builder (protected)
- `/learn` - Learning center (protected)
- `/settings` - Settings page (protected)

## Key Technologies

- **React 18** - UI framework
- **TypeScript** - Type safety
- **React Router** - Navigation
- **Recharts** - Chart visualization
- **Lucide React** - Icon library
- **Tailwind CSS 4** - Styling
- **Radix UI** - Accessible components

## Getting Started

1. Login with demo credentials:
   - Email: demo@example.com
   - Password: demo123

2. Or create a new account to get started

3. Explore the dashboard to see your strategies

4. Go to Strategies page to build and manage options strategies

5. Save strategies and they'll appear in your dashboard

## Data Persistence

All user data is stored in localStorage:
- `users` - User accounts
- `strategies_{userId}` - User's strategies
- `trades_{userId}` - Trade history
- `notes_{userId}` - Personal notes
- `user` - Current session

## Design Principles

1. **Clean & Professional** - Fintech-grade interface
2. **User-Focused** - Intuitive workflows
3. **Consistent** - Reusable components and patterns
4. **Responsive** - Works on all devices
5. **Accessible** - Built with Radix UI primitives
6. **Performance** - Optimized rendering
7. **Organized** - Clear file structure and naming

## Future Enhancements

- Real-time data integration
- Advanced strategy analytics
- Strategy comparison tools
- Portfolio tracking
- Alerts and notifications
- Export/import strategies
- Collaboration features
- Backend integration with Supabase (optional)