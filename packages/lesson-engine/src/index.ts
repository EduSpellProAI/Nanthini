export interface LearningObjective {
  id: string;
  title: string;
  description: string;
  successCriteria: string[];
}

export interface LessonVocabularyItem {
  word: string;
  definition: string;
  example: string;
}

export interface LessonActivity {
  id: string;
  title: string;
  type: 'reading' | 'speaking' | 'writing' | 'quiz';
  durationMinutes: number;
}

export interface LessonTemplate {
  id: string;
  title: string;
  objectives: LearningObjective[];
  vocabulary: LessonVocabularyItem[];
  activities: LessonActivity[];
  worksheetTitle?: string;
  homeworkPrompt?: string;
}

export class LessonEngineService {
  createTemplate(title: string): LessonTemplate {
    return {
      id: `lesson-${title.toLowerCase().replace(/\s+/g, '-')}`,
      title,
      objectives: [
        {
          id: 'obj-1',
          title: 'Understand the topic',
          description: 'Explain the concept in simple language.',
          successCriteria: ['Use key vocabulary', 'Answer guided questions'],
        },
      ],
      vocabulary: [
        { word: 'practice', definition: 'Repeated effort to improve skill', example: 'Daily practice helps fluency.' },
      ],
      activities: [
        { id: 'act-1', title: 'Warm-up reading', type: 'reading', durationMinutes: 10 },
        { id: 'act-2', title: 'Spelling challenge', type: 'quiz', durationMinutes: 10 },
      ],
      worksheetTitle: `${title} worksheet`,
      homeworkPrompt: `Review the key vocabulary from ${title} and complete one short reflection.`,
    };
  }

  generateHomework(template: LessonTemplate): string {
    return template.homeworkPrompt ?? `Complete a short reflection for ${template.title}.`;
  }
}
