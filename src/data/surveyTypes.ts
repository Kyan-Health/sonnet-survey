import { SurveyTypeConfig, RATING_SCALES } from '@/types/surveyType';

// Employee Engagement Survey Type (migrated from current system)
export const EMPLOYEE_ENGAGEMENT_SURVEY: SurveyTypeConfig = {
  id: 'employee-engagement',
  metadata: {
    name: 'employee-engagement',
    displayName: 'Employee Engagement',
    description: 'Comprehensive employee engagement survey covering happiness, leadership, growth, and workplace culture',
    version: '1.0',
    category: 'engagement',
    recommendedFrequency: 'Quarterly',
    estimatedTime: 15
  },
  defaultRatingScale: RATING_SCALES.FIVE_POINT_LIKERT,
  questionTemplates: [
    // Happiness
    {
      factor: "Happiness",
      questionTemplate: "I often experience positive emotions when I am working (e.g., happiness, enthusiasm, enjoyment).",
      order: 1,
      required: true
    },
    {
      factor: "Happiness",
      questionTemplate: "I am passionate about the work I do.",
      order: 2,
      required: true
    },
    {
      factor: "Happiness",
      questionTemplate: "On most days, time goes by quickly when I'm working.",
      order: 3,
      required: true
    },
    {
      factor: "Happiness",
      questionTemplate: "I feel a strong sense of belonging to {organization}.",
      order: 4,
      required: true
    },
    {
      factor: "Happiness",
      questionTemplate: "I would recommend {organization} as a great place to work.",
      order: 5,
      required: true
    },

    // Leadership
    {
      factor: "Leadership",
      questionTemplate: "I have confidence in {organization}'s Senior Leadership.",
      order: 6,
      required: true
    },
    {
      factor: "Leadership",
      questionTemplate: "{organization}'s Senior Leadership has communicated a vision that motivates me.",
      order: 7,
      required: true
    },
    {
      factor: "Leadership",
      questionTemplate: "{organization}'s Senior Leadership demonstrates that people are important to the company's success.",
      order: 8,
      required: true
    },

    // Mission & Purpose
    {
      factor: "Mission & Purpose",
      questionTemplate: "I understand {organization}'s Mission.",
      order: 9,
      required: true
    },
    {
      factor: "Mission & Purpose",
      questionTemplate: "{organization}'s Mission aligns well with my own purpose and values.",
      order: 10,
      required: true
    },
    {
      factor: "Mission & Purpose",
      questionTemplate: "I know how my work contributes to the goals of {organization}.",
      order: 11,
      required: true
    },
    {
      factor: "Mission & Purpose",
      questionTemplate: "{organization} is in a position to succeed over the next 3 years.",
      order: 12,
      required: true
    },
    {
      factor: "Mission & Purpose",
      questionTemplate: "{organization}'s commitment to social responsibility is genuine (e.g. sustainability, social impact etc.).",
      order: 13,
      required: true
    },
    {
      factor: "Mission & Purpose",
      questionTemplate: "{organization}'s social impact initiatives really allow us to make a positive difference.",
      order: 14,
      required: true
    },

    // Wellbeing & Switching Off
    {
      factor: "Wellbeing & Switching Off",
      questionTemplate: "We are genuinely supported with flexibility in the way we work (hours, time off).",
      order: 15,
      required: true
    },
    {
      factor: "Wellbeing & Switching Off",
      questionTemplate: "I believe our team's wellbeing is a priority at {organization}.",
      order: 16,
      required: true
    },
    {
      factor: "Wellbeing & Switching Off",
      questionTemplate: "The norms on my team are supportive of my personal or family responsibilities.",
      order: 17,
      required: true
    },
    {
      factor: "Wellbeing & Switching Off",
      questionTemplate: "I am able to effectively switch off from work to make time for other areas in my life.",
      order: 18,
      required: true
    },
    {
      factor: "Wellbeing & Switching Off",
      subFactor: "Direct Manager Effectiveness",
      questionTemplate: "My manager is checking in regularly enough with how I am doing (not just work related).",
      order: 19,
      required: true
    },
    {
      factor: "Wellbeing & Switching Off",
      subFactor: "Direct Manager Effectiveness",
      questionTemplate: "My manager is setting a good example for our wellbeing.",
      order: 20,
      required: true
    },

    // Growth
    {
      factor: "Growth",
      questionTemplate: "{organization} is a great company for me to make a contribution to my development.",
      order: 21,
      required: true
    },
    {
      factor: "Growth",
      questionTemplate: "I believe there are good personal growth opportunities for me at {organization}.",
      order: 22,
      required: true
    },
    {
      factor: "Growth",
      questionTemplate: "My performance is evaluated fairly.",
      order: 23,
      required: true
    },
    {
      factor: "Growth",
      questionTemplate: "{organization} is a great company for me to develop my leadership skills.",
      order: 24,
      required: true
    },
    {
      factor: "Growth",
      questionTemplate: "I know what I need to do to be successful in my role.",
      order: 25,
      required: true
    },
    {
      factor: "Growth",
      subFactor: "Direct Manager Effectiveness",
      questionTemplate: "My manager actively supports my personal growth & development.",
      order: 26,
      required: true
    },

    // Diversity & Inclusion
    {
      factor: "Diversity & Inclusion",
      questionTemplate: "Decisions that affect me are made in a fair and unbiased manner.",
      order: 27,
      required: true
    },
    {
      factor: "Diversity & Inclusion",
      questionTemplate: "I can be my authentic self at work.",
      order: 28,
      required: true
    },
    {
      factor: "Diversity & Inclusion",
      questionTemplate: "I feel I am part of a team.",
      order: 29,
      required: true
    },
    {
      factor: "Diversity & Inclusion",
      questionTemplate: "{organization} values diversity.",
      order: 30,
      required: true
    },
    {
      factor: "Diversity & Inclusion",
      questionTemplate: "{organization} builds teams that are diverse.",
      order: 31,
      required: true
    },
    {
      factor: "Diversity & Inclusion",
      questionTemplate: "People from all backgrounds have equal opportunities to succeed at {organization}.",
      order: 32,
      required: true
    },
    {
      factor: "Diversity & Inclusion",
      questionTemplate: "I am confident on how I can contribute in building a more inclusive culture in my team.",
      order: 33,
      required: true
    },
    {
      factor: "Diversity & Inclusion",
      subFactor: "Direct Manager Effectiveness",
      questionTemplate: "My manager promotes an inclusive team environment.",
      order: 34,
      required: true
    },

    // Entrepreneurship
    {
      factor: "Entrepreneurship",
      questionTemplate: "I am able to use my personal initiative or judgment in carrying out my work.",
      order: 35,
      required: true
    },
    {
      factor: "Entrepreneurship",
      questionTemplate: "We are encouraged to be innovative even though some of our initiatives may not succeed.",
      order: 36,
      required: true
    },
    {
      factor: "Entrepreneurship",
      questionTemplate: "We have the space to explore creative solutions and take thoughtful risks in our day-to-day work.",
      order: 37,
      required: true
    },
    {
      factor: "Entrepreneurship",
      questionTemplate: "We have enough autonomy to perform our jobs effectively.",
      order: 38,
      required: true
    },

    // Psychological Safety
    {
      factor: "Psychological Safety",
      subFactor: "Direct Manager Effectiveness",
      questionTemplate: "My manager is a great role model for our team.",
      order: 39,
      required: true
    },
    {
      factor: "Psychological Safety",
      questionTemplate: "At {organization} there is open and honest two-way communication.",
      order: 40,
      required: true
    },
    {
      factor: "Psychological Safety",
      questionTemplate: "I can voice a contrary opinion without fear of negative consequences.",
      order: 41,
      required: true
    },
    {
      factor: "Psychological Safety",
      questionTemplate: "When I share my opinion, it is valued.",
      order: 42,
      required: true
    },
    {
      factor: "Psychological Safety",
      questionTemplate: "At {organization}, failure is seen as an opportunity for learning and growth.",
      order: 43,
      required: true
    },
    {
      factor: "Psychological Safety",
      subFactor: "Direct Manager Effectiveness",
      questionTemplate: "People are comfortable speaking up when our manager is present.",
      order: 44,
      required: true
    },

    // Team Communication & Collaboration
    {
      factor: "Team Communication & Collaboration",
      questionTemplate: "I have access to the information I need to do my job effectively.",
      order: 45,
      required: true
    },
    {
      factor: "Team Communication & Collaboration",
      questionTemplate: "Other functions at {organization} collaborate well with our team to get the job done.",
      order: 46,
      required: true
    },
    {
      factor: "Team Communication & Collaboration",
      questionTemplate: "Most of the systems and processes here support us getting our work done effectively.",
      order: 47,
      required: true
    },
    {
      factor: "Team Communication & Collaboration",
      questionTemplate: "Generally, teams at {organization} work towards common goals.",
      order: 48,
      required: true
    },
    {
      factor: "Team Communication & Collaboration",
      questionTemplate: "The way decisions are taken at {organization} supports us getting our work done effectively.",
      order: 49,
      required: true
    },
    {
      factor: "Team Communication & Collaboration",
      questionTemplate: "My work is efficiently aligned with other team members.",
      order: 50,
      required: true
    },
    {
      factor: "Team Communication & Collaboration",
      questionTemplate: "Where required, we have clearly defined ownership for company priorities, goals and initiatives at {organization}.",
      order: 51,
      required: true
    },
    {
      factor: "Team Communication & Collaboration",
      questionTemplate: "I am appropriately involved in decisions that affect my work.",
      order: 52,
      required: true
    },

    // Reward & Recognition
    {
      factor: "Reward & Recognition",
      questionTemplate: "I am fairly compensated for the work I do.",
      order: 53,
      required: true
    },
    {
      factor: "Reward & Recognition",
      questionTemplate: "I receive appropriate recognition for good work at {organization}.",
      order: 54,
      required: true
    },
    {
      factor: "Reward & Recognition",
      questionTemplate: "I feel empowered to appropriately reward and recognize my team.",
      order: 55,
      required: true
    },
    {
      factor: "Reward & Recognition",
      questionTemplate: "Generally, the right people are recognized at {organization}.",
      order: 56,
      required: true
    },

    // Psychological Safety (Feedback)
    {
      factor: "Psychological Safety (Feedback)",
      questionTemplate: "{organization} takes action on team's feedback.",
      order: 57,
      required: true
    },
    {
      factor: "Psychological Safety (Feedback)",
      questionTemplate: "Our culture encourages giving candid, honest feedback even when it may be difficult.",
      order: 58,
      required: true
    },
    {
      factor: "Psychological Safety (Feedback)",
      questionTemplate: "We (team members) regularly give each other candid feedback.",
      order: 59,
      required: true
    },
    {
      factor: "Psychological Safety (Feedback)",
      subFactor: "Direct Manager Effectiveness",
      questionTemplate: "My manager gives me useful feedback on how I am performing.",
      order: 60,
      required: true
    },

    // Individual Focus & Productivity
    {
      factor: "Individual Focus & Productivity",
      subFactor: "Direct Manager Effectiveness",
      questionTemplate: "My manager keeps me informed about my team's future direction and goals.",
      order: 61,
      required: true
    },
    {
      factor: "Individual Focus & Productivity",
      subFactor: "Direct Manager Effectiveness",
      questionTemplate: "My manager provides me with the information I need to do my job effectively.",
      order: 62,
      required: true
    },
    {
      factor: "Individual Focus & Productivity",
      questionTemplate: "When it is clear that someone is not delivering in their role, we do something about it.",
      order: 63,
      required: true
    },
    {
      factor: "Individual Focus & Productivity",
      questionTemplate: "I feel equipped to effectively prioritize my workload.",
      order: 64,
      required: true
    },
    {
      factor: "Individual Focus & Productivity",
      questionTemplate: "Generally, I believe my workload is reasonable for my role.",
      order: 65,
      required: true
    },

    // Compliance
    {
      factor: "Compliance",
      questionTemplate: "I am aware of and understand {organization}'s Code of Conduct and other compliance guidelines.",
      order: 66,
      required: true
    },
    {
      factor: "Compliance",
      questionTemplate: "I believe {organization}'s Code of Conduct and other compliance guidelines help team members act in accordance with {organization}'s values.",
      order: 67,
      required: true
    },

    // Retention
    {
      factor: "Retention",
      questionTemplate: "I rarely think about looking for a job at another company.",
      order: 68,
      required: true
    },
    {
      factor: "Retention",
      questionTemplate: "I plan to be working at {organization} a year from now.",
      order: 69,
      required: true
    },
    {
      factor: "Retention",
      questionTemplate: "If I were offered a similar job at another company, I would stay at {organization}.",
      order: 70,
      required: true
    },

    // Excellence
    {
      factor: "Excellence",
      questionTemplate: "Day-to-day decisions here demonstrate that quality and improvement are top priorities.",
      order: 71,
      required: true
    },
    {
      factor: "Excellence",
      questionTemplate: "{organization} strives for excellence in all aspects of its operations.",
      order: 72,
      required: true
    },
    {
      factor: "Excellence",
      questionTemplate: "At {organization}, we are striking a good balance between continuous improvement and launching new projects.",
      order: 73,
      required: true
    }
  ]
};

// MBI (Maslach Burnout Inventory) Survey Type
export const MBI_BURNOUT_SURVEY: SurveyTypeConfig = {
  id: 'mbi-burnout',
  metadata: {
    name: 'mbi-burnout',
    displayName: 'Burnout Assessment (MBI)',
    description: 'Maslach Burnout Inventory for measuring workplace burnout across exhaustion, cynicism, and efficacy dimensions',
    version: '1.0',
    researchBasis: 'Maslach Burnout Inventory',
    category: 'burnout',
    recommendedFrequency: 'Quarterly',
    estimatedTime: 8
  },
  defaultRatingScale: RATING_SCALES.MBI_FREQUENCY,
  questionTemplates: [
    // Exhaustion
    {
      factor: "Exhaustion",
      questionTemplate: "I feel emotionally drained from my work.",
      order: 1,
      required: true
    },
    {
      factor: "Exhaustion", 
      questionTemplate: "I feel used up at the end of the workday.",
      order: 2,
      required: true
    },
    {
      factor: "Exhaustion",
      questionTemplate: "I feel fatigued when I get up in the morning and have to face another day on the job.",
      order: 3,
      required: true
    },
    {
      factor: "Exhaustion",
      questionTemplate: "Working with people all day is really a strain for me.",
      order: 4,
      required: true
    },
    {
      factor: "Exhaustion",
      questionTemplate: "I feel burned out from my work.",
      order: 5,
      required: true
    },
    {
      factor: "Exhaustion",
      questionTemplate: "I feel frustrated by my job.",
      order: 6,
      required: true
    },
    {
      factor: "Exhaustion",
      questionTemplate: "I feel I'm working too hard on my job.",
      order: 7,
      required: true
    },
    {
      factor: "Exhaustion",
      questionTemplate: "I don't really care what happens to some colleagues.",
      order: 8,
      required: true
    },
    {
      factor: "Exhaustion",
      questionTemplate: "Working directly with people puts too much stress on me.",
      order: 9,
      required: true
    },

    // Cynicism/Depersonalization
    {
      factor: "Cynicism",
      questionTemplate: "I treat some colleagues as if they were impersonal objects.",
      order: 10,
      required: true
    },
    {
      factor: "Cynicism",
      questionTemplate: "I have become more callous toward people since I took this job.",
      order: 11,
      required: true
    },
    {
      factor: "Cynicism",
      questionTemplate: "I worry that this job is hardening me emotionally.",
      order: 12,
      required: true
    },
    {
      factor: "Cynicism",
      questionTemplate: "I feel colleagues blame me for some of their problems.",
      order: 13,
      required: true
    },
    {
      factor: "Cynicism",
      questionTemplate: "I have less empathy for colleagues than I used to have.",
      order: 14,
      required: true
    },

    // Professional Efficacy (Achievement)
    {
      factor: "Professional Efficacy",
      questionTemplate: "I can easily understand how my colleagues feel about things.",
      order: 15,
      required: true
    },
    {
      factor: "Professional Efficacy",
      questionTemplate: "I deal very effectively with the problems of my colleagues.",
      order: 16,
      required: true
    },
    {
      factor: "Professional Efficacy",
      questionTemplate: "I feel I'm positively influencing people's lives through my work.",
      order: 17,
      required: true
    },
    {
      factor: "Professional Efficacy",
      questionTemplate: "I feel very energetic.",
      order: 18,
      required: true
    },
    {
      factor: "Professional Efficacy",
      questionTemplate: "I can easily create a relaxed atmosphere with my colleagues.",
      order: 19,
      required: true
    },
    {
      factor: "Professional Efficacy",
      questionTemplate: "I feel exhilarated after working closely with my colleagues.",
      order: 20,
      required: true
    },
    {
      factor: "Professional Efficacy",
      questionTemplate: "I have accomplished many worthwhile things in this job.",
      order: 21,
      required: true
    },
    {
      factor: "Professional Efficacy",
      questionTemplate: "In my work, I deal with emotional problems very calmly.",
      order: 22,
      required: true
    }
  ]
};

// COPSOC (Copenhagen Psychosocial Questionnaire) Survey Type  
export const COPSOC_WELLBEING_SURVEY: SurveyTypeConfig = {
  id: 'copsoc-wellbeing',
  metadata: {
    name: 'copsoc-wellbeing',
    displayName: 'Workplace Wellbeing (COPSOC)',
    description: 'Copenhagen Psychosocial Questionnaire measuring psychosocial workplace factors affecting wellbeing',
    version: '1.0',
    researchBasis: 'Copenhagen Psychosocial Questionnaire (COPSOC)',
    category: 'wellbeing',
    recommendedFrequency: 'Annually',
    estimatedTime: 12
  },
  defaultRatingScale: RATING_SCALES.FIVE_POINT_LIKERT,
  questionTemplates: [
    // Job Demands
    {
      factor: "Job Demands",
      questionTemplate: "Do you have enough time to complete your work tasks?",
      order: 1,
      required: true,
      ratingScale: RATING_SCALES.FREQUENCY_SCALE
    },
    {
      factor: "Job Demands",
      questionTemplate: "How often do you not have time to complete all your work tasks?",
      order: 2,
      required: true,
      ratingScale: RATING_SCALES.FREQUENCY_SCALE
    },
    {
      factor: "Job Demands",
      questionTemplate: "Do you have to work very fast?",
      order: 3,
      required: true,
      ratingScale: RATING_SCALES.FREQUENCY_SCALE
    },
    {
      factor: "Job Demands",
      questionTemplate: "Is your workload unevenly distributed so it piles up?",
      order: 4,
      required: true,
      ratingScale: RATING_SCALES.FREQUENCY_SCALE
    },

    // Work Pace and Time Pressure
    {
      factor: "Work Pace",
      questionTemplate: "Do you have to work very intensively?",
      order: 5,
      required: true,
      ratingScale: RATING_SCALES.FREQUENCY_SCALE
    },
    {
      factor: "Work Pace",
      questionTemplate: "Do you have enough time for your work tasks?",
      order: 6,
      required: true,
      ratingScale: RATING_SCALES.FREQUENCY_SCALE
    },
    {
      factor: "Work Pace",
      questionTemplate: "Do you get behind with your work?",
      order: 7,
      required: true,
      ratingScale: RATING_SCALES.FREQUENCY_SCALE
    },

    // Job Control/Autonomy
    {
      factor: "Job Control",
      questionTemplate: "Do you have a large degree of influence concerning your work?",
      order: 8,
      required: true
    },
    {
      factor: "Job Control",
      questionTemplate: "Do you have a say in choosing who you work with?",
      order: 9,
      required: true
    },
    {
      factor: "Job Control",
      questionTemplate: "Can you influence the amount of work assigned to you?",
      order: 10,
      required: true
    },
    {
      factor: "Job Control",
      questionTemplate: "Do you have influence on what you do at work?",
      order: 11,
      required: true
    },

    // Social Support from Colleagues
    {
      factor: "Colleague Support",
      questionTemplate: "How often do you get help and support from your colleagues?",
      order: 12,
      required: true,
      ratingScale: RATING_SCALES.FREQUENCY_SCALE
    },
    {
      factor: "Colleague Support",
      questionTemplate: "How often are your colleagues willing to listen to your work-related problems?",
      order: 13,
      required: true,
      ratingScale: RATING_SCALES.FREQUENCY_SCALE
    },
    {
      factor: "Colleague Support",
      questionTemplate: "How often do your colleagues talk with you about how well you carry out your work?",
      order: 14,
      required: true,
      ratingScale: RATING_SCALES.FREQUENCY_SCALE
    },

    // Social Support from Supervisors
    {
      factor: "Supervisor Support",
      questionTemplate: "How often does your immediate superior give you information on how well you carry out your work?",
      order: 15,
      required: true,
      ratingScale: RATING_SCALES.FREQUENCY_SCALE
    },
    {
      factor: "Supervisor Support",
      questionTemplate: "How often is your immediate superior willing to listen to problems in your work?",
      order: 16,
      required: true,
      ratingScale: RATING_SCALES.FREQUENCY_SCALE
    },
    {
      factor: "Supervisor Support",
      questionTemplate: "How often do you get help and support from your immediate superior?",
      order: 17,
      required: true,
      ratingScale: RATING_SCALES.FREQUENCY_SCALE
    },

    // Role Clarity
    {
      factor: "Role Clarity",
      questionTemplate: "Does your work have clear objectives?",
      order: 18,
      required: true
    },
    {
      factor: "Role Clarity",
      questionTemplate: "Do you know exactly which areas are your responsibility?",
      order: 19,
      required: true
    },
    {
      factor: "Role Clarity",
      questionTemplate: "Do you know exactly what is expected of you at work?",
      order: 20,
      required: true
    },

    // Role Conflicts
    {
      factor: "Role Conflicts",
      questionTemplate: "Do you sometimes have to do things that you feel should be done differently?",
      order: 21,
      required: true,
      ratingScale: RATING_SCALES.FREQUENCY_SCALE
    },
    {
      factor: "Role Conflicts",
      questionTemplate: "Are you given conflicting demands at work?",
      order: 22,
      required: true,
      ratingScale: RATING_SCALES.FREQUENCY_SCALE
    },
    {
      factor: "Role Conflicts",
      questionTemplate: "Do you have to do things that you feel are unnecessary?",
      order: 23,
      required: true,
      ratingScale: RATING_SCALES.FREQUENCY_SCALE
    },

    // Work-Life Balance
    {
      factor: "Work-Life Balance",
      questionTemplate: "Is it possible for you to leave your workplace to take care of personal or family matters?",
      order: 24,
      required: true,
      ratingScale: RATING_SCALES.FREQUENCY_SCALE
    },
    {
      factor: "Work-Life Balance",
      questionTemplate: "Can you arrange your working time according to your personal needs?",
      order: 25,
      required: true
    },
    {
      factor: "Work-Life Balance",
      questionTemplate: "Do you feel that your work drains so much of your energy that it has a negative effect on your private life?",
      order: 26,
      required: true,
      ratingScale: RATING_SCALES.FREQUENCY_SCALE
    },

    // Job Satisfaction
    {
      factor: "Job Satisfaction",
      questionTemplate: "Regarding your work in general, how pleased are you with your job as a whole?",
      order: 27,
      required: true
    },
    {
      factor: "Job Satisfaction",
      questionTemplate: "Are you satisfied with your job prospects?",
      order: 28,
      required: true
    },
    {
      factor: "Job Satisfaction",
      questionTemplate: "Are you satisfied with the physical working conditions?",
      order: 29,
      required: true
    },
    {
      factor: "Job Satisfaction",
      questionTemplate: "Are you satisfied with the way your abilities are used?",
      order: 30,
      required: true
    }
  ]
};

// COPSOC II Short Survey Type
export const COPSOC_II_SHORT_SURVEY: SurveyTypeConfig = {
  id: 'copsoc-ii-short',
  metadata: {
    name: 'copsoc-ii-short',
    displayName: 'COPSOC II Short',
    description: 'Copenhagen Psychosocial Questionnaire II Short Form - Workplace psychosocial risk assessment',
    version: '1.0',
    researchBasis: 'Copenhagen Psychosocial Questionnaire II (COPSOC II)',
    category: 'wellbeing',
    recommendedFrequency: 'Annually',
    estimatedTime: 10
  },
  defaultRatingScale: RATING_SCALES.COPSOC_FREQUENCY,
  questionTemplates: [
    // 1. Quantitative demands (Questions 1A & 1B)
    {
      factor: "Quantitative Demands",
      questionTemplate: "Do you get behind with your work?",
      order: 1,
      required: true,
      ratingScale: RATING_SCALES.COPSOC_FREQUENCY
    },
    {
      factor: "Quantitative Demands", 
      questionTemplate: "Do you have enough time for your work tasks?",
      order: 2,
      required: true,
      ratingScale: RATING_SCALES.COPSOC_FREQUENCY
    },

    // 2. Work pace (Questions 2A & 2B)
    {
      factor: "Work Pace",
      questionTemplate: "Is it necessary to keep working at a high pace?",
      order: 3,
      required: true,
      ratingScale: RATING_SCALES.COPSOC_FREQUENCY
    },
    {
      factor: "Work Pace",
      questionTemplate: "Do you work at a high pace throughout the day?",
      order: 4,
      required: true,
      ratingScale: RATING_SCALES.COPSOC_FREQUENCY
    },

    // 3. Emotional demands (Questions 3A & 3B)
    {
      factor: "Emotional Demands",
      questionTemplate: "Does your work put you in emotionally disturbing situations?",
      order: 5,
      required: true,
      ratingScale: RATING_SCALES.COPSOC_FREQUENCY
    },
    {
      factor: "Emotional Demands",
      questionTemplate: "Do you have to relate to other people's personal problems as part of your work?",
      order: 6,
      required: true,
      ratingScale: RATING_SCALES.COPSOC_FREQUENCY
    },

    // 4. Influence at work (Questions 4A & 4B)
    {
      factor: "Influence at Work",
      questionTemplate: "Do you have a large degree of influence concerning your work?",
      order: 7,
      required: true,
      ratingScale: RATING_SCALES.COPSOC_EXTENT
    },
    {
      factor: "Influence at Work",
      questionTemplate: "Can you influence the amount of work assigned to you?",
      order: 8,
      required: true,
      ratingScale: RATING_SCALES.COPSOC_EXTENT
    },

    // 5. Possibilities for development (Questions 5A & 5B)
    {
      factor: "Possibilities for Development",
      questionTemplate: "Do you have the possibility of learning new things through your work?",
      order: 9,
      required: true,
      ratingScale: RATING_SCALES.COPSOC_EXTENT
    },
    {
      factor: "Possibilities for Development",
      questionTemplate: "Does your work require you to take the initiative?",
      order: 10,
      required: true,
      ratingScale: RATING_SCALES.COPSOC_EXTENT
    },

    // 6. Meaning of work (Questions 6A & 6B)
    {
      factor: "Meaning of Work",
      questionTemplate: "Is your work meaningful?",
      order: 11,
      required: true,
      ratingScale: RATING_SCALES.COPSOC_EXTENT
    },
    {
      factor: "Meaning of Work",
      questionTemplate: "Do you feel that the work you do is important?",
      order: 12,
      required: true,
      ratingScale: RATING_SCALES.COPSOC_EXTENT
    },

    // 7. Commitment to the workplace (Questions 7A & 7B)
    {
      factor: "Commitment to Workplace",
      questionTemplate: "Do you feel that your place of work is of great importance to you?",
      order: 13,
      required: true,
      ratingScale: RATING_SCALES.COPSOC_EXTENT
    },
    {
      factor: "Commitment to Workplace",
      questionTemplate: "Would you recommend a good friend to apply for a position at your workplace?",
      order: 14,
      required: true,
      ratingScale: RATING_SCALES.COPSOC_EXTENT
    },

    // 8. Predictability (Questions 8A & 8B)
    {
      factor: "Predictability",
      questionTemplate: "At your place of work, are you informed well in advance concerning for example important decisions, changes, or plans for the future?",
      order: 15,
      required: true,
      ratingScale: RATING_SCALES.COPSOC_EXTENT
    },
    {
      factor: "Predictability",
      questionTemplate: "Do you receive all the information you need in order to do your work well?",
      order: 16,
      required: true,
      ratingScale: RATING_SCALES.COPSOC_EXTENT
    },

    // 9. Recognition (Questions 9A & 9B)
    {
      factor: "Recognition",
      questionTemplate: "Is your work recognised and appreciated by the management?",
      order: 17,
      required: true,
      ratingScale: RATING_SCALES.COPSOC_EXTENT
    },
    {
      factor: "Recognition",
      questionTemplate: "Are you treated fairly at your workplace?",
      order: 18,
      required: true,
      ratingScale: RATING_SCALES.COPSOC_EXTENT
    },

    // 10. Role clarity (Questions 10A & 10B)
    {
      factor: "Role Clarity",
      questionTemplate: "Does your work have clear objectives?",
      order: 19,
      required: true,
      ratingScale: RATING_SCALES.COPSOC_EXTENT
    },
    {
      factor: "Role Clarity",
      questionTemplate: "Do you know exactly what is expected of you at work?",
      order: 20,
      required: true,
      ratingScale: RATING_SCALES.COPSOC_EXTENT
    },

    // 11. Quality of leadership (Questions 11A & 11B)
    {
      factor: "Quality of Leadership",
      questionTemplate: "To what extent would you say that your immediate superior gives high priority to job satisfaction?",
      order: 21,
      required: true,
      ratingScale: RATING_SCALES.COPSOC_EXTENT
    },
    {
      factor: "Quality of Leadership",
      questionTemplate: "To what extent would you say that your immediate superior is good at work planning?",
      order: 22,
      required: true,
      ratingScale: RATING_SCALES.COPSOC_EXTENT
    },

    // 12. Social support from supervisor (Questions 12A & 12B)
    {
      factor: "Social Support from Supervisor",
      questionTemplate: "How often is your nearest superior willing to listen to your problems at work?",
      order: 23,
      required: true,
      ratingScale: RATING_SCALES.COPSOC_FREQUENCY
    },
    {
      factor: "Social Support from Supervisor",
      questionTemplate: "How often do you get help and support from your nearest superior?",
      order: 24,
      required: true,
      ratingScale: RATING_SCALES.COPSOC_FREQUENCY
    },

    // 13. Job satisfaction (Question 13)
    {
      factor: "Job Satisfaction",
      questionTemplate: "Regarding your work in general. How pleased are you with your job as a whole, everything taken into consideration?",
      order: 25,
      required: true,
      ratingScale: RATING_SCALES.COPSOC_SATISFACTION
    },

    // 14. Work-family conflict (Questions 14A & 14B)
    {
      factor: "Work-Family Conflict",
      questionTemplate: "Do you feel that your work drains so much of your energy that it has a negative effect on your private life?",
      order: 26,
      required: true,
      ratingScale: RATING_SCALES.COPSOC_WORK_LIFE
    },
    {
      factor: "Work-Family Conflict",
      questionTemplate: "Do you feel that your work takes so much of your time that it has a negative effect on your private life?",
      order: 27,
      required: true,
      ratingScale: RATING_SCALES.COPSOC_WORK_LIFE
    },

    // 15. Trust regarding management (Questions 15A & 15B)
    {
      factor: "Trust Regarding Management",
      questionTemplate: "Can you trust the information that comes from the management?",
      order: 28,
      required: true,
      ratingScale: RATING_SCALES.COPSOC_EXTENT
    },
    {
      factor: "Trust Regarding Management",
      questionTemplate: "Does the management trust the employees to do their work well?",
      order: 29,
      required: true,
      ratingScale: RATING_SCALES.COPSOC_EXTENT
    },

    // 16. Justice and respect (Questions 16A & 16B)
    {
      factor: "Justice and Respect",
      questionTemplate: "Are conflicts resolved in a fair way?",
      order: 30,
      required: true,
      ratingScale: RATING_SCALES.COPSOC_EXTENT
    },
    {
      factor: "Justice and Respect",
      questionTemplate: "Is the work distributed fairly?",
      order: 31,
      required: true,
      ratingScale: RATING_SCALES.COPSOC_EXTENT
    },

    // 17. General health (Question 17)
    {
      factor: "General Health",
      questionTemplate: "In general, would you say your health is:",
      order: 32,
      required: true,
      ratingScale: RATING_SCALES.COPSOC_HEALTH
    },

    // 18. Burnout (Questions 18A & 18B)
    {
      factor: "Burnout",
      questionTemplate: "How often have you felt worn out?",
      order: 33,
      required: true,
      ratingScale: RATING_SCALES.COPSOC_TIME_FREQUENCY
    },
    {
      factor: "Burnout",
      questionTemplate: "How often have you been emotionally exhausted?",
      order: 34,
      required: true,
      ratingScale: RATING_SCALES.COPSOC_TIME_FREQUENCY
    },

    // 19. Stress (Questions 19A & 19B)
    {
      factor: "Stress",
      questionTemplate: "How often have you been stressed?",
      order: 35,
      required: true,
      ratingScale: RATING_SCALES.COPSOC_TIME_FREQUENCY
    },
    {
      factor: "Stress",
      questionTemplate: "How often have you been irritable?",
      order: 36,
      required: true,
      ratingScale: RATING_SCALES.COPSOC_TIME_FREQUENCY
    }
  ]
};

// Export all survey type configurations
export const SYSTEM_SURVEY_TYPES = [
  EMPLOYEE_ENGAGEMENT_SURVEY,
  MBI_BURNOUT_SURVEY,
  COPSOC_WELLBEING_SURVEY,
  COPSOC_II_SHORT_SURVEY
];

export default SYSTEM_SURVEY_TYPES;