# JARVIS Testing Guide

## Overview

This document serves as the master testing checklist for the JARVIS AI Command Center. It outlines the testing strategy, execution instructions, flow diagrams, and comprehensive test cases to ensure the application runs reliably with a "clean slate" startup.

## Testing Strategy

### 1. Unit Testing
- **Purpose**: Test individual functions and components in isolation
- **Tools**: Jest, React Testing Library
- **Coverage Target**: 80%+ for critical paths
- **Scope**: Services, utilities, hooks, pure functions

### 2. Integration Testing
- **Purpose**: Test interactions between services and modules
- **Tools**: Jest with service mocking
- **Coverage Target**: Key user flows and service interactions
- **Scope**: API integrations, database operations, service coordination

### 3. End-to-End (E2E) Testing
- **Purpose**: Test complete user workflows in a browser-like environment
- **Tools**: Playwright
- **Coverage Target**: Critical user journeys
- **Scope**: Login flow, master profile creation, WebSocket connections, API key setup

### 4. CI/CD Pipeline Testing
- **Purpose**: Automated validation on every commit
- **Tools**: GitHub Actions
- **Scope**: Linting, type checking, unit tests, integration tests, E2E tests

## Execution Instructions

### Running Tests Locally

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test suite
npm test -- path/to/test.test.ts

# Run E2E tests (after setup)
npm run test:e2e

# Run backend integration tests
npm run test:backend
```

### CI/CD Testing

Tests run automatically on:
- Push to `main`, `develop`, or `copilot/**` branches
- Pull requests to `main` or `develop`

The pipeline includes:
1. **Lint & Type Check**: Validates code quality
2. **Unit Tests**: Runs all Jest unit tests
3. **Integration Tests**: Tests service interactions
4. **E2E Tests**: Validates complete user flows
5. **Build Verification**: Ensures backend builds successfully

## Flow Diagrams

### Application Startup Flow (Clean Slate)

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Launch                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 1: Load Environment Configuration                     │
│  - NO external API calls                                     │
│  - NO API key validation                                     │
│  - Load local settings only                                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 2: Check Master Profile Existence                     │
│  - Check local storage (AsyncStorage/SecureStore)           │
│  - NO network calls                                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                ┌──────┴──────┐
                │             │
                ▼             ▼
    ┌──────────────────┐  ┌──────────────────┐
    │ Profile Exists   │  │ No Profile       │
    └────────┬─────────┘  └────────┬─────────┘
             │                     │
             │                     ▼
             │         ┌──────────────────────────┐
             │         │ Show Login/Setup Screen  │
             │         │ - No API calls           │
             │         │ - Create master profile  │
             │         │ - Set up authentication  │
             │         └──────────┬───────────────┘
             │                    │
             │                    │ (After profile created)
             │                    │
             └────────┬───────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 3: Initialize Local Services                          │
│  - Voice service (local)                                     │
│  - Storage service (local)                                   │
│  - UI state management (local)                               │
│  - NO API clients initialized yet                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 4: Lazy Load API Clients (Optional)                   │
│  - Only when user navigates to Settings                      │
│  - Only when user provides API keys                          │
│  - Graceful fallback if keys missing/invalid                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 5: Connect Backend Services (Optional)                │
│  - WebSocket connection (with retry)                         │
│  - Backend API health check                                  │
│  - Graceful degradation if unavailable                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│               Application Ready                              │
│  - All local features available                              │
│  - Remote features available if configured                   │
│  - User sees main dashboard                                  │
└─────────────────────────────────────────────────────────────┘
```

### WebSocket Connection Flow

```
┌─────────────────────────────────────────────────────────────┐
│           WebSocket Connection Attempt                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 1: Get WebSocket URL from RuntimeConfig               │
│  - Fallback to default if unavailable                        │
│  - Set connection timeout (10s)                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 2: Attempt Connection                                  │
│  - Create WebSocket instance                                 │
│  - Attach event handlers (open, close, error, message)       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                ┌──────┴──────┐
                │             │
                ▼             ▼
    ┌──────────────────┐  ┌──────────────────┐
    │ Success          │  │ Error            │
    └────────┬─────────┘  └────────┬─────────┘
             │                     │
             ▼                     ▼
┌──────────────────────┐  ┌──────────────────────────┐
│ Connected            │  │ Error Handling           │
│ - Reset retry count  │  │ - Log error (once)       │
│ - Start heartbeat    │  │ - Emit error event       │
│ - Flush msg queue    │  │ - Check retry attempts   │
└──────────────────────┘  └──────────┬───────────────┘
                                     │
                          ┌──────────┴──────────┐
                          │                     │
                          ▼                     ▼
              ┌────────────────────┐  ┌─────────────────┐
              │ Retry Available    │  │ Max Retries     │
              └──────────┬─────────┘  │ - Give up       │
                         │            │ - App continues │
                         ▼            └─────────────────┘
              ┌────────────────────────────┐
              │ Exponential Backoff        │
              │ - Wait: baseDelay * 2^n    │
              │ - Max wait: 5 minutes      │
              │ - Emit 'reconnecting'      │
              └────────────┬───────────────┘
                           │
                           └──────► (Retry connection)


┌─────────────────────────────────────────────────────────────┐
│           WebSocket Disconnection                            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                ┌──────┴──────┐
                │             │
                ▼             ▼
    ┌──────────────────┐  ┌──────────────────┐
    │ Clean Close      │  │ Unclean Close    │
    │ (code 1000)      │  │ (codes 1006+)    │
    └────────┬─────────┘  └────────┬─────────┘
             │                     │
             ▼                     ▼
┌──────────────────────┐  ┌──────────────────────────┐
│ No Reconnect         │  │ Attempt Reconnect        │
│ - User initiated     │  │ - Use backoff strategy   │
│ - Stop heartbeat     │  │ - Continue until max     │
└──────────────────────┘  └──────────────────────────┘
```

### API Key Integration Flow (Post-Startup)

```
┌─────────────────────────────────────────────────────────────┐
│         User Navigates to Settings Page                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Display API Key Configuration UI                            │
│  - Show providers (Groq, Gemini, OpenAI, etc.)              │
│  - Show current status (not configured/configured/active)    │
│  - Input fields for new keys                                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  User Enters API Key                                         │
│  - No validation yet                                         │
│  - Store temporarily in UI state                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  User Clicks "Test & Save"                                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 1: Validate Key Format                                 │
│  - Check pattern matches (gsk_*, hf_*, etc.)                │
│  - Show immediate feedback if invalid format                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Step 2: Test API Connection                                 │
│  - Lazy-load API client for this provider                    │
│  - Make test request (simple query)                          │
│  - Set timeout (10s)                                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                ┌──────┴──────┐
                │             │
                ▼             ▼
    ┌──────────────────┐  ┌──────────────────┐
    │ Test Succeeds    │  │ Test Fails       │
    └────────┬─────────┘  └────────┬─────────┘
             │                     │
             ▼                     ▼
┌──────────────────────┐  ┌──────────────────────────┐
│ Save to Storage      │  │ Show Error Message       │
│ - SecureStore        │  │ - Invalid key / no quota │
│ - Update UI state    │  │ - Connection failed      │
│ - Mark as active     │  │ - Keep UI for retry      │
└──────────────────────┘  └──────────────────────────┘
```

## Master Test Checklist

### Startup & Master Profile Creation

#### Clean Slate Launch (No Profile)
- [ ] App starts without making any external API calls
- [ ] No network requests on initial load (monitored via E2E)
- [ ] Login/setup screen appears immediately
- [ ] No errors in console related to API keys
- [ ] SecureStorage is accessible and working
- [ ] AsyncStorage is accessible and working

#### Master Profile Creation
- [ ] User can create profile with email only
- [ ] User can create profile with OAuth (Google)
- [ ] Profile is saved to secure storage
- [ ] Profile persists across app restarts
- [ ] No API keys required for profile creation
- [ ] Onboarding wizard starts after profile creation

#### Existing Profile Launch
- [ ] App detects existing master profile
- [ ] App loads profile data from storage
- [ ] App initializes with profile context
- [ ] App skips login screen
- [ ] Profile data is validated

### WebSocket Lifecycle

#### Connection Success
- [ ] WebSocket connects to /ws endpoint
- [ ] Connection emits 'connected' event
- [ ] Welcome message received from server
- [ ] Heartbeat/ping mechanism starts
- [ ] Message queue flushes after connection
- [ ] Client count increments on server

#### Connection Failure
- [ ] Connection timeout handled (10s)
- [ ] Error event emitted with details
- [ ] Error logged once (no spam)
- [ ] App continues without WebSocket
- [ ] No unhandled promise rejections
- [ ] Retry mechanism triggered

#### Reconnection Logic
- [ ] Exponential backoff implemented
- [ ] Retry attempts tracked correctly
- [ ] Max retries respected (default: 5)
- [ ] 'reconnecting' event emitted
- [ ] Successful reconnect resets counter
- [ ] Failed reconnects don't crash app

#### Disconnection Handling
- [ ] Clean disconnect (code 1000) handled
- [ ] Unclean disconnect (code 1006) handled
- [ ] Close event emitted with code/reason
- [ ] Heartbeat stops on disconnect
- [ ] Queued messages preserved
- [ ] No reconnect on intentional disconnect

#### Message Handling
- [ ] Messages parsed correctly
- [ ] Type-specific handlers invoked
- [ ] Invalid messages don't crash client
- [ ] Large messages handled
- [ ] Message queue respects order
- [ ] 'message' event emitted for all types

### Backend API Integration

#### Health Check Endpoints
- [ ] GET /healthz returns 200 OK
- [ ] GET /healthz includes status field
- [ ] GET /readyz returns 200 OK (when ready)
- [ ] GET /readyz returns 503 (when not ready)
- [ ] Health checks don't require auth
- [ ] Health checks are fast (<100ms)

#### WebSocket Server Endpoint
- [ ] GET /ws returns 404 (not a GET endpoint)
- [ ] WebSocket upgrade on /ws succeeds
- [ ] Server accepts WebSocket connections
- [ ] Server sends welcome message
- [ ] Server handles client messages
- [ ] Server cleans up on disconnect

#### Startup Behavior
- [ ] Server starts without external dependencies
- [ ] Server doesn't require API keys to start
- [ ] Server logs startup information
- [ ] Server binds to configured host/port
- [ ] Server handles SIGINT gracefully
- [ ] Server handles SIGTERM gracefully

### API Key Integration (Post-Startup)

#### No API Keys Configured
- [ ] App works with local features only
- [ ] Settings show "not configured" status
- [ ] No errors when keys missing
- [ ] Clear messaging about optional nature
- [ ] UI remains functional

#### Adding API Keys
- [ ] User can navigate to settings
- [ ] Key input fields displayed
- [ ] Format validation on blur
- [ ] Test button initiates validation
- [ ] Loading state during test
- [ ] Success message on valid key
- [ ] Error message on invalid key

#### API Key Validation
- [ ] Format check (regex patterns)
- [ ] Test API call to provider
- [ ] Timeout after 10 seconds
- [ ] Error handling for network issues
- [ ] Error handling for invalid keys
- [ ] Error handling for quota exceeded

#### API Key Storage
- [ ] Keys saved to SecureStore
- [ ] Keys persist across restarts
- [ ] Keys retrievable after save
- [ ] Keys can be updated
- [ ] Keys can be deleted
- [ ] Old keys cleared on update

#### Lazy Loading AI Clients
- [ ] Clients not initialized on startup
- [ ] Clients initialized only when key provided
- [ ] Multiple clients can coexist
- [ ] Client initialization errors handled
- [ ] Fallback to other providers on failure

### CI/CD Pipeline Validation

#### Linting & Static Analysis
- [ ] ESLint runs on all TypeScript/JavaScript
- [ ] No linting errors fail pipeline
- [ ] Warnings logged but don't fail build
- [ ] TypeScript compilation succeeds
- [ ] Type checking covers all files

#### Unit Tests
- [ ] All unit tests pass
- [ ] Coverage threshold met (80%+)
- [ ] Tests run in parallel (maxWorkers)
- [ ] Test failures stop pipeline
- [ ] Coverage report uploaded

#### Integration Tests
- [ ] Backend integration tests run
- [ ] Service interaction tests pass
- [ ] Database/storage tests pass
- [ ] API endpoint tests pass
- [ ] WebSocket tests pass

#### E2E Tests
- [ ] Playwright installed and configured
- [ ] Browser tests run in CI
- [ ] Login flow test passes
- [ ] Network interception works
- [ ] Screenshots captured on failure
- [ ] Test failures stop pipeline

#### Build Verification
- [ ] Backend builds successfully
- [ ] Build artifacts created
- [ ] No build warnings/errors
- [ ] Artifact uploaded for download
- [ ] Build runs after tests pass

### User-Facing Quality

#### Documentation
- [ ] README.md updated
- [ ] TESTING.md created (this file)
- [ ] .env.example includes all vars
- [ ] Comments clear and helpful
- [ ] No spelling errors
- [ ] No grammar errors

#### Error Messages
- [ ] User-friendly error text
- [ ] Actionable error messages
- [ ] No technical jargon
- [ ] Clear next steps provided
- [ ] Errors logged appropriately

#### UI/UX
- [ ] Login screen appears correctly
- [ ] Loading states clear
- [ ] Success feedback visible
- [ ] Error states handled gracefully
- [ ] No flash of incorrect content

## Test Environments

### Local Development
- Node.js 22.x
- React Native environment
- Expo development server
- Local backend server

### CI/CD Environment
- Ubuntu latest
- Node.js 20.x (CI uses 20 for stability)
- GitHub Actions runners
- Headless browser for E2E

## Coverage Goals

- **Unit Tests**: 80%+ coverage on services and utilities
- **Integration Tests**: All critical service interactions
- **E2E Tests**: Key user journeys (login, profile, settings, WebSocket)
- **CI/CD**: 100% pipeline reliability

## Troubleshooting

### Tests Failing Locally
1. Run `npm ci` to ensure clean dependencies
2. Clear Jest cache: `npx jest --clearCache`
3. Check environment variables in `.env`
4. Verify no other processes on test ports

### CI/CD Failures
1. Check GitHub Actions logs
2. Verify all secrets configured
3. Check for timing issues in E2E tests
4. Ensure CI-specific env vars set

### WebSocket Issues
1. Verify backend is running
2. Check port 3000 is available
3. Inspect network tab for upgrade request
4. Check CORS configuration
5. Verify WebSocket URL in config

## Future Enhancements

- [ ] Performance testing (Lighthouse)
- [ ] Load testing for backend
- [ ] Visual regression testing
- [ ] Accessibility testing (a11y)
- [ ] Mobile device testing (Detox)
- [ ] Security scanning (OWASP)

## Maintenance

This document should be updated when:
- New features are added
- Test strategy changes
- New test tools introduced
- Flow diagrams need adjustment
- New critical paths identified

---

**Last Updated**: 2025-11-10
**Maintained By**: Development Team
