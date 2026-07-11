import { useEffect, useState, useCallback } from 'react';
import { repo } from '../lib/repo';
import type { Student, Parent, Group, GroupEnrollment, StudentParent } from '../lib/types';
import { DataTable, type Column } from '../components/ui/DataTable';
import { Button } from '../components/ui/Button';
import { Input, Select, Textarea, Combobox } from '../components/ui/Input';
import { Dialog } from '../components/ui/Dialog';
import { Badge, StatusBadge } from '../components/ui/Badge';
import { Card, CardHeader, EmptyState, Spinner } from '../components/ui/Card';
import { Search, Plus, Users, QrCode, School, Edit2, Trash2, Phone } from 'lucide-react';

export function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<Student | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [detail, setDetail] = useState<Student | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [students, parents, studentParents] = await Promise.all([
      repo.getAll('students'),
      repo.getAll('parents'),
      repo.getAll('student_parents')
    ]);
    const parentMap = new Map(parents.map((p) => [p.id, p]));
    const studentParentsMap = new Map<string, StudentParent[]>();
    
    studentParents.forEach((sp) => {
      const p = { ...sp, parent: parentMap.get(sp.parentId) };
      if (studentParentsMap.has(sp.studentId)) {
        studentParentsMap.get(sp.studentId)!.push(p);
      } else {
        studentParentsMap.set(sp.studentId, [p]);
      }
    });

    let data = students.map((s) => ({
      ...s,
      parents: studentParentsMap.get(s.id) || []
    }));
    
    data.sort((a, b) => b.created_at.localeCompare(a.created_at));
    setStudents(data as Student[]);
    parents.sort((a, b) => a.name.localeCompare(b.name));
    setParents(parents as Parent[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = students.filter((s) => {
    if (search && !s.name.includes(search) && !(s.phone || '').includes(search) && !(s.school || '').includes(search)) return false;
    if (statusFilter && s.status !== statusFilter) return false;
    if (gradeFilter && s.grade !== gradeFilter) return false;
    return true;
  });

  const grades = [...new Set(students.map((s) => s.grade).filter(Boolean))] as string[];

  const columns: Column<Student>[] = [
    {
      key: 'name', header: 'الطالب', sortable: true, sortValue: (s) => s.name,
      render: (s) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-semibold shrink-0">
            {s.name.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-ink-900">{s.name}</p>
            <p className="text-xs text-ink-400">{s.phone || '—'}</p>
          </div>
        </div>
      ),
    },
    { key: 'grade', header: 'الصف', sortable: true, sortValue: (s) => s.grade || '', render: (s) => <span className="text-ink-600">{s.grade || '—'}</span> },
    { key: 'school', header: 'المدرسة', render: (s) => <span className="text-ink-600">{s.school || '—'}</span> },
    {
      key: 'parent', header: 'أولياء الأمور',
      render: (s) => (
        <span className="text-ink-600">
          {s.parents && s.parents.length > 0
            ? s.parents.map((p) => p.parent?.name).filter(Boolean).join('، ')
            : '—'}
        </span>
      )
    },

    { key: 'status', header: 'الحالة', sortable: true, sortValue: (s) => s.status, render: (s) => <StatusBadge status={s.status} /> },
    {
      key: 'actions', header: '', align: 'left',
      render: (s) => (
        <div className="flex items-center gap-1">
          <button className="btn-ghost btn-icon btn-sm" onClick={(e) => { e.stopPropagation(); setDetail(s); }} title="عرض">
            <QrCode size={14} />
          </button>
          <button className="btn-ghost btn-icon btn-sm" onClick={(e) => { e.stopPropagation(); setEditing(s); setShowForm(true); }} title="تعديل">
            <Edit2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطالب؟')) return;
    await repo.softDelete('students', id);
    load();
  };

  const handleBulkDelete = async () => {
    if (!confirm(`حذف ${selected.size} طالب؟`)) return;
    for (const id of selected) {
      await repo.softDelete('students', id);
    }
    await     setSelected(new Set());
    load();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96"><Spinner className="text-brand-600" /></div>;
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            className="input pr-9"
            placeholder="بحث بالاسم أو الهاتف أو المدرسة..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="input w-40" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">كل الحالات</option>
          <option value="نشط">نشط</option>
          <option value="غير نشط">غير نشط</option>
          <option value="متوقف">متوقف</option>
          <option value="خرج">خرج</option>
        </select>
        <select className="input w-48" value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)}>
          <option value="">كل الصفوف</option>
          {grades.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <Button onClick={() => { setEditing(null); setShowForm(true); }}>
          <Plus size={16} /> طالب جديد
        </Button>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 p-3 bg-brand-50 rounded-lg border border-brand-200">
          <p className="text-sm text-brand-700 font-medium">{selected.size} محدد</p>
          <button className="btn-danger btn-sm" onClick={handleBulkDelete}>
            <Trash2 size={14} /> حذف المحدد
          </button>
          <button className="btn-ghost btn-sm" onClick={() => setSelected(new Set())}>إلغاء</button>
        </div>
      )}

      <DataTable
        columns={columns}
        data={filtered}
        rowKey={(s) => s.id}
        onRowClick={(s) => setDetail(s)}
        selectable
        selectedIds={selected}
        onSelectionChange={setSelected}
        emptyState={<EmptyState icon={<Users size={40} />} title="لا يوجد طلاب" description="ابدأ بإضافة أول طالب" action={<Button onClick={() => { setEditing(null); setShowForm(true); }}><Plus size={16} /> طالب جديد</Button>} />}
      />

      {showForm && (
        <StudentForm
          student={editing}
          parents={parents}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load(); }}
        />
      )}

      {detail && (
        <StudentDetail
          student={detail}
          onClose={() => setDetail(null)}
          onEdit={() => { setEditing(detail); setDetail(null); setShowForm(true); }}
          onDelete={() => { handleDelete(detail.id); setDetail(null); }}
        />
      )}
    </div>
  );
}

function StudentForm({ student, parents, onClose, onSaved }: { student: Student | null; parents: Parent[]; onClose: () => void; onSaved: () => void }) {
  const parseGrade = (gradeStr: string) => {
    if (!gradeStr) return { stage: '', grade: '' };
    
    if (gradeStr.includes('الابتدائي') || gradeStr.includes('ابتدائي')) {
      let grade = '';
      if (gradeStr.includes('الأول') || gradeStr.includes('الاول')) grade = 'الصف الأول';
      else if (gradeStr.includes('الثاني') || gradeStr.includes('التاني')) grade = 'الصف الثاني';
      else if (gradeStr.includes('الثالث')) grade = 'الصف الثالث';
      else if (gradeStr.includes('الرابع')) grade = 'الصف الرابع';
      else if (gradeStr.includes('الخامس')) grade = 'الصف الخامس';
      else if (gradeStr.includes('السادس')) grade = 'الصف السادس';
      return { stage: 'ابتدائي', grade };
    }
    
    if (gradeStr.includes('الإعدادي') || gradeStr.includes('اعدادي') || gradeStr.includes('الاعتدادي') || gradeStr.includes('الأعدادي')) {
      let grade = '';
      if (gradeStr.includes('الأول') || gradeStr.includes('الاول')) grade = 'الصف الأول';
      else if (gradeStr.includes('الثاني') || gradeStr.includes('التاني')) grade = 'الصف الثاني';
      else if (gradeStr.includes('الثالث')) grade = 'الصف الثالث';
      return { stage: 'اعدادي', grade };
    }
    
    if (gradeStr.includes('الثانوي') || gradeStr.includes('ثانوي')) {
      let grade = '';
      if (gradeStr.includes('الأول') || gradeStr.includes('الاول')) grade = 'الصف الأول';
      else if (gradeStr.includes('الثاني') || gradeStr.includes('التاني')) grade = 'الصف الثاني';
      else if (gradeStr.includes('الثالث')) grade = 'الصف الثالث';
      return { stage: 'ثانوي', grade };
    }
    
    return { stage: '', grade: gradeStr };
  };

  const getCombinedGrade = (stage: string, grade: string) => {
    if (!stage) return grade;
    if (!grade) return stage;
    
    if (stage === 'ابتدائي') {
      if (grade === 'الصف الأول') return 'الأول الابتدائي';
      if (grade === 'الصف الثاني') return 'الثاني الابتدائي';
      if (grade === 'الصف الثالث') return 'الثالث الابتدائي';
      if (grade === 'الصف الرابع') return 'الرابع الابتدائي';
      if (grade === 'الصف الخامس') return 'الخامس الابتدائي';
      if (grade === 'الصف السادس') return 'السادس الابتدائي';
    }
    if (stage === 'اعدادي') {
      if (grade === 'الصف الأول') return 'الأول الإعدادي';
      if (grade === 'الصف الثاني') return 'الثاني الإعدادي';
      if (grade === 'الصف الثالث') return 'الثالث الإعدادي';
    }
    if (stage === 'ثانوي') {
      if (grade === 'الصف الأول') return 'الأول الثانوي';
      if (grade === 'الصف الثاني') return 'الثاني الثانوي';
      if (grade === 'الصف الثالث') return 'الثالث الثانوي';
    }
    return `${grade} ${stage}`;
  };

  const initialGradeInfo = student?.grade ? parseGrade(student.grade) : { stage: '', grade: '' };
  const [selectedStage, setSelectedStage] = useState<string>(initialGradeInfo.stage);
  const [selectedGrade, setSelectedGrade] = useState<string>(initialGradeInfo.grade);

  const [schools, setSchools] = useState<string[]>([]);
  useEffect(() => {
    repo.getAll('students').then((allStudents) => {
      const uniqueSchools = Array.from(
        new Set(
          allStudents
            .map((s) => s.school?.trim())
            .filter(Boolean)
        )
      ) as string[];
      uniqueSchools.sort((a, b) => a.localeCompare(b));
      setSchools(uniqueSchools);
    });
  }, []);

  const primaryParentRel = student?.parents?.find(p => p.isPrimary) || student?.parents?.[0];
  const primaryParent = primaryParentRel?.parent;
  const initialRelation = primaryParentRel?.relation || 'الأب';
  
  const standardRelations = ['الأب', 'الأم', 'الأخ', 'الأخت', 'الجد', 'الجدة', 'العم', 'العمة', 'الخال', 'الخالة', 'الوصي'];
  const isOtherRelation = primaryParentRel && !standardRelations.includes(initialRelation);

  const [form, setForm] = useState({
    name: student?.name || '',
    gender: student?.gender || 'ذكر',
    school: student?.school || '',
    phone: student?.phone || '',
    phone2: student?.phone2 || '',
    notes: student?.notes || '',
    status: student?.status || 'نشط',
    parentName: primaryParent?.name || '',
    parentRelation: isOtherRelation ? 'أخرى' : initialRelation,
    parentRelationOther: isOtherRelation ? initialRelation : '',
    parentPhone: primaryParent?.phone || '',
    parentPhone2: primaryParent?.phone2 || '',
    parentNotes: primaryParent?.notes || '',
  });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.name.trim() || !form.parentName.trim() || !form.parentPhone.trim()) return;
    setSaving(true);
    const { parentName, parentRelation, parentRelationOther, parentPhone, parentPhone2, parentNotes, ...rawForm } = form;
    const combinedGrade = getCombinedGrade(selectedStage, selectedGrade);
    
    const finalRelation = parentRelation === 'أخرى' ? parentRelationOther : parentRelation;
    const existingParentMatch = parents.find(p => p.phone === parentPhone && parentPhone.trim() !== '');
    
    const parentData = {
      name: parentName,
      phone: parentPhone,
      phone2: parentPhone2,
      relation: finalRelation,
      notes: parentNotes,
      existingParentId: existingParentMatch?.id
    };

    const data = {
      ...rawForm,
      grade: combinedGrade || null,
      parentData
    };
    
    if (student) {
      await repo.update('students', student.id, data);
    } else {
      const qr = 'QR-' + Math.random().toString(36).substring(2, 12).toUpperCase();
      await repo.insert('students', { ...data, qr_code: qr });
    }

    setSaving(false);
    onSaved();
  };

  return (
    <Dialog
      open
      onClose={onClose}
      title={student ? 'تعديل بيانات الطالب' : 'طالب جديد'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>إلغاء</Button>
          <Button onClick={submit} disabled={saving || !form.name.trim()}>
            {saving ? <Spinner /> : 'حفظ'}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-4">
        <Input label="الاسم الكامل *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Select label="الجنس" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} options={[{ value: 'ذكر', label: 'ذكر' }, { value: 'أنثى', label: 'أنثى' }]} />


        <Combobox label="المدرسة" value={form.school} onChange={(e) => setForm({ ...form, school: e.target.value })} onSelect={(val) => setForm({ ...form, school: val })} options={schools} />
        <Select
          label="المرحلة الدراسية"
          value={selectedStage}
          onChange={(e) => {
            setSelectedStage(e.target.value);
            setSelectedGrade('');
          }}
          options={[
            { value: 'ابتدائي', label: 'ابتدائي' },
            { value: 'اعدادي', label: 'اعدادي' },
            { value: 'ثانوي', label: 'ثانوي' }
          ]}
          placeholder="اختر المرحلة الدراسية..."
        />
        <Select
          label="الصف الدراسي"
          value={selectedGrade}
          onChange={(e) => setSelectedGrade(e.target.value)}
          options={
            selectedStage === 'ابتدائي'
              ? [
                  { value: 'الصف الأول', label: 'الصف الأول' },
                  { value: 'الصف الثاني', label: 'الصف الثاني' },
                  { value: 'الصف الثالث', label: 'الصف الثالث' },
                  { value: 'الصف الرابع', label: 'الصف الرابع' },
                  { value: 'الصف الخامس', label: 'الصف الخامس' },
                  { value: 'الصف السادس', label: 'الصف السادس' }
                ]
              : selectedStage === 'اعدادي' || selectedStage === 'ثانوي'
              ? [
                  { value: 'الصف الأول', label: 'الصف الأول' },
                  { value: 'الصف الثاني', label: 'الصف الثاني' },
                  { value: 'الصف الثالث', label: 'الصف الثالث' }
                ]
              : []
          }
          placeholder="اختر الصف الدراسي..."
          disabled={!selectedStage}
        />
        <Input label="الهاتف الأساسي" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <Input label="هاتف إضافي" value={form.phone2} onChange={(e) => setForm({ ...form, phone2: e.target.value })} />
        <Select label="الحالة" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={[
          { value: 'نشط', label: 'نشط' }, { value: 'غير نشط', label: 'غير نشط' }, { value: 'متوقف', label: 'متوقف' }, { value: 'خرج', label: 'خرج' },
        ]} />

        <Textarea label="ملاحظات" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="col-span-2" />


        <div className="col-span-2 pt-6 mt-2 border-t border-ink-200">
          <h3 className="text-sm font-semibold text-ink-900 mb-4">بيانات ولي الأمر الأساسي</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input label="اسم ولي الأمر *" value={form.parentName} onChange={(e) => setForm({ ...form, parentName: e.target.value })} />
            <Select 
              label="صلة القرابة *" 
              value={form.parentRelation} 
              onChange={(e) => setForm({ ...form, parentRelation: e.target.value })} 
              options={[
                { value: 'الأب', label: 'الأب' },
                { value: 'الأم', label: 'الأم' },
                { value: 'الأخ', label: 'الأخ' },
                { value: 'الأخت', label: 'الأخت' },
                { value: 'الجد', label: 'الجد' },
                { value: 'الجدة', label: 'الجدة' },
                { value: 'العم', label: 'العم' },
                { value: 'العمة', label: 'العمة' },
                { value: 'الخال', label: 'الخال' },
                { value: 'الخالة', label: 'الخالة' },
                { value: 'الوصي', label: 'الوصي' },
                { value: 'أخرى', label: 'أخرى' },
              ]} 
            />
            {form.parentRelation === 'أخرى' && (
              <Input label="وصف صلة القرابة *" value={form.parentRelationOther} onChange={(e) => setForm({ ...form, parentRelationOther: e.target.value })} className="col-span-2" />
            )}
            <div className="flex flex-col gap-1">
              <Input label="رقم الهاتف الأساسي *" value={form.parentPhone} onChange={(e) => setForm({ ...form, parentPhone: e.target.value })} />
              {parents.find(p => p.phone === form.parentPhone && form.parentPhone.trim() !== '') && (
                <p className="text-[11px] text-info-600 bg-info-50 p-1.5 rounded border border-info-100">
                  هذا الرقم مسجل بالفعل لولي الأمر ({parents.find(p => p.phone === form.parentPhone)?.name}). سيتم ربط الطالب به.
                </p>
              )}
            </div>
            <Input label="رقم هاتف إضافي" value={form.parentPhone2} onChange={(e) => setForm({ ...form, parentPhone2: e.target.value })} />
            <Textarea label="ملاحظات ولي الأمر" value={form.parentNotes} onChange={(e) => setForm({ ...form, parentNotes: e.target.value })} className="col-span-2" />
          </div>
        </div>

      </div>
    </Dialog>
  );
}

function StudentDetail({ student, onClose, onEdit, onDelete }: { student: Student; onClose: () => void; onEdit: () => void; onDelete: () => void }) {
  const [enrollments, setEnrollments] = useState<(GroupEnrollment & { group: Group })[]>([]);
  
  const handlePrintCard = (student: Student) => {
    const printWindow = window.open('', '_blank', 'width=400,height=500');
    if (!printWindow) {
      alert('الرجاء السماح بنوافذ منبثقة لطباعة البطاقة');
      return;
    }

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(student.qr_code || student.id)}`;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>بطاقة طالب - ${student.name}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700&display=swap');
          
          body {
            font-family: 'Rubik', sans-serif;
            margin: 0;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            background-color: #f3f4f6;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .card {
            background: white;
            width: 320px;
            padding: 24px;
            border-radius: 16px;
            border: 2px solid #e5e7eb;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            text-align: center;
            position: relative;
            box-sizing: border-box;
          }
          
          .header {
            border-bottom: 2px dashed #e5e7eb;
            padding-bottom: 12px;
            margin-bottom: 16px;
          }
          
          .center-title {
            font-size: 18px;
            font-weight: 700;
            color: #4f46e5;
            margin: 0;
          }
          
          .center-subtitle {
            font-size: 11px;
            color: #6b7280;
            margin: 4px 0 0 0;
            letter-spacing: 0.5px;
          }
          
          .student-avatar {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background-color: #e0e7ff;
            color: #4338ca;
            font-size: 24px;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 12px auto;
          }
          
          .student-name {
            font-size: 16px;
            font-weight: 700;
            color: #111827;
            margin: 0 0 6px 0;
          }
          
          .student-info {
            font-size: 12px;
            color: #4b5563;
            margin: 4px 0;
          }
          
          .qr-container {
            margin: 20px auto 16px auto;
            width: 140px;
            height: 140px;
            border: 2px solid #111827;
            border-radius: 8px;
            padding: 8px;
            background: white;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .qr-container img {
            width: 100%;
            height: 100%;
          }
          
          .qr-code-text {
            font-family: monospace;
            font-size: 11px;
            color: #374151;
            background-color: #f3f4f6;
            padding: 4px 8px;
            border-radius: 4px;
            display: inline-block;
            margin: 0;
          }
          
          .footer {
            margin-top: 16px;
            font-size: 10px;
            color: #9ca3af;
            border-top: 1px solid #f3f4f6;
            padding-top: 10px;
          }
          
          @media print {
            body {
              background-color: white;
              padding: 0;
            }
            .card {
              box-shadow: none;
              border: 1px solid #d1d5db;
              margin: 0 auto;
            }
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <h1 class="center-title">مركز Genius Center</h1>
            <p class="center-subtitle">بطاقة تعريفية للطالب</p>
          </div>
          
          <div class="student-avatar">
            ${student.name.charAt(0)}
          </div>
          
          <h2 class="student-name">${student.name}</h2>
          <p class="student-info">الصف: <strong>${student.grade || '—'}</strong></p>
          ${student.phone ? `<p class="student-info">الهاتف: <span dir="ltr">${student.phone}</span></p>` : ''}
          
          <div class="qr-container">
            <img src="${qrUrl}" alt="QR Code" />
          </div>
          
          <p class="qr-code-text">${student.qr_code || student.id}</p>
          
          <div class="footer">
            الرجاء إحضار هذه البطاقة في كل حصة لتسجيل الحضور.
          </div>
        </div>
        
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              };
              setTimeout(function() { window.close(); }, 500);
            }, 300);
          };
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const [payments, setPayments] = useState<{ id: string; amount: number; status: string; period_month: string; group: { name: string } | null }[]>([]);

  useEffect(() => {
    Promise.all([
      repo.where('group_enrollments', 'student_id', student.id),
      repo.getAll('groups'),
      repo.where('payments', 'student_id', student.id),
    ]).then(([enrollments, groups, payments]) => {
      const groupMap = new Map(groups.map((g) => [g.id, g]));
      const enrData = enrollments.map((e) => ({ ...e, group: (e.group_id ? groupMap.get(e.group_id) : null) || null }));
      const payData = payments.map((p) => ({ ...p, group: (p.group_id ? groupMap.get(p.group_id) : null) || null }));
      payData.sort((a, b) => b.created_at.localeCompare(a.created_at));
      setEnrollments(enrData as (GroupEnrollment & { group: Group })[]);
      setPayments(payData as { id: string; amount: number; status: string; period_month: string; group: { name: string } | null }[]);
    });
  }, [student.id]);

  const totalPaid = payments.filter((p) => p.status === 'مدفوع').reduce((s, p) => s + Number(p.amount) / 100, 0);
  const totalDue = payments.filter((p) => p.status === 'غير مدفوع' || p.status === 'جزئي').reduce((s, p) => s + Number(p.amount) / 100, 0);

  return (
    <Dialog
      open
      onClose={onClose}
      title={student.name}
      size="xl"
      footer={
        <>
          <Button variant="danger" size="sm" onClick={onDelete}><Trash2 size={14} /> حذف</Button>
          <Button variant="secondary" size="sm" onClick={onEdit}><Edit2 size={14} /> تعديل</Button>
          <Button variant="secondary" onClick={onClose}>إغلاق</Button>
        </>
      }
    >
      <div className="grid grid-cols-3 gap-5">
        {/* Left: Profile + QR */}
        <div className="col-span-1 space-y-4">
          <div className="text-center p-4 rounded-lg border border-ink-200 bg-ink-50">
            <div className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-2xl font-bold mx-auto mb-3">
              {student.name.charAt(0)}
            </div>
            <p className="text-base font-semibold text-ink-900">{student.name}</p>
            <div className="mt-2"><StatusBadge status={student.status} /></div>

          </div>

          {/* QR Code */}
          <div className="text-center p-4 rounded-lg border border-ink-200">
            <div className="w-32 h-32 bg-white border-2 border-ink-900 rounded-lg mx-auto mb-2 flex items-center justify-center relative">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(student.qr_code || student.id)}`}
                alt="QR Code"
                className="w-28 h-28"
              />
            </div>
            <p className="text-xs text-ink-500 font-mono">{student.qr_code}</p>
            <Button variant="secondary" size="sm" className="mt-2 w-full" onClick={() => handlePrintCard(student)}>طباعة البطاقة</Button>
          </div>

          {/* Contact */}
          <div className="space-y-2">
            {student.phone && <InfoRow icon={<Phone size={14} />} label="الهاتف" value={student.phone} />}
            {student.school && <InfoRow icon={<School size={14} />} label="المدرسة" value={student.school} />}
            {student.grade && <InfoRow icon={<Users size={14} />} label="الصف" value={student.grade} />}
            {student.parents && student.parents.length > 0 && (
              <div className="pt-3 border-t border-ink-100 mt-3 space-y-2">
                <p className="text-xs font-semibold text-ink-500 mb-1">أولياء الأمور:</p>
                {student.parents.map((p, idx) => (
                  <div key={idx} className="flex flex-col text-sm border-b border-ink-50 pb-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-ink-700 font-medium">{p.parent?.name}</span>
                      <span className="text-[10px] bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded">{p.relation || 'ولي أمر'}</span>
                    </div>
                    <span className="text-ink-500 font-mono text-xs mt-0.5">{p.parent?.phone}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Enrollments + Payments */}
        <div className="col-span-2 space-y-4">
          {/* Payment summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-success-50 border border-success-100">
              <p className="text-xs text-success-700 font-medium">إجمالي المدفوع</p>
              <p className="text-xl font-bold text-success-700 tabular">{totalPaid.toLocaleString('ar-EG')} ج.م</p>
            </div>
            <div className="p-3 rounded-lg bg-danger-50 border border-danger-100">
              <p className="text-xs text-danger-700 font-medium">المستحق</p>
              <p className="text-xl font-bold text-danger-700 tabular">{totalDue.toLocaleString('ar-EG')} ج.م</p>
            </div>
          </div>

          {/* Enrollments */}
          <Card>
            <CardHeader title="المجموعات المسجل بها" subtitle={`${enrollments.length} مجموعة`} />
            <div className="p-3 space-y-1.5">
              {enrollments.length === 0 ? (
                <p className="text-sm text-ink-400 text-center py-4">غير مسجل بأي مجموعة</p>
              ) : (
                enrollments.map((e) => (
                  <div key={e.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-ink-50">
                    <p className="text-sm font-medium text-ink-800">{e.group?.name}</p>
                    <StatusBadge status={e.status} />
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Payment history */}
          <Card>
            <CardHeader title="سجل المدفوعات" subtitle={`${payments.length} دفعة`} />
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-ink-200 bg-ink-50">
                    <th className="px-3 py-2 text-right text-xs font-semibold text-ink-600">الشهر</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-ink-600">المجموعة</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-ink-600">المبلغ</th>
                    <th className="px-3 py-2 text-right text-xs font-semibold text-ink-600">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="border-b border-ink-100">
                      <td className="px-3 py-2 text-ink-700">{p.period_month || '—'}</td>
                      <td className="px-3 py-2 text-ink-600">{p.group?.name || '—'}</td>
                      <td className="px-3 py-2 text-ink-900 font-semibold tabular">{(Number(p.amount) / 100).toLocaleString('ar-EG')} ج.م</td>
                      <td className="px-3 py-2"><StatusBadge status={p.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>


        </div>
      </div>
    </Dialog>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-ink-50">
      <div className="w-7 h-7 rounded-lg bg-ink-100 flex items-center justify-center text-ink-500 shrink-0">{icon}</div>
      <div>
        <p className="text-[10px] text-ink-400">{label}</p>
        <p className="text-sm text-ink-800">{value}</p>
      </div>
    </div>
  );
}


