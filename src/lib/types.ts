export type Student = {
  id: string;
  name: string;
  gender: string;
  birthdate: string | null;
  school: string | null;
  grade: string | null;
  parent_id?: string | null; // Deprecated, migrating to many-to-many
  phone: string | null;
  phone2: string | null;
  photo_url: string | null;
  notes: string | null;
  medical_notes: string | null;
  tags: string[];
  status: string;
  qr_code: string | null;
  enrollment_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  parents?: StudentParent[];
};

export type Parent = {
  id: string;
  name: string;
  phone: string | null;
  phone2: string | null;
  email: string | null;
  relation: string;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  students?: StudentParent[];
};

export type StudentParent = {
  studentId: string;
  parentId: string;
  relation: string;
  isPrimary: boolean;
  student?: Student;
  parent?: Parent;
};

export type Subject = {
  id: string;
  name: string;
  name_en: string | null;
  color: string;
  is_active: boolean;
};

export type Teacher = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  specialization: string | null;
  hire_date: string | null;
  status: string;
  notes: string | null;
  is_active: boolean;
};

export type Classroom = {
  id: string;
  name: string;
  capacity: number;
  location: string | null;
  is_active: boolean;
};

export type Group = {
  id: string;
  name: string;
  subject_id: string | null;
  teacher_id: string | null;
  classroom_id: string | null;
  schedule_days: string[];
  start_time: string | null;
  end_time: string | null;
  capacity: number;
  price: number;
  payment_type: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  subject?: Subject | null;
  teacher?: Teacher | null;
  classroom?: Classroom | null;
  enrollments?: GroupEnrollment[];
};

export type GroupEnrollment = {
  id: string;
  group_id: string;
  student_id: string;
  enrollment_date: string;
  status: string;
  student?: Student;
};

export type ClassSession = {
  id: string;
  group_id: string;
  session_date: string;
  start_time: string | null;
  end_time: string | null;
  topic: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  group?: Group;
  attendance?: Attendance[];
};

export type Attendance = {
  id: string;
  session_id: string;
  student_id: string;
  status: string;
  notes: string | null;
  recorded_at: string;
  student?: Student;
};

export type Payment = {
  id: string;
  student_id: string;
  group_id: string | null;
  parent_id: string | null;
  amount: number;
  payment_type: string;
  method: string;
  status: string;
  receipt_number: string | null;
  period_month: string | null;
  notes: string | null;
  payment_date: string | null;
  due_date: string | null;
  created_at: string;
  student?: Student;
  group?: Group;
};

export type Income = {
  id: string;
  source: string;
  category: string;
  amount: number;
  description: string | null;
  income_date: string;
  reference: string | null;
  created_at: string;
};

export type Expense = {
  id: string;
  category: string;
  amount: number;
  payee: string | null;
  description: string | null;
  expense_date: string;
  reference: string | null;
  created_at: string;
};

export type Staff = {
  id: string;
  name: string;
  role: string;
  phone: string | null;
  email: string | null;
  username: string | null;
  password_hash: string | null;
  base_salary: number;
  hire_date: string;
  status: string;
  permissions: Record<string, boolean>;
  notes: string | null;
  is_active: boolean;
  user_id: string | null;
  created_at: string;
};

export type Salary = {
  id: string;
  staff_id: string;
  month: string;
  amount: number;
  bonus: number;
  deduction: number;
  net_amount: number;
  status: string;
  payment_date: string | null;
  notes: string | null;
  staff?: Staff;
};

export type Exam = {
  id: string;
  group_id: string;
  subject_id: string | null;
  title: string;
  exam_date: string;
  max_score: number;
  description: string | null;
  created_at: string;
  group?: Group;
  subject?: Subject | null;
  grades?: Grade[];
};

export type Grade = {
  id: string;
  exam_id: string;
  student_id: string;
  score: number;
  notes: string | null;
  student?: Student;
};

export type Homework = {
  id: string;
  group_id: string;
  title: string;
  description: string | null;
  assigned_date: string;
  due_date: string | null;
  created_at: string;
  group?: Group;
};

export type HomeworkSubmission = {
  id: string;
  homework_id: string;
  student_id: string;
  status: string;
  submitted_date: string | null;
  teacher_notes: string | null;
  student?: Student;
};

export type NotificationTemplate = {
  id: string;
  name: string;
  channel: string;
  body: string;
  variables: string[];
};

export type Notification = {
  id: string;
  recipient_type: string;
  recipient_id: string | null;
  recipient_name: string | null;
  channel: string;
  template_id: string | null;
  subject: string | null;
  body: string;
  status: string;
  sent_at: string;
  created_at: string;
};

export type AuditLog = {
  id: string;
  actor: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
};

export type Settings = {
  id: string;
  center_name: string;
  center_phone: string | null;
  center_address: string | null;
  center_logo: string | null;
  currency: string;
  academic_year: string;
  default_payment_type: string;
  enable_qr: boolean;
  enable_notifications: boolean;
  session_timeout_min: number;
  updated_at: string;
};
