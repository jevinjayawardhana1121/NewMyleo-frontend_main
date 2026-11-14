// @ts-nocheck
import { create } from 'zustand';

export interface ClubRecord {
  id: string;
  name: string;
  districtId: string;
  districtName: string;
  regionId: string;
  regionName: string;
  zoneId: string;
  zoneName: string;
  charterDate: string;
  sponsorLionsClub: string;
  presidentName: string;
  activeMembers: number;
}

export interface DistrictRecord {
  id: string;
  name: string;
  multipleId: string;
  geographicArea: string;
  charterDate: string;
  districtPresidentName: string;
  totalClubs: number;
}

export interface OfficerAppointment {
  id: string;
  level: 'Club' | 'District' | 'Multiple';
  targetEntityId: string; // clubId or districtId
  targetEntityName: string;
  role: string;
  officerName: string;
  officerLeoId: string;
  appointedBy: string;
  appointedDate: string;
}

interface DeadlineSettings {
  districtDeadlineDay: number;
  internationalDeadlineDay: number;

  // District President's Preference: Route via Region Chairperson (RC)
  enableRegionChairpersonApproval: boolean;
  delegateApprovalToRD: boolean;
  rdInactiveFallbackContestDirector: boolean;
  isRDActive: boolean;

  // Dynamic Registries
  clubs: ClubRecord[];
  districts: DistrictRecord[];
  officerAppointments: OfficerAppointment[];
  forwardedReportsToMD: (string | number)[];

  setDistrictDeadlineDay: (day: number) => void;
  setInternationalDeadlineDay: (day: number) => void;
  setEnableRegionChairpersonApproval: (enabled: boolean) => void;
  setDelegateApprovalToRD: (enabled: boolean) => void;
  setRdInactiveFallbackContestDirector: (enabled: boolean) => void;
  setIsRDActive: (active: boolean) => void;

  addClub: (club: Partial<ClubRecord>) => ClubRecord;
  addDistrict: (district: Partial<DistrictRecord>) => DistrictRecord;
  appointOfficer: (appointment: Omit<OfficerAppointment, 'id' | 'appointedDate'>) => OfficerAppointment;
  forwardReportToMultiple: (reportId: string | number) => void;

  calculateSubmissionStatus: (submissionDate: string | Date, reportMonthIndex: number) => {
    isLate: boolean;
    daysLate: number;
    deadlineDate: Date;
    formattedDeadline: string;
  };
}

export const useSettingsStore = create<DeadlineSettings>((set, get) => ({
  districtDeadlineDay: 15,
  internationalDeadlineDay: 28,

  // Optional: District President preference whether reports route through Region Chairperson
  enableRegionChairpersonApproval: true,
  delegateApprovalToRD: true,
  rdInactiveFallbackContestDirector: true,
  isRDActive: true,

  // Initial Clubs Registry across regions and districts for Data Isolation verification
  clubs: [
    {
      id: '1',
      name: 'Colombo Millennium',
      districtId: '306 A1',
      districtName: 'District 306 A1',
      regionId: '1',
      regionName: 'Region 1',
      zoneId: '1',
      zoneName: 'Zone 1',
      charterDate: '2015-06-20',
      sponsorLionsClub: 'Lions Club of Colombo Millennium',
      presidentName: 'Leo Jevin Jayawardhana',
      activeMembers: 28,
    },
    {
      id: '2',
      name: 'Nawala Metro',
      districtId: '306 A1',
      districtName: 'District 306 A1',
      regionId: '1',
      regionName: 'Region 1',
      zoneId: '2',
      zoneName: 'Zone 2',
      charterDate: '2018-09-12',
      sponsorLionsClub: 'Lions Club of Nawala Metro',
      presidentName: 'Leo Sanuka Perera',
      activeMembers: 24,
    },
    {
      id: '3',
      name: 'Negombo Orient',
      districtId: '306 A1',
      districtName: 'District 306 A1',
      regionId: '2',
      regionName: 'Region 2',
      zoneId: '1',
      zoneName: 'Zone 1',
      charterDate: '2019-11-04',
      sponsorLionsClub: 'Lions Club of Negombo Orient',
      presidentName: 'Leo Dilshan Fernando',
      activeMembers: 22,
    },
    {
      id: '4',
      name: 'Kandy Royal',
      districtId: '306 B1', // Different District Jurisdiction!
      districtName: 'District 306 B1',
      regionId: '1',
      regionName: 'Region 1',
      zoneId: '1',
      zoneName: 'Zone 1',
      charterDate: '2017-02-18',
      sponsorLionsClub: 'Lions Club of Kandy Royal',
      presidentName: 'Leo Hasitha Bandara',
      activeMembers: 30,
    },
    {
      id: '5',
      name: 'Galle Central',
      districtId: '306 C1', // Different District Jurisdiction!
      districtName: 'District 306 C1',
      regionId: '1',
      regionName: 'Region 1',
      zoneId: '1',
      zoneName: 'Zone 1',
      charterDate: '2020-08-25',
      sponsorLionsClub: 'Lions Club of Galle Central',
      presidentName: 'Leo Sandun Jayasuriya',
      activeMembers: 19,
    },
  ],

  // Initial Districts Registry
  districts: [
    {
      id: '306 A1',
      name: 'District 306 A1',
      multipleId: 'MD 306',
      geographicArea: 'Western Province Central & Colombo Metro',
      charterDate: '1975-07-01',
      districtPresidentName: 'Leo District President (306 A1)',
      totalClubs: 18,
    },
    {
      id: '306 A2',
      name: 'District 306 A2',
      multipleId: 'MD 306',
      geographicArea: 'Western Province South & Kalutara',
      charterDate: '1980-07-01',
      districtPresidentName: 'Leo District President (306 A2)',
      totalClubs: 16,
    },
    {
      id: '306 B1',
      name: 'District 306 B1',
      multipleId: 'MD 306',
      geographicArea: 'Central & North Western Provinces',
      charterDate: '1982-07-01',
      districtPresidentName: 'Leo District President (306 B1)',
      totalClubs: 20,
    },
    {
      id: '306 B2',
      name: 'District 306 B2',
      multipleId: 'MD 306',
      geographicArea: 'North Central & Eastern Provinces',
      charterDate: '1986-07-01',
      districtPresidentName: 'Leo District President (306 B2)',
      totalClubs: 14,
    },
    {
      id: '306 C1',
      name: 'District 306 C1',
      multipleId: 'MD 306',
      geographicArea: 'Southern Province & Galle/Matara',
      charterDate: '1988-07-01',
      districtPresidentName: 'Leo District President (306 C1)',
      totalClubs: 15,
    },
    {
      id: '306 C2',
      name: 'District 306 C2',
      multipleId: 'MD 306',
      geographicArea: 'Uva & Sabaragamuwa Provinces',
      charterDate: '1992-07-01',
      districtPresidentName: 'Leo District President (306 C2)',
      totalClubs: 12,
    },
  ],

  officerAppointments: [
    {
      id: 'apt-1',
      level: 'Club',
      targetEntityId: '1',
      targetEntityName: 'Colombo Millennium',
      role: 'Vice President',
      officerName: 'Devin Perera',
      officerLeoId: '4892012',
      appointedBy: 'Leo Jevin Jayawardhana (President)',
      appointedDate: '2026-07-05',
    },
    {
      id: 'apt-2',
      level: 'Club',
      targetEntityId: '1',
      targetEntityName: 'Colombo Millennium',
      role: 'Club Secretary',
      officerName: 'Kavindi Silva',
      officerLeoId: '4892015',
      appointedBy: 'Leo Jevin Jayawardhana (President)',
      appointedDate: '2026-07-05',
    },
    {
      id: 'apt-3',
      level: 'Club',
      targetEntityId: '1',
      targetEntityName: 'Colombo Millennium',
      role: 'Club Treasurer',
      officerName: 'Sachin Fernando',
      officerLeoId: '4892020',
      appointedBy: 'Leo Jevin Jayawardhana (President)',
      appointedDate: '2026-07-05',
    },
    {
      id: 'apt-4',
      level: 'District',
      targetEntityId: '306 A1',
      targetEntityName: 'District 306 A1',
      role: 'Region Chairperson (Region 1)',
      officerName: 'Leo Nimesh Wickramasinghe',
      officerLeoId: '306001',
      appointedBy: 'Leo District President (306 A1)',
      appointedDate: '2026-07-01',
    },
    {
      id: 'apt-5',
      level: 'Multiple',
      targetEntityId: 'MD 306',
      targetEntityName: 'Multiple District 306',
      role: 'District President (306 A1)',
      officerName: 'Leo District President (306 A1)',
      officerLeoId: '306999',
      appointedBy: 'Leo Multiple District President',
      appointedDate: '2026-06-25',
    },
  ],

  forwardedReportsToMD: ['101', '102', '301', '302'],

  setDistrictDeadlineDay: (day) => set({ districtDeadlineDay: day }),
  setInternationalDeadlineDay: (day) => set({ internationalDeadlineDay: day }),
  setEnableRegionChairpersonApproval: (enabled) =>
    set({ enableRegionChairpersonApproval: enabled, delegateApprovalToRD: enabled }),
  setDelegateApprovalToRD: (enabled) =>
    set({ delegateApprovalToRD: enabled, enableRegionChairpersonApproval: enabled }),
  setRdInactiveFallbackContestDirector: (enabled) =>
    set({ rdInactiveFallbackContestDirector: enabled }),
  setIsRDActive: (active) => set({ isRDActive: active }),

  addClub: (club) => {
    const newClub: ClubRecord = {
      id: String(Date.now()),
      name: club.name || 'New Leo Club',
      districtId: club.districtId || '306 A1',
      districtName: club.districtName || 'District 306 A1',
      regionId: club.regionId || '1',
      regionName: `Region ${club.regionId || '1'}`,
      zoneId: club.zoneId || '1',
      zoneName: `Zone ${club.zoneId || '1'}`,
      charterDate: club.charterDate || new Date().toISOString().split('T')[0],
      sponsorLionsClub: club.sponsorLionsClub || 'Sponsoring Lions Club',
      presidentName: club.presidentName || 'Charter President',
      activeMembers: club.activeMembers || 20,
    };
    set((state) => ({ clubs: [newClub, ...state.clubs] }));
    return newClub;
  },

  addDistrict: (district) => {
    const newDist: DistrictRecord = {
      id: district.id || `306 D${get().districts.length + 1}`,
      name: district.name || `District 306 D${get().districts.length + 1}`,
      multipleId: 'MD 306',
      geographicArea: district.geographicArea || 'Territorial Jurisdiction',
      charterDate: district.charterDate || new Date().toISOString().split('T')[0],
      districtPresidentName: district.districtPresidentName || 'District President Appointee',
      totalClubs: 0,
    };
    set((state) => ({ districts: [...state.districts, newDist] }));
    return newDist;
  },

  appointOfficer: (appointment) => {
    const newApt: OfficerAppointment = {
      id: `apt-${Date.now()}`,
      appointedDate: new Date().toISOString().split('T')[0],
      ...appointment,
    };
    set((state) => ({ officerAppointments: [newApt, ...state.officerAppointments] }));
    return newApt;
  },

  forwardReportToMultiple: (reportId) => {
    set((state) => {
      const exists = state.forwardedReportsToMD.includes(String(reportId));
      if (exists) return state;
      return { forwardedReportsToMD: [...state.forwardedReportsToMD, String(reportId)] };
    });
  },

  calculateSubmissionStatus: (submissionDate, reportMonthIndex) => {
    const { districtDeadlineDay } = get();
    const now = new Date(submissionDate || Date.now());
    const currentYear = now.getFullYear();
    let calendarMonth = (reportMonthIndex + 5) % 12;
    let deadlineYear = currentYear;
    let deadlineMonth = calendarMonth + 1;
    if (deadlineMonth > 11) {
      deadlineMonth = 0;
      deadlineYear += 1;
    }
    const deadline = new Date(deadlineYear, deadlineMonth, districtDeadlineDay, 23, 59, 59);
    const diffTime = now.getTime() - deadline.getTime();
    const daysLate = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
      isLate: daysLate > 0,
      daysLate: Math.max(0, daysLate),
      deadlineDate: deadline,
      formattedDeadline: deadline.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
    };
  },
}));
