import { Plus } from 'lucide-react';

export function EmptyLegsState() {
  return (
    <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 p-12 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
        <Plus className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-base font-medium text-gray-900 mb-1">No legs added yet</h3>
      <p className="text-sm text-gray-500">
        Click "Add New Leg" to start building your strategy
      </p>
    </div>
  );
}
