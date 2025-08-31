## Overview

The ZAR Stablecoin Application is a React-based financial platform that enables users to send, receive, and manage ZAR-pegged stablecoins. The application supports both direct peer-to-peer transfers and collaborative payment requests where multiple users can contribute to a single payment.

## Key Capabilities

- Digital Wallet: Secure ZAR stablecoin balance management
- Direct Transfers: Instant peer-to-peer payments
- Collaborative Payments: Group funding for shared expenses
- Transaction History: Complete transaction tracking and filtering
- QR Code Integration: Easy payment sharing and scanning
- WhatsApp Notifications: Automated payment confirmations
- Responsive Design: Optimized for both mobile and desktop

# Architecture

Backend Integration
The application integrates with multiple backend services:

Primary API
- User management and authentication
- Balance queries and transfers
- Transaction processing

Collaborative Payments Backend (https://github.com/Thabang019/zar_app.git)
- Group payment request management
- Contribution tracking
- Request lifecycle management

WhatsApp Business API
- Payment notifications
- Transaction confirmations

## Features

1. User Authentication & Profile Management

- Sign Up: Email-based registration with phone number
- Sign In: Secure authentication with session management
- Profile View: User information display and management
- Logout: Secure session termination

2. Wallet Management

- Balance Display: Real-time ZAR stablecoin balance
- User ID: Unique identifier with copy functionality

3. Direct Payments

- Send Money: Email-based recipient lookup
- Currency Selection: Multi-currency support (ZAR, USD)
- Gas Management: Automatic transaction fee handling
- Instant Notifications: WhatsApp alerts to recipients

4. Collaborative Payments

- Request Creation: Group payment request generation
- Split Types:

- Open: Flexible contribution amounts
- Equal: Fixed equal splits among participants

- QR Code Sharing: Easy request distribution
- Progress Tracking: Real-time payment completion status
- Expiry Management: Time-bound request validity
- Contributor Management: Track all participants

5. Transaction Management
- History Tracking: Complete transaction logs

## User Guide


# Sign Up
- Navigate to /signup
- Enter personal information (name, email, phone)
- Create a secure password


# Sign In
- Use registered email and password
- Access your dashboard automatically


# Dashboard Overview
- View your ZAR stablecoin balance
- See recent transaction history
- Access quick actions (Send, Requests)

## Sending Money

# Direct Transfer

- Click "Send" from dashboard or navigation
- Enter recipient's email address
- Specify amount in ZAR or USD
- Confirm and send
- Recipient receives WhatsApp notification

# Creating Collaborative Requests

- Enable "Create collaborative payment request"
- Enter final recipient email
- Set total target amount
- Add descriptive title
- Choose split type:
- Open: Contributors can pay any amount
- Equal: Fixed amount per participant
- Set expiry time (1 hour to 1 week)
- Share QR code or link with contributors

## Managing Collaborative Payments

# As Request Creator

- Monitor payment progress in real-time
- Share QR codes for easy access
- Copy shareable links
- Track all contributors
- Receive completion notifications

# As Contributor

- Scan QR code or click shared link
- View payment details and progress
- Contribute your amount
- Add optional notes
- Receive confirmation

## Environment Configuration Guide

Step 1: Clone the Repository
First, clone your project repository using Git:
```
git clone https://github.com/Thabang019/stablecoin_app.git
cd stablecoin_app

```
Step 2: Install Dependencies
Make sure you have Node.js (v16+) and npm or yarn installed. Then run the following commands to install project dependencies:

Using npm:
```
npm install
```

Step 3: Set Up Environment Configuration
Required Environment Variables
To configure your environment, you will need the following environment variables:
```

# Primary API Configuration
VITE_API_BASE_URL=https://seal-app-qp9cc.ondigitalocean.app/api/v1
VITE_API_AUTH_TOKEN=your_api_authentication_token

# Collaborative Payments Backend
VITE_BACKEND_URL=https://zarstablecoin-app.onrender.com

# WhatsApp Business API
VITE_WHATSAPP_TOKEN=your_whatsapp_business_token
VITE_WHATSAPP_PHONE_NUMBER_ID=your_whatsapp_phone_number_id
```

## Configuration Setup
Create an .env file in the project root:

```
touch .env
```

Add all required environment variables to the .env file. Replace placeholder values with your actual tokens and IDs:
```
VITE_API_BASE_URL=https://seal-app-qp9cc.ondigitalocean.app/api/v1
VITE_API_AUTH_TOKEN=your_api_authentication_token
VITE_BACKEND_URL=https://zarstablecoin-app.onrender.com
VITE_WHATSAPP_TOKEN=your_whatsapp_business_token
VITE_WHATSAPP_PHONE_NUMBER_ID=your_whatsapp_phone_number_id
Restart the development server to apply the changes:
```
Using npm:

```
npm run dev
```

Step 4: Verify Configuration
Once the server is running, open your browser's console and verify that the environment variables are correctly configured. You can do this by checking for API calls or logging out values in your application.

Deployment Guide
Prerequisites

- Node.js version 16 or higher and npm or yarn installed
- Environment variables configured as described above
- Backend services running for successful API interactions
- WhatsApp Business API configured and ready for use
