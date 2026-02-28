from fastapi import FastAPI
from pydantic import BaseModel
from typing import Dict, List
import re
import os

app = FastAPI(title="AI Security Interceptor")

# Function to load whitelist from text files
def load_whitelist() -> Dict[str, List[str]]:
    whitelist = {}
    
    for file in os.listdir("."):
        if file.endswith(".txt") and not file.endswith("_limit.txt") and file != "requirements.txt":
            with open(file, "r") as f:
                key = file.replace(".txt", "")
                whitelist[key] = [line.strip() for line in f if line.strip()]
                
    return whitelist

# Pydantic models for the incoming request
class InterceptRequest(BaseModel):
    user_task: str
    active_account_category: str

class CategoryCreateRequest(BaseModel):
    name: str
    limit: float

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

# Final strict Pydantic model for the response schema
class InterceptResponse(BaseModel):
    decision: str
    extracted_data: ExtractedData
    context_verification: ContextVerification
    whitelist_verification: WhitelistVerification
    security_summary: str

@app.post("/api/v1/categories")
def create_category(request: CategoryCreateRequest):
    category_file = f"{request.name.lower()}.txt"
    if not os.path.exists(category_file):
        open(category_file, "w").close()
    
    limit_file = f"{request.name.lower()}_limit.txt"
    with open(limit_file, "w") as f:
        f.write(str(request.limit))
        
    return {
        "status": "success", 
        "category": request.name, 
        "limit": request.limit,
        "message": f"Created category {request.name} with limit {request.limit}"
    }

@app.post("/api/v1/intercept", response_model=InterceptResponse)
def intercept_action(request: InterceptRequest):
    whitelist = load_whitelist()
    
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

    # Validate active account category
    if request.active_account_category not in whitelist:
        context_verification.is_context_valid = False
        context_verification.context_reasoning = f"Category '{request.active_account_category}' not found in whitelist."
        return InterceptResponse(
            decision="BLOCK",
            extracted_data=extracted_data,
            context_verification=context_verification,
            whitelist_verification=whitelist_verification,
            security_summary=f"Invalid category: {request.active_account_category}"
        )
    
    context_verification.is_context_valid = True
    context_verification.context_reasoning = f"Category '{request.active_account_category}' is recognized."

    # Validate extracted domain against the whitelist for the given category
    approved_domains = whitelist[request.active_account_category]
    if extracted_domain in approved_domains:
        whitelist_verification.is_domain_approved = True
        whitelist_verification.whitelist_reasoning = f"Domain '{extracted_domain}' is approved for category '{request.active_account_category}'."
        return InterceptResponse(
            decision="ALLOW",
            extracted_data=extracted_data,
            context_verification=context_verification,
            whitelist_verification=whitelist_verification,
            security_summary="Transaction authorized. Domain and category are both approved."
        )
    else:
        whitelist_verification.is_domain_approved = False
        whitelist_verification.whitelist_reasoning = f"Domain '{extracted_domain}' is not approved for category '{request.active_account_category}'."
        return InterceptResponse(
            decision="BLOCK",
            extracted_data=extracted_data,
            context_verification=context_verification,
            whitelist_verification=whitelist_verification,
            security_summary=f"Domain {extracted_domain} is unapproved for category {request.active_account_category}."
        )
