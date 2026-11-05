# EngineeringQuizHub

**EngineeringQuizHub** is a responsive, web-based engineering quiz application designed to help engineering students improve their technical knowledge through branch-wise quizzes, difficulty-based assessments, and performance analysis.

The application uses a modern frontend, a Java-based backend, Firebase Authentication, and Cloud Firestore to deliver an accessible online quiz experience.

## Project Links

- **GitHub Repository:** https://github.com/nehalare14-glitch/EngineeringQuizHub
- **Live Website:** https://engineeringquizhub.vercel.app
- **Backend API:** https://engineeringquizhub.onrender.com

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

### Hosting and Deployment

| Component | Technology | Hosting Platform |
|---|---|---|
| Frontend | Next.js 16 | Vercel |
| Backend | Java Spring Boot | Render |
| Authentication | Firebase Authentication | Firebase |
| Database | Cloud Firestore | Firebase |
| Source Code | Git | GitHub |

## Main Features

### Authentication and User Management
- User registration and login
- Google and email/password authentication
- Email verification and password recovery
- User profile management
- Profile badge displaying the user's first initial

### Quiz Management
- Engineering branch selection
- Subject-wise quizzes
- Multiple-choice questions
- Difficulty-based assessments
- Quiz submission and automatic score calculation
- Quiz results and performance history

### Dashboard and Navigation
- User dashboard
- Responsive interface for Windows PCs and Android smartphones
- Sidebar navigation on desktop
- Hamburger menu navigation on mobile

### Additional Features and Planned Enhancements
- Detailed answer explanations
- Mistakes and saved questions
- Advanced performance analysis
- Location selection using browser permission
- Additional engineering branches and question banks

## Supported Engineering Branches

The current application includes:

1. Computer Science and Engineering (CSE)
2. Electronics and Communication Engineering (ECE)
3. Electrical and Electronics Engineering (EEE)
4. Mechanical Engineering (MECH)
5. Civil Engineering (CIVIL)
6. Artificial Intelligence and Machine Learning (AIML)

Additional branches, including CCP, may be supported in future updates.

## Quiz Difficulty Levels

Quiz difficulty options are managed by the application and question database. The project supports difficulty-based assessments, including Easy, Medium, and Difficult levels where configured.

## Project Structure

```text
EngineeringQuizHub/
├── backend/
│   ├── src/
│   │   └── main/
│   │       ├── java/
│   │       └── resources/
│   ├── data/
│   ├── pom.xml
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── lib/
│   ├── package.json
│   └── next.config.ts
├── firebase-scripts/
├── database/
├── docs/
├── tests/
├── .gitignore
├── .gitattributes
└── README.md
```

## Project Objective

The main objective of EngineeringQuizHub is to provide a centralized online quiz platform where engineering students can:

- Test their knowledge across engineering branches and subjects.
- Assess their understanding through multiple-choice quizzes.
- Track scores and previous quiz attempts.
- Identify areas that require improvement.
- Access quizzes through desktop and mobile browsers.

## Deployment Architecture

The application follows a frontend–backend architecture using Firebase services.

**1. Frontend — Vercel**

The Next.js application is deployed on Vercel and provides the user interface for authentication, dashboards, quizzes, profiles, and results.

**2. Backend — Render**

The Java Spring Boot REST API is hosted on Render. It processes authenticated requests, retrieves quiz data, handles quiz submissions, and manages results.

**3. Authentication — Firebase**

Firebase Authentication provides Google Sign-In and email/password authentication. Authenticated users receive Firebase ID tokens.

**4. Database — Cloud Firestore**

Cloud Firestore stores application data, including quiz content and user-related records.

**5. Security**

The frontend sends Firebase ID tokens to protected backend endpoints. The Spring Boot backend verifies these tokens using the Firebase Admin SDK.

### Request Flow

```text
User (Windows / Android)
          |
          v
Next.js Frontend (Vercel)
          |
          v
Firebase Authentication
          |
          v
Firebase ID Token
          |
          v
Spring Boot REST API (Render)
          |
          v
Firebase Cloud Firestore
          |
          v
API Response → Frontend → User
```

## API Overview

The backend includes endpoints for:

- Health checks
- Engineering branches
- Subjects
- Quiz questions
- Quiz submissions
- User results and history

Protected endpoints require a valid Firebase ID token.

## Supported Platforms

- Windows desktop browsers
- Windows laptop browsers
- Android mobile browsers

The responsive interface adapts to different screen sizes.

## Development Tools

- Visual Studio Code
- IntelliJ IDEA
- Git and GitHub
- Windows PowerShell
- Firebase Console
- Maven
- Node.js and npm
- Vercel Dashboard
- Render Dashboard

## Local Development

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

The frontend is available at `http://localhost:3000` by default.

### Backend

```powershell
cd backend
mvn spring-boot:run
```

The backend uses environment-specific Firebase credentials and application configuration.

**Security:** Never commit Firebase service-account private keys, passwords, or other secrets to GitHub.

## Deployment Notes

- Frontend hosting: Vercel
- Backend hosting: Render
- Database: Firebase Cloud Firestore
- Authentication: Firebase Authentication
- Version control: GitHub

The frontend communicates with the deployed backend using the `NEXT_PUBLIC_API_URL` environment variable.

The backend may experience additional startup latency when running on a hosting plan that scales down during inactivity.

## Project Type

**Web-Based Engineering Quiz Application**

## Future Improvements

- Expand the engineering question bank.
- Add more engineering branches and subjects.
- Improve question explanations and review tools.
- Enhance performance analytics.
- Optimize frontend and backend loading times.
- Expand automated testing.

## Repository

**EngineeringQuizHub**

https://github.com/nehalare14-glitch/EngineeringQuizHub
