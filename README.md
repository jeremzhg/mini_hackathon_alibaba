# AI Security Interceptor

A functional FastAPI mock backend designed to act as middleware. It prevents autonomous AI agents from making unauthorized financial transactions by validating the intent of the purchase against the active account category using a Gemini LLM.

## Features

- Mocks a checkout flow (e.g., from Shopee) to generate pending transactions.
- Uses **Gemini 2.5 Flash** to semantically verify if the `purpose` of the transaction aligns with the `active_account_category`.
- Tracks spending budgets dynamically stored in a PostgreSQL database.
- Returns a strict JSON response with a decision (`ALLOW` or `BLOCK`), detailed reasoning, and limit verifications.

## Setup

1. **Install dependencies** (requires [uv](https://docs.astral.sh/uv/)):

   ```bash
   cd athena_backend
   uv sync
   ```

2. **Database Configuration**:
   The backend uses a PostgreSQL database. Set the `DATABASE_URL` environment variable if your database is not local, and make sure to configure your `GEMINI_API_KEY`:

   ```bash
   export DATABASE_URL="postgresql://user:password@localhost:5432/dbname"
   export GEMINI_API_KEY="your_api_key_here"
   ```

   _By default, it will attempt to connect to: `postgresql://postgres:postgres@localhost:5432/postgres` if no URL is provided._

3. **Run the server**:
   ```bash
   uv run uvicorn main:app --reload
   ```
   The backend will automatically generate the required database tables upon startup!

## Budgets & Categories

The backend automatically manages categories and tracking budgets within the PostgreSQL database via SQLAlchemy models (`categories` and `transactions` tables).

You can populate these tables directly or utilize the exposed `/api/v1/categories` endpoints to do so automatically.

### Example: Creating a Category

1. Method: `POST`
2. URL: `http://127.0.0.1:8000/api/v1/categories`

**Request Body**:

```json
{
  "name": "cloud",
  "limit": 5000.0
}
```

**Expected Response**:

```json
{
  "status": "success",
  "category": "cloud",
  "limit": 5000.0,
  "message": "Created category cloud with limit 5000.0"
}
```

## How to Use

You can test the API by simulating a transaction creation and then authorizing it.

You can use the interactive Swagger UI by navigating to `http://127.0.0.1:8000/docs` in your browser.

### Example Flow

**Step 1. Create a Pending Transaction (Shopee Mock)**

1. Method: `POST`
2. URL: `http://127.0.0.1:8000/api/v1/shopee/create_transaction`

**Request Body**:

```json
{
  "amount": 1000.0,
  "merchant_id": "shopee_1",
  "category": "cloud",
  "purpose": "Pay for the new database servers at AWS immediately."
}
```

**Expected Response**:

```json
{
  "transaction_id": 1
}
```

**Step 2. Authorize the Transaction via AI Verification**

This simulates the Agent supplying its assigned account ID array to complete the purchase.

1. Method: `POST`
2. URL: `http://127.0.0.1:8000/api/v1/authorize`

**Request Body**:

```json
{
  "account_id": "cloud",
  "transaction_id": 1
}
```

**Expected Response**:

```json
{
  "decision": "ALLOW",
  "context_verification": {
    "account_category": "cloud",
    "is_context_valid": true,
    "context_reasoning": "Gemini verified purchase is relevant."
  },
  "limit_verification": {
    "initial_limit": 5000.0,
    "remaining_budget": 4000.0
  },
  "security_summary": "Transaction authorized. Context and budget are both approved."
}
```

If the purpose was "Buy a new smartphone" instead, Gemini would reject the context match for the "cloud" category, and the transaction would be `BLOCK`ed.
