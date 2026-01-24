import { Sidebar } from '../components/Sidebar';
import { BookOpen, Video, FileText, TrendingUp } from 'lucide-react';

export function LearnPage() {
  const resources = [
    {
      id: 1,
      title: 'Options Trading Basics',
      description: 'Learn the fundamentals of options trading and key terminology',
      icon: BookOpen,
      color: 'blue',
    },
    {
      id: 2,
      title: 'Strategy Tutorials',
      description: 'Step-by-step guides for popular options strategies',
      icon: Video,
      color: 'purple',
    },
    {
      id: 3,
      title: 'Risk Management',
      description: 'Essential risk management principles for options traders',
      icon: TrendingUp,
      color: 'green',
    },
    {
      id: 4,
      title: 'Market Analysis',
      description: 'Technical and fundamental analysis techniques',
      icon: FileText,
      color: 'orange',
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto pt-16 lg:pt-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">Learning Center</h1>
            <p className="text-gray-600">Educational resources and trading guides to help you succeed</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {resources.map((resource) => {
              const Icon = resource.icon;
              const colorClasses = {
                blue: 'bg-blue-50 text-blue-600',
                purple: 'bg-purple-50 text-purple-600',
                green: 'bg-green-50 text-green-600',
                orange: 'bg-orange-50 text-orange-600',
              };

              return (
                <div
                  key={resource.id}
                  className="bg-white rounded-xl border p-6 hover:shadow-lg transition-all cursor-pointer hover:border-blue-300"
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${colorClasses[resource.color as keyof typeof colorClasses]}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{resource.title}</h3>
                  <p className="text-gray-600 text-sm">{resource.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}