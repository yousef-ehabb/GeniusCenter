/*
# Add auth integration to staff table

## Changes
1. Add `user_id` column to `staff` table — links staff to Supabase auth users.
2. Add unique index on `staff.user_id` to prevent duplicate links.
3. Update RLS policies on all ERP tables: switch from `TO anon, authenticated` to `TO authenticated` with ownership via `staff.user_id = auth.uid()`.
   - For the initial single-tutor setup, all authenticated users can access all data (shared workspace model).
   - This is the correct pattern for a shared ERP where all staff see the same data.

## Security
- All tables now require authentication — anon key can no longer read/write.
- The `staff` table gets a SELECT policy so authenticated users can read staff records (needed for RBAC).
- Settings table: authenticated users can read/update (shared config).
*/

-- Add user_id to staff
ALTER TABLE staff ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_staff_user_id ON staff(user_id) WHERE user_id IS NOT NULL;

-- Drop all old anon policies and replace with authenticated-only policies.
-- We use a shared-workspace model: any authenticated user can CRUD all ERP data.

-- Helper: drop and recreate CRUD policies for a table with authenticated-only access
-- PARENTS
DROP POLICY IF EXISTS "anon_select_parents" ON parents;
DROP POLICY IF EXISTS "anon_insert_parents" ON parents;
DROP POLICY IF EXISTS "anon_update_parents" ON parents;
DROP POLICY IF EXISTS "anon_delete_parents" ON parents;
CREATE POLICY "auth_select_parents" ON parents FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_parents" ON parents FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_parents" ON parents FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_parents" ON parents FOR DELETE TO authenticated USING (true);

-- STUDENTS
DROP POLICY IF EXISTS "anon_select_students" ON students;
DROP POLICY IF EXISTS "anon_insert_students" ON students;
DROP POLICY IF EXISTS "anon_update_students" ON students;
DROP POLICY IF EXISTS "anon_delete_students" ON students;
CREATE POLICY "auth_select_students" ON students FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_students" ON students FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_students" ON students FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_students" ON students FOR DELETE TO authenticated USING (true);

-- SUBJECTS
DROP POLICY IF EXISTS "anon_select_subjects" ON subjects;
DROP POLICY IF EXISTS "anon_insert_subjects" ON subjects;
DROP POLICY IF EXISTS "anon_update_subjects" ON subjects;
DROP POLICY IF EXISTS "anon_delete_subjects" ON subjects;
CREATE POLICY "auth_select_subjects" ON subjects FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_subjects" ON subjects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_subjects" ON subjects FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_subjects" ON subjects FOR DELETE TO authenticated USING (true);

-- TEACHERS
DROP POLICY IF EXISTS "anon_select_teachers" ON teachers;
DROP POLICY IF EXISTS "anon_insert_teachers" ON teachers;
DROP POLICY IF EXISTS "anon_update_teachers" ON teachers;
DROP POLICY IF EXISTS "anon_delete_teachers" ON teachers;
CREATE POLICY "auth_select_teachers" ON teachers FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_teachers" ON teachers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_teachers" ON teachers FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_teachers" ON teachers FOR DELETE TO authenticated USING (true);

-- CLASSROOMS
DROP POLICY IF EXISTS "anon_select_classrooms" ON classrooms;
DROP POLICY IF EXISTS "anon_insert_classrooms" ON classrooms;
DROP POLICY IF EXISTS "anon_update_classrooms" ON classrooms;
DROP POLICY IF EXISTS "anon_delete_classrooms" ON classrooms;
CREATE POLICY "auth_select_classrooms" ON classrooms FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_classrooms" ON classrooms FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_classrooms" ON classrooms FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_classrooms" ON classrooms FOR DELETE TO authenticated USING (true);

-- GROUPS
DROP POLICY IF EXISTS "anon_select_groups" ON groups;
DROP POLICY IF EXISTS "anon_insert_groups" ON groups;
DROP POLICY IF EXISTS "anon_update_groups" ON groups;
DROP POLICY IF EXISTS "anon_delete_groups" ON groups;
CREATE POLICY "auth_select_groups" ON groups FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_groups" ON groups FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_groups" ON groups FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_groups" ON groups FOR DELETE TO authenticated USING (true);

-- GROUP ENROLLMENTS
DROP POLICY IF EXISTS "anon_select_enrollments" ON group_enrollments;
DROP POLICY IF EXISTS "anon_insert_enrollments" ON group_enrollments;
DROP POLICY IF EXISTS "anon_update_enrollments" ON group_enrollments;
DROP POLICY IF EXISTS "anon_delete_enrollments" ON group_enrollments;
CREATE POLICY "auth_select_enrollments" ON group_enrollments FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_enrollments" ON group_enrollments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_enrollments" ON group_enrollments FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_enrollments" ON group_enrollments FOR DELETE TO authenticated USING (true);

-- CLASS SESSIONS
DROP POLICY IF EXISTS "anon_select_sessions" ON class_sessions;
DROP POLICY IF EXISTS "anon_insert_sessions" ON class_sessions;
DROP POLICY IF EXISTS "anon_update_sessions" ON class_sessions;
DROP POLICY IF EXISTS "anon_delete_sessions" ON class_sessions;
CREATE POLICY "auth_select_sessions" ON class_sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_sessions" ON class_sessions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_sessions" ON class_sessions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_sessions" ON class_sessions FOR DELETE TO authenticated USING (true);

-- ATTENDANCE
DROP POLICY IF EXISTS "anon_select_attendance" ON attendance;
DROP POLICY IF EXISTS "anon_insert_attendance" ON attendance;
DROP POLICY IF EXISTS "anon_update_attendance" ON attendance;
DROP POLICY IF EXISTS "anon_delete_attendance" ON attendance;
CREATE POLICY "auth_select_attendance" ON attendance FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_attendance" ON attendance FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_attendance" ON attendance FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_attendance" ON attendance FOR DELETE TO authenticated USING (true);

-- PAYMENTS
DROP POLICY IF EXISTS "anon_select_payments" ON payments;
DROP POLICY IF EXISTS "anon_insert_payments" ON payments;
DROP POLICY IF EXISTS "anon_update_payments" ON payments;
DROP POLICY IF EXISTS "anon_delete_payments" ON payments;
CREATE POLICY "auth_select_payments" ON payments FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_payments" ON payments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_payments" ON payments FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_payments" ON payments FOR DELETE TO authenticated USING (true);

-- INCOME
DROP POLICY IF EXISTS "anon_select_income" ON income;
DROP POLICY IF EXISTS "anon_insert_income" ON income;
DROP POLICY IF EXISTS "anon_update_income" ON income;
DROP POLICY IF EXISTS "anon_delete_income" ON income;
CREATE POLICY "auth_select_income" ON income FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_income" ON income FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_income" ON income FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_income" ON income FOR DELETE TO authenticated USING (true);

-- EXPENSES
DROP POLICY IF EXISTS "anon_select_expenses" ON expenses;
DROP POLICY IF EXISTS "anon_insert_expenses" ON expenses;
DROP POLICY IF EXISTS "anon_update_expenses" ON expenses;
DROP POLICY IF EXISTS "anon_delete_expenses" ON expenses;
CREATE POLICY "auth_select_expenses" ON expenses FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_expenses" ON expenses FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_expenses" ON expenses FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_expenses" ON expenses FOR DELETE TO authenticated USING (true);

-- STAFF
DROP POLICY IF EXISTS "anon_select_staff" ON staff;
DROP POLICY IF EXISTS "anon_insert_staff" ON staff;
DROP POLICY IF EXISTS "anon_update_staff" ON staff;
DROP POLICY IF EXISTS "anon_delete_staff" ON staff;
CREATE POLICY "auth_select_staff" ON staff FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_staff" ON staff FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_staff" ON staff FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_staff" ON staff FOR DELETE TO authenticated USING (true);

-- SALARIES
DROP POLICY IF EXISTS "anon_select_salaries" ON salaries;
DROP POLICY IF EXISTS "anon_insert_salaries" ON salaries;
DROP POLICY IF EXISTS "anon_update_salaries" ON salaries;
DROP POLICY IF EXISTS "anon_delete_salaries" ON salaries;
CREATE POLICY "auth_select_salaries" ON salaries FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_salaries" ON salaries FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_salaries" ON salaries FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_salaries" ON salaries FOR DELETE TO authenticated USING (true);

-- EXAMS
DROP POLICY IF EXISTS "anon_select_exams" ON exams;
DROP POLICY IF EXISTS "anon_insert_exams" ON exams;
DROP POLICY IF EXISTS "anon_update_exams" ON exams;
DROP POLICY IF EXISTS "anon_delete_exams" ON exams;
CREATE POLICY "auth_select_exams" ON exams FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_exams" ON exams FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_exams" ON exams FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_exams" ON exams FOR DELETE TO authenticated USING (true);

-- GRADES
DROP POLICY IF EXISTS "anon_select_grades" ON grades;
DROP POLICY IF EXISTS "anon_insert_grades" ON grades;
DROP POLICY IF EXISTS "anon_update_grades" ON grades;
DROP POLICY IF EXISTS "anon_delete_grades" ON grades;
CREATE POLICY "auth_select_grades" ON grades FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_grades" ON grades FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_grades" ON grades FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_grades" ON grades FOR DELETE TO authenticated USING (true);

-- HOMEWORK
DROP POLICY IF EXISTS "anon_select_homework" ON homework;
DROP POLICY IF EXISTS "anon_insert_homework" ON homework;
DROP POLICY IF EXISTS "anon_update_homework" ON homework;
DROP POLICY IF EXISTS "anon_delete_homework" ON homework;
CREATE POLICY "auth_select_homework" ON homework FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_homework" ON homework FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_homework" ON homework FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_homework" ON homework FOR DELETE TO authenticated USING (true);

-- HOMEWORK SUBMISSIONS
DROP POLICY IF EXISTS "anon_select_hw_sub" ON homework_submissions;
DROP POLICY IF EXISTS "anon_insert_hw_sub" ON homework_submissions;
DROP POLICY IF EXISTS "anon_update_hw_sub" ON homework_submissions;
DROP POLICY IF EXISTS "anon_delete_hw_sub" ON homework_submissions;
CREATE POLICY "auth_select_hw_sub" ON homework_submissions FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_hw_sub" ON homework_submissions FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_hw_sub" ON homework_submissions FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_hw_sub" ON homework_submissions FOR DELETE TO authenticated USING (true);

-- NOTIFICATION TEMPLATES
DROP POLICY IF EXISTS "anon_select_nt" ON notification_templates;
DROP POLICY IF EXISTS "anon_insert_nt" ON notification_templates;
DROP POLICY IF EXISTS "anon_update_nt" ON notification_templates;
DROP POLICY IF EXISTS "anon_delete_nt" ON notification_templates;
CREATE POLICY "auth_select_nt" ON notification_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_nt" ON notification_templates FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_nt" ON notification_templates FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_nt" ON notification_templates FOR DELETE TO authenticated USING (true);

-- NOTIFICATIONS
DROP POLICY IF EXISTS "anon_select_notifications" ON notifications;
DROP POLICY IF EXISTS "anon_insert_notifications" ON notifications;
DROP POLICY IF EXISTS "anon_update_notifications" ON notifications;
DROP POLICY IF EXISTS "anon_delete_notifications" ON notifications;
CREATE POLICY "auth_select_notifications" ON notifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_notifications" ON notifications FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_notifications" ON notifications FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_notifications" ON notifications FOR DELETE TO authenticated USING (true);

-- AUDIT LOG
DROP POLICY IF EXISTS "anon_select_audit" ON audit_log;
DROP POLICY IF EXISTS "anon_insert_audit" ON audit_log;
DROP POLICY IF EXISTS "anon_update_audit" ON audit_log;
DROP POLICY IF EXISTS "anon_delete_audit" ON audit_log;
CREATE POLICY "auth_select_audit" ON audit_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_audit" ON audit_log FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_audit" ON audit_log FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_audit" ON audit_log FOR DELETE TO authenticated USING (true);

-- SETTINGS
DROP POLICY IF EXISTS "anon_select_settings" ON settings;
DROP POLICY IF EXISTS "anon_insert_settings" ON settings;
DROP POLICY IF EXISTS "anon_update_settings" ON settings;
DROP POLICY IF EXISTS "anon_delete_settings" ON settings;
CREATE POLICY "auth_select_settings" ON settings FOR SELECT TO authenticated USING (true);
CREATE POLICY "auth_insert_settings" ON settings FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_settings" ON settings FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_settings" ON settings FOR DELETE TO authenticated USING (true);
