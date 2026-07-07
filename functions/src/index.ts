import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { onDocumentCreated } from 'firebase-functions/v2/firestore';

initializeApp();

type AuthRole = 'student' | 'teacher' | 'parent' | 'admin';

interface UserProfileRecord {
  uid: string;
  email: string;
  name: string;
  role: AuthRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const syncUserRoleClaims = onDocumentCreated('userProfiles/{uid}', async (event) => {
  const uid = event.params.uid;
  const snapshot = event.data;

  if (!snapshot) {
    return;
  }

  const profile = snapshot.data() as UserProfileRecord;
  await getAuth().setCustomUserClaims(uid, {
    role: profile.role,
    isActive: profile.isActive,
  });
});

export const setUserRole = onCall(async (request) => {
  const caller = request.auth;
  if (!caller?.uid) {
    throw new HttpsError('unauthenticated', 'You must be signed in to set roles.');
  }

  const callerRecord = await getAuth().getUser(caller.uid);
  const callerRole = callerRecord.customClaims?.role;
  if (callerRole !== 'admin') {
    throw new HttpsError('permission-denied', 'Only admins can set user roles.');
  }

  const uid = String(request.data.uid ?? '');
  const role = String(request.data.role ?? '') as AuthRole;
  const allowedRoles: AuthRole[] = ['student', 'teacher', 'parent', 'admin'];

  if (!uid || !allowedRoles.includes(role)) {
    throw new HttpsError('invalid-argument', 'Provide a valid uid and role.');
  }

  await getAuth().setCustomUserClaims(uid, { role });
  await getFirestore().collection('userProfiles').doc(uid).set(
    {
      role,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );

  return { ok: true };
});

export const generateStudentSnapshot = onCall(async (request) => {
  if (!request.auth?.uid) {
    throw new HttpsError('unauthenticated', 'You must be signed in.');
  }

  const studentId = String(request.data.studentId ?? request.auth.uid);
  const progressSnapshot = await getFirestore()
    .collection('learningProgress')
    .where('studentId', '==', studentId)
    .get();

  const total = progressSnapshot.size;
  const averageMastery =
    total === 0
      ? 0
      : progressSnapshot.docs.reduce((sum, item) => sum + Number(item.get('masteryScore') ?? 0), 0) / total;

  return {
    studentId,
    totalActivities: total,
    averageMastery: Number(averageMastery.toFixed(2)),
  };
});
