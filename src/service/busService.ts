export interface Contact {
  name: string;
  phone: string;
}

export interface BusScheduleItem {
  id: string;
  busName: string;
  servesArea?: string;
  startPlace: string;
  endPlace: string;
  startTime: string;     // e.g., 07:00 AM
  downTime: string;      // e.g., 06:15 PM
  stops: string[];
  driver: Contact;
  president: Contact; // student representative
  notes?: string;
  days?: string;      // e.g., Sun–Thu
}

// Demo dataset (20+ buses). Replace with real data later.
const DEMO_BUSES: BusScheduleItem[] = [
  {
    id: 'DU-01',
    busName: 'TSC Express',
    startPlace: 'Mirpur-12 Stand',
    endPlace: 'TSC, University of Dhaka',
    startTime: '07:00 AM',
    downTime: '06:15 PM',
    stops: ['Mirpur-12', 'Mirpur-10', 'Kazipara', 'Shewrapara', 'Agargaon', 'Farmgate', 'Karwan Bazar', 'Shahbagh', 'TSC'],
    driver: { name: 'Abdul Karim', phone: '01711-000001' },
    president: { name: 'Md. Rakib', phone: '01722-000001' },
    days: 'Sun–Thu',
    notes: 'Peak load around Farmgate 8:15–8:30 AM',
  },
  {
    id: 'DU-02',
    busName: 'Motijheel Link',
    startPlace: 'Motijheel Shapla Chattar',
    endPlace: 'TSC, University of Dhaka',
    startTime: '06:45 AM',
    downTime: '06:00 PM',
    stops: ['Motijheel', 'Paltan', 'Press Club', 'High Court', 'Shahbagh', 'TSC'],
    driver: { name: 'Nazrul Islam', phone: '01711-000002' },
    president: { name: 'Nabila Ahmed', phone: '01722-000002' },
    days: 'Sun–Thu',
  },
  {
    id: 'DU-03',
    busName: 'Uttara Shuttle',
    startPlace: 'Uttara Sector-10',
    endPlace: 'Curzon Hall, DU',
    startTime: '06:40 AM',
    downTime: '06:10 PM',
    stops: ['Uttara-10', 'Uttara-7', 'Airport', 'Banani', 'Mohakhali', 'Karwan Bazar', 'Shahbagh', 'Curzon Hall'],
    driver: { name: 'Shahidul', phone: '01711-000003' },
    president: { name: 'Tasnim Jahan', phone: '01722-000003' },
    days: 'Sun–Thu',
  },
  {
    id: 'DU-04',
    busName: 'Savar Circular',
    startPlace: 'Savar Bazar',
    endPlace: 'Nilkhet, DU',
    startTime: '06:15 AM',
    downTime: '05:50 PM',
    stops: ['Savar', 'Hemayetpur', 'Gabtoli', 'Technical', 'Kallyanpur', 'Shyamoli', 'Asad Gate', 'Science Lab', 'Nilkhet'],
    driver: { name: 'Babul', phone: '01711-000004' },
    president: { name: 'Shanto Roy', phone: '01722-000004' },
    days: 'Sun–Thu',
  },
  {
    id: 'DU-05',
    busName: 'Narayanganj Line',
    startPlace: 'Chashara',
    endPlace: 'TSC, DU',
    startTime: '06:20 AM',
    downTime: '05:45 PM',
    stops: ['Chashara', 'Signboard', 'Shympur', 'Jatrabari', 'Gulistan', 'Shahbagh', 'TSC'],
    driver: { name: 'Kamal', phone: '01711-000005' },
    president: { name: 'Rizvi Rahman', phone: '01722-000005' },
    days: 'Sun–Thu',
  },
  // Add more demo items quickly by cloning pattern
];

// Expand to at least 20 by generating variations
for (let i = 6; i <= 20; i++) {
  DEMO_BUSES.push({
    id: `DU-${String(i).padStart(2, '0')}`,
    busName: i % 2 ? 'Eastern Route' : 'Western Route',
    startPlace: i % 2 ? 'Badda Link Road' : 'Keraniganj Ferry',
    endPlace: i % 3 ? 'TSC, DU' : 'Curzon Hall, DU',
    startTime: `${6 + (i % 3)}:${(15 * (i % 4)).toString().padStart(2, '0')} AM`,
    downTime: `${5 + (i % 3)}:${(10 * (i % 4)).toString().padStart(2, '0')} PM`,
    stops: (i % 2)
      ? ['Badda', 'Rampura', 'Mouchak', 'Kakrail', 'Shahbagh', 'TSC']
      : ['Keraniganj', 'Babu Bazar', 'Naya Paltan', 'Press Club', 'High Court', 'Shahbagh', 'Curzon'],
    driver: { name: `Driver ${i}`, phone: `01711-000${(100 + i).toString().slice(1)}` },
    president: { name: `President ${i}`, phone: `01722-000${(200 + i).toString().slice(1)}` },
    days: 'Sun–Thu',
    notes: i % 2 ? 'Crowded at Rampura bridge' : 'Traffic near Babubazar bridge',
  });
}

// Load official/basic list and merge with demo timings to reach 20 entries
// Note: bundlers allow importing JSON
// eslint-disable-next-line @typescript-eslint/no-var-requires
const RAW = require('./busData.json') as Array<{ busName: string; routeInfo: string }>;

// Enrichment defaults by bus name (demo when not fully available)
const ENRICH: Record<string, Partial<BusScheduleItem>> = {
  Ananda: {
    servesArea: 'Mirpur 1 • 10 • 14',
    startPlace: 'Mirpur-10 Roundabout', endPlace: 'TSC, DU',
    startTime: '07:00 AM', downTime: '06:10 PM',
    stops: ['Mirpur-14', 'Mirpur-10', 'Kazipara', 'Shewrapara', 'Agargaon', 'Farmgate', 'Karwan Bazar', 'Shahbagh', 'TSC'],
    driver: { name: 'Abdul Karim', phone: '01711-100101' },
    president: { name: 'Rakib Hasan', phone: '01722-200101' },
  },
  Basanta: {
    servesArea: 'Banasree • Rampura • Merul Badda',
    startPlace: 'Banasree Main Gate', endPlace: 'TSC, DU',
    startTime: '06:50 AM', downTime: '05:55 PM',
    stops: ['Banasree', 'Rampura', 'Mouchak', 'Kakrail', 'Shahbagh', 'TSC'],
    driver: { name: 'Nazrul Islam', phone: '01711-100102' },
    president: { name: 'Nabila Ahmed', phone: '01722-200102' },
  },
  Falguni: {
    servesArea: 'Merul Badda • Notun Bazar',
    startPlace: 'Notun Bazar', endPlace: 'Curzon Hall, DU',
    startTime: '06:45 AM', downTime: '05:50 PM',
    stops: ['Notun Bazar', 'Badda', 'Rampura', 'Mouchak', 'Kakrail', 'Shahbagh', 'Curzon'],
    driver: { name: 'Shahidul', phone: '01711-100103' },
    president: { name: 'Tasnim Jahan', phone: '01722-200103' },
  },
  'Wari-Bateshwar': {
    servesArea: 'Old Dhaka (Wari • Bateshwar)',
    startPlace: 'Wari', endPlace: 'TSC, DU',
    startTime: '06:40 AM', downTime: '05:40 PM',
    stops: ['Wari', 'Ittefaq', 'Paltan', 'Press Club', 'High Court', 'Shahbagh', 'TSC'],
    driver: { name: 'Babul', phone: '01711-100104' },
    president: { name: 'Shanto Roy', phone: '01722-200104' },
  },
  'Ullash': {
    servesArea: 'Hatirjheel • Rampura (East Dhaka)',
    startPlace: 'Hatirjheel Police Box', endPlace: 'TSC, DU',
    startTime: '06:55 AM', downTime: '06:05 PM',
    stops: ['Hatirjheel', 'Rampura', 'Mouchak', 'Kakrail', 'Shahbagh', 'TSC'],
    driver: { name: 'Kamal', phone: '01711-100105' },
    president: { name: 'Rizvi Rahman', phone: '01722-200105' },
  },
  'Maitree': {
    servesArea: 'Mirpur Corridor',
    startPlace: 'Mirpur-14', endPlace: 'Curzon Hall, DU',
    startTime: '06:35 AM', downTime: '05:45 PM',
    stops: ['Mirpur-14', 'Mirpur-10', 'Agargaon', 'Farmgate', 'Shahbagh', 'Curzon'],
    driver: { name: 'Shafiqul', phone: '01711-100106' },
    president: { name: 'Farzana S', phone: '01722-200106' },
  },
  'Khonika': {
    servesArea: 'Mohakhali • Airport • Abdullahpur',
    startPlace: 'Abdullahpur', endPlace: 'TSC, DU',
    startTime: '06:30 AM', downTime: '06:00 PM',
    stops: ['Abdullahpur', 'Airport', 'Banani', 'Mohakhali', 'Karwan Bazar', 'Shahbagh', 'TSC'],
    driver: { name: 'Jalal', phone: '01711-100107' },
    president: { name: 'Mehedi H', phone: '01722-200107' },
  },
  'Taranga': {
    servesArea: 'Mohammadpur',
    startPlace: 'Mohammadpur Bus Stand', endPlace: 'TSC, DU',
    startTime: '06:40 AM', downTime: '05:55 PM',
    stops: ['Mohammadpur', 'Asad Gate', 'New Market', 'Nilkhet', 'TSC'],
    driver: { name: 'Selim', phone: '01711-100108' },
    president: { name: 'Sajid A', phone: '01722-200108' },
  },
  'Kinchit': {
    servesArea: 'Pallabi • Begum Rokeya Ave',
    startPlace: 'Pallabi', endPlace: 'Curzon Hall, DU',
    startTime: '06:50 AM', downTime: '06:10 PM',
    stops: ['Pallabi', 'Mirpur-11', 'Mirpur-10', 'Agargaon', 'Farmgate', 'Shahbagh', 'Curzon'],
    driver: { name: 'Iqbal', phone: '01711-100109' },
    president: { name: 'Rafi U', phone: '01722-200109' },
  },
};

export async function getBusSchedules(): Promise<{ success: boolean; data: BusScheduleItem[] }> {
  const official: BusScheduleItem[] = RAW.map((x, idx) => {
    const e = ENRICH[x.busName] || {};
    return {
      id: `DU-O-${idx + 1}`,
      busName: x.busName,
      servesArea: e.servesArea || x.routeInfo,
      startPlace: e.startPlace || '',
      endPlace: e.endPlace || 'University of Dhaka',
      startTime: e.startTime || '',
      downTime: e.downTime || '',
      stops: e.stops || [],
      driver: e.driver || { name: '', phone: '' },
      president: e.president || { name: '', phone: '' },
      notes: x.routeInfo,
      days: 'Sun–Thu',
    };
  });

  // Fill up to 20 using demo data for schedule richness
  const combined = [...official];
  let i = 0;
  while (combined.length < 20 && i < DEMO_BUSES.length) {
    combined.push(DEMO_BUSES[i]);
    i++;
  }
  return { success: true, data: combined };
}
