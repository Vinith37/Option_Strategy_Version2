import { TrendingUp, Minus, Plus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Slider } from './ui/slider';

interface PayoffDiagramProps {
  underlyingPrice: number;
  priceRange: number;
  onUnderlyingPriceChange: (value: number) => void;
  onPriceRangeChange: (value: number) => void;
  payoffData: Array<{ price: number; payoff: number }>;
  breakEven: number;
}

export function PayoffDiagram({
  underlyingPrice,
  priceRange,
  onUnderlyingPriceChange,
  onPriceRangeChange,
  payoffData,
  breakEven,
}: PayoffDiagramProps) {
  const minPrice = Math.round(underlyingPrice * (1 - priceRange / 100));
  const maxPrice = Math.round(underlyingPrice * (1 + priceRange / 100));

  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-purple-600" />
        </div>
        <h2 className="font-semibold text-gray-900">Payoff Diagram</h2>
      </div>

      <p className="text-sm text-gray-500 mb-4">
        Click and drag on the chart to zoom into a specific range
      </p>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-700">Underlying Price</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Break-even:</span>
            <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-sm font-medium">
              ₹{breakEven.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onUnderlyingPriceChange(underlyingPrice - 100)}
            className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <Minus className="w-4 h-4 text-gray-600" />
          </button>

          <div className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-center font-medium">
            {underlyingPrice}
          </div>

          <button
            onClick={() => onUnderlyingPriceChange(underlyingPrice + 100)}
            className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <Plus className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-700">Price Range (%)</span>
          <span className="text-blue-600 font-medium">{priceRange}</span>
        </div>
        <Slider
          value={[priceRange]}
          onValueChange={(values) => onPriceRangeChange(values[0])}
          min={10}
          max={50}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Range: ₹{minPrice.toLocaleString()} - ₹{maxPrice.toLocaleString()}</span>
        </div>
      </div>

      <div className="h-80 border rounded-lg p-4 bg-gray-50">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={payoffData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="price"
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(value) => `${value}`}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(value) => `${value}`}
            />
            <ReferenceLine y={0} stroke="#9ca3af" strokeDasharray="3 3" />
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
  );
}
