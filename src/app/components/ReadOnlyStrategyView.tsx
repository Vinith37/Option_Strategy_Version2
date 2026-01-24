import { useState } from 'react';
import { Dialog, DialogContent } from './ui/dialog';
import { LegCard, OptionLeg } from './LegCard';
import { Lock, X } from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { DateInput } from './DateInput';
import { FinalResultCard } from './FinalResultCard';
import { calculateTotalRealizedPnL, isStrategyFullyExited } from '../utils/calculateLegPnL';
import { Strategy } from '../types/strategy';
import { getHistoricalPnL } from '../utils/createHistoricalSnapshot';
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

interface ReadOnlyStrategyViewProps {
  strategy: Strategy;
  onClose: () => void;
}

export function ReadOnlyStrategyView({ strategy, onClose }: ReadOnlyStrategyViewProps) {
  const [underlyingPrice, setUnderlyingPrice] = useState(strategy.underlyingPrice || 0);
  const [priceRange, setPriceRange] = useState(20);

  // Calculate payoff data based on legs
  const calculatePayoff = () => {
    const payoffData = [];
    
    if (underlyingPrice <= 0 || !strategy.legs || strategy.legs.length === 0) {
      return [{price: 0, payoff: 0}];
    }
    
    const minPrice = underlyingPrice * (1 - priceRange / 100);
    const maxPrice = underlyingPrice * (1 + priceRange / 100);
    const step = (maxPrice - minPrice) / 100;

    for (let price = minPrice; price <= maxPrice; price += step) {
      let totalPayoff = 0;

      strategy.legs.forEach(leg => {
        const quantity = parseFloat(leg.quantity) || 0;
        let legPayoff = 0;

        if (leg.instrumentType === 'fut') {
          const entryPrice = parseFloat(leg.entryPrice || '0');
          const exitPrice = leg.exitPrice ? parseFloat(leg.exitPrice) : price;
          
          if (leg.position === 'buy') {
            legPayoff = (exitPrice - entryPrice) * quantity;
          } else {
            legPayoff = (entryPrice - exitPrice) * quantity;
          }
        } else {
          const strike = parseFloat(leg.strike || '0');
          const premium = parseFloat(leg.premium || '0');
          const exitPremium = leg.exitPremium ? parseFloat(leg.exitPremium) : null;

          if (leg.instrumentType === 'call') {
            const intrinsic = Math.max(0, price - strike);
            if (leg.position === 'buy') {
              // If exit premium exists, use it for realized P&L, otherwise use theoretical
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
  const isProfit = (strategy.actualProfit || 0) > 0;

  // CRITICAL: Use historical snapshot for P&L if available
  // This prevents recalculation and ensures data integrity
  const finalPnL = getHistoricalPnL(strategy.historicalSnapshot, strategy.actualProfit);
  
  // Check if strategy is fully exited (for UI purposes)
  const isFullyExited = strategy.legs ? isStrategyFullyExited(strategy.legs) : false;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="space-y-6 py-4">
        {/* Read-Only Banner */}
        <div className="flex items-center gap-2 p-3 bg-gray-100 border border-gray-300 rounded-lg">
          <Lock className="w-4 h-4 text-gray-600" />
          <p className="text-sm text-gray-700 font-medium">
            Read-only — This trade has already been completed and cannot be edited.
          </p>
        </div>

        {/* Final Result Banner */}
        <FinalResultCard finalPnL={finalPnL} />

        {/* Strategy Type */}
        <div className="p-4 bg-gray-50 rounded-lg border">
          <p className="text-sm text-gray-600 mb-1">Strategy Type</p>
          <p className="font-semibold text-gray-900">{strategy.type}</p>
        </div>

        {/* Entry/Exit Dates */}
        <div className="grid grid-cols-2 gap-4">
          <DateInput 
            id="entry-date-readonly"
            label="Entry Date"
            value={strategy.entryDate ? new Date(strategy.entryDate) : undefined}
            onChange={() => {}}
            disabled={true}
            disabledTooltip="Dates cannot be edited for completed trades"
          />
          <DateInput 
            id="exit-date-readonly"
            label="Exit Date"
            value={strategy.exitDate ? new Date(strategy.exitDate) : undefined}
            onChange={() => {}}
            disabled={true}
            disabledTooltip="Dates cannot be edited for completed trades"
          />
        </div>

        {/* Expiry Date */}
        {strategy.expiryDate && (
          <DateInput 
            id="expiry-date-readonly"
            label="Expiry Date"
            value={new Date(strategy.expiryDate)}
            onChange={() => {}}
            disabled={true}
            disabledTooltip="Dates cannot be edited for completed trades"
          />
        )}

        {/* Underlying Price */}
        {strategy.underlyingPrice && (
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-sm text-amber-700 mb-1">Underlying Price at Entry</p>
            <p className="text-2xl font-semibold text-amber-900">₹{strategy.underlyingPrice.toLocaleString()}</p>
          </div>
        )}

        {/* Max Profit/Loss Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg border">
            <p className="text-sm text-gray-600 mb-1">Max Potential Profit</p>
            <p className="text-xl font-semibold text-green-600">+₹{strategy.maxProfit.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border">
            <p className="text-sm text-gray-600 mb-1">Max Potential Loss</p>
            <p className="text-xl font-semibold text-red-600">₹{Math.abs(strategy.maxLoss).toLocaleString()}</p>
          </div>
        </div>

        {/* Trade Legs Section */}
        {strategy.legs && strategy.legs.length > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">Trade Legs</p>
                <p className="text-sm text-gray-600 mt-0.5">Position details and pricing</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Lock className="w-4 h-4" />
                <span>Locked</span>
              </div>
            </div>
            <div className="space-y-3 p-4 bg-gray-50">
              {strategy.legs.map((leg, index) => (
                <div key={leg.id} className="relative opacity-90 pointer-events-none">
                  <LegCard
                    leg={leg}
                    index={index}
                    onEdit={() => {}}
                    onDelete={() => {}}
                    isReadOnly={true}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payoff Diagram */}
        {payoffData.length > 1 && (
          <div className="border rounded-lg overflow-hidden">
            <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">Payoff Diagram</p>
                <p className="text-sm text-gray-600 mt-0.5">Historical profit/loss visualization</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Lock className="w-4 h-4" />
                <span>View only</span>
              </div>
            </div>
            
            <div className="p-6 bg-white">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={payoffData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="price" 
                      stroke="#6b7280"
                      tickFormatter={(value) => `₹${value.toLocaleString()}`}
                    />
                    <YAxis 
                      stroke="#6b7280"
                      tickFormatter={(value) => `₹${value.toLocaleString()}`}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`₹${value.toLocaleString()}`, 'P&L']}
                      labelFormatter={(label) => `Price: ₹${label.toLocaleString()}`}
                    />
                    <ReferenceLine y={0} stroke="#000" strokeWidth={2} />
                    <ReferenceLine 
                      x={underlyingPrice} 
                      stroke="#3b82f6" 
                      strokeDasharray="3 3"
                      label={{ value: 'Entry', position: 'top', fill: '#3b82f6' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="payoff" 
                      stroke="#8b5cf6" 
                      strokeWidth={3}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              {/* Disabled Range Control */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-between mb-2 opacity-50">
                  <Label className="text-gray-600">Price Range</Label>
                  <span className="text-sm text-gray-500">±{priceRange}%</span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min="10"
                    max="50"
                    value={priceRange}
                    disabled
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-not-allowed opacity-50"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Completed trades cannot be adjusted
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {strategy.notes && (
          <div className="space-y-2">
            <Label className="text-gray-600">Trade Notes</Label>
            <div className="relative">
              <Textarea
                value={strategy.notes}
                disabled
                className="min-h-[120px] bg-gray-50 cursor-not-allowed"
              />
            </div>
          </div>
        )}

        {/* Close Button */}
        <div className="flex justify-center pt-4">
          <Button onClick={onClose} variant="outline" className="px-8">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}