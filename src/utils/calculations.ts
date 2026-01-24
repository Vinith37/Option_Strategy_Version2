/**
 * Centralized Profit/Loss Calculation Engine
 * 
 * This is the single source of truth for all P&L calculations across the app.
 * Used by: Strategy Builder, Exit Trade, Trade History, Dashboard Metrics
 */

export interface OptionLeg {
  id: string;
  type: 'call' | 'put';
  position: 'long' | 'short';
  strikePrice: number;
  premium: number;
  quantity: number;
  expiryDate?: string;
  exitPremium?: number;
}

export interface FutureLeg {
  id: string;
  type: 'future';
  position: 'long' | 'short';
  entryPrice: number;
  quantity: number;
  lotSize: number;
  exitPrice?: number;
}

export type TradeLeg = OptionLeg | FutureLeg;

/**
 * Calculate P&L for a single Option leg
 */
export function calculateOptionLegPnL(leg: OptionLeg, exitPremium?: number): number {
  const premium = exitPremium ?? leg.exitPremium ?? leg.premium;
  
  if (leg.type === 'call') {
    // Long Call: P&L = (Exit Premium - Entry Premium) × Quantity
    // Short Call: P&L = (Entry Premium - Exit Premium) × Quantity
    if (leg.position === 'long') {
      return (premium - leg.premium) * leg.quantity;
    } else {
      return (leg.premium - premium) * leg.quantity;
    }
  } else {
    // Put options
    // Long Put: P&L = (Exit Premium - Entry Premium) × Quantity
    // Short Put: P&L = (Entry Premium - Exit Premium) × Quantity
    if (leg.position === 'long') {
      return (premium - leg.premium) * leg.quantity;
    } else {
      return (leg.premium - premium) * leg.quantity;
    }
  }
}

/**
 * Calculate P&L for a single Future leg
 */
export function calculateFutureLegPnL(leg: FutureLeg, exitPrice?: number): number {
  const exit = exitPrice ?? leg.exitPrice ?? leg.entryPrice;
  
  // P&L = (Exit Price - Entry Price) × Lot Size
  // For short positions, reverse the calculation
  if (leg.position === 'long') {
    return (exit - leg.entryPrice) * leg.lotSize;
  } else {
    return (leg.entryPrice - exit) * leg.lotSize;
  }
}

/**
 * Calculate total P&L for a multi-leg strategy
 */
export function calculateStrategyPnL(legs: TradeLeg[], underlyingPrice: number): number {
  let totalPnL = 0;
  
  for (const leg of legs) {
    if ('premium' in leg) {
      // Option leg - use underlying price as exit premium for calculation
      totalPnL += calculateOptionLegPnL(leg, underlyingPrice);
    } else {
      // Future leg - use underlying price as exit price
      totalPnL += calculateFutureLegPnL(leg, underlyingPrice);
    }
  }
  
  return totalPnL;
}

/**
 * Calculate actual P&L when a trade is exited with specific exit prices
 */
export function calculateActualExitPnL(legs: TradeLeg[]): number {
  let totalPnL = 0;
  
  for (const leg of legs) {
    if ('premium' in leg) {
      // Option leg - use exitPremium if available
      if (leg.exitPremium !== undefined) {
        totalPnL += calculateOptionLegPnL(leg, leg.exitPremium);
      }
    } else {
      // Future leg - use exitPrice if available
      if (leg.exitPrice !== undefined) {
        totalPnL += calculateFutureLegPnL(leg, leg.exitPrice);
      }
    }
  }
  
  return totalPnL;
}

/**
 * Calculate Max Profit for a strategy based on payoff at different price points
 */
export function calculateMaxProfit(
  legs: TradeLeg[], 
  underlyingPrice: number,
  priceRange: { min: number; max: number }
): number {
  const pricePoints: number[] = [];
  const step = (priceRange.max - priceRange.min) / 100;
  
  // Generate 100 price points across the range
  for (let i = 0; i <= 100; i++) {
    const price = priceRange.min + (step * i);
    pricePoints.push(price);
  }
  
  // Add all strike prices to ensure we check at those exact points
  for (const leg of legs) {
    if ('strikePrice' in leg) {
      pricePoints.push(leg.strikePrice);
    }
  }
  
  // Calculate P&L at each price point
  let maxProfit = -Infinity;
  
  for (const price of pricePoints) {
    const pnl = calculatePayoffAtPrice(legs, price);
    if (pnl > maxProfit) {
      maxProfit = pnl;
    }
  }
  
  return maxProfit;
}

/**
 * Calculate Max Loss for a strategy based on payoff at different price points
 */
export function calculateMaxLoss(
  legs: TradeLeg[], 
  underlyingPrice: number,
  priceRange: { min: number; max: number }
): number {
  const pricePoints: number[] = [];
  const step = (priceRange.max - priceRange.min) / 100;
  
  // Generate 100 price points across the range
  for (let i = 0; i <= 100; i++) {
    const price = priceRange.min + (step * i);
    pricePoints.push(price);
  }
  
  // Add all strike prices to ensure we check at those exact points
  for (const leg of legs) {
    if ('strikePrice' in leg) {
      pricePoints.push(leg.strikePrice);
    }
  }
  
  // Calculate P&L at each price point
  let maxLoss = Infinity;
  
  for (const price of pricePoints) {
    const pnl = calculatePayoffAtPrice(legs, price);
    if (pnl < maxLoss) {
      maxLoss = pnl;
    }
  }
  
  return maxLoss;
}

/**
 * Calculate payoff at a specific underlying price
 * This is the core payoff engine used for charting and max profit/loss
 */
export function calculatePayoffAtPrice(legs: TradeLeg[], underlyingPrice: number): number {
  let totalPayoff = 0;
  
  for (const leg of legs) {
    if ('premium' in leg) {
      // Option leg
      const intrinsicValue = calculateOptionIntrinsicValue(
        leg.type,
        leg.strikePrice,
        underlyingPrice
      );
      
      if (leg.position === 'long') {
        // Long option: Payoff = (Intrinsic Value - Premium) × Quantity
        totalPayoff += (intrinsicValue - leg.premium) * leg.quantity;
      } else {
        // Short option: Payoff = (Premium - Intrinsic Value) × Quantity
        totalPayoff += (leg.premium - intrinsicValue) * leg.quantity;
      }
    } else {
      // Future leg
      if (leg.position === 'long') {
        totalPayoff += (underlyingPrice - leg.entryPrice) * leg.lotSize;
      } else {
        totalPayoff += (leg.entryPrice - underlyingPrice) * leg.lotSize;
      }
    }
  }
  
  return totalPayoff;
}

/**
 * Calculate intrinsic value of an option at a given underlying price
 */
export function calculateOptionIntrinsicValue(
  optionType: 'call' | 'put',
  strikePrice: number,
  underlyingPrice: number
): number {
  if (optionType === 'call') {
    return Math.max(0, underlyingPrice - strikePrice);
  } else {
    return Math.max(0, strikePrice - underlyingPrice);
  }
}

/**
 * Generate payoff chart data for visualization
 */
export function generatePayoffData(
  legs: TradeLeg[],
  underlyingPrice: number,
  priceRange?: { min: number; max: number }
): { price: number; payoff: number }[] {
  // Determine price range if not provided
  let minPrice = priceRange?.min ?? underlyingPrice * 0.8;
  let maxPrice = priceRange?.max ?? underlyingPrice * 1.2;
  
  // Adjust range based on strike prices
  for (const leg of legs) {
    if ('strikePrice' in leg) {
      minPrice = Math.min(minPrice, leg.strikePrice * 0.9);
      maxPrice = Math.max(maxPrice, leg.strikePrice * 1.1);
    }
  }
  
  const dataPoints: { price: number; payoff: number }[] = [];
  const step = (maxPrice - minPrice) / 100;
  
  for (let i = 0; i <= 100; i++) {
    const price = minPrice + (step * i);
    const payoff = calculatePayoffAtPrice(legs, price);
    dataPoints.push({ price, payoff });
  }
  
  return dataPoints;
}

/**
 * Calculate breakeven points for a strategy
 */
export function calculateBreakevenPoints(
  legs: TradeLeg[],
  underlyingPrice: number
): number[] {
  const breakevenPoints: number[] = [];
  const payoffData = generatePayoffData(legs, underlyingPrice);
  
  for (let i = 1; i < payoffData.length; i++) {
    const prev = payoffData[i - 1];
    const curr = payoffData[i];
    
    // Check if payoff crosses zero between these two points
    if ((prev.payoff < 0 && curr.payoff >= 0) || (prev.payoff > 0 && curr.payoff <= 0)) {
      // Linear interpolation to find exact breakeven price
      const slope = (curr.payoff - prev.payoff) / (curr.price - prev.price);
      const breakevenPrice = prev.price - (prev.payoff / slope);
      breakevenPoints.push(breakevenPrice);
    }
  }
  
  return breakevenPoints;
}
