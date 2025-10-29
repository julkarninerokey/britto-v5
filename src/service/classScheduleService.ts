export interface ClassItem {
  id: string;
  course: string;
  teacher: string;
  room: string;
  startTime: string; // 24h or AM/PM
  endTime: string;
}

export type Weekday = 'Sunday'|'Monday'|'Tuesday'|'Wednesday'|'Thursday'|'Friday'|'Saturday';

export interface WeeklySchedule {
  department: string;
  week: Record<Weekday, ClassItem[]>;
}

// Build a 6-class-per-day demo for Department of Law
const BASE_CLASSES: Array<Omit<ClassItem, 'id'>> = [
  { course: 'Constitutional Law I', teacher: 'Dr. A. Chowdhury', room: 'Room 201', startTime: '09:00 AM', endTime: '10:30 AM' },
  { course: 'Criminal Law I',       teacher: 'Mr. S. Rahman',    room: 'Room 104', startTime: '10:30 AM', endTime: '12:00 PM' },
  { course: 'Law of Torts',         teacher: 'Ms. R. Sultana',   room: 'Room 305', startTime: '12:00 PM', endTime: '01:30 PM' },
  { course: 'Administrative Law',   teacher: 'Dr. F. Ahmed',     room: 'Room 207', startTime: '01:30 PM', endTime: '03:00 PM' },
  { course: 'Jurisprudence',        teacher: 'Prof. N. Karim',   room: 'Room 401', startTime: '03:00 PM', endTime: '04:30 PM' },
  { course: 'International Law',    teacher: 'Ms. T. Hasan',     room: 'Room 302', startTime: '04:30 PM', endTime: '06:00 PM' },
];

function makeDay(day: string): ClassItem[] {
  return BASE_CLASSES.map((c, idx) => ({ ...c, id: `${day}-LAW-${(idx+1).toString().padStart(2,'0')}` }));
}

const DEMO_LAW_SCHEDULE: WeeklySchedule = {
  department: 'Department of Law',
  week: {
    Sunday: makeDay('SUN'),
    Monday: makeDay('MON'),
    Tuesday: makeDay('TUE'),
    Wednesday: makeDay('WED'),
    Thursday: makeDay('THU'),
    Friday: makeDay('FRI'),
    Saturday: makeDay('SAT'),
  },
};

export async function getWeeklyClassSchedule(): Promise<{ success: boolean; data: WeeklySchedule }>{
  return { success: true, data: DEMO_LAW_SCHEDULE };
}
