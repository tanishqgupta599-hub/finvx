# Fintech API Documentation

## Overview

This fintech solution provides comprehensive financial management APIs for individuals, including expense tracking, insurance management, credit card advisor, money splitting between friends, and full financial planning capabilities.

## Base URL

All API endpoints are prefixed with `/api/`

## Authentication

All endpoints require authentication via Clerk. The user must be authenticated to access any endpoint.

## API Endpoints

### Transactions

#### GET `/api/transactions`
Fetch all transactions with optional filters.

**Query Parameters:**
- `startDate` (optional): Filter transactions from this date
- `endDate` (optional): Filter transactions to this date
- `category` (optional): Filter by transaction category
- `limit` (optional): Limit number of results
- `offset` (optional): Offset for pagination

**Response:**
```json
[
  {
    "id": "string",
    "userId": "string",
    "date": "ISO date",
    "amount": "number",
    "description": "string",
    "category": "income|spending|transfer|grocery|entertainment|utilities|shopping|travel|health|dining|other",
    "account": "string"
  }
]
```

#### POST `/api/transactions`
Create a new transaction.

**Request Body:**
```json
{
  "date": "ISO date",
  "amount": "number",
  "description": "string",
  "category": "income|spending|transfer|...",
  "account": "string",
  "paymentSource": {
    "id": "string",
    "type": "asset|creditCard"
  }
}
```

#### GET `/api/transactions/[id]`
Get a single transaction by ID.

#### PATCH `/api/transactions/[id]`
Update a transaction.

#### DELETE `/api/transactions/[id]`
Delete a transaction.

---

### Credit Cards

#### GET `/api/credit-cards`
Fetch all credit cards.

**Response:**
```json
[
  {
    "id": "string",
    "name": "string",
    "brand": "visa|mastercard|amex|discover|other",
    "last4": "string",
    "limit": "number",
    "balance": "number",
    "apr": "number",
    "billDueDate": "ISO date",
    "billAmount": "number",
    "pointsBalance": "number",
    "rewardProgram": "string",
    "annualFee": "number"
  }
]
```

#### POST `/api/credit-cards`
Create a new credit card.

**Request Body:**
```json
{
  "brand": "visa|mastercard|amex|discover|other",
  "last4": "string",
  "limit": "number",
  "balance": "number",
  "apr": "number",
  "name": "string",
  "billDueDate": "ISO date",
  "billAmount": "number",
  "pointsBalance": "number",
  "rewardProgram": "string",
  "annualFee": "number"
}
```

#### GET `/api/credit-cards/[id]`
Get a single credit card.

#### PATCH `/api/credit-cards/[id]`
Update a credit card.

#### DELETE `/api/credit-cards/[id]`
Delete a credit card.

#### GET `/api/credit-cards/advisor`
Get credit card recommendations and insights.

**Response:**
```json
{
  "summary": {
    "totalCards": "number",
    "totalCreditLimit": "number",
    "totalBalance": "number",
    "totalUtilization": "string",
    "avgAPR": "string",
    "availableCredit": "number"
  },
  "recommendations": [
    {
      "type": "warning|info|suggestion",
      "title": "string",
      "message": "string",
      "priority": "high|medium|low"
    }
  ],
  "highUtilizationCards": [...],
  "upcomingBills": [...],
  "bestCardsForSpending": [...]
}
```

---

### Insurance

#### GET `/api/insurance`
Fetch all insurance policies.

#### POST `/api/insurance`
Create a new insurance policy.

**Request Body:**
```json
{
  "type": "health|life|home|auto|other",
  "provider": "string",
  "premium": "number",
  "coverageAmount": "number",
  "renewalDate": "ISO date"
}
```

#### GET `/api/insurance/[id]`
Get a single insurance policy.

#### PATCH `/api/insurance/[id]`
Update an insurance policy.

#### DELETE `/api/insurance/[id]`
Delete an insurance policy.

---

### Expense Circles (Money Splitting)

#### GET `/api/circles`
Fetch all expense circles (where user is owner or member).

**Response:**
```json
[
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "emoji": "string",
    "owner": {...},
    "members": [...],
    "expenses": [...]
  }
]
```

#### POST `/api/circles`
Create a new expense circle.

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "emoji": "string",
  "memberIds": ["string"]
}
```

#### GET `/api/circles/[id]`
Get a single expense circle with balance calculations.

**Response includes:**
- Circle details
- Member balances (who owes whom)

#### PATCH `/api/circles/[id]`
Update an expense circle (owner only).

#### DELETE `/api/circles/[id]`
Delete an expense circle (owner only).

#### GET `/api/circles/[id]/expenses`
Get all expenses in a circle.

#### POST `/api/circles/[id]/expenses`
Add an expense to a circle.

**Request Body:**
```json
{
  "amount": "number",
  "description": "string",
  "paidById": "string",
  "splitType": "equal|exact|percentage",
  "date": "ISO date"
}
```

---

### Friends

#### GET `/api/friends`
Fetch all friends with summary.

**Response:**
```json
{
  "friends": [...],
  "summary": {
    "total": "number",
    "totalOwed": "number",
    "totalOwing": "number",
    "netBalance": "number"
  }
}
```

#### POST `/api/friends`
Create a new friend.

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "relationType": "friend|family|colleague",
  "balance": "number"
}
```

#### GET `/api/friends/[id]`
Get a single friend.

#### PATCH `/api/friends/[id]`
Update a friend.

#### DELETE `/api/friends/[id]`
Delete a friend.

---

### Goals

#### GET `/api/goals`
Fetch all goals.

#### POST `/api/goals`
Create a new goal.

**Request Body:**
```json
{
  "title": "string",
  "type": "retirement|emergency|family|travel|education|home|other",
  "targetAmount": "number",
  "currentAmount": "number",
  "dueDate": "ISO date",
  "priority": "low|medium|high"
}
```

#### GET `/api/goals/[id]`
Get a single goal.

#### PATCH `/api/goals/[id]`
Update a goal.

#### DELETE `/api/goals/[id]`
Delete a goal.

---

### Subscriptions

#### GET `/api/subscriptions`
Fetch all subscriptions with monthly cost calculations.

**Response:**
```json
{
  "subscriptions": [
    {
      "id": "string",
      "name": "string",
      "amount": "number",
      "cadence": "monthly|yearly|weekly",
      "nextChargeDate": "ISO date",
      "monthlyCost": "number"
    }
  ],
  "totalMonthly": "number",
  "count": "number"
}
```

#### POST `/api/subscriptions`
Create a new subscription.

**Request Body:**
```json
{
  "name": "string",
  "amount": "number",
  "cadence": "monthly|yearly|weekly",
  "nextChargeDate": "ISO date"
}
```

#### GET `/api/subscriptions/[id]`
Get a single subscription.

#### PATCH `/api/subscriptions/[id]`
Update a subscription.

#### DELETE `/api/subscriptions/[id]`
Delete a subscription.

---

### Assets

#### GET `/api/assets`
Fetch all assets with total value.

#### POST `/api/assets`
Create a new asset.

**Request Body:**
```json
{
  "name": "string",
  "type": "cash|investment|property|other",
  "value": "number",
  "institution": "string"
}
```

#### GET `/api/assets/[id]`
Get a single asset.

#### PATCH `/api/assets/[id]`
Update an asset.

#### DELETE `/api/assets/[id]`
Delete an asset.

---

### Loans

#### GET `/api/loans`
Fetch all loans with summary.

#### POST `/api/loans`
Create a new loan.

**Request Body:**
```json
{
  "name": "string",
  "principal": "number",
  "balance": "number",
  "apr": "number",
  "monthlyPayment": "number"
}
```

#### GET `/api/loans/[id]`
Get a single loan.

#### PATCH `/api/loans/[id]`
Update a loan.

#### DELETE `/api/loans/[id]`
Delete a loan.

---

### Liabilities

#### GET `/api/liabilities`
Fetch all liabilities with summary.

#### POST `/api/liabilities`
Create a new liability.

**Request Body:**
```json
{
  "name": "string",
  "type": "loan|mortgage|credit|other",
  "balance": "number",
  "apr": "number"
}
```

#### GET `/api/liabilities/[id]`
Get a single liability.

#### PATCH `/api/liabilities/[id]`
Update a liability.

#### DELETE `/api/liabilities/[id]`
Delete a liability.

---

### Financial Planning

#### GET `/api/financial-planning/overview`
Get comprehensive financial overview.

**Response includes:**
- Net worth (assets, debt breakdown)
- Cash flow (income, expenses, savings rate)
- Debt analysis (debt-to-income ratio)
- Goals progress
- Emergency fund status
- Spending by category
- AI-generated insights

#### GET `/api/financial-planning/analytics`
Get financial analytics and trends.

**Query Parameters:**
- `period` (optional): `1month|3months|6months|1year` (default: `6months`)

**Response includes:**
- Monthly breakdown
- Income/expense trends
- Average monthly metrics
- Spending by category
- Top spending categories
- Projections

---

## Error Responses

All endpoints return standard error responses:

```json
{
  "error": "Error message"
}
```

**Status Codes:**
- `400`: Bad Request (missing/invalid parameters)
- `401`: Unauthorized (not authenticated)
- `404`: Not Found (resource doesn't exist)
- `500`: Internal Server Error

---

## Future AI Integration

The backend is structured to support AI integration for:
- Transaction categorization
- Spending analysis
- Financial insights generation
- Personalized recommendations
- Anomaly detection

AI services are already set up in `backend/src/services/ai/ai.service.ts` and can be extended for additional features.

---

## Notes

- All monetary values are stored as numbers (floats)
- Dates are in ISO 8601 format
- All endpoints require authentication
- User data is automatically scoped to the authenticated user
- The API uses Prisma for database operations with PostgreSQL
