import 'dotenv/config';
import { Hono } from 'hono';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
const adapter = new PrismaLibSql({ url: 'file:dev.db' });
export const prisma = new PrismaClient({ adapter: adapter as any });

export const apiRouter = new Hono<{ Variables: { tenantId: string; modelName: string } }>();

// A basic middleware to attach default tenantId for local single-tenant mode
apiRouter.use('*', async (c, next) => {
  let defaultTenant = await prisma.tenant.findFirst();
  if (!defaultTenant) {
    defaultTenant = await prisma.tenant.create({
      data: {
        name: 'Default Center',
        settings: {
          create: {
            centerName: 'المركز الذكي',
            academicYear: '2025/2026'
          }
        }
      }
    });
  }
  c.set('tenantId', defaultTenant.id);
  await next();
});

const allowedTables = [
  'parent', 'student', 'subject', 'user', 'classroom', 'group',
  'enrollment', 'classSession', 'attendance', 'payment',
  'income', 'expense', 'staff', 'salary', 'exam', 'grade',
  'homework', 'homeworkSubmission', 'notificationTemplate',
  'notification', 'auditLog', 'settings', 'invoice', 'invoiceLine', 'paymentAllocation', 'studentParent'
];

const tablesWithTenantId = new Set([
  'tenant', 'user', 'student', 'parent', 'studentParent', 'group',
  'payment', 'settings', 'subject', 'classroom', 'income',
  'expense', 'staff', 'salary', 'exam', 'homework',
  'notificationTemplate', 'notification', 'invoice'
]);

apiRouter.post('/auth/login', async (c) => {
  const { username, password } = await c.req.json();
  const tenant = await prisma.tenant.findFirst();
  if (!tenant) return c.json({ error: 'No tenant found' }, 400);

  // Note: we can hash passwords later, for now we do direct matching for migration MVP
  const user = await prisma.user.findFirst({
    where: { username, tenantId: tenant.id }
  });

  if (!user || user.passwordHash !== password) {
    return c.json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' }, 401);
  }

  return c.json({
    token: 'mock-jwt-token',
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
    }
  });
});

apiRouter.post('/auth/register', async (c) => {
  const { username, password, name, phone, email } = await c.req.json();
  const tenantId = c.get('tenantId');
  if (!tenantId) return c.json({ error: 'No tenant found' }, 400);

  const existingUser = await prisma.user.findFirst({
    where: { username, tenantId }
  });
  if (existingUser) {
    return c.json({ error: 'اسم المستخدم مسجل بالفعل' }, 400);
  }

  const userCount = await prisma.user.count({
    where: { tenantId }
  });

  const isFirst = userCount === 0;
  const userRole = isFirst ? 'admin' : 'assistant';
  const staffRole = isFirst ? 'مالك' : 'مساعد';

  const user = await prisma.user.create({
    data: {
      tenantId,
      username,
      passwordHash: password,
      name,
      role: userRole
    }
  });

  const allPermissionsList = [
    'view_dashboard', 'manage_students', 'manage_parents',
    'manage_groups', 'manage_subjects', 'manage_sessions',
    'manage_attendance', 'manage_homework', 'manage_exams',
    'manage_grades', 'manage_payments', 'manage_finance',
    'manage_staff', 'manage_notifications', 'view_reports',
    'view_audit', 'manage_settings', 'manage_backup'
  ];

  const permissions = isFirst
    ? Object.fromEntries(allPermissionsList.map(k => [k, true]))
    : {};

  await prisma.staff.create({
    data: {
      tenantId,
      name,
      role: staffRole,
      phone: phone || null,
      email: email || null,
      username,
      passwordHash: password,
      baseSalary: 0,
      hireDate: new Date().toISOString().split('T')[0],
      status: 'نشط',
      permissions: JSON.stringify(permissions),
      isActive: true,
      userId: user.id
    }
  });

  return c.json({
    token: 'mock-jwt-token',
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role
    }
  });
});

// Custom routes for Invoices and Payments (placed before generic routes)
apiRouter.get('/invoices', async (c) => {
  const tenantId = c.get('tenantId');
  const invoices = await prisma.invoice.findMany({
    where: { tenantId },
    include: {
      lines: true,
      allocations: {
        include: { payment: true }
      },
      student: true
    },
    orderBy: { createdAt: 'desc' }
  });
  return c.json(invoices);
});

apiRouter.post('/invoices/generate', async (c) => {
  const { studentId, period } = await c.req.json();
  const tenantId = c.get('tenantId');
  
  const enrollments = await prisma.enrollment.findMany({
    where: { studentId },
    include: { group: true }
  });
  
  if (enrollments.length === 0) {
    return c.json({ error: 'لا يوجد اشتراكات نشطة للطالب' }, 400);
  }
  
  let totalAmount = 0;
  const linesData = [];
  
  for (const env of enrollments) {
    const price = env.priceOverride !== null ? env.priceOverride : env.group.monthlyPrice;
    if (price > 0) {
      totalAmount += price;
      linesData.push({
        description: `رسوم مجموعة: ${env.group.name}`,
        amount: price
      });
    }
  }
  
  if (totalAmount === 0) {
    return c.json({ error: 'قيمة الفاتورة صفر' }, 400);
  }
  
  const invoice = await prisma.invoice.create({
    data: {
      tenantId,
      studentId,
      period,
      totalAmount,
      status: 'unpaid',
      dueDate: new Date(),
      lines: {
        create: linesData
      }
    },
    include: {
      lines: true
    }
  });
  
  return c.json(invoice, 201);
});

apiRouter.get('/payments', async (c) => {
  const tenantId = c.get('tenantId');
  const payments = await prisma.payment.findMany({
    where: { tenantId },
    include: {
      allocations: {
        include: { invoice: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  return c.json(payments);
});

apiRouter.post('/payments', async (c) => {
  const body = await c.req.json();
  const tenantId = c.get('tenantId');

  const { student_id, amount, method, payment_date } = body;
  
  // 1. Create Payment
  const payment = await prisma.payment.create({
    data: {
      tenantId,
      studentId: student_id,
      amount,
      method: method || 'cash',
      paymentDate: new Date(payment_date || new Date()),
      receiptNumber: 'REC-' + Date.now().toString().slice(-6)
    }
  });

  // 2. Auto allocate to unpaid or partial invoices
  let remainingAmount = amount;
  const allocations = [];

  const unpaidInvoices = await prisma.invoice.findMany({
    where: { studentId: student_id, tenantId, status: { in: ['unpaid', 'partial'] } },
    include: { allocations: true },
    orderBy: { dueDate: 'asc' }
  });

  for (const invoice of unpaidInvoices as any[]) {
    if (remainingAmount <= 0) break;

    const paidSoFar = invoice.allocations.reduce((sum: number, alloc: any) => sum + alloc.amount, 0);
    const dueAmount = invoice.totalAmount - paidSoFar;

    if (dueAmount <= 0) continue;

    const allocateAmount = Math.min(remainingAmount, dueAmount);
    remainingAmount -= allocateAmount;

    const allocation = await prisma.paymentAllocation.create({
      data: {
        paymentId: payment.id,
        invoiceId: invoice.id,
        amount: allocateAmount
      }
    });

    allocations.push(allocation);

    const isFullyPaid = (paidSoFar + allocateAmount) >= invoice.totalAmount;
    await prisma.invoice.update({
      where: { id: invoice.id },
      data: { status: isFullyPaid ? 'paid' : 'partial' }
    });
  }

  return c.json({ ...payment, allocations }, 201);
});

apiRouter.use('/:table/*', async (c, next) => {
  const table = c.req.param('table');
  const tableMap: Record<string, string> = {
    parents: 'parent', students: 'student', subjects: 'subject',
    teachers: 'user', classrooms: 'classroom', groups: 'group',
    group_enrollments: 'enrollment', class_sessions: 'classSession',
    attendance: 'attendance', payments: 'payment', income: 'income',
    expenses: 'expense', staff: 'staff', salaries: 'salary', exams: 'exam',
    grades: 'grade', homework: 'homework', homework_submissions: 'homeworkSubmission',
    notification_templates: 'notificationTemplate', notifications: 'notification',
    audit_log: 'auditLog', settings: 'settings', invoices: 'invoice',
    invoice_lines: 'invoiceLine', payment_allocations: 'paymentAllocation',
    student_parents: 'studentParent'
  };

  const modelName = tableMap[table];
  if (!modelName || !allowedTables.includes(modelName)) {
    return c.notFound();
  }
  c.set('modelName', modelName);
  await next();
});

function toCamelCase(str: string): string {
  return str.replace(/_([a-z0-9])/g, (g) => g[1].toUpperCase());
}

function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function convertInput(body: any): any {
  if (Array.isArray(body)) {
    return body.map(convertInput);
  } else if (body !== null && typeof body === 'object') {
    const result: any = {};
    for (const key of Object.keys(body)) {
      let val = body[key];
      let targetKey = toCamelCase(key);
      
      if (key === 'qr_code') {
        targetKey = 'qrToken';
      } else if (key === 'schedule_days') {
        targetKey = 'schedule';
        val = JSON.stringify(val);
      } else if (['tags', 'permissions', 'variables'].includes(key) && typeof val !== 'string') {
        val = JSON.stringify(val);
      } else if (['enrollment_date', 'joined_at', 'left_at', 'payment_date', 'date', 'exam_date', 'assigned_date', 'due_date', 'submitted_date', 'sent_at'].includes(key) && val) {
        val = new Date(val);
      }
      
      result[targetKey] = convertInput(val);
    }
    return result;
  }
  return body;
}

function convertOutput(record: any): any {
  if (Array.isArray(record)) {
    return record.map(convertOutput);
  } else if (record !== null && typeof record === 'object') {
    if (record instanceof Date) {
      return record.toISOString();
    }
    const result: any = {};
    for (const key of Object.keys(record)) {
      let val = record[key];
      let targetKey = toSnakeCase(key);
      
      if (key === 'qrToken') {
        targetKey = 'qr_code';
      } else if (key === 'schedule') {
        targetKey = 'schedule_days';
        try {
          val = val ? JSON.parse(val) : [];
        } catch (e) {
          val = [];
        }
      } else if (['tags', 'permissions', 'variables'].includes(key) && typeof val === 'string') {
        try {
          val = JSON.parse(val);
        } catch (e) {
          // Keep as string
        }
      }
      
      result[targetKey] = convertOutput(val);
    }
    return result;
  }
  return record;
}

apiRouter.get('/:table', async (c) => {
  const modelName = c.get('modelName');
  const queryOptions: any = {};
  if (tablesWithTenantId.has(modelName)) {
    queryOptions.where = { tenantId: c.get('tenantId') };
  }
  const records = await (prisma as any)[modelName].findMany(queryOptions);
  return c.json(convertOutput(records));
});

apiRouter.get('/:table/:id', async (c) => {
  const modelName = c.get('modelName');
  const queryOptions: any = {
    where: { id: c.req.param('id') }
  };
  if (tablesWithTenantId.has(modelName)) {
    queryOptions.where.tenantId = c.get('tenantId');
  }
  const record = await (prisma as any)[modelName].findUnique(queryOptions);
  return record ? c.json(convertOutput(record)) : c.notFound();
});

function mapStaffRoleToUserRole(role: string): string {
  if (role === 'مالك') return 'admin';
  if (role === 'معلم') return 'teacher';
  return 'assistant';
}

apiRouter.post('/:table', async (c) => {
  const modelName = c.get('modelName');
  const body = await c.req.json();
  
  if (modelName === 'student' && body.parentData) {
    const tenantId = c.get('tenantId');
    const { parentData, ...studentData } = body;
    const convertedStudentData = convertInput(studentData);
    if (tablesWithTenantId.has(modelName)) {
      convertedStudentData.tenantId = tenantId;
    }

    const result = await prisma.$transaction(async (tx) => {
      let parentId = parentData.existingParentId;
      if (!parentId) {
        const existing = await tx.parent.findFirst({
          where: { phone: parentData.phone, tenantId }
        });
        if (existing) {
          parentId = existing.id;
        } else {
          const newParent = await tx.parent.create({
            data: {
              tenantId,
              name: parentData.name,
              phone: parentData.phone,
              phone2: parentData.phone2,
              relation: parentData.relation,
              notes: parentData.notes
            }
          });
          parentId = newParent.id;
        }
      }

      const student = await tx.student.create({
        data: {
          ...convertedStudentData,
          parents: {
            create: [
              {
                parentId,
                relation: parentData.relation,
                isPrimary: true,
                tenantId
              }
            ]
          }
        }
      });
      return student;
    });

    return c.json(convertOutput(result), 201);
  }

  const convertedBody = convertInput(body);

  if (modelName === 'staff' && convertedBody.username) {
    const existing = await prisma.user.findUnique({
      where: { username: convertedBody.username }
    });
    if (existing) {
      return c.json({ error: 'اسم المستخدم مسجل بالفعل' }, 400);
    }

    const password = convertedBody.password || convertedBody.passwordHash || '';
    delete convertedBody.password;
    convertedBody.passwordHash = password;

    const user = await prisma.user.create({
      data: {
        tenantId: c.get('tenantId'),
        username: convertedBody.username,
        passwordHash: password,
        name: convertedBody.name,
        role: mapStaffRoleToUserRole(convertedBody.role)
      }
    });

    const record = await prisma.staff.create({
      data: {
        ...convertedBody,
        userId: user.id,
        tenantId: c.get('tenantId')
      }
    });
    return c.json(convertOutput(record), 201);
  }

  const data: any = { ...convertedBody };
  if (tablesWithTenantId.has(modelName)) {
    data.tenantId = c.get('tenantId');
  }
  const record = await (prisma as any)[modelName].create({ data });
  return c.json(convertOutput(record), 201);
});

apiRouter.put('/:table/:id', async (c) => {
  const modelName = c.get('modelName');
  const id = c.req.param('id');
  const body = await c.req.json();

  if (modelName === 'student' && body.parentData) {
    const tenantId = c.get('tenantId');
    const { parentData, ...studentData } = body;
    const convertedStudentData = convertInput(studentData);
    
    const result = await prisma.$transaction(async (tx) => {
      let parentId = parentData.existingParentId;
      if (!parentId) {
        const existing = await tx.parent.findFirst({
          where: { phone: parentData.phone, tenantId }
        });
        if (existing) {
          parentId = existing.id;
        } else {
          const newParent = await tx.parent.create({
            data: {
              tenantId,
              name: parentData.name,
              phone: parentData.phone,
              phone2: parentData.phone2,
              relation: parentData.relation,
              notes: parentData.notes
            }
          });
          parentId = newParent.id;
        }
      }

      const student = await tx.student.update({
        where: { id },
        data: convertedStudentData
      });

      const existingRelations = await tx.studentParent.findMany({
        where: { studentId: id }
      });
      const nonPrimary = existingRelations.filter((r: any) => !r.isPrimary);

      await tx.studentParent.deleteMany({
        where: { studentId: id }
      });

      await tx.studentParent.create({
        data: {
          studentId: id,
          parentId,
          relation: parentData.relation,
          isPrimary: true,
          tenantId
        }
      });

      for (const rel of nonPrimary) {
        if (rel.parentId !== parentId) {
          await tx.studentParent.create({
            data: {
              studentId: id,
              parentId: rel.parentId,
              relation: rel.relation,
              isPrimary: false,
              tenantId
            }
          });
        }
      }

      return student;
    });

    return c.json(convertOutput(result), 200);
  }

  const convertedBody = convertInput(body);

  if (modelName === 'staff') {
    const staffId = c.req.param('id');
    const existingStaff = await prisma.staff.findUnique({ where: { id: staffId } });
    
    if (existingStaff) {
      const username = convertedBody.username || existingStaff.username;
      
      if (username) {
        // Find if a User exists or needs to be created/updated
        let existingUser = await prisma.user.findFirst({
          where: { username: existingStaff.username || username }
        });
        
        const password = convertedBody.password || convertedBody.passwordHash;
        const userRole = mapStaffRoleToUserRole(convertedBody.role || existingStaff.role);

        if (existingUser) {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              name: convertedBody.name || existingStaff.name,
              role: userRole,
              ...(username && { username }),
              ...(password && { passwordHash: password })
            }
          });
        } else {
          // If they are setting a username now but they didn't have one before
          existingUser = await prisma.user.create({
            data: {
              tenantId: c.get('tenantId'),
              username,
              passwordHash: password || '',
              name: convertedBody.name || existingStaff.name,
              role: userRole
            }
          });
        }
        
        convertedBody.userId = existingUser.id;
      }
    }

    if (convertedBody.password !== undefined) {
      if (convertedBody.password) {
        convertedBody.passwordHash = convertedBody.password;
      }
      delete convertedBody.password;
    }
  }

  const queryOptions: any = {
    where: { id: c.req.param('id') },
    data: convertedBody
  };
  if (tablesWithTenantId.has(modelName)) {
    queryOptions.where.tenantId = c.get('tenantId');
  }
  const record = await (prisma as any)[modelName].update(queryOptions);
  return c.json(convertOutput(record));
});

apiRouter.delete('/:table/:id', async (c) => {
  const modelName = c.get('modelName');
  if (modelName === 'staff') {
    const staffId = c.req.param('id');
    const existingStaff = await prisma.staff.findUnique({ where: { id: staffId } });
    if (existingStaff && existingStaff.username) {
      await prisma.user.deleteMany({
        where: { username: existingStaff.username }
      });
    }
  }

  const queryOptions: any = {
    where: { id: c.req.param('id') }
  };
  if (tablesWithTenantId.has(modelName)) {
    queryOptions.where.tenantId = c.get('tenantId');
  }
  await (prisma as any)[modelName].delete(queryOptions);
  return c.json({ success: true });
});
