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
from models import Category, Domain, History, User

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

class InterceptRequest(BaseModel):
    user_task: str
    active_account_category: str
    transaction_amount: float = 0.0

class CategoryCreateRequest(BaseModel):
    name: str
    limit: float
    domains: List[str] = []

class CategoryUpdateRequest(BaseModel):
    domains: List[str] = []

class CategoryPatchRequest(BaseModel):
    name: Optional[str] = None
    limit: Optional[float] = None

class ExtractedData(BaseModel):
    target_domain: str
    purchase_nature: str

class ContextVerification(BaseModel):
    account_category: str
    is_context_valid: bool
    context_reasoning: str

class WhitelistVerification(BaseModel):
    is_domain_approved: bool
    whitelist_reasoning: str

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
    extracted_data: ExtractedData
    context_verification: ContextVerification
    whitelist_verification: WhitelistVerification
    limit_verification: LimitVerification
    security_summary: str

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
            "domains": [d.name for d in cat.domains],
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

    if request.domains:
        for domain_name in request.domains:
            new_domain = Domain(name=domain_name, category_id=new_category.id)
            db.add(new_domain)
        db.commit()
        
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

@app.put("/api/v1/categories/{category_name}")
def update_category(category_name: str, request: CategoryUpdateRequest, db: Session = Depends(get_db)):
    db_category = db.query(Category).filter(Category.name == category_name.lower()).first()
    if not db_category:
        return {
            "status": "error",
            "message": f"Category '{category_name}' not found."
        }

    # Clear existing domains and replace them
    db.query(Domain).filter(Domain.category_id == db_category.id).delete()
    if request.domains:
        for domain_name in request.domains:
            new_domain = Domain(name=domain_name, category_id=db_category.id)
            db.add(new_domain)
    db.commit()
            
    return {
        "status": "success",
        "category": category_name,
        "message": f"Updated active domains for category '{category_name}'."
    }


# ═══════════════════════════════════════════════════════════════════════
# INTERCEPT & HISTORY ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════

@app.post("/api/v1/intercept", response_model=InterceptResponse)
def intercept_action(request: InterceptRequest, db: Session = Depends(get_db)):
    domain_match = re.search(r'(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}', request.user_task)
    extracted_domain = domain_match.group(0) if domain_match else 'https://www.google.com/search?q=unknown-domain.com'
    
    purchase_nature = request.user_task[:30]
    
    extracted_data = ExtractedData(target_domain=extracted_domain, purchase_nature=purchase_nature)
    context_verification = ContextVerification(
        account_category=request.active_account_category, 
        is_context_valid=False, 
        context_reasoning="Validating category..."
    )
    whitelist_verification = WhitelistVerification(
        is_domain_approved=False,
        whitelist_reasoning="Validating domain..."
    )

    db_category = db.query(Category).filter(Category.name == request.active_account_category.lower()).first()

    if not db_category:
        limit_verify = LimitVerification(initial_limit=0.0, remaining_budget=0.0)
        context_verification.is_context_valid = False
        context_verification.context_reasoning = f"Category '{request.active_account_category}' not found in database."
        response = InterceptResponse(
            decision="BLOCK",
            extracted_data=extracted_data,
            context_verification=context_verification,
            whitelist_verification=whitelist_verification,
            limit_verification=limit_verify,
            security_summary=f"Invalid category: {request.active_account_category}"
        )
    else:
        initial_limit = db_category.initial_limit
        remaining_budget = db_category.remaining_budget
        is_budget_sufficient = (remaining_budget - request.transaction_amount) >= 0

        limit_verify = LimitVerification(initial_limit=initial_limit, remaining_budget=remaining_budget)
        
        context_verification.is_context_valid = True
        context_verification.context_reasoning = f"Category '{request.active_account_category}' is recognized."

        approved_domains = [d.name for d in db_category.domains]
        if extracted_domain in approved_domains:
            whitelist_verification.is_domain_approved = True
            whitelist_verification.whitelist_reasoning = f"Domain '{extracted_domain}' is approved for category '{request.active_account_category}'."
            
            if not is_budget_sufficient:
                response = InterceptResponse(
                    decision="BLOCK",
                    extracted_data=extracted_data,
                    context_verification=context_verification,
                    whitelist_verification=whitelist_verification,
                    limit_verification=limit_verify,
                    security_summary=f"Transaction blocked: Insufficient budget. Cost is {request.transaction_amount} but only {remaining_budget} remaining."
                )
            else:
                if request.transaction_amount > 0:
                    db_category.remaining_budget -= request.transaction_amount
                    db.commit()
                    limit_verify.remaining_budget = db_category.remaining_budget
                        
                response = InterceptResponse(
                    decision="ALLOW",
                    extracted_data=extracted_data,
                    context_verification=context_verification,
                    whitelist_verification=whitelist_verification,
                    limit_verification=limit_verify,
                    security_summary="Transaction authorized. Domain and category are both approved."
                )
        else:
            whitelist_verification.is_domain_approved = False
            whitelist_verification.whitelist_reasoning = f"Domain '{extracted_domain}' is not approved for category '{request.active_account_category}'."
            response = InterceptResponse(
                decision="BLOCK",
                extracted_data=extracted_data,
                context_verification=context_verification,
                whitelist_verification=whitelist_verification,
                limit_verification=limit_verify,
                security_summary=f"Domain {extracted_domain} is unapproved for category {request.active_account_category}."
            )

    history_record = History(
        user_task=request.user_task,
        active_account_category=request.active_account_category,
        transaction_amount=request.transaction_amount,
        decision=response.decision,
        timestamp=datetime.datetime.utcnow()
    )
    db.add(history_record)
    db.commit()

    return response

@app.get("/api/v1/history", response_model=List[HistoryItem])
def get_history(db: Session = Depends(get_db)):
    return db.query(History).order_by(History.timestamp.desc()).all()
