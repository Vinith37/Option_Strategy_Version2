import { TrendingUp, Shield, Zap, Lock, Move } from 'lucide-react';
import { Button } from './ui/button';
import { OptionLeg } from './LegCard';

interface StrategyTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  legs: Omit<OptionLeg, 'id'>[];
}

const templates: StrategyTemplate[] = [
  {
    id: 'covered-call',
    name: 'Covered Call',
    description: 'Long futures + Short call',
    icon: TrendingUp,
    legs: [
      { instrumentType: 'fut', position: 'buy', entryPrice: '18000', quantity: '50' },
      { instrumentType: 'call', position: 'sell', strike: '19000', premium: '200', quantity: '50' },
    ],
  },
  {
    id: 'protective-put',
    name: 'Protective Put',
    description: 'Long futures + Long put',
    icon: Shield,
    legs: [
      { instrumentType: 'fut', position: 'buy', entryPrice: '18000', quantity: '50' },
      { instrumentType: 'put', position: 'buy', strike: '17500', premium: '150', quantity: '50' },
    ],
  },
  {
    id: 'long-straddle',
    name: 'Long Straddle',
    description: 'Buy call + Buy put at same strike',
    icon: Zap,
    legs: [
      { instrumentType: 'call', position: 'buy', strike: '18000', premium: '300', quantity: '50' },
      { instrumentType: 'put', position: 'buy', strike: '18000', premium: '300', quantity: '50' },
    ],
  },
  {
    id: 'iron-condor',
    name: 'Iron Condor',
    description: 'Sell OTM call & put spreads',
    icon: Move,
    legs: [
      { instrumentType: 'put', position: 'buy', strike: '17000', premium: '50', quantity: '50' },
      { instrumentType: 'put', position: 'sell', strike: '17500', premium: '100', quantity: '50' },
      { instrumentType: 'call', position: 'sell', strike: '18500', premium: '100', quantity: '50' },
      { instrumentType: 'call', position: 'buy', strike: '19000', premium: '50', quantity: '50' },
    ],
  },
  {
    id: 'butterfly',
    name: 'Butterfly Spread',
    description: 'Buy 1, sell 2, buy 1',
    icon: Lock,
    legs: [
      { instrumentType: 'call', position: 'buy', strike: '17500', premium: '100', quantity: '50' },
      { instrumentType: 'call', position: 'sell', strike: '18000', premium: '200', quantity: '100' },
      { instrumentType: 'call', position: 'buy', strike: '18500', premium: '100', quantity: '50' },
    ],
  },
];

interface QuickTemplatesProps {
  onLoadTemplate: (legs: Omit<OptionLeg, 'id'>[]) => void;
}

export function QuickStrategyTemplates({ onLoadTemplate }: QuickTemplatesProps) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-100 p-6">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-900 mb-1">Quick Start Templates</h3>
        <p className="text-sm text-gray-600">
          Load a common strategy to get started quickly
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {templates.map((template) => {
          const Icon = template.icon;
          return (
            <Button
              key={template.id}
              variant="outline"
              onClick={() => onLoadTemplate(template.legs)}
              className="h-auto flex-col items-start p-4 bg-white hover:bg-blue-50 hover:border-blue-300 transition-all"
            >
              <div className="flex items-center gap-2 mb-2 w-full">
                <Icon className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-sm text-gray-900">{template.name}</span>
              </div>
              <p className="text-xs text-gray-600 text-left">{template.description}</p>
            </Button>
          );
        })}
      </div>
    </div>
  );
}