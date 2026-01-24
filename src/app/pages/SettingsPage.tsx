import { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { User, Bell, Shield, CreditCard } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useAuth } from '../contexts/AuthContext';

export function SettingsPage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  const sections = [
    {
      id: 'profile',
      title: 'Profile Settings',
      description: 'Manage your account information',
      icon: User,
      color: 'blue',
    },
    {
      id: 'notifications',
      title: 'Notifications',
      description: 'Configure your notification preferences',
      icon: Bell,
      color: 'purple',
    },
    {
      id: 'security',
      title: 'Security',
      description: 'Password and authentication settings',
      icon: Shield,
      color: 'green',
    },
    {
      id: 'billing',
      title: 'Billing',
      description: 'Manage subscription and payment methods',
      icon: CreditCard,
      color: 'orange',
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto pt-16 lg:pt-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">Settings</h1>
            <p className="text-gray-600">Manage your account settings and preferences</p>
          </div>

          {/* Profile Settings */}
          <div className="bg-white rounded-xl border shadow-sm p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Profile Settings</h2>
                <p className="text-sm text-gray-600">Manage your account information</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-sm text-gray-700 mb-2 block">
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-sm text-gray-700 mb-2 block">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>

              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Save Changes
              </Button>
            </div>
          </div>

          {/* Other Settings Sections */}
          <div className="grid md:grid-cols-2 gap-6">
            {sections.slice(1).map((section) => {
              const Icon = section.icon;
              const colorClasses = {
                blue: 'bg-blue-50 text-blue-600',
                purple: 'bg-purple-50 text-purple-600',
                green: 'bg-green-50 text-green-600',
                orange: 'bg-orange-50 text-orange-600',
              };

              return (
                <div
                  key={section.id}
                  className="bg-white rounded-xl border p-6 hover:shadow-lg transition-all cursor-pointer hover:border-blue-300"
                >
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${colorClasses[section.color as keyof typeof colorClasses]}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{section.title}</h3>
                  <p className="text-gray-600 text-sm">{section.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}