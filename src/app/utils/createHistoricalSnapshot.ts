import { OptionLeg } from '../components/LegCard';
import { HistoricalSnapshot } from '../types/strategy';
import { calculateLegPnL } from './calculateLegPnL';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * HISTORICAL SNAPSHOT SYSTEM - DATA INTEGRITY GUARANTEE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * PURPOSE:
 * This system creates immutable snapshots of completed trades to ensure that
 * historical data NEVER changes due to recalculations or system updates.
 * 
 * WORKFLOW:
 * 1. When a trade is exited (Current → History):
 *    - createHistoricalSnapshot() captures ALL exit data
 *    - Snapshot is frozen (Object.freeze) to prevent mutations
 *    - Snapshot is saved with the strategy in localStorage
 * 
 * 2. When displaying history:
 *    - getHistoricalPnL() ALWAYS uses snapshot data if available
 *    - Falls back to actualProfit only for backward compatibility
 *    - NEVER recalculates from legs for completed trades
 * 
 * 3. Data included in snapshot:
 *    ✓ All leg entry/exit prices
 *    ✓ Realized P&L for each leg
 *    ✓ Total realized P&L
 *    ✓ Entry/Exit dates
 *    ✓ Underlying price at exit
 *    ✓ Win/Loss/BreakEven status
 * 
 * CRITICAL RULES:
 * ❌ NEVER modify a snapshot after creation
 * ❌ NEVER recalculate P&L for completed trades
 * ✓ ALWAYS use getHistoricalPnL() for display
 * ✓ ALWAYS validate snapshot before using
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 */

/**
 * Creates an immutable snapshot of a strategy at the moment it's moved to history.
 * This snapshot preserves all exit data and prevents future recalculations.
 * 
 * CRITICAL: Once created, this snapshot should NEVER be modified or recalculated.
 * It represents the exact state of the trade at the time of exit.
 */
export function createHistoricalSnapshot(
  legs: OptionLeg[],
  entryDate?: string,
  exitDate?: string,
  underlyingPriceAtExit?: number,
  notes?: string
): HistoricalSnapshot {
  // Calculate individual leg P&L for audit trail
  const legPnLBreakdown = legs.map(leg => {
    const legPnL = calculateLegPnL(leg);
    
    return {
      legId: leg.id,
      instrumentType: leg.instrumentType,
      position: leg.position,
      quantity: leg.quantity,
      entryPrice: leg.entryPrice, // For futures
      exitPrice: leg.exitPrice, // For futures
      premium: leg.premium, // For options
      exitPremium: leg.exitPremium, // For options
      strike: leg.strike, // For options
      realizedPnL: legPnL,
    };
  });

  // Calculate total realized P&L
  const realizedPnL = legPnLBreakdown.reduce((sum, leg) => sum + leg.realizedPnL, 0);

  // Calculate total quantity and lot size
  const totalQuantity = legs.reduce((sum, leg) => {
    const qty = parseFloat(leg.quantity) || 0;
    return sum + qty;
  }, 0);

  const totalLotSize = legs.reduce((sum, leg) => {
    const qty = parseFloat(leg.quantity) || 0;
    const lotSize = parseFloat(leg.lotSize || '1') || 1;
    return sum + (qty * lotSize);
  }, 0);

  // Determine win/loss/breakeven status
  const isWin = realizedPnL > 0;
  const isLoss = realizedPnL < 0;
  const isBreakEven = realizedPnL === 0;

  // Create immutable snapshot
  const snapshot: HistoricalSnapshot = {
    snapshotDate: new Date().toISOString(),
    entryDate,
    exitDate: exitDate || new Date().toISOString().split('T')[0],
    legs: JSON.parse(JSON.stringify(legs)), // Deep copy to prevent mutations
    realizedPnL,
    totalQuantity,
    totalLotSize,
    legPnLBreakdown,
    isWin,
    isLoss,
    isBreakEven,
    underlyingPriceAtExit,
    notes,
  };

  // Freeze the snapshot to make it truly immutable
  Object.freeze(snapshot);
  Object.freeze(snapshot.legs);
  Object.freeze(snapshot.legPnLBreakdown);

  return snapshot;
}

/**
 * Validates that a historical snapshot has all required exit data.
 * Returns true if the snapshot is complete and trustworthy.
 */
export function isSnapshotValid(snapshot?: HistoricalSnapshot): boolean {
  if (!snapshot) return false;
  
  // Check required fields
  if (!snapshot.exitDate || !snapshot.snapshotDate) return false;
  if (!snapshot.legs || snapshot.legs.length === 0) return false;
  
  // Check that all legs have exit data
  const allLegsHaveExitData = snapshot.legs.every(leg => {
    if (leg.instrumentType === 'fut') {
      return leg.exitPrice !== undefined && leg.exitPrice !== null && leg.exitPrice !== '';
    } else {
      return leg.exitPremium !== undefined && leg.exitPremium !== null && leg.exitPremium !== '';
    }
  });
  
  return allLegsHaveExitData;
}

/**
 * Gets the display value for realized P&L, prioritizing the snapshot.
 * This ensures we always show the frozen historical value.
 */
export function getHistoricalPnL(
  snapshot?: HistoricalSnapshot,
  fallbackActualProfit?: number
): number {
  // ALWAYS prefer the snapshot if it exists and is valid
  if (snapshot && isSnapshotValid(snapshot)) {
    return snapshot.realizedPnL;
  }
  
  // Fallback to actualProfit (for backward compatibility)
  return fallbackActualProfit || 0;
}