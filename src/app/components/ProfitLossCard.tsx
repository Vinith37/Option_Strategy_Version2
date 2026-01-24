interface ProfitLossCardProps {
  label: string;
  value: number;
  type: 'profit' | 'loss' | 'breakeven';
}

export function ProfitLossCard({ label, value, type }: ProfitLossCardProps) {
  const colorClasses = {
    profit: 'bg-green-50 border-green-200 text-green-700',
    loss: 'bg-red-50 border-red-200 text-red-700',
    breakeven: 'bg-orange-50 border-orange-200 text-orange-700',
  };

  const textColorClasses = {
    profit: 'text-green-900',
    loss: 'text-red-900',
    breakeven: 'text-orange-900',
  };

  return (
    <div className={`rounded-lg border p-4 ${colorClasses[type]}`}>
      <p className="text-xs font-medium mb-1">{label}</p>
      <p className={`text-2xl font-semibold ${textColorClasses[type]}`}>
        ₹{Math.abs(value).toLocaleString()}
      </p>
    </div>
  );
}
