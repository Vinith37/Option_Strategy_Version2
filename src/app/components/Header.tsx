import { BookOpen, Lightbulb } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b bg-white">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="2" width="12" height="12" rx="2" fill="#3B82F6" />
              </svg>
            </div>
            <h1 className="font-semibold text-gray-900">Options Strategy Builder</h1>
          </div>
          
          <div className="flex items-center gap-1 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-green-600">Backend connected</span>
          </div>
        </div>

        <nav className="flex items-center gap-6">
          <button className="text-gray-600 hover:text-gray-900 transition-colors">
            Strategies
          </button>
          <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
            <BookOpen className="w-4 h-4" />
            Learn
          </button>
          <button className="text-gray-600 hover:text-gray-900 transition-colors">
            <Lightbulb className="w-4 h-4" />
          </button>
        </nav>
      </div>
    </header>
  );
}
