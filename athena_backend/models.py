from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from database import Base
import datetime
import uuid

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    initial_limit = Column(Float, default=0.0)
    remaining_budget = Column(Float, default=0.0)

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    amount = Column(Float)
    merchant_id = Column(String)
    category_name = Column(String)
    purpose = Column(String)
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class History(Base):
    __tablename__ = "history"

    id = Column(Integer, primary_key=True, index=True)
    user_task = Column(String)
    active_account_category = Column(String)
    transaction_amount = Column(Float)
    decision = Column(String)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, default="")
    timezone = Column(String, default="utc+7")
    two_fa_enabled = Column(Boolean, default=False)
    session_timeout = Column(Integer, default=30)
    email_notifications = Column(Boolean, default=True)
    threat_alerts = Column(Boolean, default=True)
    weekly_report = Column(Boolean, default=False)
    agent_status_alerts = Column(Boolean, default=True)
    api_key = Column(String, default=lambda: f"ak_live_{uuid.uuid4().hex}")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
