# Sonnet Survey - Employee Experience Survey Platform

A comprehensive employee experience survey application built with Next.js, Firebase, and TypeScript, designed specifically for Kyan Health team members.

## 🌟 Features

### 🔐 Authentication & Security
- **Firebase Google Auth** restricted to @kyanhealth.com email addresses
- **Custom claims-based admin system** with server-side verification
- **Secure Firestore rules** protecting survey data
- **Admin user management** interface

### 📊 Survey System
- **73 employee engagement questions** organized by 15 factors:
  - Happiness, Leadership, Mission & Purpose
  - Wellbeing, Growth, Diversity & Inclusion
  - Entrepreneurship, Psychological Safety
  - Team Communication, Rewards, Feedback
  - Productivity, Compliance, Retention, Excellence

### 👥 Demographics Collection
- **Department, Country, Role Level**
- **Years at Company, Work Location**
- **Privacy-focused** with aggregate analysis only

### 📈 Admin Dashboard
- **Real-time analytics** with factor scoring
- **Demographics breakdown** with visual charts
- **Response distribution** and completion rates
- **User management** for granting admin access

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Firebase project with Authentication and Firestore enabled
- @kyanhealth.com Google Workspace account

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd sonnet-survey
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create `.env.local` with your Firebase credentials:
```env
FIREBASE_PROJECT_ID=survey-sonnet
FIREBASE_CLIENT_EMAIL=your-service-account@survey-sonnet.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

4. **Deploy Firestore security rules**
```bash
firebase login
firebase init firestore
firebase deploy --only firestore:rules
```

5. **Run the development server**
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
src/
├── app/                    # Next.js app router
│   ├── admin/             # Admin dashboard pages
│   ├── api/               # API routes for admin functions
│   └── survey/            # Survey form page
├── components/            # Reusable React components
├── contexts/              # React context providers
├── data/                  # Survey questions and types
└── lib/                   # Utility functions and services
```

## 🔧 Configuration

### Firebase Setup
1. Create a Firebase project
2. Enable Authentication with Google provider
3. Create Firestore database
4. Generate service account key
5. Configure authorized domains

### Admin Access
1. Set custom claims manually for first admin:
```javascript
// Using Firebase Admin SDK
await admin.auth().setCustomUserClaims(uid, { admin: true });
```

2. Use admin dashboard to grant access to other users

### Survey Questions
Modify questions in `src/data/surveyData.ts`:
- `SURVEY_QUESTIONS` - Main engagement questions
- `DEMOGRAPHIC_QUESTIONS` - Demographics form configuration

## 🚢 Deployment

### Firebase Hosting
```bash
npm run build
firebase deploy --only hosting
```

### Environment Variables
Set production environment variables in Firebase:
```bash
firebase functions:config:set app.firebase_client_email="..." app.firebase_private_key="..."
```

## 📊 Analytics

The admin dashboard provides:
- **Overall engagement scores** across all factors
- **Department-wise breakdown** of satisfaction
- **Geographic analysis** by country
- **Tenure-based insights** (years at company)
- **Role-level comparisons** (IC vs Manager vs Director)
- **Work location analysis** (Remote vs Office vs Hybrid)

## 🔒 Security Features

- **Domain restriction** to @kyanhealth.com only
- **Server-side token verification** for all admin operations
- **Firestore security rules** protecting data access
- **Custom claims** for role-based access control
- **Immutable survey responses** (no edits after submission)

## 🧪 Testing

```bash
# Run tests
npm test

# Build and check for errors
npm run build

# Lint code
npm run lint
```

## 📝 License

This project is proprietary to Kyan Health.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For questions or issues, contact the development team or create an issue in this repository.

---

Built with ❤️ for the Kyan Health team