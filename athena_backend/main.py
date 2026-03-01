from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import re
import datetime
from sqlalchemy.orm import Session
from database import engine, Base, get_db
from models import Category, Domain, History

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

# Pydantic models for the incoming request
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

# Pydantic models for response verification details
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

# Final strict Pydantic model for the response schema
class InterceptResponse(BaseModel):
    decision: str
    extracted_data: ExtractedData
    context_verification: ContextVerification
    whitelist_verification: WhitelistVerification
    limit_verification: LimitVerification
    security_summary: str

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

@app.post("/api/v1/intercept", response_model=InterceptResponse)
def intercept_action(request: InterceptRequest, db: Session = Depends(get_db)):
    # Extract domain using regex, default to a google search URL if not found
    domain_match = re.search(r'(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}', request.user_task)
    extracted_domain = domain_match.group(0) if domain_match else 'https://www.google.com/search?q=unknown-domain.com'
    
    # Mock extraction for purchase nature, take first 30 chars
    purchase_nature = request.user_task[:30]
    
    # Initialize verifications
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

        # Validate extracted domain against the database for the given category
        approved_domains = [d.name for d in db_category.domains]
        if extracted_domain in approved_domains:
            whitelist_verification.is_domain_approved = True
            whitelist_verification.whitelist_reasoning = f"Domain '{extracted_domain}' is approved for category '{request.active_account_category}'."
            
            # Check budget limits
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
                # Deduct budget
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
