export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export interface StudentProfile {
    id: string;
    name: string;
    age: number;
    currentLevel: DifficultyLevel;
    masteryScore: number;
    strengths: string[];
    weaknesses: string[];
}
export interface TopicSkill {
    id: string;
    name: string;
    category: string;
    difficulty: DifficultyLevel;
}
export interface LearningObjective {
    id: string;
    title: string;
    description: string;
    difficulty: DifficultyLevel;
}
export interface AssessmentResult {
    studentId: string;
    topicId: string;
    score: number;
    mastery: number;
    timestamp: string;
}
export interface ApiResponse<T> {
    data: T;
    success: boolean;
    message: string;
}
