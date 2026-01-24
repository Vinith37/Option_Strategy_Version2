import { Slider } from './ui/slider';
import { Label } from './ui/label';

interface RangeSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label: string;
}

export function RangeSlider({ value, onChange, min = 10, max = 50, step = 5, label }: RangeSliderProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm text-gray-600">{label}</Label>
        <span className="text-sm font-semibold text-gray-900">±{value}%</span>
      </div>
      <Slider
        value={[value]}
        onValueChange={(values) => onChange(values[0])}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />
    </div>
  );
}
