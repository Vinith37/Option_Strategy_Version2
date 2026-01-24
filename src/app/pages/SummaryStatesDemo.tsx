import { TrendingUp, TrendingDown } from 'lucide-react';
import { FinalResultCard } from '../components/FinalResultCard';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';

/**
 * Demo page to showcase the two states of the summary section:
 * 1. Active Trade: Two cards (Max Profit / Max Loss)
 * 2. Completed Trade: One card (Final Result)
 */
export function SummaryStatesDemo() {
  const navigate = useNavigate();

  // Sample data for demo
  const maxProfit = 12500;
  const maxLoss = -8500;
  const finalPnLProfit = 7125;
  const finalPnLLoss = -9300;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => navigate('/strategies')}
            variant="outline"
            className="mb-4"
          >
            ← Back to Strategy Builder
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Summary Section States - Side by Side Comparison
          </h1>
          <p className="text-gray-600">
            Visual comparison of Active vs Completed trade summary cards
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* STATE 1: ACTIVE TRADE */}
          <div className="bg-white rounded-2xl border-2 border-blue-500 p-8 shadow-lg">
            <div className="mb-6">
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-semibold mb-3">
                STATE 1: ACTIVE TRADE
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Two Cards Displayed
              </h2>
              <p className="text-sm text-gray-600">
                When the trade is active/in-progress, show Max Profit and Max Loss as two separate cards
              </p>
            </div>

            {/* Active Trade Summary Cards */}
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Max Profit Card */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-green-700 font-medium">Max Profit</p>
                      <p className="text-2xl font-semibold text-green-900">
                        +₹{maxProfit.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Max Loss Card */}
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200 p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                      <TrendingDown className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-red-700 font-medium">Max Loss</p>
                      <p className="text-2xl font-semibold text-red-900">
                        -₹{Math.abs(maxLoss).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Usage Note */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>When shown:</strong> Trade status is "In Progress" or "Active"
              </p>
            </div>
          </div>

          {/* STATE 2: COMPLETED TRADE */}
          <div className="bg-white rounded-2xl border-2 border-purple-500 p-8 shadow-lg">
            <div className="mb-6">
              <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-semibold mb-3">
                STATE 2: COMPLETED TRADE
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Single Card Displayed
              </h2>
              <p className="text-sm text-gray-600">
                When the trade is completed/exited, show only Final Result as one card
              </p>
            </div>

            {/* Completed Trade Summary - Profit Example */}
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                  Example 1: Profitable Trade
                </p>
                <FinalResultCard finalPnL={finalPnLProfit} />
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                  Example 2: Loss-Making Trade
                </p>
                <FinalResultCard finalPnL={finalPnLLoss} />
              </div>
            </div>

            {/* Usage Note */}
            <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-800">
                <strong>When shown:</strong> Trade status is "Completed" (all legs exited)
              </p>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="mt-8 bg-white rounded-xl border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📋 Implementation Details
          </h3>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="flex gap-3">
              <span className="font-semibold min-w-[120px]">Component:</span>
              <span>FinalResultCard.tsx (for completed state)</span>
            </div>
            <div className="flex gap-3">
              <span className="font-semibold min-w-[120px]">Logic:</span>
              <span>Conditional rendering based on isStrategyFullyExited() function</span>
            </div>
            <div className="flex gap-3">
              <span className="font-semibold min-w-[120px]">Active Trade:</span>
              <span>Shows 2 cards side-by-side (Max Profit + Max Loss)</span>
            </div>
            <div className="flex gap-3">
              <span className="font-semibold min-w-[120px]">Completed:</span>
              <span>Shows 1 card full-width (Final Result with color coding)</span>
            </div>
            <div className="flex gap-3">
              <span className="font-semibold min-w-[120px]">Color Logic:</span>
              <span>Green gradient for profit, Red gradient for loss, Gray for break-even</span>
            </div>
            <div className="flex gap-3">
              <span className="font-semibold min-w-[120px]">Badge:</span>
              <span>Shows "Profit" / "Loss" / "Break Even" in top-right corner</span>
            </div>
          </div>
        </div>

        {/* Code Snippet */}
        <div className="mt-8 bg-gray-900 rounded-xl p-6 text-white font-mono text-sm overflow-x-auto">
          <p className="text-gray-400 mb-3">// Strategy Builder Implementation:</p>
          <pre className="text-green-400">{`{isFullyExited && totalRealizedPnL !== null ? (
  // COMPLETED: Show single Final Result card
  <FinalResultCard finalPnL={totalRealizedPnL} />
) : (
  // ACTIVE: Show two cards for Max Profit and Max Loss
  <div className="grid md:grid-cols-2 gap-4">
    <MaxProfitCard profit={maxProfit} />
    <MaxLossCard loss={maxLoss} />
  </div>
)}`}</pre>
        </div>
      </div>
    </div>
  );
}
