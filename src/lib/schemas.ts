import { z } from 'zod';

export const userSchema = z.object({
  id: z.string().uuid().optional(),
  tenantId: z.string().uuid(),
  username: z.string().min(3),
  passwordHash: z.string().optional(),
  name: z.string().min(2),
  role: z.enum(['admin', 'teacher', 'assistant']),
});

export const studentSchema = z.object({
  id: z.string().uuid().optional(),
  tenantId: z.string().uuid(),
  code: z.string().min(1),
  name: z.string().min(2),
  phone: z.string().nullable().optional(),
  grade: z.string().nullable().optional(),
  school: z.string().nullable().optional(),
  status: z.string().default('نشط'),
  enrollmentDate: z.string().datetime().nullable().optional(),
});

export const parentSchema = z.object({
  id: z.string().uuid().optional(),
  tenantId: z.string().uuid(),
  name: z.string().min(2),
  phone: z.string().min(8),
  whatsapp: z.string().nullable().optional(),
  job: z.string().nullable().optional(),
});

export const groupSchema = z.object({
  id: z.string().uuid().optional(),
  tenantId: z.string().uuid(),
  name: z.string().min(2),
  subject: z.string().min(2),
  grade: z.string().min(2),
  teacherId: z.string().uuid().nullable().optional(),
  paymentType: z.enum(['شهري', 'بالحصة', 'دورة']),
  monthlyPrice: z.number().int().nonnegative(),
  sessionPrice: z.number().int().nonnegative().nullable().optional(),
  schedule: z.string().nullable().optional(),
});

export const enrollmentSchema = z.object({
  id: z.string().uuid().optional(),
  studentId: z.string().uuid(),
  groupId: z.string().uuid(),
  priceOverride: z.number().int().nonnegative().nullable().optional(),
  joinedAt: z.string().datetime().optional(),
  leftAt: z.string().datetime().nullable().optional(),
});

export const classSessionSchema = z.object({
  id: z.string().uuid().optional(),
  groupId: z.string().uuid(),
  date: z.string().datetime(),
  startTime: z.string().nullable().optional(),
  endTime: z.string().nullable().optional(),
  status: z.string().default('scheduled'),
});

export const attendanceSchema = z.object({
  id: z.string().uuid().optional(),
  studentId: z.string().uuid(),
  sessionId: z.string().uuid(),
  status: z.enum(['حاضر', 'غائب', 'متأخر', 'بعذر']),
  method: z.enum(['MANUAL', 'QR_MOBILE', 'QR_USB', 'SEARCH']),
  markedBy: z.string().uuid().nullable().optional(),
});

export const invoiceSchema = z.object({
  id: z.string().uuid().optional(),
  tenantId: z.string().uuid(),
  studentId: z.string().uuid(),
  period: z.string().nullable().optional(),
  totalAmount: z.number().int().nonnegative(),
  status: z.enum(['draft', 'unpaid', 'partial', 'paid', 'cancelled']),
  dueDate: z.string().datetime().nullable().optional(),
});

export const invoiceLineSchema = z.object({
  id: z.string().uuid().optional(),
  invoiceId: z.string().uuid(),
  description: z.string().min(1),
  amount: z.number().int().nonnegative(),
});

export const paymentSchema = z.object({
  id: z.string().uuid().optional(),
  tenantId: z.string().uuid(),
  studentId: z.string().uuid().nullable().optional(),
  receiptNumber: z.string().nullable().optional(),
  amount: z.number().int().nonnegative(),
  method: z.enum(['cash', 'wallet', 'card']),
  paymentDate: z.string().datetime(),
});

export const paymentAllocationSchema = z.object({
  id: z.string().uuid().optional(),
  paymentId: z.string().uuid(),
  invoiceId: z.string().uuid(),
  amount: z.number().int().nonnegative(),
});

export const settingsSchema = z.object({
  id: z.string().uuid().optional(),
  tenantId: z.string().uuid(),
  centerName: z.string().min(2),
  centerPhone: z.string().nullable().optional(),
  currency: z.string().default('EGP'),
  academicYear: z.string().min(4),
  enableQR: z.boolean().default(true),
});
