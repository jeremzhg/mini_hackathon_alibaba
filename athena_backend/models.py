from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
import datetime

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    initial_limit = Column(Float, default=0.0)
    remaining_budget = Column(Float, default=0.0)

    domains = relationship("Domain", back_populates="category", cascade="all, delete-orphan")

class Domain(Base):
    __tablename__ = "domains"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"))

    category = relationship("Category", back_populates="domains")

class History(Base):
    __tablename__ = "history"

    id = Column(Integer, primary_key=True, index=True)
    user_task = Column(String)
    active_account_category = Column(String)
    transaction_amount = Column(Float)
    decision = Column(String)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
