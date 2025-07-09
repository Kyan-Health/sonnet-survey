const admin = require('firebase-admin');
const { SYSTEM_SURVEY_TYPES } = require('../src/data/surveyTypes');

// Initialize Firebase Admin SDK
const serviceAccount = require('./path-to-your-service-account-key.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function migrateSurveyTypes() {
  console.log('Starting survey type migration...');
  
  for (const surveyTypeConfig of SYSTEM_SURVEY_TYPES) {
    try {
      // Generate unique IDs for questions
      const questionsWithIds = surveyTypeConfig.questionTemplates.map((template, index) => ({
        ...template,
        id: `${surveyTypeConfig.id}_q${index + 1}`
      }));

      // Create survey type document
      const surveyTypeDoc = {
        id: surveyTypeConfig.id,
        metadata: surveyTypeConfig.metadata,
        defaultRatingScale: surveyTypeConfig.defaultRatingScale,
        questions: questionsWithIds,
        factors: [...new Set(questionsWithIds.map(q => q.factor))],
        isActive: true,
        isSystemDefault: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: 'system'
      };

      await db.collection('surveyTypes').doc(surveyTypeConfig.id).set(surveyTypeDoc);
      console.log(`✅ Migrated survey type: ${surveyTypeConfig.metadata.displayName}`);
    } catch (error) {
      console.error(`❌ Error migrating ${surveyTypeConfig.metadata.displayName}:`, error);
    }
  }
  
  console.log('Migration completed!');
  process.exit(0);
}

migrateSurveyTypes().catch(console.error);