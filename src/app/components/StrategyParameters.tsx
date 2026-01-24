import { Plus } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface StrategyParametersProps {
  entryDate: string;
  expiryDate: string;
  futuresLotSize: string;
  futuresEntryPrice: string;
  callLotSize: string;
  callStrikePrice: string;
  onEntryDateChange: (value: string) => void;
  onExpiryDateChange: (value: string) => void;
  onFuturesLotSizeChange: (value: string) => void;
  onFuturesEntryPriceChange: (value: string) => void;
  onCallLotSizeChange: (value: string) => void;
  onCallStrikePriceChange: (value: string) => void;
}

export function StrategyParameters({
  entryDate,
  expiryDate,
  futuresLotSize,
  futuresEntryPrice,
  callLotSize,
  callStrikePrice,
  onEntryDateChange,
  onExpiryDateChange,
  onFuturesLotSizeChange,
  onFuturesEntryPriceChange,
  onCallLotSizeChange,
  onCallStrikePriceChange,
}: StrategyParametersProps) {
  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-yellow-50 rounded-lg flex items-center justify-center">
          <Plus className="w-4 h-4 text-yellow-600" />
        </div>
        <h2 className="font-semibold text-gray-900">Strategy Parameters</h2>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="entry-date" className="text-sm text-gray-700 mb-2 block">
            Entry Date
          </Label>
          <Input
            id="entry-date"
            type="date"
            value={entryDate}
            onChange={(e) => onEntryDateChange(e.target.value)}
            className="w-full"
          />
        </div>

        <div>
          <Label htmlFor="expiry-date" className="text-sm text-gray-700 mb-2 block">
            Expiry Date
          </Label>
          <Input
            id="expiry-date"
            type="date"
            value={expiryDate}
            onChange={(e) => onExpiryDateChange(e.target.value)}
            className="w-full"
          />
        </div>

        <div>
          <Label htmlFor="futures-lot-size" className="text-sm text-gray-700 mb-2 block">
            Futures Lot Size
          </Label>
          <Input
            id="futures-lot-size"
            type="number"
            value={futuresLotSize}
            onChange={(e) => onFuturesLotSizeChange(e.target.value)}
            className="w-full"
          />
        </div>

        <div>
          <Label htmlFor="futures-entry-price" className="text-sm text-gray-700 mb-2 block">
            Futures Entry Price
          </Label>
          <Input
            id="futures-entry-price"
            type="number"
            value={futuresEntryPrice}
            onChange={(e) => onFuturesEntryPriceChange(e.target.value)}
            className="w-full"
          />
        </div>

        <div>
          <Label htmlFor="call-lot-size" className="text-sm text-gray-700 mb-2 block">
            Call Lot Size
          </Label>
          <Input
            id="call-lot-size"
            type="number"
            value={callLotSize}
            onChange={(e) => onCallLotSizeChange(e.target.value)}
            className="w-full"
          />
        </div>

        <div>
          <Label htmlFor="call-strike-price" className="text-sm text-gray-700 mb-2 block">
            Call Strike Price
          </Label>
          <Input
            id="call-strike-price"
            type="number"
            value={callStrikePrice}
            onChange={(e) => onCallStrikePriceChange(e.target.value)}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
