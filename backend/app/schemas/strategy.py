from pydantic import BaseModel, Field, validator
from typing import Optional, Dict, List, Any
from datetime import datetime, date
from uuid import UUID

class PayoffRequest(BaseModel):
    """Request schema for payoff calculation."""
    strategy_type: str = Field(..., description="Type of strategy (covered-call, bull-call-spread, etc.)")
    entry_date: str = Field(..., description="Entry date in YYYY-MM-DD format")
    expiry_date: str = Field(..., description="Expiry date in YYYY-MM-DD format")
    parameters: Optional[Dict[str, Any]] = Field(default={}, description="Strategy parameters")
    underlying_price: Optional[float] = Field(default=18000, description="Current underlying price")
    price_range_percent: Optional[float] = Field(default=30, ge=10, le=100, description="Price range percentage (10-100)")
    custom_legs: Optional[List[Dict[str, Any]]] = Field(default=None, description="Custom strategy legs")
    
    @validator("price_range_percent")
    def validate_price_range(cls, v):
        if v < 10 or v > 100:
            raise ValueError("price_range_percent must be between 10 and 100")
        return v

class PayoffDataPoint(BaseModel):
    """Single data point in payoff diagram."""
    price: float = Field(..., description="Underlying price")
    pnl: float = Field(..., description="Profit/Loss at this price")

class StrategyCreate(BaseModel):
    name: str
    strategy_type: str
    entry_date: str
    expiry_date: str
    parameters: Dict[str, Any] = {}
    custom_legs: Optional[List[Dict[str, Any]]] = None
    notes: Optional[str] = None

    
class StrategyUpdate(BaseModel):
    """Schema for updating an existing strategy."""
    status: Optional[str] = None
    exit_date: Optional[date] = None
    actual_profit: Optional[float] = None
    historical_snapshot: Optional[Dict[str, Any]] = None
    config: Optional[Dict[str, Any]] = None


class StrategyResponse(BaseModel):
    """Schema for strategy response."""
    id: UUID
    name: str
    strategy_type: str
    entry_date: date
    expiry_date: date
    parameters: Dict[str, Any]
    custom_legs: Optional[List[Dict[str, Any]]]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True  # For SQLAlchemy model conversion


class StandardResponse(BaseModel):
    """Standard API response format."""
    success: bool = Field(..., description="Whether the operation was successful")
    message: str = Field(..., description="Human-readable message")
    data: Optional[Any] = Field(default=None, description="Response data")