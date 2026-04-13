export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  plan: 'basic' | 'standard' | 'premium';
  status: 'active' | 'inactive' | 'frozen';
  joinDate: string;
  renewalDate: string;
  avatar?: string;
  age: number;
  gender: 'male' | 'female';
  attendanceThisMonth: number;
}

export interface Staff {
  id: string;
  name: string;
  role: 'trainer' | 'receptionist' | 'manager' | 'cleaner';
  email: string;
  phone: string;
  schedule: string[];
  salary: number;
  joinDate: string;
  status: 'active' | 'inactive';
  avatar?: string;
}

export interface ClassEvent {
  id: string;
  title: string;
  trainer: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  enrolled: number;
  room: string;
  type: 'yoga' | 'pilates' | 'cardio' | 'strength' | 'boxing' | 'spinning' | 'zumba';
  color: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  date: string;
  paymentMethod?: string;
}
