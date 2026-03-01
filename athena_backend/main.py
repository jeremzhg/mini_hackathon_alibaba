from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import re
import datetime
import hashlib
import uuid
from sqlalchemy.orm import Session
from database import engine, Base, get_db
from models import Category, Transaction, History, User
import google.generativeai as genai
import os

genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Security Interceptor")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Helpers ─────────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

# ── Pydantic models ─────────────────────────────────────────────────────

class CategoryCreateRequest(BaseModel):
    name: str
    limit: float

class CategoryPatchRequest(BaseModel):
    name: Optional[str] = None
    limit: Optional[float] = None

class ContextVerification(BaseModel):
    account_category: str
    is_context_valid: bool
    context_reasoning: str

class LimitVerification(BaseModel):
    initial_limit: float
    remaining_budget: float

class HistoryItem(BaseModel):
    id: int
    user_task: str
    active_account_category: str
    transaction_amount: float
    decision: str
    timestamp: datetime.datetime

    class Config:
        orm_mode = True
        from_attributes = True

class InterceptResponse(BaseModel):
    decision: str
    context_verification: ContextVerification
    limit_verification: LimitVerification
    security_summary: str

class ShopeeCreateTransactionRequest(BaseModel):
    amount: float
    merchant_id: str
    category: str
    purpose: str

class ShopeeCreateTransactionResponse(BaseModel):
    transaction_id: int

class AuthorizeTransactionRequest(BaseModel):
    account_id: str
    transaction_id: int

# Auth models
class SignupRequest(BaseModel):
    email: str
    password: str
    name: str = ""

class LoginRequest(BaseModel):
    email: str
    password: str

# Settings models
class ProfileUpdateRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    timezone: Optional[str] = None
    two_fa_enabled: Optional[bool] = None
    session_timeout: Optional[int] = None
    email_notifications: Optional[bool] = None
    threat_alerts: Optional[bool] = None
    weekly_report: Optional[bool] = None
    agent_status_alerts: Optional[bool] = None

class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str



# ═══════════════════════════════════════════════════════════════════════
# AUTH ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════

@app.post("/api/v1/auth/signup")
def signup(request: SignupRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == request.email.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=request.email.lower(),
        password_hash=hash_password(request.password),
        name=request.name or request.email.split("@")[0],
        api_key=f"ak_live_{uuid.uuid4().hex}",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "status": "success",
        "user_id": user.id,
        "email": user.email,
        "name": user.name,
        "message": "Account created successfully",
    }


@app.post("/api/v1/auth/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email.lower()).first()
    if not user or user.password_hash != hash_password(request.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    return {
        "status": "success",
        "user_id": user.id,
        "email": user.email,
        "name": user.name,
        "message": "Login successful",
    }


# ═══════════════════════════════════════════════════════════════════════
# SETTINGS ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════

def _get_first_user(db: Session) -> User:
    """Helper: get first user or raise 404."""
    user = db.query(User).first()
    if not user:
        raise HTTPException(status_code=404, detail="No user found. Please sign up first.")
    return user


@app.get("/api/v1/settings/profile")
def get_profile(db: Session = Depends(get_db)):
    user = _get_first_user(db)
    return {
        "name": user.name,
        "email": user.email,
        "timezone": user.timezone,
        "two_fa_enabled": user.two_fa_enabled,
        "session_timeout": user.session_timeout,
        "email_notifications": user.email_notifications,
        "threat_alerts": user.threat_alerts,
        "weekly_report": user.weekly_report,
        "agent_status_alerts": user.agent_status_alerts,
        "api_key": user.api_key,
    }


@app.put("/api/v1/settings/profile")
def update_profile(request: ProfileUpdateRequest, db: Session = Depends(get_db)):
    user = _get_first_user(db)

    if request.name is not None:
        user.name = request.name
    if request.email is not None:
        user.email = request.email.lower()
    if request.timezone is not None:
        user.timezone = request.timezone
    if request.two_fa_enabled is not None:
        user.two_fa_enabled = request.two_fa_enabled
    if request.session_timeout is not None:
        user.session_timeout = request.session_timeout
    if request.email_notifications is not None:
        user.email_notifications = request.email_notifications
    if request.threat_alerts is not None:
        user.threat_alerts = request.threat_alerts
    if request.weekly_report is not None:
        user.weekly_report = request.weekly_report
    if request.agent_status_alerts is not None:
        user.agent_status_alerts = request.agent_status_alerts

    db.commit()

    return {"status": "success", "message": "Profile updated"}


@app.put("/api/v1/settings/password")
def change_password(request: PasswordChangeRequest, db: Session = Depends(get_db)):
    user = _get_first_user(db)

    if user.password_hash != hash_password(request.current_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    user.password_hash = hash_password(request.new_password)
    db.commit()

    return {"status": "success", "message": "Password changed successfully"}


@app.post("/api/v1/settings/api-key/regenerate")
def regenerate_api_key(db: Session = Depends(get_db)):
    user = _get_first_user(db)
    user.api_key = f"ak_live_{uuid.uuid4().hex}"
    db.commit()

    return {"status": "success", "api_key": user.api_key}


# ═══════════════════════════════════════════════════════════════════════
# CATEGORY ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════

@app.get("/api/v1/categories")
def list_categories(db: Session = Depends(get_db)):
    categories = db.query(Category).all()
    return [
        {
            "id": cat.id,
            "name": cat.name,
            "initial_limit": cat.initial_limit,
            "remaining_budget": cat.remaining_budget,
        }
        for cat in categories
    ]

@app.post("/api/v1/categories")
def create_category(request: CategoryCreateRequest, db: Session = Depends(get_db)):
    db_category = db.query(Category).filter(Category.name == request.name.lower()).first()
    if db_category:
        raise HTTPException(status_code=400, detail="Category already exists")

    new_category = Category(
        name=request.name.lower(),
        initial_limit=request.limit,
        remaining_budget=request.limit
    )
    db.add(new_category)
    db.commit()
    db.refresh(new_category)


    return {
        "status": "success", 
        "category": new_category.name, 
        "limit": new_category.initial_limit,
        "message": f"Created category {new_category.name} with limit {new_category.initial_limit}"
    }

@app.patch("/api/v1/categories/{category_name}")
def patch_category(category_name: str, request: CategoryPatchRequest, db: Session = Depends(get_db)):
    db_category = db.query(Category).filter(Category.name == category_name.lower()).first()
    if not db_category:
        raise HTTPException(status_code=404, detail=f"Category '{category_name}' not found.")

    if request.name is not None:
        # Check for name conflicts
        existing = db.query(Category).filter(Category.name == request.name.lower()).first()
        if existing and existing.id != db_category.id:
            raise HTTPException(status_code=400, detail=f"Category '{request.name}' already exists.")
        db_category.name = request.name.lower()
    
    if request.limit is not None:
        # Adjust remaining budget proportionally
        if db_category.initial_limit > 0:
            spent = db_category.initial_limit - db_category.remaining_budget
            db_category.remaining_budget = max(request.limit - spent, 0)
        else:
            db_category.remaining_budget = request.limit
        db_category.initial_limit = request.limit

    db.commit()

    return {
        "status": "success",
        "category": db_category.name,
        "initial_limit": db_category.initial_limit,
        "remaining_budget": db_category.remaining_budget,
        "message": f"Category '{db_category.name}' updated.",
    }

@app.delete("/api/v1/categories/{category_name}")
def delete_category(category_name: str, db: Session = Depends(get_db)):
    db_category = db.query(Category).filter(Category.name == category_name.lower()).first()
    if not db_category:
        raise HTTPException(status_code=404, detail=f"Category '{category_name}' not found.")

    db.delete(db_category)
    db.commit()

    return {
        "status": "success",
        "message": f"Category '{category_name}' deleted.",
    }



# ═══════════════════════════════════════════════════════════════════════
# INTERCEPT & HISTORY ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════

@app.post("/api/v1/shopee/create_transaction", response_model=ShopeeCreateTransactionResponse)
def create_shopee_transaction(request: ShopeeCreateTransactionRequest, db: Session = Depends(get_db)):
    transaction = Transaction(
        amount=request.amount,
        merchant_id=request.merchant_id,
        category_name=request.category,
        purpose=request.purpose,
        status="pending"
    )
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    return {"transaction_id": 1} # Hardcoded for demo as requested

@app.post("/api/v1/authorize", response_model=InterceptResponse)
def authorize_transaction(request: AuthorizeTransactionRequest, db: Session = Depends(get_db)):
    # Since ID is hardcoded to 1 in demo, we just fetch the latest transaction created
    transaction = db.query(Transaction).order_by(Transaction.id.desc()).first()
    
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    context_verification = ContextVerification(
        account_category=request.account_id, 
        is_context_valid=False, 
        context_reasoning="Validating category..."
    )

    db_category = db.query(Category).filter(Category.name == request.account_id.lower()).first()

    if not db_category:
        limit_verify = LimitVerification(initial_limit=0.0, remaining_budget=0.0)
        context_verification.is_context_valid = False
        context_verification.context_reasoning = f"Category '{request.account_id}' not found in database."
        response = InterceptResponse(
            decision="BLOCK",
            context_verification=context_verification,
            limit_verification=limit_verify,
            security_summary=f"Invalid category: {request.account_id}"
        )
    else:
        initial_limit = db_category.initial_limit
        remaining_budget = db_category.remaining_budget
        is_budget_sufficient = (remaining_budget - transaction.amount) >= 0

        limit_verify = LimitVerification(initial_limit=initial_limit, remaining_budget=remaining_budget)
        
        # Call Gemini to check context
        prompt = f"Account category is '{db_category.name}'. The user's intended purchase is '{transaction.purpose}'. Is this purchase relevant to the account purpose? Answer only 'YES' or 'NO'."
        
        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
            res = model.generate_content(prompt)
            answer = res.text.strip().upper()
            is_valid_context = "YES" in answer
        except Exception as e:
            is_valid_context = False
            answer = f"Error calling Gemini: {e}"

        if is_valid_context:
            context_verification.is_context_valid = True
            context_verification.context_reasoning = "Gemini verified purchase is relevant."
            
            if not is_budget_sufficient:
                response = InterceptResponse(
                    decision="BLOCK",
                    context_verification=context_verification,
                    limit_verification=limit_verify,
                    security_summary=f"Transaction blocked: Insufficient budget. Cost is {transaction.amount} but only {remaining_budget} remaining."
                )
            else:
                if transaction.amount > 0:
                    db_category.remaining_budget -= transaction.amount
                    transaction.status = "approved"
                    db.commit()
                    limit_verify.remaining_budget = db_category.remaining_budget
                        
                response = InterceptResponse(
                    decision="ALLOW",
                    context_verification=context_verification,
                    limit_verification=limit_verify,
                    security_summary="Transaction authorized. Context and budget are both approved."
                )
        else:
            context_verification.is_context_valid = False
            context_verification.context_reasoning = f"Gemini rejected context: {answer}"
            transaction.status = "rejected"
            db.commit()
            
            response = InterceptResponse(
                decision="BLOCK",
                context_verification=context_verification,
                limit_verification=limit_verify,
                security_summary=f"Purchase '{transaction.purpose}' is not relevant for category '{request.account_id}'."
            )

    history_record = History(
        user_task=transaction.purpose,
        active_account_category=request.account_id,
        transaction_amount=transaction.amount,
        decision=response.decision,
        timestamp=datetime.datetime.utcnow()
    )
    db.add(history_record)
    db.commit()

    return response

@app.get("/api/v1/history", response_model=List[HistoryItem])
def get_history(db: Session = Depends(get_db)):
    return db.query(History).order_by(History.timestamp.desc()).all()
