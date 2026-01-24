import { LucideIcon } from 'lucide-react';

interface StrategyCardProps {
  name: string;
  description: string;
  icon: LucideIcon;
  isSelected: boolean;
  onClick: () => void;
}

export function StrategyCard({ name, description, icon: Icon, isSelected, onClick }: StrategyCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 sm:p-5 rounded-lg border transition-all duration-200 active:scale-98 ${
        isSelected
          ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-500 shadow-md'
          : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-center gap-3 mb-2">
        <div
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center ${
            isSelected ? 'bg-blue-500' : 'bg-blue-50'
          }`}
        >
          <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${isSelected ? 'text-white' : 'text-blue-600'}`} />
        </div>
        <h3 className={`font-semibold text-sm sm:text-base ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
          {name}
        </h3>
      </div>
      <p className="text-xs sm:text-sm text-gray-600 ml-13 sm:ml-15">{description}</p>
    </button>
  );
}