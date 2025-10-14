# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**우영달림 가계부** - A couples' expense tracking React application built with SOLID principles. This is a shared budget app for two users (우영 & 달림) to track income/expenses together.

**Tech Stack**: React 19.2.0, Tailwind CSS (via CDN), Lucide React icons, Firebase
**Storage**: Firebase Realtime Database + Authentication
**Language**: Korean UI, JavaScript codebase

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (http://localhost:3000)
npm start

# Build for production
npm run build

# Run tests
npm test
```

## Architecture Overview

This project follows **SOLID principles** strictly. The codebase has been refactored from a monolithic 2000+ line App.js into a modular architecture.

### Directory Structure

```
src/
├── constants/          # Application constants (categories, users, payment methods)
├── utils/              # Pure utility functions (date, format, storage)
├── services/           # Business logic layer (TransactionService)
├── hooks/              # Custom React hooks (useAuth, useTransactions, useFixedExpenses)
├── firebase/           # Firebase configuration and services
│   ├── config.js       # Firebase initialization
│   ├── authService.js  # Authentication functions
│   └── databaseService.js  # Database CRUD functions
├── components/
│   ├── common/         # Reusable UI components (Button, Input, Modal)
│   ├── forms/          # Form components (TransactionForm, FixedExpenseForm)
│   └── layout/         # Layout components (Header, Sidebar)
├── pages/              # Page components (LoginPage, CalendarPage, etc.)
└── App.js              # Main app orchestration
```

### Key Architecture Patterns

1. **State Management**: Custom hooks manage domain-specific state
   - `useAuth()` - Authentication state and login/logout
   - `useTransactions()` - Transaction CRUD operations
   - `useFixedExpenses()` - Fixed expense management

2. **Business Logic**: Centralized in service layer
   - `TransactionService` - Static methods for transaction operations
   - All filtering, calculation, and validation logic lives here
   - Components never contain business logic

3. **Data Flow**: Unidirectional props flow
   - App.js orchestrates all state via hooks
   - Props are passed down to page components
   - Page components pass data to presentational components

4. **Storage**: Firebase Realtime Database
   - `databaseService.js` provides CRUD operations
   - Real-time listeners for automatic UI updates
   - LocalStorage used only for automatic migration
   - Family mode and personal mode support

### Data Models

**Transaction**:
```javascript
{
  id: Number,              // Timestamp-based unique ID
  type: 'income' | 'expense',
  category: String,        // Category ID from CATEGORIES
  subcategory: String,     // Optional subcategory
  amount: Number,
  paymentMethod: String,   // From PAYMENT_METHODS
  memo: String,            // Optional
  date: String,            // 'YYYY-MM-DD'
  userId: String           // 'user1' or 'user2'
}
```

**Fixed Expense**:
```javascript
{
  id: Number,
  name: String,
  category: String,
  amount: Number,
  day: Number,             // Day of month (1-31)
  memo: String,
  isActive: Boolean        // Toggle for active/inactive
}
```

## Important Implementation Details

### SOLID Principles Adherence

This project **strictly follows SOLID principles**. See `SOLID-GUIDE.md` for detailed guidelines.

**Key rules**:
- One file = one responsibility (files should be < 200 lines)
- Extend via props/variants, don't modify existing code
- Business logic in services, never in components
- Import only what you need from index.js exports
- Components depend on abstractions (hooks/services), not implementations

### Component Conventions

**Button Component** (OCP example):
```javascript
<Button variant="primary|secondary|danger" size="sm|md|lg" icon={LucideIcon}>
  Text
</Button>
```

**Import Order**:
```javascript
// 1. React
import React, { useState } from 'react';
// 2. External libraries
import { X, Plus } from 'lucide-react';
// 3. Constants
import { CATEGORIES } from '../constants';
// 4. Utils/Services
import { TransactionService } from '../services';
// 5. Hooks
import { useAuth } from '../hooks';
// 6. Components
import { Button, Modal } from '../components/common';
```

### Styling

- **Tailwind CSS** via CDN in `public/index.html`
- Custom animations in `src/App.css` (glassmorphism, gradients)
- Gradient background with 20s animation cycle
- Purple-pink color scheme (`#667eea → #764ba2`)

### User Roles

- **user1 (우영)**: Admin role, full access
- **user2 (달림)**: User role, can add own transactions and view all

## Key Files to Understand

- `개발일지.md` - **Complete development history** (Korean)
- `SOLID.md` - SOLID principles guide
- `CLAUDE.md` - This file, project documentation
- `README.md` - Project overview
- `src/App.js` - Main orchestration, shows how everything connects
- `src/hooks/` - Understanding hooks is key to understanding state flow
- `src/firebase/databaseService.js` - Firebase CRUD operations
- `src/services/transactionService.js` - Core business logic

## Development Guidelines

### Adding New Features

1. Check `SOLID.md` for SOLID principles
2. Review `개발일지.md` for implementation patterns
3. Determine correct folder: constants/utils/services/hooks/components/firebase
4. Create file with single responsibility
5. Add export to corresponding `index.js`
6. Keep files under 200 lines, functions under 30 lines

### Code Review Checklist

Before committing, verify:
- [ ] SOLID principles followed (SRP, OCP, LSP, ISP, DIP)
- [ ] No business logic in components
- [ ] Proper import order maintained
- [ ] No direct localStorage access (use storageUtils)
- [ ] Props documented if > 3 props
- [ ] Korean UI text for user-facing content

## Current Status

✅ **Completed**:
- SOLID principles refactoring
- Firebase Authentication (Google login)
- Firebase Realtime Database integration
- Real-time synchronization
- Family sharing system (couples can share budgets)
- Auto-migration from LocalStorage

⏳ **In Progress**:
- Family creation UI

🔮 **Future Plans**:
1. **High**: Firebase Security Rules
2. **Medium**: Budget management with alerts
3. **Medium**: PWA conversion for offline support
4. **Low**: TypeScript migration, comprehensive testing

## Firebase Setup

This app requires Firebase configuration. Create `.env` file:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_DATABASE_URL=https://your_project.firebasedatabase.app
REACT_APP_FIREBASE_PROJECT_ID=your_project
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

**Database Structure**:
- `families/{familyId}/transactions` - Shared budget mode
- `families/{familyId}/fixedExpenses` - Shared fixed expenses
- `users/{userId}/transactions` - Personal mode (fallback)
- `users/{userId}/fixedExpenses` - Personal fixed expenses

## Context for Development

This app was initially built as a monolithic 2177-line `App.js` using Claude web interface. It has been refactored using Claude Code to follow SOLID principles and integrated with Firebase for real-time sync.

**Development Phases**:
- ✅ Phase 1: SOLID refactoring (100%)
- ✅ Phase 2: Firebase Authentication (100%)
- ✅ Phase 3: Firebase Realtime Database (100%)
- ✅ Phase 4: Family sharing system (95%)
- ⏳ Phase 5: Family creation UI (in progress)

**Development Log**: See `개발일지.md` for complete development history.

When making changes:
- Preserve the existing SOLID architecture
- Keep Korean language in UI elements
- Maintain the glassmorphism visual style
- Consult `SOLID.md` for SOLID principles
- Test in browser at localhost:3000 after changes
- Check `개발일지.md` for implementation details
