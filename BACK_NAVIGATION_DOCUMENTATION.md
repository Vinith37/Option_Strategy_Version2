# Back Navigation Pattern - Complete Guide

## 🎯 Overview

The Strategy Builder now features a **complete back navigation system** that allows users to seamlessly navigate between the Quick Start Templates view and the Strategy Builder view, with smart unsaved changes protection.

---

## 🆕 What's New

### Two-View System

The application now has **two distinct views**:

1. **Templates View** — Quick Start Templates grid + "Build Custom Strategy" button
2. **Builder View** — Full strategy builder with forms, legs, and payoff diagram

---

## 🎨 Visual Components

### 1. Back Button (Builder View Only)

**Desktop:**
```
┌────────────────────────────────────┐
│  ← Back to Templates               │
└────────────────────────────────────┘
```

**Mobile:**
```
┌──────────────┐
│  ← Back      │
└──────────────┘
```

**Design:**
- Variant: Ghost button (subtle, not heavy)
- Icon: ArrowLeft from lucide-react
- Text: "Back to Templates" (hidden on small screens)
- Position: Top-left, above page header
- Margin: `-ml-2` to align with content
- Colors: `text-gray-600 hover:text-gray-900 hover:bg-gray-100`

**Implementation:**
```tsx
<Button
  variant="ghost"
  onClick={handleBack}
  className="mb-4 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
>
  <ArrowLeft className="w-4 h-4 mr-2" />
  <span className="hidden sm:inline">Back to Templates</span>
  <span className="sm:hidden">Back</span>
</Button>
```

---

### 2. Breadcrumb Navigation

**Visual:**
```
Strategies  >  Strategy Builder
```

**Design:**
- Text size: `text-sm`
- Default color: `text-gray-500`
- Active/current: `text-gray-900 font-medium`
- Separator: ChevronRight icon (`w-4 h-4`)
- Interactive: "Strategies" is clickable with hover effect

**Implementation:**
```tsx
<div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
  <button
    onClick={handleBack}
    className="hover:text-gray-900 transition-colors"
  >
    Strategies
  </button>
  <ChevronRight className="w-4 h-4" />
  <span className="text-gray-900 font-medium">Strategy Builder</span>
</div>
```

**Benefits:**
- Shows user location in navigation hierarchy
- Provides alternative click target for back action
- Professional fintech UI pattern

---

## 🔄 User Flow

### Flow 1: Template Selection → Builder

1. User lands on **Templates View**
2. Sees Quick Start Templates grid
3. Clicks a template (e.g., "Covered Call")
4. ✅ Switches to **Builder View** with legs pre-populated
5. Back button appears at top
6. Toast: "Template loaded successfully!"

---

### Flow 2: Build from Scratch → Builder

1. User lands on **Templates View**
2. Scrolls down past templates
3. Clicks "Build Custom Strategy" button
4. ✅ Switches to **Builder View** with empty state
5. Back button appears at top
6. User starts adding legs manually

---

### Flow 3: Back Without Changes (Clean Exit)

1. User is in **Builder View** with **0 legs**
2. Clicks "Back to Templates" button
3. ✅ Immediately returns to **Templates View**
4. No confirmation dialog (nothing to lose)

---

### Flow 4: Back With Changes (Confirmation Required)

1. User is in **Builder View** with **1+ legs**
2. Clicks "Back to Templates" button
3. ⚠️ **Confirmation dialog appears**:

```
┌─────────────────────────────────────┐
│  Discard Changes?                   │
│                                     │
│  Are you sure you want to discard   │
│  the changes and go back to         │
│  templates?                         │
│                                     │
│  [Cancel]        [← Go Back]        │
└─────────────────────────────────────┘
```

4. User can:
   - Click **"Cancel"** → Stay in builder
   - Click **"Go Back"** → Clear all data and return to templates

---

## 🎨 UI States

### Templates View Header

```tsx
<div className="mb-8">
  <h1 className="text-3xl font-semibold text-gray-900 mb-2">
    Strategy Builder
  </h1>
  <p className="text-gray-600">
    Choose a template below to get started, or build from scratch
  </p>
</div>
```

**Content:**
- Quick Start Templates grid (3 columns on desktop)
- "Or start building from scratch" message
- "Build Custom Strategy" button

---

### Builder View Header

```tsx
<div className="mb-8">
  {/* Back Button */}
  <Button variant="ghost" onClick={handleBack} ...>
    <ArrowLeft /> Back to Templates
  </Button>

  {/* Breadcrumb */}
  <div className="flex items-center gap-2 ...">
    Strategies > Strategy Builder
  </div>

  {/* Title */}
  <h1>Strategy Builder</h1>
  <p>Configure and visualize your options trading strategies...</p>
</div>
```

**Content:**
- Back button (sticky at top)
- Breadcrumb navigation
- Strategy builder form (parameters, legs, notes)
- Payoff diagram (right column)

---

## 🛡️ Data Protection

### Confirmation Dialog

**When Shown:**
- User clicks back button
- `legs.length > 0` (has unsaved work)

**When Skipped:**
- `legs.length === 0` (nothing to lose)

**What Gets Cleared:**
```typescript
const handleConfirmBack = () => {
  setLegs([]);              // Clear all legs
  setEntryDate(undefined);  // Reset entry date
  setExpiryDate(undefined); // Reset expiry date
  setNotes('');             // Clear notes
  setView('templates');     // Switch view
  setShowBackConfirm(false); // Close dialog
};
```

**Implementation:**
```tsx
<AlertDialog open={showBackConfirm} onOpenChange={setShowBackConfirm}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Discard Changes?</AlertDialogTitle>
      <AlertDialogDescription>
        Are you sure you want to discard the changes and go back to templates?
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleConfirmBack}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Go Back
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

## 📱 Responsive Behavior

### Desktop (≥ 640px)

**Back Button:**
```
← Back to Templates
```
- Full text visible
- Left-aligned above header

**Breadcrumb:**
```
Strategies  >  Strategy Builder
```
- Fully visible
- Below back button

---

### Mobile (< 640px)

**Back Button:**
```
← Back
```
- Shortened text (via `hidden sm:inline`)
- Icon remains visible
- More compact layout

**Breadcrumb:**
```
Strategies  >  Strategy Builder
```
- Still visible (important for orientation)
- Text wraps if needed

---

## 🔧 Technical Implementation

### State Management

```typescript
// View state
const [view, setView] = useState<'templates' | 'builder'>('templates');
const [showBackConfirm, setShowBackConfirm] = useState(false);
```

**Initial State:**
- `view: 'templates'` — Start on templates screen
- `showBackConfirm: false` — Dialog closed by default

---

### Navigation Functions

#### 1. Load Template

```typescript
const handleLoadTemplate = (templateLegs: Omit<OptionLeg, 'id'>[]) => {
  const legsWithIds = templateLegs.map(leg => ({
    ...leg,
    id: Math.random().toString(36).substring(7),
  }));
  setLegs(legsWithIds);
  setView('builder');  // ← Switch to builder
  toast.success('Template loaded successfully!');
};
```

---

#### 2. Start from Scratch

```typescript
const handleStartFromScratch = () => {
  setView('builder');  // ← Switch to builder (empty state)
};
```

---

#### 3. Back Navigation (Smart)

```typescript
const handleBack = () => {
  if (legs.length > 0) {
    setShowBackConfirm(true);  // ← Show confirmation
  } else {
    setView('templates');      // ← Direct return
  }
};
```

**Logic:**
- Has legs? → Show confirmation dialog
- No legs? → Immediately switch to templates

---

#### 4. Confirm Back (Clear Data)

```typescript
const handleConfirmBack = () => {
  setLegs([]);
  setEntryDate(undefined);
  setExpiryDate(undefined);
  setNotes('');
  setView('templates');
  setShowBackConfirm(false);
};
```

**Complete Reset:**
- Clears all form data
- Returns to templates view
- Closes confirmation dialog

---

## 🎯 Design Principles

### 1. **Progressive Disclosure**
- Show back button only when in builder view
- Don't clutter templates view with unnecessary navigation

### 2. **Predictable Behavior**
- Back button always returns to templates
- Breadcrumb mirrors back button action
- Multiple ways to trigger same action (accessibility)

### 3. **Data Protection**
- Warn before discarding work
- Skip confirmation when safe
- Clear messaging in dialog

### 4. **Responsive First**
- Text adapts to screen size
- Icon remains visible on mobile
- Touch-friendly button sizes

### 5. **Visual Hierarchy**
- Back button is subtle (ghost variant)
- Doesn't compete with page title
- Breadcrumb provides context without noise

---

## 📋 Component Structure

```
StrategiesPage
├── Sidebar
└── Main Content
    ├── Templates View
    │   ├── Header (simple)
    │   ├── QuickStrategyTemplates
    │   └── "Build Custom Strategy" button
    │
    └── Builder View
        ├── Header with Back Button
        │   ├── Back Button
        │   ├── Breadcrumb
        │   └── Title/Description
        │
        ├── Strategy Builder Form
        │   ├── Parameters
        │   ├── Option Legs
        │   ├── P/L Summary
        │   └── Notes
        │
        └── Payoff Diagram (sticky)

Dialogs (Rendered at Root)
├── AddLegDialog
└── Back Confirmation AlertDialog
```

---

## 🎨 Styling Reference

### Back Button

```css
/* Base */
variant="ghost"
className="mb-4 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100"

/* Icon */
<ArrowLeft className="w-4 h-4 mr-2" />

/* Responsive Text */
<span className="hidden sm:inline">Back to Templates</span>
<span className="sm:hidden">Back</span>
```

---

### Breadcrumb

```css
/* Container */
className="flex items-center gap-2 text-sm text-gray-500 mb-3"

/* Link */
className="hover:text-gray-900 transition-colors"

/* Separator */
<ChevronRight className="w-4 h-4" />

/* Current */
className="text-gray-900 font-medium"
```

---

### Confirmation Dialog

```tsx
<AlertDialog open={showBackConfirm} onOpenChange={setShowBackConfirm}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Discard Changes?</AlertDialogTitle>
      <AlertDialogDescription>
        Are you sure you want to discard the changes...
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleConfirmBack}>
        <ArrowLeft /> Go Back
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

## ✅ Benefits Summary

1. **Clear Navigation** — Users always know how to return to templates
2. **Data Safety** — Confirmation prevents accidental data loss
3. **Flexible Entry** — Can start from template OR from scratch
4. **Professional UX** — Follows fintech app patterns (breadcrumb + back button)
5. **Mobile-Friendly** — Responsive text and touch targets
6. **Accessible** — Multiple ways to trigger navigation (button, breadcrumb)
7. **Visual Consistency** — Matches existing button and dialog styles

---

## 🚀 User Experience Flow Chart

```
┌─────────────────────┐
│  Templates View     │
│  (Landing Page)     │
└──────┬──────────────┘
       │
       ├─────────────────────┐
       │                     │
       v                     v
┌──────────────┐      ┌──────────────────┐
│ Click        │      │ Click "Build     │
│ Template     │      │ Custom Strategy" │
└──────┬───────┘      └────────┬─────────┘
       │                       │
       └───────┬───────────────┘
               │
               v
       ┌───────────────┐
       │ Builder View  │
       │ (Full Form)   │
       └───────┬───────┘
               │
               │ Click Back Button
               v
       ┌───────────────────┐
       │ Has Legs?         │
       └───────┬───────────┘
               │
       ├───────┴───────┐
       │               │
       v               v
   ┌───────┐      ┌──────────────┐
   │ No    │      │ Yes          │
   │ Legs  │      │ Show Confirm │
   └───┬───┘      └──────┬───────┘
       │                 │
       │          ┌──────┴──────┐
       │          │             │
       │          v             v
       │    ┌──────────┐  ┌─────────┐
       │    │ Cancel   │  │ Go Back │
       │    └────┬─────┘  └────┬────┘
       │         │             │
       │         v             v
       │    ┌──────────┐  ┌──────────┐
       │    │ Stay in  │  │ Clear +  │
       │    │ Builder  │  │ Return   │
       │    └──────────┘  └────┬─────┘
       │                       │
       └───────────────────────┘
               │
               v
       ┌───────────────┐
       │ Templates     │
       │ View          │
       └───────────────┘
```

---

## 🎯 Summary

The Strategy Builder now features:

✅ **Two-view system** (Templates ↔ Builder)  
✅ **Smart back button** (visible only in builder)  
✅ **Breadcrumb navigation** (Strategies > Strategy Builder)  
✅ **Data protection** (confirmation when work exists)  
✅ **Mobile responsive** (shortened text on small screens)  
✅ **Multiple entry points** (templates OR custom)  
✅ **Clean exit paths** (skip confirmation when safe)  

**Result:** A professional, intuitive navigation pattern that prevents data loss while maintaining a clean, uncluttered interface! 🎉
