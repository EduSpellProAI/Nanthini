export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  role: 'student' | 'teacher' | 'parent' | 'admin';
}
