# Sonnet Survey - Multi-Survey Employee Experience Platform

A comprehensive, mobile-responsive employee experience survey application built with Next.js, Firebase, and TypeScript. Features a flexible multi-survey system supporting various validated survey instruments including Employee Engagement, MBI Burnout Assessment, and COPSOC workplace factors.

## 🌟 Features

### 🔐 Authentication & Security
- **Firebase Google Auth** with organization-based domain restrictions
- **Custom claims-based admin system** with server-side verification
- **Secure Firestore rules** protecting survey data and user privacy
- **Admin user management** interface with role-based access control

### 📊 Multi-Survey System
- **Database-driven survey types** with flexible configuration
- **Employee Engagement Survey** (73 questions across 15 factors)
- **MBI Burnout Assessment** (22 questions with 0-6 frequency scale)
- **COPSOC Workplace Factors** (40+ questions across 8 psychosocial dimensions)
- **COPSOC II Short** (36 questions across 19 psychosocial risk factors)
- **Survey type selection interface** for organizations with multiple surveys
- **Flexible rating scales** (5-point Likert, 7-point, frequency-based, MBI scale, COPSOC scales)
- **Organization-level survey configuration** with admin controls

### 👥 Dynamic Demographics Collection
- **Customizable demographic questions** per organization
- **Department, Country, Role Level, Years at Company, Work Location**
- **Custom demographic fields** for organization-specific needs
- **Privacy-focused** with aggregate analysis only

### 📱 Mobile-Responsive Design
- **Touch-friendly interface** with proper button sizing and spacing
- **Responsive layouts** adapting from mobile to desktop
- **Mobile-optimized navigation** with collapsible menus
- **Card-based layouts** for mobile table alternatives
- **Proper typography scaling** across all screen sizes

### 📈 Advanced Analytics Dashboard
- **Multi-survey analytics** with survey type segmentation
- **Real-time factor scoring** across all survey types
- **Demographics breakdown** with interactive visualizations
- **Response distribution** and completion rate tracking
- **Survey type comparison** and cross-analysis capabilities
- **Mobile-responsive admin interface** with touch-friendly controls

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

4. **Deploy Firestore security rules and indexes**
```bash
firebase login
firebase init firestore
firebase deploy --only firestore:rules,firestore:indexes
```

5. **Run the development server**
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
src/
├── app/                          # Next.js app router
│   ├── admin/                   # Admin dashboard and management
│   │   ├── organizations/       # Organization management
│   │   ├── survey-types/        # Survey type management
│   │   └── users/              # User management
│   ├── api/                    # API routes for admin functions
│   │   └── admin/              # Admin-specific endpoints
│   └── survey/                 # Dynamic survey interface
├── components/                 # Reusable React components
│   ├── DemographicForm.tsx     # Dynamic demographics form
│   ├── SurveyTypeSelector.tsx  # Survey type configuration
│   ├── SurveyQuestionSelector.tsx # Custom question selection interface
│   ├── OrganizationSelector.tsx # Organization filter
│   └── DemographicManagementModal.tsx # Demographics management
├── contexts/                   # React context providers
│   ├── AuthContext.tsx         # Authentication state
│   └── OrganizationContext.tsx # Organization selection
├── data/                       # Survey definitions and types
│   ├── surveyData.ts          # Legacy survey structure
│   └── surveyTypes.ts         # Multi-survey type definitions
├── lib/                       # Utility functions and services
│   ├── analytics.ts           # Multi-survey analytics
│   ├── surveyService.ts       # Survey CRUD operations
│   ├── surveyTypeService.ts   # Survey type management
│   ├── organizationService.ts # Organization management
│   ├── migrationUtils.ts      # System migration utilities
│   ├── admin.ts              # Admin authentication helpers
│   └── firebase.ts           # Firebase configuration
└── types/                     # TypeScript type definitions
    ├── surveyType.ts          # Survey type interfaces
    └── organization.ts        # Organization interfaces
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

### Survey Type Configuration
The application supports multiple survey types defined in `src/data/surveyTypes.ts`:

#### Built-in Survey Types:
- **Employee Engagement** - 73 questions across 15 workplace factors
- **MBI Burnout Assessment** - 22 research-validated burnout questions
- **COPSOC** - 40+ psychosocial workplace factor questions
- **COPSOC II Short** - 36 questions across 19 psychosocial risk factors

#### Creating Custom Survey Types:
1. Access `/admin/survey-types` to manage survey types
2. Click "Create System Defaults" to initialize built-in surveys
3. Define custom survey types with:
   - Metadata (name, description, category)
   - Custom rating scales (5-point, 7-point, frequency, etc.)
   - Question templates with factor organization
   - Research basis documentation

#### Organization Survey Configuration:
1. Navigate to `/admin/organizations`
2. Click "Survey Types" for any organization
3. Select which survey types are available
4. Set default survey type for new users
5. Configure organization-specific settings

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

## 📊 Multi-Survey Analytics

The admin dashboard provides comprehensive analytics across all survey types:

### Core Metrics:
- **Overall engagement scores** across all factors and survey types
- **Survey type comparison** with cross-analysis capabilities
- **Completion rates** per survey type and organization
- **Response distribution** patterns across different scales

### Demographic Analysis:
- **Department-wise breakdown** with survey type segmentation
- **Geographic analysis** by country and region
- **Tenure-based insights** (years at company)
- **Role-level comparisons** (IC vs Manager vs Director)
- **Work location analysis** (Remote vs Office vs Hybrid)

### Advanced Features:
- **Factor scoring** with category-based performance indicators
- **Dynamic demographic filtering** with custom field support
- **Mobile-responsive charts** and visualizations
- **Export capabilities** for further analysis
- **Real-time updates** as new responses are submitted

### Survey-Specific Analytics:
- **Employee Engagement** - 15-factor workplace satisfaction analysis
- **MBI Burnout** - Exhaustion, cynicism, and efficacy scoring
- **COPSOC** - Psychosocial workplace risk assessment
- **COPSOC II Short** - 19-factor psychosocial risk assessment with specialized scoring

## 🔒 Security Features

- **Organization-based domain restrictions** with flexible configuration
- **Server-side token verification** for all admin operations
- **Firestore security rules** protecting data access across collections
- **Custom claims** for role-based access control
- **Survey type access control** per organization
- **Immutable survey responses** (no edits after submission)
- **Admin action auditing** for compliance tracking
- **Secure survey type management** with admin-only controls

## 📱 Mobile Responsiveness

The application is fully optimized for mobile devices:

### Mobile-First Design:
- **Touch-friendly buttons** with proper sizing (minimum 44px touch targets)
- **Responsive navigation** with collapsible menus on mobile
- **Card-based layouts** replacing tables on mobile screens
- **Optimized typography** scaling across all screen sizes
- **Gesture-friendly interactions** with proper spacing

### Mobile Survey Experience:
- **Rating scale optimization** preventing wrapping on small screens
- **Progressive disclosure** with step-by-step question presentation
- **Mobile-optimized forms** with proper input types and validation
- **Touch-friendly survey navigation** with large, accessible buttons

### Mobile Admin Interface:
- **Responsive dashboard** with mobile-friendly analytics cards
- **Touch-optimized controls** for admin functions
- **Mobile table alternatives** using card layouts
- **Collapsible sections** for better mobile organization

## 🧪 Testing

```bash
# Run tests
npm test

# Build and check for errors
npm run build

# Lint code
npm run lint

# Test mobile responsiveness
npm run dev  # Test on various device sizes using browser dev tools
```

## 📚 Additional Documentation

- **[Migration Guide](MIGRATION.md)** - System migration utilities and procedures
- **[Survey Question Management](SURVEY_QUESTION_MANAGEMENT.md)** - Custom question selection for organizations
- **[Admin Setup](ADMIN_SETUP.md)** - Complete admin configuration guide
- **[Technical Notes](CLAUDE.md)** - Development reference and architecture details

## 📝 License

This project is proprietary to Kyan Health.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly on both desktop and mobile
5. Ensure all survey types work correctly
6. Run `npm run build` to verify compilation
7. Submit a pull request with detailed description

## 📋 Recent Updates

### v2.1.0 - COPSOC II Short Addition
- ✅ **COPSOC II Short survey type** with 36 questions across 19 factors
- ✅ **Specialized COPSOC rating scales** for different question types
- ✅ **Comprehensive psychosocial risk assessment** capabilities
- ✅ **Research-validated Copenhagen Psychosocial Questionnaire II** implementation

### v2.0.0 - Multi-Survey System & Mobile Responsiveness
- ✅ **Multi-survey support** with Employee Engagement, MBI, and COPSOC
- ✅ **Database-driven survey types** with flexible configuration
- ✅ **Survey type selection interface** for organizations
- ✅ **Mobile-responsive design** across all screens
- ✅ **Touch-friendly interactions** with proper button sizing
- ✅ **Admin survey type management** with CRUD operations
- ✅ **Organization-level survey configuration** controls
- ✅ **Enhanced analytics** with multi-survey support
- ✅ **Improved security** with survey type access control

### v1.0.0 - Initial Employee Engagement Platform
- ✅ **Employee engagement survey** with 73 questions
- ✅ **Demographics collection** with privacy controls
- ✅ **Admin dashboard** with analytics
- ✅ **Firebase authentication** with domain restrictions
- ✅ **Organization management** system

## 📞 Support

For questions or issues:
- Create an issue in this repository
- Contact the development team
- Check the admin dashboard for system status

---

Built with ❤️ for organizational wellbeing and employee experience insights