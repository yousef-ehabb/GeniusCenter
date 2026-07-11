import type {
  Student, Parent, Subject, Teacher, Classroom, Group, GroupEnrollment,
  ClassSession, Attendance, Payment, Income, Expense, Staff, Salary,
  Exam, Grade, Homework, HomeworkSubmission, NotificationTemplate, Notification,
  AuditLog, Settings, StudentParent
} from './types';

type EntityMap = {
  parents: Parent;
  students: Student;
  subjects: Subject;
  teachers: Teacher;
  classrooms: Classroom;
  groups: Group;
  group_enrollments: GroupEnrollment;
  class_sessions: ClassSession;
  attendance: Attendance;
  payments: Payment;
  income: Income;
  expenses: Expense;
  staff: Staff;
  salaries: Salary;
  exams: Exam;
  grades: Grade;
  homework: Homework;
  homework_submissions: HomeworkSubmission;
  notification_templates: NotificationTemplate;
  notifications: Notification;
  audit_log: AuditLog;
  settings: Settings;
  student_parents: StudentParent;
};

export type TableName = keyof EntityMap;

const API_BASE = 'http://localhost:3001/api';

export const repo = {
  async getAll<K extends TableName>(table: K): Promise<EntityMap[K][]> {
    const res = await fetch(`${API_BASE}/${table}`);
    if (!res.ok) throw new Error('Failed to fetch data');
    return res.json();
  },

  async getById<K extends TableName>(table: K, id: string): Promise<EntityMap[K] | null> {
    const res = await fetch(`${API_BASE}/${table}/${id}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('Failed to fetch data');
    return res.json();
  },

  async where<K extends TableName>(table: K, field: string, value: any): Promise<EntityMap[K][]> {
    const all = await this.getAll(table);
    // Simple in-memory filter for now until we add query params to API
    return all.filter((item: any) => item[field] === value);
  },

  async insert<K extends TableName>(table: K, data: Partial<EntityMap[K]>): Promise<EntityMap[K]> {
    const res = await fetch(`${API_BASE}/${table}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to insert data');
    return res.json();
  },

  async update<K extends TableName>(table: K, id: string, data: Partial<EntityMap[K]>): Promise<void> {
    const res = await fetch(`${API_BASE}/${table}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update data');
  },

  async softDelete<K extends TableName>(table: K, id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/${table}/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete data');
  },

  async bulkInsert<K extends TableName>(table: K, records: Partial<EntityMap[K]>[]): Promise<void> {
    for (const record of records) {
      await this.insert(table, record);
    }
  },

  async replaceAll<K extends TableName>(table: K, filterField: string, filterValue: any, newRecords: Partial<EntityMap[K]>[]): Promise<void> {
    const existing = await this.where(table, filterField, filterValue);
    for (const record of existing) {
      await this.softDelete(table, (record as any).id);
    }
    await this.bulkInsert(table, newRecords);
  },

  async getSettings(): Promise<Settings | null> {
    const res = await fetch(`${API_BASE}/settings`);
    if (!res.ok) return null;
    const settings = await res.json();
    return settings[0] || null;
  },

  async upsertSettings(data: Partial<Settings>): Promise<Settings> {
    const current = await this.getSettings();
    if (current) {
      await this.update('settings', current.id, data);
      return { ...current, ...data } as Settings;
    } else {
      return this.insert('settings', data);
    }
  },
};
