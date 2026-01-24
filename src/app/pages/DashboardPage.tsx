import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Plus, Activity, Edit, LogOut, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Sidebar } from '../components/Sidebar';
import { ReadOnlyStrategyView } from '../components/ReadOnlyStrategyView';
import { useAuth } from '../contexts/AuthContext';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '../components/ui/alert-dialog';
import { toast } from 'sonner';
import { OptionLeg } from '../components/LegCard';
import { calculateTotalRealizedPnL } from '../utils/calculateLegPnL';
import { Strategy } from '../types/strategy';
import { createHistoricalSnapshot, getHistoricalPnL } from '../utils/createHistoricalSnapshot';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [exitingStrategy, setExitingStrategy] = useState<Strategy | null>(null);
  const [viewingStrategy, setViewingStrategy] = useState<Strategy | null>(null);

  useEffect(() => {
    // Load user data from localStorage
    const userStrategies = JSON.parse(localStorage.getItem(`strategies_${user?.id}`) || '[]');

    setStrategies(userStrategies);
  }, [user?.id]);

  const deleteStrategy = (id: string) => {
    const updatedStrategies = strategies.filter(s => s.id !== id);
    setStrategies(updatedStrategies);
    localStorage.setItem(`strategies_${user?.id}`, JSON.stringify(updatedStrategies));
    toast.success('Strategy deleted');
  };

  const handleExitTrade = (strategy: Strategy) => {
    setExitingStrategy(strategy);
  };

  const confirmExitTrade = () => {
    if (!exitingStrategy) return;

    // For now, calculate P&L assuming all positions are closed at current underlying price
    // In a real app, you would prompt for actual exit prices for each leg
    const legs = (exitingStrategy.legs || []) as OptionLeg[];
    const underlyingPrice = exitingStrategy.underlyingPrice || 0;
    
    // Set exit prices based on current underlying price
    const legsWithExit = legs.map(leg => {
      if (leg.instrumentType === 'fut') {
        // For futures, use underlying price as exit price
        return { ...leg, exitPrice: underlyingPrice.toString() };
      } else {
        // For options, use intrinsic value as exit premium
        const strike = parseFloat(leg.strike || '0');
        const intrinsicValue = leg.instrumentType === 'call'
          ? Math.max(0, underlyingPrice - strike)
          : Math.max(0, strike - underlyingPrice);
        return { ...leg, exitPremium: intrinsicValue.toString() };
      }
    });

    // Calculate actual profit/loss based on exit prices
    const actualPnL = calculateTotalRealizedPnL(legsWithExit) || 0;

    // CRITICAL: Create immutable snapshot before saving
    const exitDate = new Date().toISOString().split('T')[0];
    const historicalSnapshot = createHistoricalSnapshot(
      legsWithExit,
      exitingStrategy.entryDate,
      exitDate,
      underlyingPrice,
      exitingStrategy.notes
    );

    const updatedStrategy: Strategy = {
      ...exitingStrategy,
      legs: legsWithExit,
      status: 'completed',
      exitDate,
      actualProfit: actualPnL,
      historicalSnapshot, // Save the immutable snapshot
    };

    const updatedStrategies = strategies.map(s =>
      s.id === exitingStrategy.id ? updatedStrategy : s
    );

    setStrategies(updatedStrategies);
    localStorage.setItem(`strategies_${user?.id}`, JSON.stringify(updatedStrategies));
    
    setExitingStrategy(null);
    toast.success('Trade exited successfully');
    setActiveTab('history');
  };

  const handleViewStrategy = (strategy: Strategy) => {
    setViewingStrategy(strategy);
  };

  // Filter strategies based on active tab
  const currentStrategies = strategies.filter(s => s.status === 'current' || (s.status === 'active' && !s.exitDate));
  const completedStrategies = strategies.filter(s => s.status === 'completed');

  // Calculate real metrics from actual strategy data
  const totalStrategiesCount = strategies.length;
  const activeStrategiesCount = currentStrategies.length;
  
  // Count winning/losing trades from completed strategies
  const winningTrades = completedStrategies.filter(s => (s.actualProfit ?? 0) > 0).length;
  const losingTrades = completedStrategies.filter(s => (s.actualProfit ?? 0) < 0).length;
  const totalCompletedTrades = completedStrategies.length;
  
  // Calculate win rate
  const winRate = totalCompletedTrades > 0 
    ? Math.round((winningTrades / totalCompletedTrades) * 100) 
    : 0;
  
  // Find last activity date (most recent creation or exit)
  const getLastActivityDate = (): string => {
    if (strategies.length === 0) return '—';
    
    const allDates: Date[] = [];
    
    strategies.forEach(strategy => {
      // Add creation date (lastUpdated as proxy)
      if (strategy.lastUpdated) {
        allDates.push(new Date(strategy.lastUpdated));
      }
      // Add exit date if exists
      if (strategy.exitDate) {
        allDates.push(new Date(strategy.exitDate));
      }
      // Add entry date if exists
      if (strategy.entryDate) {
        allDates.push(new Date(strategy.entryDate));
      }
    });
    
    if (allDates.length === 0) return '—';
    
    // Sort and get most recent
    const mostRecent = new Date(Math.max(...allDates.map(d => d.getTime())));
    return mostRecent.toISOString().split('T')[0];
  };
  
  const lastActivityDate = getLastActivityDate();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto pt-16 lg:pt-4 sm:pt-16 lg:pt-6">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-sm sm:text-base text-gray-600">Here's an overview of your trading strategies and performance</p>
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl border p-4 sm:p-6 hover:shadow-lg transition-all duration-300 active:scale-98">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <p className="text-xs sm:text-sm text-gray-600">Total Strategies</p>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-semibold text-gray-900">
              {totalStrategiesCount > 0 ? totalStrategiesCount : '—'}
            </p>
            <p className="text-xs text-gray-500 mt-1 sm:mt-2">
              {totalStrategiesCount > 0 ? `${activeStrategiesCount} active` : 'No activity yet'}
            </p>
          </div>

          <div className="bg-white rounded-xl border p-4 sm:p-6 hover:shadow-lg transition-all duration-300 active:scale-98">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <p className="text-xs sm:text-sm text-gray-600">Winning Trades</p>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-semibold text-gray-900">
              {totalCompletedTrades > 0 ? winningTrades : '—'}
            </p>
            <p className="text-xs text-green-600 mt-1 sm:mt-2">
              {totalCompletedTrades > 0 ? `${winRate}% win rate` : 'No completed trades'}
            </p>
          </div>

          <div className="bg-white rounded-xl border p-4 sm:p-6 hover:shadow-lg transition-all duration-300 active:scale-98">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <p className="text-xs sm:text-sm text-gray-600">Losing Trades</p>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-50 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-semibold text-gray-900">
              {totalCompletedTrades > 0 ? losingTrades : '—'}
            </p>
            <p className="text-xs text-red-600 mt-1 sm:mt-2">Track and improve</p>
          </div>

          <div className="bg-white rounded-xl border p-4 sm:p-6 hover:shadow-lg transition-all duration-300 active:scale-98">
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <p className="text-xs sm:text-sm text-gray-600">Last Activity</p>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              </div>
            </div>
            <p className="text-lg sm:text-xl font-semibold text-gray-900">{lastActivityDate}</p>
            <p className="text-xs text-gray-500 mt-1 sm:mt-2">
              {lastActivityDate !== '—' ? 'Recent trade' : 'No activity yet'}
            </p>
          </div>
        </div>

        {/* Trading Strategies Section */}
        <div className="bg-white rounded-xl border shadow-sm">
          <div className="p-4 sm:p-6 border-b">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Trading Strategies</h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">Track and manage your options trades</p>
              </div>
              <Button
                onClick={() => navigate('/strategies')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 active:scale-98 w-full sm:w-auto"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New
              </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('current')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'current'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                }`}
              >
                Current Trades ({currentStrategies.length})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === 'history'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-50 border border-transparent'
                }`}
              >
                History ({completedStrategies.length})
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {/* Current Trades Tab */}
            {activeTab === 'current' && (
              <>
                {currentStrategies.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No current trades</h3>
                    <p className="text-gray-600 mb-6">Create your first options strategy to get started</p>
                    <Button
                      onClick={() => navigate('/strategies')}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Strategy
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentStrategies.map((strategy) => (
                      <div
                        key={strategy.id}
                        className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200 min-w-[280px]"
                      >
                        {/* Header Section */}
                        <div className="mb-4 pb-4 border-b border-gray-100">
                          <h3 className="font-semibold text-gray-900 mb-2 text-base">
                            {strategy.name}
                          </h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-md border border-blue-200">
                              In Progress
                            </span>
                            <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-md">
                              {strategy.type}
                            </span>
                          </div>
                        </div>

                        {/* Body Section - Metrics */}
                        <div className="space-y-3.5 mb-5">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="text-xs text-gray-500 mb-1">Max Profit</p>
                              <p className="text-base font-semibold text-green-600">
                                +₹{strategy.maxProfit.toLocaleString()}
                              </p>
                            </div>
                            <div className="flex-1 text-right">
                              <p className="text-xs text-gray-500 mb-1">Max Loss</p>
                              <p className="text-base font-semibold text-red-600">
                                -₹{Math.abs(strategy.maxLoss).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="pt-2 border-t border-gray-100">
                            <p className="text-xs text-gray-500 mb-1">Entry Date</p>
                            <p className="text-sm font-medium text-gray-900">
                              {strategy.entryDate || strategy.lastUpdated}
                            </p>
                          </div>
                        </div>

                        {/* Footer Section - Actions */}
                        <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                          <button
                            onClick={() => navigate('/strategies', { state: { editingStrategy: strategy } })}
                            className="flex-1 px-3 py-2 hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors text-sm font-medium text-gray-700 flex items-center justify-center gap-1.5"
                            title="Edit strategy"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleExitTrade(strategy)}
                            className="flex-1 px-3 py-2 bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-1.5"
                            title="Exit trade"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            Exit
                          </button>
                          <button
                            onClick={() => deleteStrategy(strategy.id)}
                            className="px-3 py-2 hover:bg-red-50 border border-transparent hover:border-red-200 rounded-lg transition-colors"
                            title="Delete strategy"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <>
                {completedStrategies.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Activity className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No completed trades</h3>
                    <p className="text-gray-600">Exit a current trade to see it here</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {completedStrategies.map((strategy) => {
                      // CRITICAL: Use snapshot for P&L to ensure data integrity
                      const profit = getHistoricalPnL(strategy.historicalSnapshot, strategy.actualProfit);
                      const isWin = profit > 0;
                      
                      return (
                        <div
                          key={strategy.id}
                          onClick={() => handleViewStrategy(strategy)}
                          className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-200 cursor-pointer group min-w-[280px]"
                        >
                          {/* Header Section */}
                          <div className="mb-4 pb-4 border-b border-gray-100">
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                                  isWin ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'
                                }`}
                              >
                                {isWin ? (
                                  <TrendingUp className="w-6 h-6 text-green-600" />
                                ) : (
                                  <TrendingDown className="w-6 h-6 text-red-600" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1 text-base truncate">
                                  {strategy.name}
                                </h3>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="inline-flex items-center px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-md">
                                    {strategy.type}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Body Section - Results */}
                          <div className="space-y-3.5">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="text-xs text-gray-500 mb-1">Result</p>
                                <p
                                  className={`text-xl font-bold ${
                                    isWin ? 'text-green-600' : 'text-red-600'
                                  }`}
                                >
                                  {profit > 0 ? '+' : ''}₹{profit.toLocaleString()}
                                </p>
                              </div>
                              <div className="flex-1 text-right">
                                <p className="text-xs text-gray-500 mb-1">Status</p>
                                <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-md ${
                                  isWin 
                                    ? 'bg-green-50 text-green-700 border border-green-200' 
                                    : 'bg-red-50 text-red-700 border border-red-200'
                                }`}>
                                  {isWin ? 'Win' : 'Loss'}
                                </span>
                              </div>
                            </div>
                            <div className="pt-2 border-t border-gray-100">
                              <p className="text-xs text-gray-500 mb-1">Exit Date</p>
                              <p className="text-sm font-medium text-gray-900">
                                {strategy.exitDate}
                              </p>
                            </div>
                          </div>

                          {/* Footer hint */}
                          <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                            <p className="text-xs text-gray-400 group-hover:text-blue-600 transition-colors">
                              Click to view details →
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Exit Trade Confirmation Dialog */}
      <AlertDialog open={!!exitingStrategy} onOpenChange={() => setExitingStrategy(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exit this trade now?</AlertDialogTitle>
            <AlertDialogDescription>
              This will close the trade and calculate your profit/loss. The trade will be moved to your History.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmExitTrade} className="bg-orange-600 hover:bg-orange-700">
              Confirm Exit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Strategy Details Dialog */}
      {viewingStrategy && (
        <ReadOnlyStrategyView 
          strategy={viewingStrategy} 
          onClose={() => setViewingStrategy(null)} 
        />
      )}
    </div>
  );
}