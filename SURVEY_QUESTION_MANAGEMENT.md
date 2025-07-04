# Survey Question Management

This document covers the advanced survey question customization system for organizations.

## Overview

The Survey Question Management system allows administrators to customize which questions are included in surveys for each organization. This provides flexibility for organizations with different needs while maintaining survey validity.

## SurveyQuestionSelector Component

**File:** `src/components/SurveyQuestionSelector.tsx`

### Purpose
Provides a comprehensive interface for organizations to:
- Select/deselect individual survey questions
- Manage questions by factor groupings
- View question statistics and coverage
- Maintain survey validity through factor coverage

### Key Features

#### Factor-Based Organization
Questions are organized by survey factors for easy management:
- **Collapsible Factor Groups** - Expand/collapse to view questions
- **Bulk Factor Selection** - Select/deselect entire factors at once
- **Factor Statistics** - View selection counts per factor
- **Partial Selection Indicators** - Visual feedback for partially selected factors

#### Question Selection Interface
- **Individual Question Checkboxes** - Granular control over question inclusion
- **Question Preview** - See actual question text with organization name
- **Question Metadata** - View question IDs and sub-factors
- **Search and Filter** - Find specific questions (future enhancement)

#### Statistics Dashboard
Real-time statistics showing:
- **Selected Count** - Number of questions currently selected
- **Total Available** - Total questions in the survey pool
- **Coverage Percentage** - Percentage of questions selected
- **Active Factors** - Number of factors with at least one question selected

#### Bulk Operations
- **Select All** - Choose all available questions
- **Deselect All** - Remove all question selections
- **Factor-Level Selection** - Select/deselect entire factor groups

### Usage

#### Props Interface
```typescript
interface SurveyQuestionSelectorProps {
  organization: Organization;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedOrganization: Organization) => void;
}
```

#### Integration Example
```typescript
import SurveyQuestionSelector from '@/components/SurveyQuestionSelector';

function OrganizationAdmin() {
  const [showQuestionSelector, setShowQuestionSelector] = useState(false);
  const [organization, setOrganization] = useState<Organization>();

  return (
    <>
      <button onClick={() => setShowQuestionSelector(true)}>
        Customize Questions
      </button>
      
      <SurveyQuestionSelector
        organization={organization}
        isOpen={showQuestionSelector}
        onClose={() => setShowQuestionSelector(false)}
        onSave={(updatedOrg) => {
          setOrganization(updatedOrg);
          setShowQuestionSelector(false);
        }}
      />
    </>
  );
}
```

### Data Management

#### Question Selection Storage
Selected questions are stored in the organization document:

```typescript
interface Organization {
  selectedQuestions?: string[]; // Array of question IDs
  questionSetVersion?: number; // Version tracking
  lastQuestionUpdate?: Date; // Timestamp of last update
}
```

#### Version Control
- **Automatic Versioning** - Increments `questionSetVersion` on each save
- **Timestamp Tracking** - Records `lastQuestionUpdate` for audit trails
- **Change Detection** - Compares selections to detect modifications

#### Persistence
```typescript
const handleSave = async () => {
  const updatedOrg = {
    ...organization,
    selectedQuestions,
    questionSetVersion: (organization.questionSetVersion || 0) + 1,
    lastQuestionUpdate: new Date()
  };

  await updateOrganization(organization.id, {
    selectedQuestions,
    questionSetVersion: updatedOrg.questionSetVersion,
    lastQuestionUpdate: updatedOrg.lastQuestionUpdate
  });
};
```

## Question Statistics System

**File:** `src/data/surveyData.ts` (getQuestionStats function)

### Calculated Metrics
- **Selection Count** - Total questions selected
- **Total Questions** - Available questions in pool
- **Selection Percentage** - Coverage calculation
- **Factor Statistics** - Per-factor selection breakdown

### Factor Analysis
```typescript
interface FactorStats {
  [factorName: string]: {
    selected: number;
    total: number;
    percentage: number;
  }
}
```

## Best Practices

### Question Selection Guidelines

#### Minimum Requirements
- **At least 1 question per factor** - Maintains survey validity
- **Minimum 20% coverage** - Ensures statistical significance
- **Balanced factor representation** - Avoid overweighting single factors

#### Recommended Practices
- **Review factor coverage** - Ensure key dimensions are represented
- **Consider survey length** - Balance comprehensiveness with completion rates
- **Test with stakeholders** - Validate question relevance for organization
- **Document rationale** - Record reasons for significant question exclusions

### Version Management
- **Track major changes** - Document significant question set modifications
- **Coordinate with surveys** - Avoid changes during active survey periods
- **Backup configurations** - Maintain records of previous question sets
- **Communicate changes** - Inform stakeholders of question set updates

## Admin Workflow

### Setting Up Question Customization

1. **Access Organization Admin**
   ```
   /admin/organizations → Select Organization → Manage Questions
   ```

2. **Review Default Selection**
   - All questions selected by default
   - Review factors relevant to organization

3. **Customize Selection**
   - Use factor-level controls for bulk changes
   - Fine-tune with individual question selection
   - Monitor statistics for adequate coverage

4. **Save and Validate**
   - Review final statistics
   - Ensure minimum coverage requirements
   - Save configuration with version increment

### Monitoring Question Usage

#### Analytics Integration
- **Response Distribution** - Track responses across selected questions
- **Factor Performance** - Monitor factor-level engagement
- **Completion Rates** - Measure impact of question set size
- **Trend Analysis** - Compare performance across question set versions

#### Audit Trail
- **Version History** - Track question set changes over time
- **Change Attribution** - Link changes to admin users
- **Impact Assessment** - Measure effects of question modifications

## Technical Implementation

### Component Architecture
```
SurveyQuestionSelector/
├── Question Statistics Dashboard
├── Bulk Operations Toolbar
├── Factor Groups
│   ├── Factor Header (with bulk controls)
│   ├── Question List (expandable)
│   └── Selection Status Indicators
└── Save/Cancel Actions
```

### State Management
- **Local State** - Question selections during editing
- **Optimistic Updates** - Immediate UI feedback
- **Persistence Layer** - Firestore organization updates
- **Error Handling** - Rollback on save failures

### Performance Considerations
- **Virtualization** - For large question sets (future enhancement)
- **Debounced Search** - Efficient question filtering
- **Memoized Calculations** - Optimize statistics computation
- **Lazy Loading** - Load question details on demand

## Integration Points

### Survey Generation
Selected questions are used during survey presentation:
```typescript
// Filter questions based on organization selection
const surveyQuestions = SURVEY_QUESTION_TEMPLATES.filter(
  question => organization.selectedQuestions?.includes(question.id)
);
```

### Analytics System
Question selection affects analytics calculations:
- **Factor scoring** - Only includes selected questions
- **Benchmark comparisons** - Adjusts for different question sets
- **Trend analysis** - Accounts for question set changes

### Migration Support
Question selection is preserved during system migrations:
- **Legacy Support** - Maintains existing selections
- **Default Handling** - Sets all questions if no selection exists
- **Validation** - Ensures selected questions still exist

---

*For organizations with specialized needs, consider creating custom question templates or consulting with the survey methodology team.*