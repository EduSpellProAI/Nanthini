import { getFirebaseAuth, getFirebaseFirestore } from '@eduspell/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { clearPortalAuthCookies, setPortalAuthCookies } from './cookies';
import type { AuthRole, AuthSession, LoginCredentials, RegisterCredentials, UserProfile, UserProfileRecord } from './models';

export class AuthService {
  private getAuthClient() {
    return getFirebaseAuth();
  }

  private getFirestoreClient() {
    return getFirebaseFirestore();
  }

  private userProfileRef(uid: string) {
    return doc(this.getFirestoreClient(), 'userProfiles', uid);
  }

  private toUserProfile(record: UserProfileRecord): UserProfile {
    return {
      id: record.uid,
      email: record.email,
      name: record.name,
      role: record.role,
      isActive: record.isActive,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  private async ensureUserProfile(uid: string, email: string, name: string, role: AuthRole): Promise<UserProfileRecord> {
    const now = new Date().toISOString();
    const ref = this.userProfileRef(uid);
    const snapshot = await getDoc(ref);

    if (snapshot.exists()) {
      return snapshot.data() as UserProfileRecord;
    }

    const profile: UserProfileRecord = {
      uid,
      email,
      name,
      role,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(ref, profile);
    return profile;
  }

  async register(credentials: RegisterCredentials): Promise<AuthSession> {
    const authClient = this.getAuthClient();
    const created = await createUserWithEmailAndPassword(authClient, credentials.email, credentials.password);
    await updateProfile(created.user, { displayName: credentials.name });

    const profile = await this.ensureUserProfile(
      created.user.uid,
      created.user.email ?? credentials.email,
      credentials.name,
      credentials.role
    );

    const token = await created.user.getIdToken(true);
    const user = this.toUserProfile(profile);
    setPortalAuthCookies(user.role, user.id);

    return { token, user };
  }

  async login(credentials: LoginCredentials, expectedRole?: AuthRole): Promise<AuthSession> {
    const authClient = this.getAuthClient();
    const signedIn = await signInWithEmailAndPassword(authClient, credentials.email, credentials.password);
    const firebaseUser = signedIn.user;

    const profile = await this.ensureUserProfile(
      firebaseUser.uid,
      firebaseUser.email ?? credentials.email,
      firebaseUser.displayName ?? 'EduSpell User',
      expectedRole ?? 'student'
    );

    if (expectedRole && profile.role !== expectedRole) {
      await signOut(authClient);
      clearPortalAuthCookies();
      throw new Error(`This account does not have ${expectedRole} portal access.`);
    }

    const token = await firebaseUser.getIdToken(true);
    const user = this.toUserProfile(profile);
    setPortalAuthCookies(user.role, user.id);

    return { token, user };
  }

  async logout(): Promise<void> {
    await signOut(this.getAuthClient());
    clearPortalAuthCookies();
  }

  async getSession(): Promise<UserProfile | null> {
    const firebaseUser = this.getAuthClient().currentUser;
    if (!firebaseUser) {
      clearPortalAuthCookies();
      return null;
    }

    const ref = this.userProfileRef(firebaseUser.uid);
    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) {
      clearPortalAuthCookies();
      return null;
    }

    const profile = snapshot.data() as UserProfileRecord;
    const user = this.toUserProfile(profile);
    setPortalAuthCookies(user.role, user.id);

    return user;
  }

  async refreshRoleClaims(): Promise<AuthRole | null> {
    const firebaseUser = this.getAuthClient().currentUser;
    if (!firebaseUser) {
      return null;
    }

    const tokenResult = await firebaseUser.getIdTokenResult(true);
    const roleClaim = tokenResult.claims.role;
    if (typeof roleClaim !== 'string') {
      return null;
    }

    return roleClaim as AuthRole;
  }

  async getSessionFromToken(token: string): Promise<UserProfile | null> {
    if (!token) {
      return null;
    }

    return this.getSession();
  }
}

export const authService = new AuthService();
