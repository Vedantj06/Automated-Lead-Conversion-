# Marketing Automation Platform - API Documentation

## Overview
This document describes the expected API endpoints that your backend should implement to work with the Marketing Automation Platform frontend.

## Base Configuration
- All endpoints are relative to `VITE_API_URL` environment variable
- Default: `http://localhost:3001/api`
- All requests should include JSON content-type headers
- Authentication uses JWT tokens in Authorization headers

## Authentication Endpoints

### Send OTP
**POST** `/auth/send-otp`

Send an OTP (One-Time Password) to the user's email for authentication.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

### Verify OTP
**POST** `/auth/verify-otp`

Verify the OTP and complete the login process.

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "_uid": "user_id",
    "_id": "user_record_id",
    "email": "user@example.com",
    "name": "User Name",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Logout
**POST** `/auth/logout`

**Headers:** `Authorization: Bearer <token>`

Logout the user and invalidate the session.

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Refresh Session
**POST** `/auth/refresh`

**Headers:** `Authorization: Bearer <token>`

Refresh the user's session token.

**Response:**
```json
{
  "success": true,
  "token": "new_jwt_token",
  "user": { ... }
}
```

## Lead Management Endpoints

### Get All Leads
**GET** `/leads?limit=50&offset=0&sortBy=createdAt&sortOrder=desc&filter_region=UAE&filter_status=new`

**Headers:** `Authorization: Bearer <token>`

Retrieve leads with filtering and pagination.

**Query Parameters:**
- `limit`: Number of results (default: 50)
- `offset`: Results offset (default: 0)
- `sortBy`: Field to sort by (default: createdAt)
- `sortOrder`: asc or desc (default: desc)
- `filter_*`: Filter by any field (e.g., filter_region=UAE)

**Response:**
```json
{
  "data": [
    {
      "_uid": "user_id",
      "_id": "lead_id",
      "_tid": "table_id",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "company": "Example Corp",
      "website": "https://example.com",
      "linkedin": "https://linkedin.com/in/johndoe",
      "title": "CEO",
      "industry": "Technology",
      "region": "UAE",
      "status": "new",
      "source": "LinkedIn",
      "sourceUrl": "https://linkedin.com/company/example",
      "notes": "Interested in web development",
      "score": 85,
      "lastContact": "2024-01-01T00:00:00Z",
      "nextFollowUp": "2024-01-08T00:00:00Z",
      "tags": ["high-priority", "web-dev"],
      "customFields": {
        "budget": "$10000",
        "timeline": "Q1 2024"
      },
      "engagementData": {
        "emailsOpened": 3,
        "emailsClicked": 1,
        "websiteVisits": 5,
        "lastEngagement": "2024-01-01T00:00:00Z"
      }
    }
  ],
  "total": 150,
  "limit": 50,
  "offset": 0
}
```

### Get Lead by ID
**GET** `/leads/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "_uid": "user_id",
  "_id": "lead_id",
  // ... full lead object
}
```

### Create Lead
**POST** `/leads`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "company": "Example Corp",
  "region": "UAE",
  "status": "new",
  "source": "Manual Entry",
  "score": 0,
  "tags": []
  // ... other lead fields (excluding system fields like _uid, _id)
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    // ... complete lead object with system fields
  },
  "message": "Lead created successfully"
}
```

### Update Lead
**PUT** `/leads/:id`

**Headers:** `Authorization: Bearer <token>`

**Request Body:** (partial lead object)
```json
{
  "status": "contacted",
  "notes": "Called and discussed requirements",
  "score": 75
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    // ... updated lead object
  },
  "message": "Lead updated successfully"
}
```

### Delete Lead
**DELETE** `/leads/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Lead deleted successfully"
}
```

### Bulk Create Leads
**POST** `/leads/bulk`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "records": [
    {
      "name": "Lead 1",
      "email": "lead1@example.com",
      // ... lead fields
    },
    {
      "name": "Lead 2",
      "email": "lead2@example.com",
      // ... lead fields
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    // ... array of created lead objects
  ],
  "message": "Leads created successfully"
}
```

### Search Leads
**GET** `/leads/search?q=search_term&limit=20&offset=0`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "data": [
    // ... array of matching leads
  ],
  "total": 25,
  "limit": 20,
  "offset": 0
}
```

## Campaign Management Endpoints

### Get All Campaigns
**GET** `/campaigns`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "data": [
    {
      "_uid": "user_id",
      "_id": "campaign_id",
      "_tid": "table_id",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "name": "Website Development Outreach Q1",
      "description": "Targeting UAE businesses for web development",
      "type": "email",
      "status": "active",
      "templateId": "template_1",
      "subject": "Transform Your Business Online - {{company}}",
      "content": "HTML email content with {{variables}}",
      "variables": ["name", "company", "region"],
      "targetRegions": ["UAE", "India"],
      "targetServices": ["Website Development"],
      "leadFilters": {
        "status": ["new", "contacted"],
        "scoreMin": 60,
        "industry": ["Technology", "Healthcare"],
        "tags": ["web-dev-interest"]
      },
      "schedule": {
        "startDate": "2024-01-01T09:00:00Z",
        "endDate": "2024-01-31T17:00:00Z",
        "timezone": "Asia/Dubai",
        "sendTime": "10:00",
        "frequency": "weekly"
      },
      "analytics": {
        "sent": 250,
        "delivered": 240,
        "opened": 120,
        "clicked": 45,
        "replied": 12,
        "bounced": 10,
        "unsubscribed": 3
      },
      "sequenceSteps": [
        {
          "stepNumber": 1,
          "delay": 0,
          "subject": "Initial Outreach - {{company}}",
          "content": "First email content",
          "conditions": {}
        },
        {
          "stepNumber": 2,
          "delay": 3,
          "subject": "Follow-up - {{company}}",
          "content": "Follow-up email content",
          "conditions": {
            "opened": false
          }
        }
      ]
    }
  ],
  "total": 15,
  "limit": 50,
  "offset": 0
}
```

### Campaign CRUD Operations
Similar pattern to leads for:
- **GET** `/campaigns/:id`
- **POST** `/campaigns`
- **PUT** `/campaigns/:id`
- **DELETE** `/campaigns/:id`

## Email Service Endpoints

### Send Single Email
**POST** `/email/send`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "to": [
    {
      "email": "recipient@example.com",
      "name": "Recipient Name"
    }
  ],
  "cc": [],
  "bcc": [],
  "from": {
    "email": "sender@agency.com",
    "name": "Your Agency"
  },
  "subject": "Email Subject",
  "html": "<h1>HTML Email Content</h1>",
  "text": "Plain text version",
  "attachments": [
    {
      "filename": "proposal.pdf",
      "content": "base64_encoded_content",
      "contentType": "application/pdf"
    }
  ],
  "tags": ["campaign_id", "lead_id"],
  "metadata": {
    "campaignId": "campaign_123",
    "leadId": "lead_456"
  }
}
```

**Response:**
```json
{
  "success": true,
  "messageId": "email_message_id",
  "message": "Email sent successfully"
}
```

### Send Bulk Emails
**POST** `/email/bulk-send`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "emails": [
    // ... array of email objects (same format as single email)
  ],
  "batchSize": 50,
  "delayBetweenBatches": 1000
}
```

**Response:**
```json
{
  "success": true,
  "totalSent": 45,
  "totalFailed": 5,
  "results": [
    {
      "email": "recipient1@example.com",
      "success": true,
      "messageId": "msg_123"
    },
    {
      "email": "recipient2@example.com",
      "success": false,
      "error": "Invalid email address"
    }
  ]
}
```

### Email Status
**GET** `/email/status/:messageId`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "status": "delivered",
  "deliveredAt": "2024-01-01T10:30:00Z",
  "reason": null
}
```

### Email Analytics
**GET** `/email/analytics?from=2024-01-01&to=2024-01-31`

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "totalSent": 1250,
  "delivered": 1200,
  "failed": 50,
  "bounced": 25,
  "complained": 5,
  "opened": 600,
  "clicked": 180,
  "deliveryRate": 96.0,
  "openRate": 50.0,
  "clickRate": 15.0
}
```

## Web Services Endpoints (Optional)

### Web Search
**POST** `/web-search`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "query": "website development services UAE contact",
  "limit": 20,
  "offset": 0,
  "country": "AE",
  "language": "en",
  "safeSearch": true,
  "timeRange": "month",
  "site": "linkedin.com"
}
```

**Response:**
```json
{
  "results": [
    {
      "title": "Website Development Company in UAE",
      "url": "https://example.com/services",
      "snippet": "Professional web development services...",
      "content": "Full page content...",
      "publishedDate": "2024-01-01T00:00:00Z",
      "source": "example.com",
      "imageUrl": "https://example.com/image.jpg"
    }
  ],
  "totalResults": 150,
  "query": "website development services UAE contact",
  "searchTime": 250
}
```

### Web Content Reader
**POST** `/web-reader`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "url": "https://example.com/about-us"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://example.com/about-us",
    "title": "About Us - Example Company",
    "content": "Extracted text content from the page...",
    "author": "John Doe",
    "publishedDate": "2024-01-01T00:00:00Z",
    "description": "Page meta description",
    "images": [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg"
    ],
    "links": [
      "https://example.com/contact",
      "https://example.com/services"
    ],
    "metadata": {
      "lang": "en",
      "charset": "utf-8"
    }
  }
}
```

### Bulk Web Reader
**POST** `/web-reader/bulk`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "urls": [
    "https://example1.com",
    "https://example2.com"
  ],
  "options": {
    "timeout": 10000,
    "extractImages": true,
    "extractLinks": true,
    "followRedirects": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "url": "https://example1.com",
      "success": true,
      "data": {
        // ... web content object
      }
    },
    {
      "url": "https://example2.com",
      "success": false,
      "error": "Timeout error"
    }
  ]
}
```

## Error Handling

### Standard Error Response
```json
{
  "success": false,
  "message": "Human-readable error message",
  "error": "Detailed error for debugging (optional)",
  "code": "ERROR_CODE (optional)"
}
```

### Common HTTP Status Codes
- **200**: Success
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (invalid/missing token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **429**: Rate Limited
- **500**: Internal Server Error

## Authentication & Security

### JWT Token Requirements
- Include user ID (`_uid`) in token payload
- Set reasonable expiration time (e.g., 24 hours)
- Support token refresh mechanism
- Validate token on all protected endpoints

### CORS Configuration
Allow requests from your frontend domain:
```javascript
// Example CORS configuration
{
  origin: ['http://localhost:3000', 'https://yourdomain.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}
```

## Rate Limiting
Implement rate limiting for:
- Authentication endpoints: 5 requests/minute
- Email sending: Based on your email service limits
- Search endpoints: 100 requests/hour per user

## Data Validation
Validate all input data:
- Email formats
- Required fields for leads/campaigns
- Proper enum values (status, region, etc.)
- Sanitize HTML content for XSS prevention