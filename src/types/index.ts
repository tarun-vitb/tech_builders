export interface User {
  uid: string;
  name: string;
  email: string;
  role: 'student' | 'faculty' | 'admin';
  photoURL?: string;
}

export interface Activity {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  description: string;
  category: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  status: 'pending' | 'approved' | 'rejected';
  remarks?: string;
  createdAt: { toDate: () => Date } | Date;
  reviewedAt?: { toDate: () => Date } | Date;
  reviewedBy?: string;
}

export interface Stats {
  totalStudents: number;
  totalActivities: number;
  pendingActivities: number;
  approvedActivities: number;
  rejectedActivities: number;
  totalFaculty: number;
}