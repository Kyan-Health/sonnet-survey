# Sonnet Survey Documentation

## Overview
This directory contains comprehensive documentation for the Sonnet Survey application. This documentation is designed to enable any developer or AI tool (like Claude Code) to understand, maintain, and extend the application effectively.

## Documentation Structure

### 📋 [API Documentation](./API.md)
Complete API reference including:
- Authentication requirements
- Request/response schemas
- Error codes and handling
- Rate limiting
- Firebase Cloud Functions
- Next.js API routes

**Use this when**: Working with backend endpoints, integrating services, or debugging API issues.

### 🗄️ [Database Schema](./DATABASE_SCHEMA.md)
Comprehensive database structure documentation:
- Firestore collections and documents
- Data relationships and indexes
- Security rules explanation
- Query patterns and performance optimization
- Migration considerations

**Use this when**: Modifying database structure, writing queries, or understanding data flow.

### 🧩 [Component Architecture](./COMPONENT_ARCHITECTURE.md)
Detailed React component structure:
- Component hierarchy and relationships
- Props interfaces and usage patterns
- State management patterns
- Error handling and performance considerations
- Component communication patterns

**Use this when**: Creating new components, refactoring existing ones, or understanding the UI structure.

### 👨‍💻 [Development Workflow](./DEVELOPMENT_WORKFLOW.md)
Complete development standards and practices:
- Code style guidelines and TypeScript patterns
- Testing strategies (unit, integration, E2E)
- Git workflow and commit conventions
- Performance guidelines and security considerations
- Development environment setup

**Use this when**: Contributing code, setting up development environment, or establishing coding standards.

### ⚙️ [Environment Setup](./ENVIRONMENT_SETUP.md)
Comprehensive environment configuration:
- System requirements and prerequisites
- Environment variables (development and production)
- Firebase project setup
- Local development configuration
- Troubleshooting common setup issues

**Use this when**: Setting up the project locally, deploying to new environments, or configuring CI/CD.

### 🔐 [Authentication Flow](./AUTHENTICATION_FLOW.md)
Complete authentication and authorization system:
- Google OAuth integration with Firebase
- Organization-based user validation
- Custom claims and role-based access control
- Security patterns and session management
- Firestore security rules

**Use this when**: Working with user authentication, implementing permissions, or debugging auth issues.

### 📊 [Survey Data Structure](./SURVEY_DATA_STRUCTURE.md)
Detailed survey system documentation:
- Complete question structure (73 questions, 15 factors)
- Response data format and validation
- Dynamic demographics system
- Analytics calculations and data export
- Rating scales and scoring methodology

**Use this when**: Modifying survey questions, implementing analytics, or understanding data structure.

### 🚀 [Deployment & Infrastructure](./DEPLOYMENT_INFRASTRUCTURE.md)
Complete deployment and infrastructure guide:
- Firebase hosting and functions setup
- CI/CD pipeline configuration
- Environment management
- Monitoring and logging
- Backup and recovery procedures

**Use this when**: Deploying the application, setting up infrastructure, or managing production environments.

## Quick Reference

### For New Developers
1. Start with [Environment Setup](./ENVIRONMENT_SETUP.md) to get the project running locally
2. Read [Component Architecture](./COMPONENT_ARCHITECTURE.md) to understand the codebase structure
3. Review [Development Workflow](./DEVELOPMENT_WORKFLOW.md) for coding standards
4. Understand [Authentication Flow](./AUTHENTICATION_FLOW.md) for user management

### For Feature Development
1. Check [Survey Data Structure](./SURVEY_DATA_STRUCTURE.md) for survey-related features
2. Reference [Database Schema](./DATABASE_SCHEMA.md) for data operations
3. Use [API Documentation](./API.md) for backend integrations
4. Follow [Component Architecture](./COMPONENT_ARCHITECTURE.md) for UI components

### For Deployment & Operations
1. Use [Deployment & Infrastructure](./DEPLOYMENT_INFRASTRUCTURE.md) for deployment procedures
2. Reference [Environment Setup](./ENVIRONMENT_SETUP.md) for configuration
3. Check [API Documentation](./API.md) for monitoring endpoints
4. Review [Authentication Flow](./AUTHENTICATION_FLOW.md) for security configuration

### For Debugging & Troubleshooting
1. Check relevant documentation for specific error patterns
2. Use [Environment Setup](./ENVIRONMENT_SETUP.md) for configuration issues
3. Reference [API Documentation](./API.md) for API-related problems
4. Review [Deployment & Infrastructure](./DEPLOYMENT_INFRASTRUCTURE.md) for production issues

## Documentation Standards

### Maintenance
- Update documentation when making code changes
- Include code examples and practical usage patterns
- Provide troubleshooting sections for common issues
- Keep environment variable lists current

### Contributing to Documentation
- Follow the established format and structure
- Include TypeScript interfaces and code examples
- Provide both conceptual explanations and practical implementation details
- Test all code examples and commands

### Documentation Version Control
- Documentation is versioned with the code
- Breaking changes must be reflected in documentation
- Include migration guides for major changes
- Archive old documentation when APIs change

## Key Concepts Summary

### Architecture Overview
- **Frontend**: Next.js 15 with TypeScript, static export for Firebase Hosting
- **Backend**: Firebase Cloud Functions, Firestore database
- **Authentication**: Firebase Auth with Google OAuth, organization-based validation
- **State Management**: React Context + hooks pattern
- **Styling**: Tailwind CSS with responsive design

### Data Flow
```
User Login → Organization Validation → Survey Access → Response Collection → Analytics Processing
```

### Security Model
```
Firebase Auth → Custom Claims → Organization Validation → Role-based Access Control
```

### Deployment Pipeline
```
Code Changes → Build Process → Firebase Deployment → Production Verification
```

## Technology Stack Reference

### Frontend Technologies
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type safety and developer experience
- **Tailwind CSS**: Utility-first CSS framework
- **React Hooks**: State management and side effects
- **Firebase SDK**: Client-side Firebase integration

### Backend Technologies
- **Firebase Cloud Functions**: Serverless backend functions
- **Firestore**: NoSQL document database
- **Firebase Authentication**: User authentication service
- **Node.js 18**: Runtime for Cloud Functions

### Development Tools
- **Firebase CLI**: Deployment and development tools
- **ESLint**: Code linting and style enforcement
- **TypeScript Compiler**: Type checking and compilation
- **Jest**: Unit testing framework
- **Cypress**: End-to-end testing

### Production Services
- **Firebase Hosting**: Static site hosting
- **Firebase Performance**: Application performance monitoring
- **Firebase Analytics**: User behavior analytics
- **Google Cloud**: Underlying infrastructure

## Contact & Support

For questions about this documentation or the application:

1. **Code Issues**: Create an issue in the GitHub repository
2. **Documentation Updates**: Submit a pull request with changes
3. **Architecture Questions**: Refer to the specific documentation section
4. **Deployment Issues**: Check [Deployment & Infrastructure](./DEPLOYMENT_INFRASTRUCTURE.md)

## License
This documentation is part of the Sonnet Survey project and follows the same license terms as the main application code.