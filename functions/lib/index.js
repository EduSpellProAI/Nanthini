"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateStudentSnapshot = exports.setUserRole = exports.syncUserRoleClaims = void 0;
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
const firestore_1 = require("firebase-admin/firestore");
const https_1 = require("firebase-functions/v2/https");
const firestore_2 = require("firebase-functions/v2/firestore");
(0, app_1.initializeApp)();
exports.syncUserRoleClaims = (0, firestore_2.onDocumentCreated)('userProfiles/{uid}', async (event) => {
    const uid = event.params.uid;
    const snapshot = event.data;
    if (!snapshot) {
        return;
    }
    const profile = snapshot.data();
    await (0, auth_1.getAuth)().setCustomUserClaims(uid, {
        role: profile.role,
        isActive: profile.isActive,
    });
});
exports.setUserRole = (0, https_1.onCall)(async (request) => {
    const caller = request.auth;
    if (!caller?.uid) {
        throw new https_1.HttpsError('unauthenticated', 'You must be signed in to set roles.');
    }
    const callerRecord = await (0, auth_1.getAuth)().getUser(caller.uid);
    const callerRole = callerRecord.customClaims?.role;
    if (callerRole !== 'admin') {
        throw new https_1.HttpsError('permission-denied', 'Only admins can set user roles.');
    }
    const uid = String(request.data.uid ?? '');
    const role = String(request.data.role ?? '');
    const allowedRoles = ['student', 'teacher', 'parent', 'admin'];
    if (!uid || !allowedRoles.includes(role)) {
        throw new https_1.HttpsError('invalid-argument', 'Provide a valid uid and role.');
    }
    await (0, auth_1.getAuth)().setCustomUserClaims(uid, { role });
    await (0, firestore_1.getFirestore)().collection('userProfiles').doc(uid).set({
        role,
        updatedAt: new Date().toISOString(),
    }, { merge: true });
    return { ok: true };
});
exports.generateStudentSnapshot = (0, https_1.onCall)(async (request) => {
    if (!request.auth?.uid) {
        throw new https_1.HttpsError('unauthenticated', 'You must be signed in.');
    }
    const studentId = String(request.data.studentId ?? request.auth.uid);
    const progressSnapshot = await (0, firestore_1.getFirestore)()
        .collection('learningProgress')
        .where('studentId', '==', studentId)
        .get();
    const total = progressSnapshot.size;
    const averageMastery = total === 0
        ? 0
        : progressSnapshot.docs.reduce((sum, item) => sum + Number(item.get('masteryScore') ?? 0), 0) / total;
    return {
        studentId,
        totalActivities: total,
        averageMastery: Number(averageMastery.toFixed(2)),
    };
});
