import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, Save, TrendingUp, TrendingDown, X, ChevronRight, Edit } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { LegCard, OptionLeg } from '../components/LegCard';
import { AddLegDialog } from '../components/AddLegDialog';
import { DateInput } from '../components/DateInput';
import { FinalResultCard } from '../components/FinalResultCard';
import { calculateTotalRealizedPnL, isStrategyFullyExited } from '../utils/calculateLegPnL';
import { Sidebar } from '../components/Sidebar';
import { QuickStrategyTemplates } from '../components/QuickStrategyTemplates';
import { EmptyLegsState } from '../components/EmptyLegsState';
import { PriceControl } from '../components/PriceControl';
import { RangeSlider } from '../components/RangeSlider';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

export function StrategiesPage() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Check if we're editing a strategy
  const editingStrategy = location.state?.editingStrategy as any | undefined;
  const isEditMode = !!editingStrategy;
  
  // View state
  const [view, setView] = useState<'templates' | 'builder'>(isEditMode ? 'builder' : 'templates');
  const [showBackConfirm, setShowBackConfirm] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Core state
  const [legs, setLegs] = useState<OptionLeg[]>([]);
  const [strategyName, setStrategyName] = useState('');
  const [entryDate, setEntryDate] = useState<Date>();
  const [expiryDate, setExpiryDate] = useState<Date>();
  const [exitDate, setExitDate] = useState<Date>();
  const [underlyingPrice, setUnderlyingPrice] = useState(0);
  const [priceRange, setPriceRange] = useState(20);
  const [notes, setNotes] = useState('');
  
  // Dialog state
  const [isAddLegDialogOpen, setIsAddLegDialogOpen] = useState(false);
  const [editingLeg, setEditingLeg] = useState<OptionLeg | undefined>();

  // Load strategy data in edit mode
  useEffect(() => {
    if (editingStrategy) {
      if (editingStrategy.name) setStrategyName(editingStrategy.name);
      if (editingStrategy.legs) setLegs(editingStrategy.legs);
      if (editingStrategy.entryDate) setEntryDate(new Date(editingStrategy.entryDate));
      if (editingStrategy.expiryDate) setExpiryDate(new Date(editingStrategy.expiryDate));
      if (editingStrategy.underlyingPrice) setUnderlyingPrice(editingStrategy.underlyingPrice);
      if (editingStrategy.notes) setNotes(editingStrategy.notes);
    }
  }, [editingStrategy]);

  // Track unsaved changes
  useEffect(() => {
    if (isEditMode) {
      setHasUnsavedChanges(true);
    }
  }, [legs, strategyName, entryDate, expiryDate, notes, isEditMode]);
  
  // Date validation - only show errors if user has interacted with dates
  const dateError = entryDate && expiryDate && expiryDate <= entryDate 
    ? "Entry date must be before expiry date."
    : undefined;
  
  // Detect if we have FUT legs and sync price
  const futuresLegs = legs.filter(leg => leg.instrumentType === 'fut');
  const hasFuturesLeg = futuresLegs.length > 0;
  
  // Auto-sync underlying price with first futures entry price
  useEffect(() => {
    if (hasFuturesLeg && futuresLegs[0]?.entryPrice) {
      const futPrice = parseFloat(futuresLegs[0].entryPrice);
      if (!isNaN(futPrice) && futPrice > 0) {
        setUnderlyingPrice(futPrice);
      }
    }
  }, [hasFuturesLeg, futuresLegs]);
  
  // Calculate payoff data based on legs
  type PayoffPoint = {
  price: number;
  payoff: number;
  };

  const calculatePayoff = (): PayoffPoint[] => {
    const payoffData: PayoffPoint[] = [];
    
    // Prevent calculation if price is 0 or invalid
    if (underlyingPrice <= 0) {
      return [{price: 0, payoff: 0}];
    }
    
    const minPrice = underlyingPrice * (1 - priceRange / 100);
    const maxPrice = underlyingPrice * (1 + priceRange / 100);
    const step = (maxPrice - minPrice) / 100;

    for (let price = minPrice; price <= maxPrice; price += step) {
      let totalPayoff = 0;

      legs.forEach(leg => {
        const quantity = parseFloat(leg.quantity) || 0;
        let legPayoff = 0;

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
          // Options payoff
          const strike = parseFloat(leg.strike || '0');
          const premium = parseFloat(leg.premium || '0');
          const exitPremium = leg.exitPremium ? parseFloat(leg.exitPremium) : null;

          if (leg.instrumentType === 'call') {
            // Call option payoff
            const intrinsic = Math.max(0, price - strike);
            if (leg.position === 'buy') {
              // If exit premium exists, use it for realized P&L
              if (exitPremium !== null) {
                legPayoff = (exitPremium - premium) * quantity;
              } else {
                legPayoff = (intrinsic - premium) * quantity;
              }
            } else {
              if (exitPremium !== null) {
                legPayoff = (premium - exitPremium) * quantity;
              } else {
                legPayoff = (premium - intrinsic) * quantity;
              }
            }
          } else {
            // Put option payoff
            const intrinsic = Math.max(0, strike - price);
            if (leg.position === 'buy') {
              if (exitPremium !== null) {
                legPayoff = (exitPremium - premium) * quantity;
              } else {
                legPayoff = (intrinsic - premium) * quantity;
              }
            } else {
              if (exitPremium !== null) {
                legPayoff = (premium - exitPremium) * quantity;
              } else {
                legPayoff = (premium - intrinsic) * quantity;
              }
            }
          }
        }

        totalPayoff += legPayoff;
      });

      payoffData.push({
        price: Math.round(price),
        payoff: Math.round(totalPayoff),
      });
    }

    return payoffData;
  };

  const payoffData = calculatePayoff();
  
  // Calculate max profit and max loss
  const maxProfit = legs.length > 0 ? Math.max(...payoffData.map(d => d.payoff)) : 0;
  const maxLoss = legs.length > 0 ? Math.min(...payoffData.map(d => d.payoff)) : 0;
  
  // Check if strategy is fully exited (all legs have exit prices)
  const isFullyExited = isStrategyFullyExited(legs);
  const totalRealizedPnL = calculateTotalRealizedPnL(legs);
  
  // Calculate break-even points
  const breakEvenPoints = payoffData.filter((d, i) => {
    if (i === 0) return false;
    const prev = payoffData[i - 1];
    return (d.payoff >= 0 && prev.payoff < 0) || (d.payoff < 0 && prev.payoff >= 0);
  });

  const handleAddLeg = () => {
    setEditingLeg(undefined);
    setIsAddLegDialogOpen(true);
  };

  const handleEditLeg = (leg: OptionLeg) => {
    setEditingLeg(leg);
    setIsAddLegDialogOpen(true);
  };

  const handleSaveLeg = (leg: OptionLeg) => {
    if (editingLeg) {
      // Update existing leg
      setLegs(legs.map(l => l.id === leg.id ? leg : l));
    } else {
      // Add new leg
      setLegs([...legs, leg]);
    }
  };

  const handleDeleteLeg = (id: string) => {
    setLegs(legs.filter(leg => leg.id !== id));
  };

  const handleSaveStrategy = async () => {
  if (legs.length === 0) {
    toast.error("Please add at least one leg");
    return;
  }

  if (!entryDate || !expiryDate) {
    toast.error("Please select entry and expiry dates");
    return;
  }

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Not authenticated");
      return;
    }

    const payload = {
      name:
        strategyName.trim() ||
        `Custom Strategy ${new Date().toISOString().split("T")[0]}`,
      strategy_type: editingStrategy?.strategy_type ?? "custom",
      entry_date: entryDate.toISOString().split("T")[0],
      expiry_date: expiryDate.toISOString().split("T")[0],
      parameters: {
        maxProfit,
        maxLoss,
        underlyingPrice,
        priceRange,
      },
      custom_legs: legs.map(({ id, ...rest }) => rest),
      notes,
    };
    const API_BASE = import.meta.env.VITE_API_BASE_URL;
    const res = await fetch(
      `${API_BASE}/api/strategies`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err);
    }

    toast.success("Strategy saved successfully");
    navigate("/dashboard");
  } catch (err) {
    console.error(err);
    toast.error("Failed to save strategy");
  }
};

  const handleLoadTemplate = (templateLegs: Omit<OptionLeg, 'id'>[]) => {
    const legsWithIds = templateLegs.map(leg => ({
      ...leg,
      id: Math.random().toString(36).substring(7),
    }));
    setLegs(legsWithIds);
    setView('builder');
    toast.success('Template loaded successfully!');
  };

  const handleBack = () => {
    if (legs.length > 0) {
      setShowBackConfirm(true);
    } else {
      setView('templates');
    }
  };

  const handleConfirmBack = () => {
    if (isEditMode) {
      navigate('/dashboard');
    } else {
      setLegs([]);
      setStrategyName('');
      setEntryDate(undefined);
      setExpiryDate(undefined);
      setNotes('');
      setView('templates');
    }
    setShowBackConfirm(false);
    setHasUnsavedChanges(false);
  };

  const handleStartFromScratch = () => {
    setView('builder');
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setShowBackConfirm(true);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 overflow-y-auto pt-16 lg:pt-0">
        <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">
          {/* Page Header with Back Button */}
          {view === 'builder' ? (
            <div className="mb-6 sm:mb-8">
              {/* Edit Mode Badge */}
              {isEditMode && (
                <div className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-lg">
                  <Edit className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">Edit Mode</span>
                </div>
              )}

              {/* Back Button */}
              <Button
                variant="ghost"
                onClick={isEditMode ? handleCancel : handleBack}
                className="mb-4 -ml-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-all duration-200 active:scale-98"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">
                  {isEditMode ? 'Back to Dashboard' : 'Back to Templates'}
                </span>
                <span className="sm:hidden">Back</span>
              </Button>

              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-3">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="hover:text-gray-900 transition-colors active:scale-98"
                >
                  {isEditMode ? 'Saved Strategies' : 'Strategies'}
                </button>
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-gray-900 font-medium">
                  {isEditMode ? 'Edit Strategy' : 'Strategy Builder'}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
                {isEditMode ? 'Edit Strategy' : 'Strategy Builder'}
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                {isEditMode 
                  ? 'Update and save changes to your strategy'
                  : 'Configure and visualize your options trading strategies with real-time payoff analysis'
                }
              </p>
            </div>
          ) : (
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">Strategy Builder</h1>
              <p className="text-sm sm:text-base text-gray-600">
                Choose a template below to get started, or build from scratch
              </p>
            </div>
          )}

          {/* Quick Start Templates View */}
          {view === 'templates' && (
            <>
              <QuickStrategyTemplates onLoadTemplate={handleLoadTemplate} />
              
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500 mb-3">Or start building from scratch</p>
                <Button
                  onClick={handleStartFromScratch}
                  variant="outline"
                  className="border-gray-300 hover:bg-gray-50"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Build Custom Strategy
                </Button>
              </div>
            </>
          )}

          {/* Strategy Builder View */}
          {view === 'builder' && (
            <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Left Column - Strategy Content */}
              <div className="space-y-4 sm:space-y-6">
                {/* Strategy Parameters */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-5">Strategy Parameters</h2>
                  
                  {/* Strategy Name */}
                  <div className="mb-5">
                    <Label htmlFor="strategy-name" className="text-sm font-medium text-gray-700 mb-2 block">
                      Strategy Name
                    </Label>
                    <input
                      id="strategy-name"
                      type="text"
                      value={strategyName}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= 40) {
                          setStrategyName(value);
                        }
                      }}
                      placeholder="Enter strategy name (optional)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      maxLength={40}
                    />
                    <p className="text-xs text-gray-500 mt-1.5">
                      {strategyName.length === 0 
                        ? "If left blank, we auto-generate a name." 
                        : `${strategyName.length}/40 characters`
                      }
                    </p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-5">
                    <DateInput
                      id="entry-date"
                      label="Entry Date"
                      value={entryDate}
                      onChange={setEntryDate}
                      placeholder="Select entry date"
                      maxDate={expiryDate || undefined}
                      isOptional
                    />

                    <DateInput
                      id="expiry-date"
                      label="Expiry Date"
                      value={expiryDate}
                      onChange={setExpiryDate}
                      placeholder="Select expiry date"
                      minDate={entryDate || undefined}
                      error={dateError}
                      isOptional
                    />
                  </div>
                </div>

                {/* Add Legs Section */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-semibold text-gray-900">Option Legs</h2>
                    <Button
                      onClick={handleAddLeg}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add New Leg
                    </Button>
                  </div>

                  {legs.length === 0 ? (
                    <EmptyLegsState />
                  ) : (
                    <div className="space-y-3">
                      {legs.map(leg => (
                        <LegCard
                          key={leg.id}
                          leg={leg}
                          onEdit={handleEditLeg}
                          onDelete={handleDeleteLeg}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Profit / Loss Summary - Conditional based on exit status */}
                {legs.length > 0 && (
                  <>
                    {/* Show Final Result if strategy is fully exited */}
                    {isFullyExited && totalRealizedPnL !== null ? (
                      <FinalResultCard finalPnL={totalRealizedPnL} />
                    ) : (
                      /* Show Max Profit/Loss for active strategies */
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 p-6">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                              <TrendingUp className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="text-sm text-green-700 font-medium">Max Profit</p>
                              <p className="text-2xl font-semibold text-green-900">
                                {maxProfit >= 0 ? '+' : ''}₹{maxProfit.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200 p-6">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                              <TrendingDown className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="text-sm text-red-700 font-medium">Max Loss</p>
                              <p className="text-2xl font-semibold text-red-900">
                                ₹{maxLoss.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Notes Section */}
                <div className="bg-white rounded-xl shadow-sm border p-6">
                  <Label htmlFor="notes" className="text-base font-semibold text-gray-900 mb-3 block">
                    Notes
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Add notes about this strategy..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[100px] rounded-lg"
                  />
                </div>

                {/* Save Button */}
                <div className="flex justify-end gap-3">
                  {isEditMode && (
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      size="lg"
                      className="px-8"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  )}
                  <Button
                    onClick={handleSaveStrategy}
                    disabled={legs.length === 0 || !!dateError}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-8"
                    size="lg"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isEditMode ? 'Save Changes' : 'Save Strategy'}
                  </Button>
                </div>
              </div>

              {/* Right Column - Payoff Diagram */}
              <div>
                <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-8">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Payoff Diagram</h3>
                    <p className="text-sm text-gray-500">
                      Adjust controls to visualize different scenarios
                    </p>
                  </div>

                  {/* Break-even Badge */}
                  {breakEvenPoints.length > 0 && (
                    <div className="mb-4 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs text-blue-700 font-medium">Break-even</p>
                      <p className="text-sm font-semibold text-blue-900">
                        ₹{breakEvenPoints[0].price.toLocaleString()}
                      </p>
                    </div>
                  )}

                  {/* Controls */}
                  <div className="space-y-5 mb-6">
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

                    <RangeSlider
                      label="Price Range"
                      value={priceRange}
                      onChange={setPriceRange}
                    />
                  </div>

                  {/* Chart */}
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={payoffData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis
                            dataKey="price"
                            stroke="#6b7280"
                            fontSize={11}
                            tickFormatter={(value) => `₹${value}`}
                          />
                          <YAxis
                            stroke="#6b7280"
                            fontSize={11}
                            tickFormatter={(value) => `₹${value}`}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              fontSize: '12px',
                            }}
                            formatter={(value: number) => [`₹${value.toLocaleString()}`, 'P/L']}
                            labelFormatter={(label) => `Price: ₹${label}`}
                          />
                          <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="3 3" />
                          <ReferenceLine 
                            x={underlyingPrice} 
                            stroke="#3b82f6" 
                            strokeDasharray="3 3"
                            label={{ value: 'Current', position: 'top', fill: '#3b82f6', fontSize: 11 }}
                          />
                          <Line
                            type="monotone"
                            dataKey="payoff"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Leg Dialog */}
      <AddLegDialog
        open={isAddLegDialogOpen}
        onOpenChange={setIsAddLegDialogOpen}
        onSave={handleSaveLeg}
        editingLeg={editingLeg}
      />

      {/* Back Confirmation Dialog */}
      <AlertDialog open={showBackConfirm} onOpenChange={setShowBackConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard {isEditMode ? 'Unsaved Changes' : 'Changes'}?</AlertDialogTitle>
            <AlertDialogDescription>
              {isEditMode 
                ? 'Are you sure you want to discard your unsaved changes? All modifications will be lost.'
                : 'Are you sure you want to discard the changes and go back to templates?'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmBack}>
              {isEditMode ? 'Discard' : 'Go Back'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}