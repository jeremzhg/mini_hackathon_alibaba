# AI Security Interceptor

A functional FastAPI mock backend designed to act as middleware. It prevents autonomous AI agents from making unauthorized financial transactions by validating domains against a provided whitelist based on the active account category.

## Features

- Validates the `active_account_category` against the provided whitelist (loaded dynamically from `category/*.txt` files).
- Tracks spending budgets dynamically stored in `limit/` and `current/` directories.
- Extracts a domain/URL from a natural language `user_task` using regex.
- Checks if the extracted domain is approved in the whitelist for the specific category.
- Returns a strict JSON response with a decision (`ALLOW` or `BLOCK`), detailed reasoning, and limit verifications.

## Setup

1. **Install dependencies** (requires [uv](https://docs.astral.sh/uv/)):

   ```bash
   cd athena_backend
   uv sync
   ```

2. **Database Configuration**:
   The backend uses a PostgreSQL database. Set the `DATABASE_URL` environment variable if your database is not local:
   _Linux/Mac_:

   ```bash
   export DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
   ```

   _Windows (PowerShell)_:

   ```powershell
   $env:DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
   ```

   By default, it will attempt to connect to: `postgresql://postgres:postgres@localhost:5432/postgres`

3. **Run the server**:
   ```bash
   uv run uvicorn main:app --reload
   ```
   The backend will automatically generate the required database tables upon startup!

## Whitelists & Limits

The backend automatically manages categories, domain whitelists, and tracking budgets within the PostgreSQL database via SQLAlchemy models (`categories` and `domains` tables).

You can populate these tables directly or utilize the exposed `/api/v1/categories` endpoints to do so automatically.

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
  "limit": 5000.0,
  "domains": ["aws.amazon.com", "azure.com", "cloud.google.com"]
}
```

Afterward, the database will contain the new `cloud` category and its allowed domains!

### Update a Category

To change the domains for an existing category, send a `PUT` request with the complete replacing list of domains:

1. Method: `PUT`
2. URL: `http://127.0.0.1:8000/api/v1/categories/cloud`

**Request Body**:

```json
{
  "domains": ["aws.amazon.com"]
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
  "transaction_amount": 1000.0
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
  "transaction_amount": 25.0
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

### View History

To retrieve all previously executed interception decisions, send a `GET` request to the `/api/v1/history` endpoint. The records will be returned sorted from newest to oldest.

1. Method: `GET`
2. URL: `http://127.0.0.1:8000/api/v1/history`

**Expected Response**:

```json
[
  {
    "id": 1,
    "user_task": "Pay for the new database servers at aws.amazon.com immediately.",
    "active_account_category": "cloud",
    "transaction_amount": 1000.0,
    "decision": "ALLOW",
    "timestamp": "2023-10-27T10:00:00.000000"
  }
]
```
