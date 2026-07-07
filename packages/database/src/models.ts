export type CollectionName =
  | 'students'
  | 'teachers'
  | 'parents'
  | 'lessons'
  | 'quizzes'
  | 'userProfiles'
  | 'reports'
  | 'learningProgress';

export interface BaseRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentRecord extends BaseRecord {
  name: string;
  className: string;
  level: string;
}

export interface TeacherRecord extends BaseRecord {
  name: string;
  subject: string;
}

export interface UserProfileRecord extends BaseRecord {
  uid: string;
  email: string;
  name: string;
  role: 'student' | 'teacher' | 'parent' | 'admin';
  isActive: boolean;
}

export interface StorageFileRecord extends BaseRecord {
  ownerId: string;
  path: string;
  downloadUrl: string;
  contentType: string;
}
