import { Minus, Plus, Lock, Info } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useState, useEffect } from 'react';

interface PriceControlProps {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  label: string;
  syncedWithFutures?: boolean;
  helperText?: string;
  placeholder?: string;
  showWarning?: boolean;
  warningText?: string;
}

export function PriceControl({ 
  value, 
  onChange, 
  step = 100, 
  label,
  syncedWithFutures = false,
  helperText,
  placeholder = "Enter price",
  showWarning = false,
  warningText
}: PriceControlProps) {
  const [inputValue, setInputValue] = useState(value.toString());

  // Sync input value when external value changes (important for futures sync)
  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleDecrease = () => {
    const newValue = Math.max(0, value - step);
    onChange(newValue);
    setInputValue(newValue.toString());
  };

  const handleIncrease = () => {
    const newValue = value + step;
    onChange(newValue);
    setInputValue(newValue.toString());
  };

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

  const handleInputBlur = () => {
    // Ensure the input shows the current valid value on blur
    setInputValue(value.toString());
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium text-gray-700">{label}</p>
        {syncedWithFutures && (
          <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
            <Lock className="w-3 h-3" />
            <span>Synced with Futures</span>
          </div>
        )}
      </div>

      {syncedWithFutures ? (
        // Synced Mode: Read-only display
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled
            className="h-9 w-9 p-0 rounded-lg opacity-50 cursor-not-allowed"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <div className="flex-1 text-center py-2 px-3 bg-gray-50 border border-gray-200 rounded-lg">
            <span className="text-lg font-semibold text-gray-700">₹{value.toLocaleString()}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            disabled
            className="h-9 w-9 p-0 rounded-lg opacity-50 cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        // Editable Mode: Manual input
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDecrease}
            className="h-9 w-9 p-0 rounded-lg hover:bg-gray-100"
            disabled={value === 0}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <div className="flex-1">
            <Input
              type="number"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              placeholder={placeholder}
              className={`text-center text-lg font-semibold h-9 rounded-lg ${
                showWarning ? 'border-orange-300 bg-orange-50' : ''
              }`}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleIncrease}
            className="h-9 w-9 p-0 rounded-lg hover:bg-gray-100"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Helper Text */}
      {helperText && !showWarning && (
        <p className="text-xs text-gray-500 flex items-start gap-1">
          <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span>{helperText}</span>
        </p>
      )}

      {/* Warning Text */}
      {showWarning && warningText && (
        <p className="text-xs text-orange-600 flex items-start gap-1">
          <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
          <span>{warningText}</span>
        </p>
      )}
    </div>
  );
}