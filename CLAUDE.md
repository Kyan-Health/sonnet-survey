# CLAUDE.md - Development Notes

This file contains technical notes and commands for developers working on the Sonnet Survey platform.

## 🔧 Development Commands

### Local Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run linting
npm run lint

# Type checking
npm run type-check
```

### Firebase Deployment
```bash
# Deploy hosting only
firebase deploy --only hosting

# Deploy Firestore rules and indexes
firebase deploy --only firestore:rules,firestore:indexes

# Deploy all Firebase resources
firebase deploy
```

### Database Management
```bash
# Initialize survey types (run once after setup)
# Access /admin/survey-types and click "Sync System Defaults"

# Backup Firestore data
firebase firestore:delete --all-collections --force  # BE CAREFUL!
```

## 📊 Survey Type System

### Survey Type Structure
Each survey type is defined with:
- **Metadata**: name, description, category, research basis
- **Rating Scale**: min/max values, labels, scale type
- **Questions**: templates with factors, order, and custom scales
- **Factors**: grouping for analysis and presentation

### Built-in Survey Types
1. **Employee Engagement** (employee-engagement)
   - 73 questions across 15 factors
   - 5-point Likert scale (1-5)
   - Workplace satisfaction focus

2. **MBI Burnout** (mbi-burnout)
   - 22 questions across 3 factors (Exhaustion, Cynicism, Efficacy)
   - 7-point frequency scale (0-6)
   - Research-validated burnout assessment

3. **COPSOC** (copsoc-workplace)
   - 40+ questions across 8 psychosocial factors
   - Mixed 5-point and 7-point scales
   - Workplace psychosocial risk assessment

4. **COPSOC II Short** (copsoc-ii-short)
   - 36 questions across 19 psychosocial risk factors
   - Specialized COPSOC rating scales (frequency, extent, satisfaction, health, time-frequency)
   - Research-validated Copenhagen Psychosocial Questionnaire II

### Adding New Survey Types
1. Define survey type in `/src/data/surveyTypes.ts`
2. Add to `SYSTEM_SURVEY_TYPES` array
3. Deploy and use admin interface to sync system defaults

## 🏗️ Architecture Notes

### Multi-Survey Flow
1. **Survey Selection** - User chooses from available survey types
2. **Demographics** - Collects organization-specific demographic data
3. **Survey Questions** - Dynamic question presentation based on survey type
4. **Completion** - Tracks completion per survey type per user

### Anonymous Survey Flow
1. **Link Creation** - Admins create shareable anonymous survey links
2. **Token Validation** - System validates survey link tokens
3. **Anonymous Access** - Users complete surveys without authentication
4. **Response Tracking** - Anonymous responses are associated with organizations

### Database Collections
- `organizations` - Organization configuration and settings
- `surveyTypes` - Survey type definitions and metadata
- `surveys` - Individual survey responses with survey type ID
- `surveyLinks` - Anonymous survey links with tokens and configuration
- `users` - User profiles and admin claims

### Mobile Responsiveness Strategy
- **Mobile-first CSS** with progressive enhancement
- **Touch targets** minimum 44px for accessibility
- **Responsive breakpoints**: sm (640px), md (768px), lg (1024px)
- **Card layouts** replace tables on mobile
- **Collapsible navigation** for space efficiency

## 🎨 Design System

### Responsive Typography
- Mobile: `text-sm` to `text-base`
- Tablet: `text-base` to `text-lg`
- Desktop: `text-lg` to `text-xl`

### Button Sizing
- Mobile: `py-2 px-3` with `touch-manipulation`
- Desktop: `py-2 px-4` with hover states
- Minimum touch target: 44px (accessibility requirement)

### Color Coding
- **Blue**: Primary actions, engagement surveys
- **Red**: Danger actions, burnout/stress indicators
- **Green**: Success states, positive scores, wellbeing surveys
- **Purple**: Admin functions, special features
- **Gray**: Secondary actions, disabled states

### COPSOC II Rating Scales
- **COPSOC_FREQUENCY**: 0-4 (Never/hardly ever → Always)
- **COPSOC_EXTENT**: 0-4 (To a very small extent → To a very large extent)
- **COPSOC_SATISFACTION**: 0-3 (Very unsatisfied → Very satisfied)
- **COPSOC_HEALTH**: 0-4 (Poor → Excellent)
- **COPSOC_TIME_FREQUENCY**: 0-4 (Not at all → All the time)
- **COPSOC_WORK_LIFE**: 0-3 (No, not at all → Yes, certainly)

## 🔐 Security Implementation

### Firestore Rules
```javascript
// Survey types - read for all (needed for anonymous surveys), write for admins
match /surveyTypes/{surveyTypeId} {
  allow read: if true; // Anonymous access required for survey loading
  allow write: if isAdmin();
}

// Organizations - read for all (needed for anonymous surveys), write for admins
match /organizations/{orgId} {
  allow read: if true; // Anonymous access required for survey loading
  allow write: if isAdmin();
}

// Surveys - authenticated users and anonymous users can create
match /surveys/{surveyId} {
  // Authenticated users can create their own surveys
  allow create: if isAuthenticatedUser() && isOwner();
  
  // Anonymous users can create surveys (for anonymous survey links)
  allow create: if request.auth == null && 
                   request.resource.data.userId != null &&
                   request.resource.data.userId is string &&
                   request.resource.data.userId.matches('anonymous_.*');
  
  // Only admins can read surveys
  allow read: if isAdmin();
}

// Survey links - for anonymous survey access
match /surveyLinks/{linkId} {
  allow read, write: if isAdmin();
  allow read: if true; // Anonymous access for token validation
}
```

### Anonymous Survey Security
- **Token-based access**: Each survey link has a unique UUID-based token
- **Anonymous user IDs**: Generated as `anonymous_${uuidv4()}` for tracking without identification
- **Organization association**: Anonymous responses are linked to organizations for analytics
- **No personal data**: Anonymous surveys collect no personally identifiable information
- **Firestore rules**: Allow anonymous read access to survey types and organizations, create access for anonymous survey responses

### Admin Claims
```javascript
// Set admin claims (server-side only)
await admin.auth().setCustomUserClaims(uid, { admin: true });
```

## 📱 Mobile Testing

### Testing Checklist
- [ ] Survey type selection cards display properly
- [ ] Rating scales don't wrap on small screens
- [ ] Navigation menus collapse on mobile
- [ ] Touch targets are minimum 44px
- [ ] Admin tables convert to cards on mobile
- [ ] Forms are optimized for mobile input

### Browser Testing
Test on these viewport sizes:
- **Mobile**: 375px (iPhone SE)
- **Mobile Large**: 414px (iPhone 12 Pro)
- **Tablet**: 768px (iPad)
- **Desktop**: 1024px+ (Laptop/Desktop)

## 🚀 Deployment Checklist

### Pre-deployment
- [ ] Run `npm run build` successfully
- [ ] Test all survey types work
- [ ] Verify mobile responsiveness
- [ ] Check admin functions
- [ ] Test organization configuration
- [ ] Verify Firebase rules are deployed

### Post-deployment
- [ ] Test live URL functionality
- [ ] Verify survey type creation works
- [ ] Check analytics display correctly
- [ ] Test mobile experience on real devices
- [ ] Confirm email domain restrictions work

## 🐛 Common Issues

### Survey Type Not Showing
1. Check organization `availableSurveyTypes` configuration
2. Verify survey type is `isActive: true`
3. Confirm Firestore security rules allow access

### Mobile Layout Issues
1. Check responsive breakpoint usage (`sm:`, `md:`, `lg:`)
2. Verify touch targets meet 44px minimum
3. Test on actual mobile devices, not just browser dev tools

### Analytics Not Loading
1. Verify survey responses have `surveyTypeId` field
2. Check organization filter is working
3. Confirm user has admin permissions

## 🔗 Anonymous Survey Links

### Key Features
- **Token-based access** - Unique tokens for each survey link
- **Organization filtering** - Only shows available survey types
- **Response tracking** - Monitors current responses and limits
- **Expiration management** - Optional link expiration dates
- **Mobile responsive** - Works on all devices

### Usage
1. **Create Link**: Admin → Organizations → Survey Links → Create New
2. **Configure**: Set name, survey type, expiration, max responses
3. **Share**: Copy generated URL: `https://site.com/survey/anonymous?token=abc123`
4. **Monitor**: Track responses and manage link status

### Implementation Files
- `/src/lib/surveyLinkService.ts` - Core service functions
- `/src/components/SurveyLinkManager.tsx` - Admin interface
- `/src/app/survey/anonymous/page.tsx` - Anonymous survey page
- `/src/types/organization.ts` - SurveyLink interface

### Security
- UUID-based tokens for security
- Anonymous user ID generation
- Organization association without user tracking
- Proper Firestore security rules

For detailed documentation, see: `/docs/ANONYMOUS_SURVEY_LINKS.md`

## 📚 Technical References

- [Next.js App Router](https://nextjs.org/docs/app)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Firebase v9 SDK](https://firebase.google.com/docs/web/setup)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Mobile Web Best Practices](https://developers.google.com/web/fundamentals/design-and-ux/principles)
- [Anonymous Survey Links Documentation](./docs/ANONYMOUS_SURVEY_LINKS.md)

---

*This file is maintained for development reference and should be updated with new features and architectural changes.*