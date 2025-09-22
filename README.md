# Britto - Student Portal Application

## Project Overview

**Britto** is a React Native mobile application designed as a comprehensive student portal for Dhaka University (DU). The app provides students with easy access to various academic services and information through a modern, user-friendly interface.

#### NOTES FOR JAHID VAI
1. Should Have valid start date and end date for enrollment and formfillup.
2. update result pereametar, lots of missing like result pub date, sub result date, held in, memo etc.


## Current Features

### 🔐 Authentication System
- **Secure Login**: Registration number and password-based authentication
- **Token Management**: JWT-based session management with AsyncStorage
- **Device Tracking**: Device information and network details for security

### 📱 Dashboard
- **Dynamic Grid Layout**: Responsive grid displaying available services
- **Icon-based Navigation**: Visual navigation with dynamic icons from server
- **Profile Integration**: Quick access to student profile information

### 👤 Profile Management
- **Personal Information**: Name, contact details, address, blood group
- **Academic Details**: Department, hall, registration number, session
- **Tabbed Interface**: Organized into Personal and Academic sections

### 🎓 Academic Services
- **Syllabus**: Course syllabus access
- **Notices**: Important announcements and notifications
- **Examinations**: Exam schedules and information
- **Results**: Academic results viewing
- **Marksheet**: Detailed mark information
- **Certificate**: Academic certificates
- **Transcript**: Official academic transcripts
- **Form Fillup**: Online form submission

### 🏢 Administrative Features
- **Hall Information**: Residential hall details
- **Department Data**: Departmental information and resources

## Technical Architecture

### Technology Stack
- **Framework**: React Native 0.74.1
- **Language**: TypeScript/JavaScript (hybrid)
- **UI Library**: Native Base 3.4.28
- **Navigation**: React Navigation 6.x
- **HTTP Client**: Axios 1.7.2
- **State Management**: React Hooks + AsyncStorage
- **Development**: Metro bundler, Flipper integration

### Project Structure
```
src/
├── assets/           # Images, icons, and static resources
├── components/       # Reusable UI components
│   ├── AppBar.js    # Custom header component
│   ├── ProfileCard.js # Student profile display
│   └── ...
├── screens/         # Application screens
│   ├── LoginScreen.js
│   ├── dashboard/   # Dashboard-related screens
│   └── ...
└── service/         # Business logic and utilities
    ├── api.js       # API communication layer
    └── utils.js     # Utility functions and constants
```

### Key Components

#### Authentication Flow
- Registration number validation (10 digits)
- Password validation (minimum 6 characters)
- Device fingerprinting for security
- Automatic token storage and retrieval

#### API Integration
- Centralized API management in `api.js`
- Token-based authentication with custom headers
- Error handling and user feedback
- Network status checking

#### UI Components
- **ProfileCard**: Displays student information with background image
- **AppBar**: Custom header with branding
- **Dashboard Grid**: Dynamic service icons and navigation

## Current Issues & Technical Debt

### 🚨 Critical Issues
1. **Syntax Error**: Malformed import in `App.tsx` line 4
2. **Duplicate Logic**: Login implementation exists in both `LoginScreen.js` and `api.js`
3. **Hardcoded Credentials**: Test credentials visible in source code
4. **Unreachable Code**: Some code after return statements

### 🔒 Security Concerns
- API secrets exposed in client code
- No secure keychain storage for sensitive data
- Missing token refresh mechanism
- Hardcoded test credentials in production code

### 🐛 Code Quality Issues
- Mixed TypeScript and JavaScript files
- Inconsistent error handling
- Missing proper loading states
- No comprehensive input validation

## Improvement Recommendations

### 🔧 Immediate Fixes (High Priority)
1. **Fix Syntax Errors**
   - Correct malformed import in `App.tsx`
   - Remove unreachable code blocks

2. **Security Hardening**
   - Move secrets to environment variables
   - Implement secure token storage (react-native-keychain)
   - Remove hardcoded test credentials
   - Add token refresh mechanism

3. **Code Cleanup**
   - Remove duplicate login logic
   - Convert remaining JS files to TypeScript
   - Implement consistent error handling

### 🚀 Feature Enhancements (Medium Priority)
1. **User Experience**
   - Add pull-to-refresh functionality
   - Implement proper loading states
   - Add offline data caching
   - Include search functionality

2. **UI/UX Improvements**
   - Dark mode support
   - Better empty states
   - Micro-animations and transitions
   - Responsive design optimization

3. **Performance Optimization**
   - Image caching and optimization
   - Lazy loading for screens
   - Bundle size optimization
   - Memory usage optimization

### 📱 New Features (Low Priority)
1. **Communication**
   - Push notifications for important updates
   - In-app messaging system
   - Emergency contact features

2. **Academic Tools**
   - GPA calculator
   - Academic calendar integration
   - Class schedule management
   - Assignment tracker

3. **Additional Services**
   - Library integration
   - Fee payment gateway
   - Campus map integration
   - Event management

### 🛠 Technical Improvements
1. **Testing & Quality**
   - Unit test implementation
   - Integration test coverage
   - E2E testing setup
   - Code quality metrics

2. **Development Workflow**
   - CI/CD pipeline setup
   - Automated testing
   - Code review process
   - Performance monitoring

3. **Architecture**
   - State management solution (Redux Toolkit/Zustand)
   - Better separation of concerns
   - Modular component architecture
   - Plugin architecture for features

## Getting Started

### Prerequisites
- Node.js 18+
- React Native development environment
- iOS/Android development tools

### Installation
```bash
# Install dependencies
npm install

# iOS setup
cd ios && pod install && cd ..

# Start Metro bundler
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

### Development Commands
```bash
# Clean build
npm run clean

# Permission fix
npm run permit

# Apply patches
npm run postinstall
```

## API Configuration

The app connects to a backend API at:
- Production: `https://du-backend.pitech.com.bd/api/britto`
- Development: `http://172.20.10.8:4100/api/britto` (commented)

## Contributing

1. Address critical security issues first
2. Follow TypeScript best practices
3. Implement proper error handling
4. Add tests for new features
5. Update documentation

## License

This project is private and proprietary.

---

**Last Updated**: June 28, 2025  
**Status**: Active Development  
**Platform**: iOS/Android  
**Target Users**: Dhaka University Students
