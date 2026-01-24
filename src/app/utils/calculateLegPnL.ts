import { OptionLeg } from '../components/LegCard';

export interface PnLResult {
  value: number;
  formatted: string;
  isProfit: boolean;
  isLoss: boolean;
  isZero: boolean;
  canCalculate: boolean;
}

/**
 * Calculate realized P&L for a leg
 * Returns null if calculation cannot be performed (missing required fields)
 */
export function calculateLegPnL(leg: OptionLeg): PnLResult | null {
  // Futures P&L calculation
  if (leg.instrumentType === 'fut') {
    const entryPrice = parseFloat(leg.entryPrice || '');
    const exitPrice = parseFloat(leg.exitPrice || '');
    const lotSize = parseFloat(leg.quantity || '');

    // Check if all required fields are present and valid
    if (!leg.exitPrice || isNaN(entryPrice) || isNaN(exitPrice) || isNaN(lotSize)) {
      return null;
    }

    // Base calculation: (Exit Price - Entry Price) × Lot Size
    let pnl = (exitPrice - entryPrice) * lotSize;

    // If position is SELL, reverse the sign
    if (leg.position === 'sell') {
      pnl = -pnl;
    }

    return formatPnLResult(pnl);
  }

  // Options P&L calculation (Call or Put)
  const entryPremium = parseFloat(leg.premium || '');
  const exitPremium = parseFloat(leg.exitPremium || '');
  const quantity = parseFloat(leg.quantity || '');

  // Check if all required fields are present and valid
  if (!leg.exitPremium || isNaN(entryPremium) || isNaN(exitPremium) || isNaN(quantity)) {
    return null;
  }

  let pnl = 0;

  if (leg.instrumentType === 'call') {
    // Call Options
    if (leg.position === 'buy') {
      // BUY Call: P&L = (Exit Premium - Entry Premium) × Quantity
      pnl = (exitPremium - entryPremium) * quantity;
    } else {
      // SELL Call: P&L = (Entry Premium - Exit Premium) × Quantity
      pnl = (entryPremium - exitPremium) * quantity;
    }
  } else if (leg.instrumentType === 'put') {
    // Put Options
    if (leg.position === 'buy') {
      // BUY Put: P&L = (Exit Premium - Entry Premium) × Quantity
      pnl = (exitPremium - entryPremium) * quantity;
    } else {
      // SELL Put: P&L = (Entry Premium - Exit Premium) × Quantity
      pnl = (entryPremium - exitPremium) * quantity;
    }
  }

  return formatPnLResult(pnl);
}

/**
 * Calculate total realized P&L for all legs in a strategy
 * Returns null if any leg is missing exit prices (strategy not fully exited)
 */
export function calculateTotalRealizedPnL(legs: OptionLeg[]): number | null {
  if (!legs || legs.length === 0) {
    return null;
  }

  let totalPnL = 0;
  let hasAllExitPrices = true;

  for (const leg of legs) {
    const legPnL = calculateLegPnL(leg);
    
    if (legPnL === null) {
      // If any leg doesn't have exit price, return null
      hasAllExitPrices = false;
      break;
    }
    
    totalPnL += legPnL.value;
  }

  return hasAllExitPrices ? totalPnL : null;
}

/**
 * Check if a strategy has been fully exited (all legs have exit prices)
 */
export function isStrategyFullyExited(legs: OptionLeg[]): boolean {
  if (!legs || legs.length === 0) {
    return false;
  }

  return legs.every(leg => {
    if (leg.instrumentType === 'fut') {
      return leg.exitPrice !== undefined && leg.exitPrice !== '';
    } else {
      return leg.exitPremium !== undefined && leg.exitPremium !== '';
    }
  });
}

function formatPnLResult(pnl: number): PnLResult {
  const isProfit = pnl > 0;
  const isLoss = pnl < 0;
  const isZero = pnl === 0;

  // Format with Indian currency symbol and commas
  const absValue = Math.abs(pnl);
  const formatted = `${isProfit ? '+' : isLoss ? '-' : ''}₹${absValue.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

  return {
    value: pnl,
    formatted,
    isProfit,
    isLoss,
    isZero,
    canCalculate: true,
  };
}