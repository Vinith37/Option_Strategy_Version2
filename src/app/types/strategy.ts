import { OptionLeg } from '../components/LegCard';

/**
 * Immutable snapshot of a strategy at the moment it was moved to history.
 * This ensures historical data integrity and prevents recalculation.
 */
export interface HistoricalSnapshot {
  // Snapshot metadata
  snapshotDate: string; // ISO date when snapshot was created
  
  // Entry details
  entryDate?: string;
  
  // Exit details
  exitDate: string;
  
  // Leg-level snapshot (immutable copy of legs at exit)
  legs: OptionLeg[];
  
  // Realized P&L (frozen at exit)
  realizedPnL: number;
  
  // Strategy-level metrics at exit
  totalQuantity: number;
  totalLotSize: number;
  
  // Individual leg P&L breakdown for audit trail
  legPnLBreakdown: Array<{
    legId: string;
    instrumentType: 'call' | 'put' | 'fut';
    position: 'buy' | 'sell';
    quantity: string;
    entryPrice?: string; // For futures
    exitPrice?: string; // For futures
    premium?: string; // For options (entry)
    exitPremium?: string; // For options (exit)
    strike?: string; // For options
    realizedPnL: number; // Individual leg P&L
  }>;
  
  // Summary result
  isWin: boolean;
  isLoss: boolean;
  isBreakEven: boolean;
  
  // Additional context
  underlyingPriceAtExit?: number;
  notes?: string;
}

/**
 * Main Strategy interface used across the application
 */
export interface Strategy {
  id: string;
  name: string;
  type: string;
  legs?: OptionLeg[];
  maxProfit: number;
  maxLoss: number;
  underlyingPrice?: number;
  entryDate?: string;
  expiryDate?: string;
  notes?: string;
  lastUpdated: string;
  status: 'current' | 'completed' | 'archived';
  exitDate?: string;
  actualProfit?: number;
  
  /**
   * Immutable snapshot of the strategy at the moment it was completed.
   * CRITICAL: This snapshot should NEVER be recalculated or modified.
   * Always use this data when displaying history.
   */
  historicalSnapshot?: HistoricalSnapshot;
}
