export interface User {
  uid: string;
  name: string;
  email: string;
  role: 'student' | 'faculty' | 'admin';
  photoURL?: string;
  // Optional profile fields
  rollNo?: string;
  facultyId?: string;
  branch?: string;
  accreditation?: 'nba' | 'naac';
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