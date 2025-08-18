# React + TypeScript + Vite

# Stablecoin App

A modern React-based stablecoin application with collaborative payment features, built with TypeScript and Vite.

## Features

- 🔐 **Secure Authentication** - Email/password login with validation
- 💰 **Digital Wallet** - ZAR stablecoin balance management
- 💸 **Direct Transfers** - Send money to other users instantly
- 🤝 **Collaborative Payments** - Group payment requests with flexible or equal splits
- 📱 **Progressive Web App** - Installable mobile experience
- 🔄 **Real-time Updates** - Live transaction and payment status updates
- 📊 **Transaction History** - Complete payment tracking
- 🎨 **Modern UI** - Dark theme with smooth animations

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: CSS-in-JS with modern design system
- **State Management**: React hooks with custom API hooks
- **Routing**: React Router DOM
- **PWA**: Vite PWA plugin
- **Testing**: Vitest, Testing Library
- **Icons**: React Icons

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API service running

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd stablecoin-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   VITE_API_BASE_URL=https://your-api-base-url.com/api/v1
   VITE_API_AUTH_TOKEN=your-auth-token-here
   VITE_BACKEND_URL=http://localhost:8080
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage
- `npm run type-check` - TypeScript type checking

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ErrorBoundary.tsx
│   └── LoadingSpinner.tsx
├── hooks/              # Custom React hooks
│   ├── useApi.ts
│   └── useLocalStorage.ts
├── pages/              # Page components
│   ├── Dashboard.tsx
│   ├── Send.tsx
│   ├── SignIn.tsx
│   └── ...
├── types/              # TypeScript type definitions
│   └── api.ts
├── utils/              # Utility functions
│   ├── api.ts
│   ├── config.ts
│   ├── logger.ts
│   └── validation.ts
└── test/               # Test files
    ├── setup.ts
    └── utils/
```

## Key Features Explained

### Authentication
- Secure email/password authentication
- Form validation with helpful error messages
- Persistent login state with localStorage
- Automatic token management

### Wallet Management
- Real-time balance updates
- Multi-token support (ZAR stablecoin)
- Transaction history with filtering
- Balance visualization

### Direct Payments
- Send money to any registered user
- Recipient validation
- Gas fee management
- Transaction confirmation

### Collaborative Payments
- Create group payment requests
- Flexible or equal split options
- QR code sharing
- Real-time contribution tracking
- Automatic completion when target reached

### Progressive Web App
- Installable on mobile devices
- Offline capability
- Push notifications (planned)
- Native app-like experience

## API Integration

The app integrates with two main services:

1. **Rapyd API** - For blockchain transactions and wallet management
2. **Backend Service** - For collaborative payments and user management

All API calls include:
- Automatic retry logic
- Error handling
- Loading states
- Type safety

## Error Handling

- Global error boundary for React errors
- API error handling with user-friendly messages
- Form validation with real-time feedback
- Comprehensive logging system

## Testing

- Unit tests for utility functions
- Component testing with Testing Library
- API mocking for reliable tests
- Coverage reporting

Run tests:
```bash
npm run test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

