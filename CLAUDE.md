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
# Access /admin/survey-types and click "Create System Defaults"

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

### Adding New Survey Types
1. Define survey type in `/src/data/surveyTypes.ts`
2. Add to `SYSTEM_SURVEY_TYPES` array
3. Deploy and use admin interface to create

## 🏗️ Architecture Notes

### Multi-Survey Flow
1. **Survey Selection** - User chooses from available survey types
2. **Demographics** - Collects organization-specific demographic data
3. **Survey Questions** - Dynamic question presentation based on survey type
4. **Completion** - Tracks completion per survey type per user

### Database Collections
- `organizations` - Organization configuration and settings
- `surveyTypes` - Survey type definitions and metadata
- `surveys` - Individual survey responses with survey type ID
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
- **Green**: Success states, positive scores
- **Purple**: Admin functions, special features
- **Gray**: Secondary actions, disabled states

## 🔐 Security Implementation

### Firestore Rules
```javascript
// Survey types - read for authenticated, write for admins
match /surveyTypes/{surveyTypeId} {
  allow read: if isAuthenticatedUser();
  allow write: if isAdmin();
}

// Organizations - read for authenticated, write for admins
match /organizations/{orgId} {
  allow read: if isAuthenticatedUser();
  allow write: if isAdmin();
}

// Surveys - write own surveys, read for admins/same org
match /surveys/{surveyId} {
  allow create: if isAuthenticatedUser() && isOwner();
  allow read: if isAdmin() || isSameOrganization();
}
```

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

## 📚 Technical References

- [Next.js App Router](https://nextjs.org/docs/app)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Firebase v9 SDK](https://firebase.google.com/docs/web/setup)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Mobile Web Best Practices](https://developers.google.com/web/fundamentals/design-and-ux/principles)

---

*This file is maintained for development reference and should be updated with new features and architectural changes.*