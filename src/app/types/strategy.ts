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
  id: number;

  name: string;
  type: string;                // frontend-friendly
  status: "current" | "active" | "completed";

  entryDate?: string;
  expiryDate?: string;
  exitDate?: string;

  legs?: any[];

  maxProfit: number;
  maxLoss: number;
  underlyingPrice?: number;

  notes?: string;
  lastUpdated?: string;

  actualProfit?: number;
  historicalSnapshot?: any;
}

