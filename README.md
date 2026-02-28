# AI Security Interceptor

A functional FastAPI mock backend designed to act as middleware. It prevents autonomous AI agents from making unauthorized financial transactions by validating domains against a provided whitelist based on the active account category.

## Features
- Validates the `active_account_category` against the provided whitelist (loaded from `.txt` files).
- Extracts a domain/URL from a natural language `user_task` using regex.
- Checks if the extracted domain is approved in the whitelist for the specific category.
- Returns a strict JSON response with a decision (`ALLOW` or `BLOCK`) and detailed reasoning.

## Setup

1. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the server**:
   ```bash
   uvicorn main:app --reload
   ```
   The server will start at `http://127.0.0.1:8000`.

## Whitelists

The backend automatically loads domains from `.txt` files in the same directory:
- `cloud.txt` (Loaded as the "Cloud" category)
- `groceries.txt` (Loaded as the "Grocery" category)

Add one domain per line in these files.

## How to Use

You can test the API by sending a `POST` request to `/api/v1/intercept`. 

You can use the interactive Swagger UI by navigating to `http://127.0.0.1:8000/docs` in your browser.

### Example Request (ALLOW)

Here is a sample `curl` command simulating an authorized Cloud transaction:

```bash
curl -X 'POST' \
  'http://127.0.0.1:8000/api/v1/intercept' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "user_task": "Pay for the new database servers at aws.amazon.com immediately.",
  "active_account_category": "Cloud"
}'
```

**Expected Response**:
```json
{
  "decision": "ALLOW",
  "extracted_data": {
    "target_domain": "aws.amazon.com",
    "purchase_nature": "Pay for the new database serve"
  },
  "context_verification": {
    "account_category": "Cloud",
    "is_context_valid": true,
    "context_reasoning": "Category '\''Cloud'\'' is recognized."
  },
  "whitelist_verification": {
    "is_domain_approved": true,
    "whitelist_reasoning": "Domain '\''aws.amazon.com'\'' is approved for category '\''Cloud'\''."
  },
  "security_summary": "Transaction authorized. Domain and category are both approved."
}
```

### Example Request (BLOCK)

If the AI tries to buy groceries using the Cloud account budget:

```bash
curl -X 'POST' \
  'http://127.0.0.1:8000/api/v1/intercept' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "user_task": "Order 50 apples from walmart.com",
  "active_account_category": "Cloud"
}'
```

**Expected Response**:
```json
{
  "decision": "BLOCK",
  "extracted_data": {
    "target_domain": "walmart.com",
    "purchase_nature": "Order 50 apples from walmart.c"
  },
  "context_verification": {
    "account_category": "Cloud",
    "is_context_valid": true,
    "context_reasoning": "Category '\''Cloud'\'' is recognized."
  },
  "whitelist_verification": {
    "is_domain_approved": false,
    "whitelist_reasoning": "Domain '\''walmart.com'\'' is not approved for category '\''Cloud'\''."
  },
  "security_summary": "Domain walmart.com is unapproved for category Cloud."
}
```
