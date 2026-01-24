import { ArrowUp, ArrowDown, TrendingUp, TrendingDown } from 'lucide-react';

interface FinalResultCardProps {
  finalPnL: number;
  className?: string;
}

export function FinalResultCard({ finalPnL, className = '' }: FinalResultCardProps) {
  const isProfit = finalPnL > 0;
  const isLoss = finalPnL < 0;
  const isBreakEven = finalPnL === 0;

  // Determine colors and styles based on result
  const getCardStyles = () => {
    if (isProfit) {
      return {
        gradient: 'from-green-50 to-green-100',
        border: 'border-green-200',
        iconBg: 'bg-green-500',
        textColor: 'text-green-700',
        valueColor: 'text-green-900',
        badgeBg: 'bg-green-100',
        badgeText: 'text-green-700',
        icon: ArrowUp,
        badge: 'Profit',
      };
    } else if (isLoss) {
      return {
        gradient: 'from-red-50 to-red-100',
        border: 'border-red-200',
        iconBg: 'bg-red-500',
        textColor: 'text-red-700',
        valueColor: 'text-red-900',
        badgeBg: 'bg-red-100',
        badgeText: 'text-red-700',
        icon: ArrowDown,
        badge: 'Loss',
      };
    } else {
      return {
        gradient: 'from-gray-50 to-gray-100',
        border: 'border-gray-200',
        iconBg: 'bg-gray-500',
        textColor: 'text-gray-700',
        valueColor: 'text-gray-900',
        badgeBg: 'bg-gray-100',
        badgeText: 'text-gray-700',
        icon: TrendingUp,
        badge: 'Break Even',
      };
    }
  };

  const styles = getCardStyles();
  const Icon = styles.icon;

  return (
    <div
      className={`bg-gradient-to-br ${styles.gradient} rounded-xl border ${styles.border} p-6 ${className} animate-in fade-in slide-in-from-top-2 duration-300`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 ${styles.iconBg} rounded-xl flex items-center justify-center shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className={`text-sm ${styles.textColor} font-medium mb-1`}>Final Result</p>
            <p className={`text-3xl font-bold ${styles.valueColor} flex items-center gap-2`}>
              {isProfit && '+'}
              {isLoss && '-'}
              ₹{Math.abs(finalPnL).toLocaleString('en-IN', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>
        <div
          className={`px-4 py-2 rounded-lg ${styles.badgeBg} ${styles.badgeText} font-semibold text-sm shadow-sm`}
        >
          {styles.badge}
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-current/10">
        <p className="text-xs text-gray-600">
          This is the realized profit/loss after closing all positions in this strategy.
        </p>
      </div>
    </div>
  );
}
