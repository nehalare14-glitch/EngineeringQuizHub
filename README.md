# EngineeringQuizHub

EngineeringQuizHub is a responsive, web-based engineering quiz application designed to help engineering students improve their technical knowledge through branch-wise quizzes, difficulty-based assessments, and performance analysis.

## Technology Stack

### Frontend
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Lucide React

### Backend
- Java 21 (Spring Boot runtime)
- Spring Boot
- Spring Security
- Maven
- REST APIs
- Firebase Admin SDK

### Authentication
- Firebase Authentication
- Google Sign-In
- Email and Password Authentication
- Email Verification
- Password Reset
- Firebase ID Token Verification

### Database
- Firebase Cloud Firestore (NoSQL)

### Hosting
- Vercel — Frontend
- Koyeb — Backend
- Firebase — Authentication and Database

## Main Features

- User registration and login
- Google and email/password authentication
- Email verification and password recovery
- User dashboard
- Engineering branch selection (CSE, ECE, EEE, Mechanical, Civil, AIML, CCP, etc.)
- Medium and Difficult quiz levels
- Multiple-choice questions
- Quiz submission and score calculation
- Quiz results and answer explanations
- Quiz history and performance analysis
- Mistakes and saved questions
- User profile management
- Profile badge displaying the user's first initial
- Location selection using browser permission
- Responsive interface for Windows PCs and Android smartphones
- Sidebar navigation on desktop
- Hamburger menu navigation on mobile

## Project Structure

```text
EngineeringQuizHub/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   └── components/
│   └── package.json
├── backend/
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       └── resources/
│   └── pom.xml
├── database/
├── docs/
├── tests/
└── README.md
```

## Project Objective

The main objective of EngineeringQuizHub is to provide a centralized online quiz platform where engineering students can test their knowledge, track their progress, review mistakes, and improve their understanding of technical subjects.

## Deployment Architecture

- **Frontend:** Next.js application deployed on Vercel.
- **Backend:** Java Spring Boot REST API hosted on Koyeb.
- **Authentication:** Firebase Authentication.
- **Database:** Firebase Cloud Firestore.
- **Security:** Firebase ID tokens verified by the Java backend.

## Supported Platforms

- Windows desktop and laptop browsers
- Android mobile browsers

## Project Type

Web-Based Engineering Quiz Application

## Development Tools

- Visual Studio Code
- IntelliJ IDEA
- Git and GitHub
- Windows PowerShell
- Firebase Console
- Maven
- Node.js and npm
