import { Edit2, Trash2, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from './ui/button';
import { calculateLegPnL } from '../utils/calculateLegPnL';

export interface OptionLeg {
  id: string;
  instrumentType: 'call' | 'put' | 'fut';
  position: 'buy' | 'sell';
  // For options
  strike?: string;
  premium?: string;
  exitPremium?: string;
  // For futures
  entryPrice?: string;
  exitPrice?: string;
  // Common
  quantity: string;
}

interface LegCardProps {
  leg: OptionLeg;
  index?: number;
  onEdit: (leg: OptionLeg) => void;
  onDelete: (id: string) => void;
  isReadOnly?: boolean;
}

export function LegCard({ leg, index, onEdit, onDelete, isReadOnly }: LegCardProps) {
  const getPositionColor = () => {
    return leg.position === 'buy' ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50';
  };

  const getTypeColor = () => {
    if (leg.instrumentType === 'fut') {
      return 'text-orange-700 bg-orange-50';
    }
    return leg.instrumentType === 'call' ? 'text-blue-700 bg-blue-50' : 'text-purple-700 bg-purple-50';
  };

  const isFutures = leg.instrumentType === 'fut';
  
  // Calculate P&L if exit price/premium is available
  const pnlResult = calculateLegPnL(leg);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          {/* Position and Type Badges */}
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-md text-xs font-medium uppercase ${getPositionColor()}`}>
              {leg.position}
            </span>
            <span className={`px-2.5 py-1 rounded-md text-xs font-medium uppercase ${getTypeColor()} flex items-center gap-1`}>
              {isFutures && <TrendingUp className="w-3 h-3" />}
              {leg.instrumentType}
            </span>
          </div>

          {/* Leg Details */}
          {isFutures ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 text-sm">
              <div>
                <p className="text-gray-500 text-xs mb-1">Entry Price</p>
                <p className="font-semibold text-gray-900">₹{leg.entryPrice}</p>
              </div>
              {leg.exitPrice && (
                <div>
                  <p className="text-gray-500 text-xs mb-1">Exit Price</p>
                  <p className="font-semibold text-gray-900">₹{leg.exitPrice}</p>
                </div>
              )}
              <div>
                <p className="text-gray-500 text-xs mb-1">Lot Size</p>
                <p className="font-semibold text-gray-900">{leg.quantity}</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-sm">
              <div>
                <p className="text-gray-500 text-xs mb-1">Strike Price</p>
                <p className="font-semibold text-gray-900">₹{leg.strike}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-1">Entry Premium</p>
                <p className="font-semibold text-gray-900">₹{leg.premium}</p>
              </div>
              {leg.exitPremium && (
                <div>
                  <p className="text-gray-500 text-xs mb-1">Exit Premium</p>
                  <p className="font-semibold text-blue-600">₹{leg.exitPremium}</p>
                </div>
              )}
              <div>
                <p className="text-gray-500 text-xs mb-1">Quantity</p>
                <p className="font-semibold text-gray-900">{leg.quantity}</p>
              </div>
            </div>
          )}

          {/* Realized P&L - Show only when exit price/premium is present */}
          {pnlResult && (
            <div className={`mt-3 pt-3 border-t border-gray-100 animate-in fade-in slide-in-from-top-1 duration-300`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-xs mb-1 font-medium">Realized Profit / Loss</p>
                  <div className="flex items-center gap-2">
                    <p className={`text-lg font-bold flex items-center gap-1.5 ${
                      pnlResult.isProfit ? 'text-green-600' : 
                      pnlResult.isLoss ? 'text-red-600' : 
                      'text-gray-600'
                    }`}>
                      {pnlResult.isProfit && <ArrowUp className="w-4 h-4" />}
                      {pnlResult.isLoss && <ArrowDown className="w-4 h-4" />}
                      {pnlResult.formatted}
                    </p>
                  </div>
                </div>
                <div className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                  pnlResult.isProfit ? 'bg-green-50 text-green-700' : 
                  pnlResult.isLoss ? 'bg-red-50 text-red-700' : 
                  'bg-gray-50 text-gray-700'
                }`}>
                  {pnlResult.isProfit ? 'Profit' : pnlResult.isLoss ? 'Loss' : 'Break Even'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {!isReadOnly && (
          <div className="flex items-center gap-1 ml-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(leg)}
              className="h-8 w-8 p-0 hover:bg-blue-50 transition-all duration-200 active:scale-95"
            >
              <Edit2 className="h-4 w-4 text-gray-600" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(leg.id)}
              className="h-8 w-8 p-0 hover:bg-red-50 transition-all duration-200 active:scale-95"
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}