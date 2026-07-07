export type AuthRole = 'student' | 'teacher' | 'parent' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: AuthRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
  role: AuthRole;
}

export interface AuthSession {
  token: string;
  user: UserProfile;
}

export interface UserProfileRecord {
  uid: string;
  email: string;
  name: string;
  role: AuthRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
