// Minimal stubs for Proctor feature UI. Replace with real API later.
export interface ProctorReport {
  id: string;
  createdAt: string;
  status: 'SUBMITTED' | 'REVIEWING' | 'RESOLVED' | 'REJECTED';
  category: string;
  note?: string;
  location?: { lat: number; lng: number };
}

export async function getMyProctorReports(): Promise<{ success: boolean; data: ProctorReport[] }> {
  return {
    success: true,
    data: [
      { id: 'R-2025-0003', createdAt: new Date().toISOString(), status: 'REVIEWING', category: 'Suspicious Activity', note: 'Near main gate' },
      { id: 'R-2025-0002', createdAt: new Date(Date.now() - 86400000).toISOString(), status: 'SUBMITTED', category: 'Vandalism' },
      { id: 'R-2025-0001', createdAt: new Date(Date.now() - 3*86400000).toISOString(), status: 'RESOLVED', category: 'Harassment' },
    ],
  };
}

export async function submitProctorReportDraft(_draft: any): Promise<{ success: boolean; id?: string; message?: string }>{
  // Simulate success
  return { success: true, id: 'R-2025-0004' };
}

