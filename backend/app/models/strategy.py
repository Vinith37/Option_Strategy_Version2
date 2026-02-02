import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, Text, Numeric, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base

class Strategy(Base):
    __tablename__ = "strategies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    name = Column(String, nullable=False)
    strategy_type = Column(String, nullable=False)  # e.g. "straddle", "iron_condor"
    status = Column(String, nullable=False, default="current")

    entry_date = Column(Date, nullable=False)
    expiry_date = Column(Date, nullable=False)
    exit_date = Column(Date)

    parameters = Column(JSON, nullable=False, default=dict)
    custom_legs = Column(JSON, nullable=True, default=list)
    notes = Column(Text, nullable=True)  # User notes
    
    actual_profit = Column(Numeric)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    config = Column(JSON, nullable=False, default=dict)  # legs, strikes, expiry, etc
    historical_snapshot = Column(JSON)
