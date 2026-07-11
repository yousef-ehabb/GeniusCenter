/*
# ERP Core Schema — Tutor Management System (fixed)

Single-tenant tutor ERP. All tables use anon+authenticated RLS with USING(true).
*/

-- ============ PARENTS ============
CREATE TABLE IF NOT EXISTS parents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  phone2 text,
  email text,
  relation text DEFAULT 'ولي الأمر',
  notes text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_parents" ON parents;
CREATE POLICY "anon_select_parents" ON parents FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_parents" ON parents;
CREATE POLICY "anon_insert_parents" ON parents FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_parents" ON parents;
CREATE POLICY "anon_update_parents" ON parents FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_parents" ON parents;
CREATE POLICY "anon_delete_parents" ON parents FOR DELETE TO anon, authenticated USING (true);

-- ============ STUDENTS ============
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  gender text DEFAULT 'ذكر' CHECK (gender IN ('ذكر', 'أنثى')),
  birthdate date,
  school text,
  grade text,
  parent_id uuid REFERENCES parents(id) ON DELETE SET NULL,
  phone text,
  phone2 text,
  photo_url text,
  notes text,
  medical_notes text,
  tags text[] DEFAULT '{}',
  status text NOT NULL DEFAULT 'نشط' CHECK (status IN ('نشط', 'غير نشط', 'متوقف', 'خرج')),
  qr_code text UNIQUE,
  enrollment_date date DEFAULT CURRENT_DATE,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_students" ON students;
CREATE POLICY "anon_select_students" ON students FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_students" ON students;
CREATE POLICY "anon_insert_students" ON students FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_students" ON students;
CREATE POLICY "anon_update_students" ON students FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_students" ON students;
CREATE POLICY "anon_delete_students" ON students FOR DELETE TO anon, authenticated USING (true);

-- ============ SUBJECTS ============
CREATE TABLE IF NOT EXISTS subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_en text,
  color text DEFAULT '#1ba882',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_subjects" ON subjects;
CREATE POLICY "anon_select_subjects" ON subjects FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_subjects" ON subjects;
CREATE POLICY "anon_insert_subjects" ON subjects FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_subjects" ON subjects;
CREATE POLICY "anon_update_subjects" ON subjects FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_subjects" ON subjects;
CREATE POLICY "anon_delete_subjects" ON subjects FOR DELETE TO anon, authenticated USING (true);

-- ============ TEACHERS ============
CREATE TABLE IF NOT EXISTS teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  email text,
  specialization text,
  hire_date date DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'نشط' CHECK (status IN ('نشط', 'غير نشط')),
  notes text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_teachers" ON teachers;
CREATE POLICY "anon_select_teachers" ON teachers FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_teachers" ON teachers;
CREATE POLICY "anon_insert_teachers" ON teachers FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_teachers" ON teachers;
CREATE POLICY "anon_update_teachers" ON teachers FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_teachers" ON teachers;
CREATE POLICY "anon_delete_teachers" ON teachers FOR DELETE TO anon, authenticated USING (true);

-- ============ CLASSROOMS ============
CREATE TABLE IF NOT EXISTS classrooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  capacity int DEFAULT 30,
  location text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_classrooms" ON classrooms;
CREATE POLICY "anon_select_classrooms" ON classrooms FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_classrooms" ON classrooms;
CREATE POLICY "anon_insert_classrooms" ON classrooms FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_classrooms" ON classrooms;
CREATE POLICY "anon_update_classrooms" ON classrooms FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_classrooms" ON classrooms;
CREATE POLICY "anon_delete_classrooms" ON classrooms FOR DELETE TO anon, authenticated USING (true);

-- ============ GROUPS ============
CREATE TABLE IF NOT EXISTS groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subject_id uuid REFERENCES subjects(id) ON DELETE SET NULL,
  teacher_id uuid REFERENCES teachers(id) ON DELETE SET NULL,
  classroom_id uuid REFERENCES classrooms(id) ON DELETE SET NULL,
  schedule_days text[] DEFAULT '{}',
  start_time time,
  end_time time,
  capacity int DEFAULT 20,
  price numeric(10,2) DEFAULT 0,
  payment_type text DEFAULT 'شهري' CHECK (payment_type IN ('شهري', 'بالجلسة', 'دورة', 'أقساط')),
  status text NOT NULL DEFAULT 'نشط' CHECK (status IN ('نشط', 'مكتمل', 'متوقف', 'ملغى')),
  start_date date,
  end_date date,
  notes text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_groups" ON groups;
CREATE POLICY "anon_select_groups" ON groups FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_groups" ON groups;
CREATE POLICY "anon_insert_groups" ON groups FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_groups" ON groups;
CREATE POLICY "anon_update_groups" ON groups FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_groups" ON groups;
CREATE POLICY "anon_delete_groups" ON groups FOR DELETE TO anon, authenticated USING (true);

-- ============ GROUP ENROLLMENTS ============
CREATE TABLE IF NOT EXISTS group_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  enrollment_date date DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'نشط' CHECK (status IN ('نشط', 'متوقف', 'خرج')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(group_id, student_id)
);
ALTER TABLE group_enrollments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_enrollments" ON group_enrollments;
CREATE POLICY "anon_select_enrollments" ON group_enrollments FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_enrollments" ON group_enrollments;
CREATE POLICY "anon_insert_enrollments" ON group_enrollments FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_enrollments" ON group_enrollments;
CREATE POLICY "anon_update_enrollments" ON group_enrollments FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_enrollments" ON group_enrollments;
CREATE POLICY "anon_delete_enrollments" ON group_enrollments FOR DELETE TO anon, authenticated USING (true);

-- ============ CLASS SESSIONS ============
CREATE TABLE IF NOT EXISTS class_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  session_date date NOT NULL,
  start_time time,
  end_time time,
  topic text,
  status text NOT NULL DEFAULT 'مجدولة' CHECK (status IN ('مجدولة', 'تمت', 'ملغاة', 'غائبة')),
  notes text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE class_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_sessions" ON class_sessions;
CREATE POLICY "anon_select_sessions" ON class_sessions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_sessions" ON class_sessions;
CREATE POLICY "anon_insert_sessions" ON class_sessions FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_sessions" ON class_sessions;
CREATE POLICY "anon_update_sessions" ON class_sessions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_sessions" ON class_sessions;
CREATE POLICY "anon_delete_sessions" ON class_sessions FOR DELETE TO anon, authenticated USING (true);

-- ============ ATTENDANCE ============
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'حاضر' CHECK (status IN ('حاضر', 'غائب', 'متأخر', 'بعذر')),
  notes text,
  recorded_at timestamptz DEFAULT now(),
  UNIQUE(session_id, student_id)
);
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_attendance" ON attendance;
CREATE POLICY "anon_select_attendance" ON attendance FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_attendance" ON attendance;
CREATE POLICY "anon_insert_attendance" ON attendance FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_attendance" ON attendance;
CREATE POLICY "anon_update_attendance" ON attendance FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_attendance" ON attendance;
CREATE POLICY "anon_delete_attendance" ON attendance FOR DELETE TO anon, authenticated USING (true);

-- ============ PAYMENTS ============
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  group_id uuid REFERENCES groups(id) ON DELETE SET NULL,
  parent_id uuid REFERENCES parents(id) ON DELETE SET NULL,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  payment_type text DEFAULT 'شهري' CHECK (payment_type IN ('شهري', 'بالجلسة', 'دورة', 'قسط', 'جزئي')),
  method text DEFAULT 'نقدي' CHECK (method IN ('نقدي', 'تحويل', 'شيك', 'بطاقة')),
  status text NOT NULL DEFAULT 'مدفوع' CHECK (status IN ('مدفوع', 'جزئي', 'غير مدفوع', 'مسترد')),
  receipt_number text,
  period_month text,
  notes text,
  payment_date date DEFAULT CURRENT_DATE,
  due_date date,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_payments" ON payments;
CREATE POLICY "anon_select_payments" ON payments FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_payments" ON payments;
CREATE POLICY "anon_insert_payments" ON payments FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_payments" ON payments;
CREATE POLICY "anon_update_payments" ON payments FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_payments" ON payments;
CREATE POLICY "anon_delete_payments" ON payments FOR DELETE TO anon, authenticated USING (true);

-- ============ INCOME ============
CREATE TABLE IF NOT EXISTS income (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL,
  category text DEFAULT 'رسوم دراسية',
  amount numeric(10,2) NOT NULL DEFAULT 0,
  description text,
  income_date date DEFAULT CURRENT_DATE,
  reference text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE income ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_income" ON income;
CREATE POLICY "anon_select_income" ON income FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_income" ON income;
CREATE POLICY "anon_insert_income" ON income FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_income" ON income;
CREATE POLICY "anon_update_income" ON income FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_income" ON income;
CREATE POLICY "anon_delete_income" ON income FOR DELETE TO anon, authenticated USING (true);

-- ============ EXPENSES ============
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL DEFAULT 'أخرى',
  amount numeric(10,2) NOT NULL DEFAULT 0,
  payee text,
  description text,
  expense_date date DEFAULT CURRENT_DATE,
  reference text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_expenses" ON expenses;
CREATE POLICY "anon_select_expenses" ON expenses FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_expenses" ON expenses;
CREATE POLICY "anon_insert_expenses" ON expenses FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_expenses" ON expenses;
CREATE POLICY "anon_update_expenses" ON expenses FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_expenses" ON expenses;
CREATE POLICY "anon_delete_expenses" ON expenses FOR DELETE TO anon, authenticated USING (true);

-- ============ STAFF ============
CREATE TABLE IF NOT EXISTS staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL DEFAULT 'مساعد' CHECK (role IN ('مالك', 'مساعد', 'سكرتير', 'معلم', 'محاسب', 'مخصص')),
  phone text,
  email text,
  base_salary numeric(10,2) DEFAULT 0,
  hire_date date DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'نشط' CHECK (status IN ('نشط', 'غير نشط')),
  permissions jsonb DEFAULT '{}'::jsonb,
  notes text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_staff" ON staff;
CREATE POLICY "anon_select_staff" ON staff FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_staff" ON staff;
CREATE POLICY "anon_insert_staff" ON staff FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_staff" ON staff;
CREATE POLICY "anon_update_staff" ON staff FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_staff" ON staff;
CREATE POLICY "anon_delete_staff" ON staff FOR DELETE TO anon, authenticated USING (true);

-- ============ SALARIES ============
CREATE TABLE IF NOT EXISTS salaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  month text NOT NULL,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  bonus numeric(10,2) DEFAULT 0,
  deduction numeric(10,2) DEFAULT 0,
  net_amount numeric(10,2) GENERATED ALWAYS AS (amount + bonus - deduction) STORED,
  status text NOT NULL DEFAULT 'غير مدفوع' CHECK (status IN ('مدفوع', 'غير مدفوع', 'مدفوع جزئيا')),
  payment_date date,
  notes text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE salaries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_salaries" ON salaries;
CREATE POLICY "anon_select_salaries" ON salaries FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_salaries" ON salaries;
CREATE POLICY "anon_insert_salaries" ON salaries FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_salaries" ON salaries;
CREATE POLICY "anon_update_salaries" ON salaries FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_salaries" ON salaries;
CREATE POLICY "anon_delete_salaries" ON salaries FOR DELETE TO anon, authenticated USING (true);

-- ============ EXAMS ============
CREATE TABLE IF NOT EXISTS exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES subjects(id) ON DELETE SET NULL,
  title text NOT NULL,
  exam_date date NOT NULL,
  max_score numeric(6,2) NOT NULL DEFAULT 100,
  description text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_exams" ON exams;
CREATE POLICY "anon_select_exams" ON exams FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_exams" ON exams;
CREATE POLICY "anon_insert_exams" ON exams FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_exams" ON exams;
CREATE POLICY "anon_update_exams" ON exams FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_exams" ON exams;
CREATE POLICY "anon_delete_exams" ON exams FOR DELETE TO anon, authenticated USING (true);

-- ============ GRADES ============
CREATE TABLE IF NOT EXISTS grades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  score numeric(6,2) NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(exam_id, student_id)
);
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_grades" ON grades;
CREATE POLICY "anon_select_grades" ON grades FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_grades" ON grades;
CREATE POLICY "anon_insert_grades" ON grades FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_grades" ON grades;
CREATE POLICY "anon_update_grades" ON grades FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_grades" ON grades;
CREATE POLICY "anon_delete_grades" ON grades FOR DELETE TO anon, authenticated USING (true);

-- ============ HOMEWORK ============
CREATE TABLE IF NOT EXISTS homework (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  assigned_date date DEFAULT CURRENT_DATE,
  due_date date,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE homework ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_homework" ON homework;
CREATE POLICY "anon_select_homework" ON homework FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_homework" ON homework;
CREATE POLICY "anon_insert_homework" ON homework FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_homework" ON homework;
CREATE POLICY "anon_update_homework" ON homework FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_homework" ON homework;
CREATE POLICY "anon_delete_homework" ON homework FOR DELETE TO anon, authenticated USING (true);

-- ============ HOMEWORK SUBMISSIONS ============
CREATE TABLE IF NOT EXISTS homework_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  homework_id uuid NOT NULL REFERENCES homework(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'لم يسلم' CHECK (status IN ('لم يسلم', 'سلم', 'متأخر', 'مرفوض')),
  submitted_date date,
  teacher_notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(homework_id, student_id)
);
ALTER TABLE homework_submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_hw_sub" ON homework_submissions;
CREATE POLICY "anon_select_hw_sub" ON homework_submissions FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_hw_sub" ON homework_submissions;
CREATE POLICY "anon_insert_hw_sub" ON homework_submissions FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_hw_sub" ON homework_submissions;
CREATE POLICY "anon_update_hw_sub" ON homework_submissions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_hw_sub" ON homework_submissions;
CREATE POLICY "anon_delete_hw_sub" ON homework_submissions FOR DELETE TO anon, authenticated USING (true);

-- ============ NOTIFICATION TEMPLATES ============
CREATE TABLE IF NOT EXISTS notification_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  channel text DEFAULT 'واتساب' CHECK (channel IN ('واتساب', 'رسالة قصيرة', 'بريد إلكتروني')),
  body text NOT NULL,
  variables text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_nt" ON notification_templates;
CREATE POLICY "anon_select_nt" ON notification_templates FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_nt" ON notification_templates;
CREATE POLICY "anon_insert_nt" ON notification_templates FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_nt" ON notification_templates;
CREATE POLICY "anon_update_nt" ON notification_templates FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_nt" ON notification_templates;
CREATE POLICY "anon_delete_nt" ON notification_templates FOR DELETE TO anon, authenticated USING (true);

-- ============ NOTIFICATIONS ============
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_type text NOT NULL CHECK (recipient_type IN ('طالب', 'ولي أمر', 'مجموعة', 'الكل')),
  recipient_id uuid,
  recipient_name text,
  channel text DEFAULT 'واتساب' CHECK (channel IN ('واتساب', 'رسالة قصيرة', 'بريد إلكتروني')),
  template_id uuid REFERENCES notification_templates(id) ON DELETE SET NULL,
  subject text,
  body text NOT NULL,
  status text NOT NULL DEFAULT 'مرسل' CHECK (status IN ('مرسل', 'فشل', 'مجدول', 'مسودة')),
  sent_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_notifications" ON notifications;
CREATE POLICY "anon_select_notifications" ON notifications FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_notifications" ON notifications;
CREATE POLICY "anon_insert_notifications" ON notifications FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_notifications" ON notifications;
CREATE POLICY "anon_update_notifications" ON notifications FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_notifications" ON notifications;
CREATE POLICY "anon_delete_notifications" ON notifications FOR DELETE TO anon, authenticated USING (true);

-- ============ AUDIT LOG ============
CREATE TABLE IF NOT EXISTS audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor text,
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  details jsonb,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_audit" ON audit_log;
CREATE POLICY "anon_select_audit" ON audit_log FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_audit" ON audit_log;
CREATE POLICY "anon_insert_audit" ON audit_log FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_audit" ON audit_log;
CREATE POLICY "anon_update_audit" ON audit_log FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_audit" ON audit_log;
CREATE POLICY "anon_delete_audit" ON audit_log FOR DELETE TO anon, authenticated USING (true);

-- ============ SETTINGS ============
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  center_name text DEFAULT 'مركز المعلم',
  center_phone text,
  center_address text,
  center_logo text,
  currency text DEFAULT 'ج.م',
  academic_year text DEFAULT '2025-2026',
  default_payment_type text DEFAULT 'شهري',
  enable_qr boolean DEFAULT true,
  enable_notifications boolean DEFAULT true,
  session_timeout_min int DEFAULT 30,
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_settings" ON settings;
CREATE POLICY "anon_select_settings" ON settings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_settings" ON settings;
CREATE POLICY "anon_insert_settings" ON settings FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_settings" ON settings;
CREATE POLICY "anon_update_settings" ON settings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_settings" ON settings;
CREATE POLICY "anon_delete_settings" ON settings FOR DELETE TO anon, authenticated USING (true);

-- ============ INDEXES ============
CREATE INDEX IF NOT EXISTS idx_students_parent ON students(parent_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_enrollments_group ON group_enrollments(group_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON group_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_sessions_group ON class_sessions(group_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON class_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_attendance_session ON attendance(session_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_student ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_income_date ON income(income_date);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log(created_at);

-- ============ SEED DEFAULT SETTINGS ============
INSERT INTO settings (id, center_name)
SELECT gen_random_uuid(), 'مركز المعلم'
WHERE NOT EXISTS (SELECT 1 FROM settings);
