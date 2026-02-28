# AI Security Interceptor

A functional FastAPI mock backend designed to act as middleware. It prevents autonomous AI agents from making unauthorized financial transactions by validating domains against a provided whitelist based on the active account category.

## Features
- Validates the `active_account_category` against the provided whitelist (loaded dynamically from `category/*.txt` files).
- Tracks spending budgets dynamically stored in `limit/` and `current/` directories.
- Extracts a domain/URL from a natural language `user_task` using regex.
- Checks if the extracted domain is approved in the whitelist for the specific category.
- Returns a strict JSON response with a decision (`ALLOW` or `BLOCK`), detailed reasoning, and limit verifications.

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

## Whitelists & Limits

The backend automatically loads categories, domains, and budgets from the following folders in the root directory:
- `category/`: Contains `.txt` files where the name of the file represents the category and the contents represent whitelisted domains (one domain per line).
- `limit/`: Contains original, unchanging budget constraints formatted as `{category}_limit.txt`.
- `current/`: Contains actively tracked remaining budgets formatted as `{category}_current.txt` that are reduced dynamically.

You can populate these files manually or utilize the `/api/v1/categories` endpoint to do so automatically.

## How to Use

You can test the API by sending a `POST` request to `/api/v1/intercept`. 

You can use the interactive Swagger UI by navigating to `http://127.0.0.1:8000/docs` in your browser.

### Create a Category

Send a `POST` request to `/api/v1/categories` to create a new category and give it an initial maximum budget limit.

1. Method: `POST`
2. URL: `http://127.0.0.1:8000/api/v1/categories`

**Request Body**:
```json
{
  "name": "cloud",
  "limit": 5000.00,
  "domains": [
    "aws.amazon.com",
    "azure.com",
    "cloud.google.com"
  ]
}
```

Afterward, the file `category/cloud.txt` will automatically be created and populated with the allowed domains!

### Update a Category

To change the domains for an existing category, send a `PUT` request with the complete replacing list of domains:

1. Method: `PUT`
2. URL: `http://127.0.0.1:8000/api/v1/categories/cloud`

**Request Body**:
```json
{
  "domains": [
    "aws.amazon.com"
  ]
}
```

### Example Request (ALLOW)

Here is a sample request simulating an authorized Cloud transaction, attempting to subtract from the tracked limit:

1. Method: `POST`
2. URL: `http://127.0.0.1:8000/api/v1/intercept`

**Request Body**:
```json
{
  "user_task": "Pay for the new database servers at aws.amazon.com immediately.",
  "active_account_category": "cloud",
  "transaction_amount": 1000.00
}
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
    "account_category": "cloud",
    "is_context_valid": true,
    "context_reasoning": "Category '\''cloud'\'' is recognized."
  },
  "whitelist_verification": {
    "is_domain_approved": true,
    "whitelist_reasoning": "Domain '\''aws.amazon.com'\'' is approved for category '\''cloud'\''."
  },
  "limit_verification": {
    "initial_limit": 5000.0,
    "remaining_budget": 4000.0
  },
  "security_summary": "Transaction authorized. Domain and category are both approved."
}
```

### Example Request (BLOCK)

If the AI tries to buy groceries using the Cloud account budget:

**Postman Setup**:
1. Method: `POST`
2. URL: `http://127.0.0.1:8000/api/v1/intercept`
3. Body tab -> raw -> JSON

**Request Body**:
```json
{
  "user_task": "Order 50 apples from walmart.com",
  "active_account_category": "cloud",
  "transaction_amount": 25.00
}
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
    "account_category": "cloud",
    "is_context_valid": true,
    "context_reasoning": "Category '\''cloud'\'' is recognized."
  },
  "whitelist_verification": {
    "is_domain_approved": false,
    "whitelist_reasoning": "Domain '\''walmart.com'\'' is not approved for category '\''cloud'\''."
  },
  "limit_verification": {
    "initial_limit": 5000.0,
    "remaining_budget": 4000.0
  },
  "security_summary": "Domain walmart.com is unapproved for category cloud."
}
```
