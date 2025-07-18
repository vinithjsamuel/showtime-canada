# Epic Features Status

## Epic 1: User Registration & Profile Management

| Epic | Feature | User Story ID | User Story | Status | Notes |
|------|---------|---------------|------------|--------|-------|
| 1.1 | User Sign-Up & Login | SCRUM-10 | User Sign-Up & Login - This feature provides users with a secure and straightforward method to create an account and access the Showtime Canada application. | ✅ | Complete registration and login system implemented |
| 1.1 | User Sign-Up & Login | SCRUM-28 | As a new user, I want to sign up using email, so that I can create an account quickly. | ✅ | Register.tsx provides email registration with form validation |
| 1.1 | User Sign-Up & Login | SCRUM-30 | As a registered user, I want to log in securely, so that I can access my personalized dashboard. | ✅ | Login.tsx provides secure login with personalized welcome message |
| 1.1 | User Sign-Up & Login | SCRUM-31 | As a new user, I want to sign up using social media, so that I can create an account quickly. | ✅ | Social media authentication implemented |
| 1.2 | Password Recovery | SCRUM-13 | Password Recovery - This feature enables users to securely regain access to their Showtime Canada account if they have forgotten their password. | ✅ | Complete password recovery system implemented |
| 1.2 | Password Recovery | SCRUM-29 | As a user, I want to reset my password through email, so that I can regain access if I forget it. | ✅ | ForgotPassword.tsx provides complete password reset flow with email verification |
| 1.3 | Profile Management | SCRUM-15 | Profile Management - This feature empowers users to view, update, and personalize their Showtime Canada account information. | ✅ | Complete profile management system implemented |
| 1.3 | Profile Management | SCRUM-27 | As a user, I want to update my profile and preferences, so that I can manage my interests and communication settings. | ✅ | Profile.tsx allows updating personal info, favorite genres, language, location, and notification preferences |

## Epic 2: Event Discovery & Location-Based Filtering

| Epic | Feature | User Story ID | User Story | Status | Notes |
|------|---------|---------------|------------|--------|-------|
| 2.1 | Event Categories | SCRUM-42 | As a user, I want to view a list of event categories, so that I can choose one to explore. | ✅ | EventCategories.tsx provides categorized event browsing |
| 2.1 | Event Categories | SCRUM-43 | As a user, I want to select a category (e.g., Movies, Music), so that I only see events of that type. | ✅ | Category filtering implemented in Events.tsx with persistent selection |
| 2.2 | Location-Based Filtering | SCRUM-44 | As a user, I want to set my city or location, so that I only see events happening near me. | ✅ | Location filtering implemented with user preference persistence and smart defaults |
| 2.2 | Location-Based Filtering | SCRUM-45 | As a user, I want to change my location manually, so that I can check events in other cities. | ✅ | Manual location selection integrated with SCRUM-44 implementation |

## Epic 3: Event Details & Information Display

| Epic | Feature | User Story ID | User Story | Status | Notes |
|------|---------|---------------|------------|--------|-------|
| 3.1 | Venue & Address Display | SCRUM-54 | As a user, I want to view the venue name and address, so that I know where the event is held. | ✅ | Venue name displayed prominently with full address and clickable Google Maps link |
| 3.2 | Event Date & Time Display | SCRUM-53 | As a user, I want to see the event's date and time, so that I can plan my schedule. | ✅ | Date and time displayed with consistent formatting near event title, using 'en-CA' locale |