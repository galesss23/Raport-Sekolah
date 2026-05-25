export interface Grade {
  subject: string;
  kkm: number;
  score: number;
  predicate: string;
  description: string;
}

export interface Attendance {
  sick: number;
  permission: number;
  absent: number;
}

export interface Extracurricular {
  name: string;
  predicate: string;
  description: string;
}

export interface SchoolSettings {
  schoolName: string;
  schoolAddress: string;
  headmasterName: string;
  headmasterNip: string;
  logoUrl: string;
}

export interface StudentReport {
  id: string;
  nis: string;
  nisn: string;
  name: string;
  className: string;
  semester: "Ganjil" | "Genap";
  academicYear: string;
  grades: Grade[];
  attendance: Attendance;
  notes: string;
  extracurriculars: Extracurricular[];
  createdAt: number;
}

export const DEFAULT_SUBJECTS = [
  "Pendidikan Agama dan Budi Pekerti",
  "Pendidikan Pancasila dan Kewarganegaraan",
  "Bahasa Indonesia",
  "Matematika",
  "Ilmu Pengetahuan Alam",
  "Ilmu Pengetahuan Sosial",
  "Bahasa Inggris",
  "Seni Budaya",
  "Pendidikan Jasmani, Olahraga, dan Kesehatan"
];
