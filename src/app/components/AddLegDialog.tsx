import { useState, useEffect } from 'react';
import { OptionLeg } from './LegCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';
import { calculateLegPnL } from '../utils/calculateLegPnL';

interface AddLegDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (leg: OptionLeg) => void;
  editingLeg?: OptionLeg;
}

export function AddLegDialog({ open, onOpenChange, onSave, editingLeg }: AddLegDialogProps) {
  const [instrumentType, setInstrumentType] = useState<'call' | 'put' | 'fut'>('call');
  const [position, setPosition] = useState<'buy' | 'sell'>('buy');
  
  // Option fields
  const [strike, setStrike] = useState('');
  const [premium, setPremium] = useState('');
  const [exitPremium, setExitPremium] = useState('');
  
  // Futures fields
  const [entryPrice, setEntryPrice] = useState('');
  const [exitPrice, setExitPrice] = useState('');
  
  // Common
  const [quantity, setQuantity] = useState('');

  useEffect(() => {
    if (editingLeg) {
      setInstrumentType(editingLeg.instrumentType);
      setPosition(editingLeg.position);
      setStrike(editingLeg.strike || '');
      setPremium(editingLeg.premium || '');
      setExitPremium(editingLeg.exitPremium || '');
      setEntryPrice(editingLeg.entryPrice || '');
      setExitPrice(editingLeg.exitPrice || '');
      setQuantity(editingLeg.quantity);
    } else {
      // Reset form when opening for new leg
      setInstrumentType('call');
      setPosition('buy');
      setStrike('');
      setPremium('');
      setExitPremium('');
      setEntryPrice('');
      setExitPrice('');
      setQuantity('');
    }
  }, [editingLeg, open]);

  const handleSave = () => {
    const baseLeg = {
      id: editingLeg?.id || Math.random().toString(36).substring(7),
      instrumentType,
      position,
      quantity,
    };

    let leg: OptionLeg;

    if (instrumentType === 'fut') {
      leg = {
        ...baseLeg,
        entryPrice,
        exitPrice: exitPrice || undefined,
      };
    } else {
      leg = {
        ...baseLeg,
        strike,
        premium,
        exitPremium: exitPremium || undefined,
      };
    }

    onSave(leg);
    onOpenChange(false);
  };

  const isValid = instrumentType === 'fut' 
    ? entryPrice && quantity 
    : strike && premium && quantity;

  const isFutures = instrumentType === 'fut';

  // Calculate P&L in real-time
  const currentLeg: OptionLeg = isFutures
    ? {
        id: 'temp',
        instrumentType,
        position,
        entryPrice,
        exitPrice: exitPrice || undefined,
        quantity,
      }
    : {
        id: 'temp',
        instrumentType,
        position,
        strike,
        premium,
        exitPremium: exitPremium || undefined,
        quantity,
      };

  const pnlResult = calculateLegPnL(currentLeg);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editingLeg ? 'Edit Leg' : 'Add New Leg'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Instrument Type Selector - Segmented Control */}
          <div className="space-y-2">
            <Label>Instrument Type</Label>
            <div className="inline-flex rounded-lg bg-gray-100 p-1 w-full">
              <button
                type="button"
                onClick={() => setInstrumentType('call')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  instrumentType === 'call'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Call
              </button>
              <button
                type="button"
                onClick={() => setInstrumentType('put')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  instrumentType === 'put'
                    ? 'bg-white text-purple-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Put
              </button>
              <button
                type="button"
                onClick={() => setInstrumentType('fut')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
                  instrumentType === 'fut'
                    ? 'bg-white text-orange-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                FUT
              </button>
            </div>
          </div>

          {/* Position Selector */}
          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <Select value={position} onValueChange={(value: 'buy' | 'sell') => setPosition(value)}>
              <SelectTrigger id="position" className="h-11 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="buy">Buy</SelectItem>
                <SelectItem value="sell">Sell</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Conditional Fields Based on Instrument Type */}
          {isFutures ? (
            <>
              {/* Futures Fields */}
              <div className="space-y-2">
                <Label htmlFor="entryPrice">Futures Entry Price</Label>
                <Input
                  id="entryPrice"
                  type="number"
                  placeholder="e.g., 18000"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(e.target.value)}
                  className="h-11 rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="exitPrice">Exit Price (Optional)</Label>
                <Input
                  id="exitPrice"
                  type="number"
                  placeholder="e.g., 18500"
                  value={exitPrice}
                  onChange={(e) => setExitPrice(e.target.value)}
                  className="h-11 rounded-lg"
                />
                <p className="text-xs text-gray-500">Leave empty for current market price</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Lot Size</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="e.g., 50"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="h-11 rounded-lg"
                />
              </div>
            </>
          ) : (
            <>
              {/* Options Fields */}
              <div className="space-y-2">
                <Label htmlFor="strike">Strike Price</Label>
                <Input
                  id="strike"
                  type="number"
                  placeholder="e.g., 18000"
                  value={strike}
                  onChange={(e) => setStrike(e.target.value)}
                  className="h-11 rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="premium">Premium (per unit)</Label>
                <Input
                  id="premium"
                  type="number"
                  placeholder="e.g., 200"
                  value={premium}
                  onChange={(e) => setPremium(e.target.value)}
                  className="h-11 rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="exitPremium">Exit Premium (Optional)</Label>
                <Input
                  id="exitPremium"
                  type="number"
                  placeholder="e.g., 150"
                  value={exitPremium}
                  onChange={(e) => setExitPremium(e.target.value)}
                  className="h-11 rounded-lg"
                />
                <p className="text-xs text-gray-500">Leave empty for current market price</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="e.g., 50"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="h-11 rounded-lg"
                />
              </div>
            </>
          )}

          {/* Realized P&L Display - Show when exit price/premium is entered */}
          {pnlResult && (
            <div className="pt-4 border-t border-gray-200 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className={`rounded-xl p-4 ${
                pnlResult.isProfit ? 'bg-green-50' : 
                pnlResult.isLoss ? 'bg-red-50' : 
                'bg-gray-50'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">
                      Realized Profit / Loss
                    </p>
                    <div className="flex items-center gap-2">
                      <p className={`text-2xl font-bold flex items-center gap-2 ${
                        pnlResult.isProfit ? 'text-green-600' : 
                        pnlResult.isLoss ? 'text-red-600' : 
                        'text-gray-600'
                      }`}>
                        {pnlResult.isProfit && <ArrowUp className="w-5 h-5" />}
                        {pnlResult.isLoss && <ArrowDown className="w-5 h-5" />}
                        {pnlResult.formatted}
                      </p>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                    pnlResult.isProfit ? 'bg-green-100 text-green-700' : 
                    pnlResult.isLoss ? 'bg-red-100 text-red-700' : 
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {pnlResult.isProfit ? 'Profit' : pnlResult.isLoss ? 'Loss' : 'Break Even'}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  This P&L is calculated based on the exit {isFutures ? 'price' : 'premium'} you entered above
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!isValid}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {editingLeg ? 'Update Leg' : 'Add Leg'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}