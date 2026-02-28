from fastapi import FastAPI
from pydantic import BaseModel
from typing import Dict, List
import re
import os

app = FastAPI(title="AI Security Interceptor")

# Function to load whitelist from text files
def load_whitelist() -> Dict[str, List[str]]:
    whitelist = {}
    
    if os.path.exists("cloud.txt"):
        with open("cloud.txt", "r") as f:
            whitelist["Cloud"] = [line.strip() for line in f if line.strip()]
    else:
        whitelist["Cloud"] = []
        
    if os.path.exists("groceries.txt"):
        with open("groceries.txt", "r") as f:
            whitelist["Grocery"] = [line.strip() for line in f if line.strip()]
    else:
        whitelist["Grocery"] = []
        
    return whitelist

# Pydantic models for the incoming request
class InterceptRequest(BaseModel):
    user_task: str
    active_account_category: str

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
