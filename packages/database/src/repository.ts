import type { BaseRecord, CollectionName, StudentRecord, TeacherRecord } from './models';

export class Repository<T extends BaseRecord> {
  constructor(private readonly collection: CollectionName) {}

  async list(): Promise<T[]> {
    return [] as T[];
  }

  async get(id: string): Promise<T | null> {
    return null;
  }

  async create(record: T): Promise<T> {
    return record;
  }

  async update(id: string, updates: Partial<T>): Promise<T | null> {
    return { id, ...updates } as T;
  }
}

export class StudentRepository extends Repository<StudentRecord> {
  constructor() {
    super('students');
  }
}

export class TeacherRepository extends Repository<TeacherRecord> {
  constructor() {
    super('teachers');
  }
}
