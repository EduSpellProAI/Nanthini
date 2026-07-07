import { getFirebaseFirestore } from '@eduspell/firebase';
import {
  CollectionReference,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import type { BaseRecord, CollectionName } from './models';

export class FirestoreRepository<T extends BaseRecord> {
  constructor(private readonly collectionName: CollectionName) {}

  private getDb() {
    return getFirebaseFirestore();
  }

  private collectionRef(): CollectionReference<T> {
    return collection(this.getDb(), this.collectionName) as CollectionReference<T>;
  }

  async list(): Promise<T[]> {
    const snapshot = await getDocs(this.collectionRef());
    return snapshot.docs.map((item) => ({ ...item.data(), id: item.id }));
  }

  async get(id: string): Promise<T | null> {
    const snapshot = await getDoc(doc(this.collectionRef(), id));
    if (!snapshot.exists()) {
      return null;
    }

    return { ...snapshot.data(), id: snapshot.id } as T;
  }

  async create(record: Omit<T, 'id'>): Promise<string> {
    const created = await addDoc(this.collectionRef(), record as T);
    return created.id;
  }

  async update(id: string, updates: Partial<T>): Promise<void> {
    const recordRef = doc(this.collectionRef(), id);
    await updateDoc(recordRef as any, updates as any);
  }

  async remove(id: string): Promise<void> {
    await deleteDoc(doc(this.collectionRef(), id));
  }

  async findByField<K extends keyof T>(field: K, value: T[K]): Promise<T[]> {
    const snapshot = await getDocs(query(this.collectionRef(), where(String(field), '==', value)));
    return snapshot.docs.map((item) => ({ ...item.data(), id: item.id }));
  }
}
