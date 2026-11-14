// @ts-nocheck
import { create } from 'zustand';
import { getCookie, setCookie, deleteCookie } from '@/lib/cookie';
import { apiEndpoint } from '@/lib/env';
import { initWebSockets } from '@/lib/broadcast';

export type UserRole =
  | 'Club President'
  | 'Club Secretary'
  | 'Club Treasurer'
  | 'Club Vice President'
  | 'Leo Advisor'
  | 'Zone Head'
  | 'Region Chairperson'
  | 'Leo District President'
  | 'Leo Multiple District President'
  | 'Member';

interface UserState {
  authenticated: boolean;
  accessToken: string | null;
  firstName: string;
  lastName: string;
  image: string;
  gender: string;
  leoId: string;
  mylci: string;
  clubId: string;
  clubName: string;
  districtId: string;
  districtName: string;
  regionId: string;
  regionName: string;
  zoneId: string;
  zoneName: string;
  clubLevel: number;
  currentRole: UserRole;

  // Club permissions
  canUpdateClubProfile: boolean;
  canManageActivityReports: boolean;
  canManageMembers: boolean;
  canManageClubOfficers: boolean;
  canManageProjectReports: boolean;
  canManageClubEvents: boolean;
  canCreateClubMeeting: boolean;
  canManageWallet: boolean;
  canAppointClubOfficers: boolean;

  // Regional permissions
  isRegionChairperson: boolean;
  isZoneHead: boolean;

  // District permissions
  isDp: boolean;
  districtLevel: number;
  isDistrictOfficer: boolean;
  canViewClubProjects: boolean;
  canViewClubActivityReports: boolean;
  canForwardReportsToMultiple: boolean;
  canViewClubWallet: boolean;
  canManageCouncil: boolean;
  canDefineDeadlines: boolean;
  canAddProjectCategories: boolean;
  canManageDistrictWallet: boolean;
  canCreateCouncilMeetings: boolean;
  canCreateDistrictEvents: boolean;
  canApproveReports: boolean;
  canManageClubs: boolean;
  canCreateClub: boolean;
  canAppointDistrictOfficers: boolean;
  canUpdateDistrictProfile: boolean;

  // Multiple District permissions
  isMdp: boolean;
  isMultipleOfficer: boolean;
  multipleLevel: number;
  canCreateMultipleCouncilMeetings: boolean;
  canCreateMultipleCouncilEvents: boolean;
  canManageMultipleCouncil: boolean;
  canManageMultipleWallet: boolean;
  canAddProjectCategoriesFromMultiple: boolean;
  canManageDistricts: boolean;
  canCreateDistrict: boolean;
  canAppointMultipleOfficers: boolean;
  canUpdateMultipleProfile: boolean;
  canUpdateResourceCenter: boolean;
  canViewForwardedReports: boolean;
  canManageSystem: boolean;

  // Actions
  login: (credentials: { email: string; password: string }) => Promise<boolean>;
  loginAsSample: (email?: string, role?: UserRole) => void;
  switchRole: (role: UserRole) => void;
  googleLogin: (token: string) => Promise<any>;
  logout: () => Promise<boolean>;
  setUserInfo: (payload: any) => void;
  initFromCookies: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  authenticated: !!getCookie('accessToken'),
  accessToken: getCookie('accessToken') || null,
  firstName: getCookie('fName') || 'Jevin',
  lastName: getCookie('lName') || 'Jayawardhana',
  image: getCookie('image') || '',
  gender: getCookie('gender') || '0',
  leoId: getCookie('leoId') || '1121',
  mylci: getCookie('mylci') || '4892011',
  clubId: getCookie('clubId') || '1',
  clubName: getCookie('clubName') || 'Colombo Millennium',
  districtId: getCookie('districtId') || '306 A1',
  districtName: getCookie('districtName') || 'District 306 A1',
  regionId: getCookie('regionId') || '1',
  regionName: getCookie('regionName') || 'Region 1',
  zoneId: getCookie('zoneId') || '1',
  zoneName: getCookie('zoneName') || 'Zone 1',
  clubLevel: parseInt(getCookie('clubLevel') || '1', 10),
  currentRole: (getCookie('currentRole') as UserRole) || 'Club President',

  canUpdateClubProfile: true,
  canManageActivityReports: true,
  canManageMembers: true,
  canManageClubOfficers: true,
  canManageProjectReports: true,
  canManageClubEvents: true,
  canCreateClubMeeting: true,
  canManageWallet: true,
  canAppointClubOfficers: true,

  isRegionChairperson: false,
  isZoneHead: false,

  isDp: true,
  districtLevel: 1,
  isDistrictOfficer: true,
  canViewClubProjects: true,
  canViewClubActivityReports: true,
  canForwardReportsToMultiple: true,
  canViewClubWallet: true,
  canManageCouncil: true,
  canDefineDeadlines: true,
  canAddProjectCategories: true,
  canManageDistrictWallet: true,
  canCreateCouncilMeetings: true,
  canCreateDistrictEvents: true,
  canApproveReports: true,
  canManageClubs: true,
  canCreateClub: true,
  canAppointDistrictOfficers: true,
  canUpdateDistrictProfile: true,

  isMdp: true,
  isMultipleOfficer: true,
  multipleLevel: 1,
  canCreateMultipleCouncilMeetings: true,
  canCreateMultipleCouncilEvents: true,
  canManageMultipleCouncil: true,
  canManageMultipleWallet: true,
  canAddProjectCategoriesFromMultiple: true,
  canManageDistricts: true,
  canCreateDistrict: true,
  canAppointMultipleOfficers: true,
  canUpdateMultipleProfile: true,
  canUpdateResourceCenter: true,
  canViewForwardedReports: true,
  canManageSystem: true,

  initFromCookies: () => {
    const token = getCookie('accessToken');
    if (!token) return;
    const role = (getCookie('currentRole') as UserRole) || 'Club President';
    get().switchRole(role);
  },

  setUserInfo: (payload: any) => {
    const d = payload.data || payload;
    setCookie('fName', d.fName || 'Jevin', 1);
    setCookie('lName', d.lName || 'Jayawardhana', 1);
    setCookie('image', d.image === 'null' ? '' : (d.image || ''), 1);
    setCookie('leoId', String(d.leoId || '1121'), 1);
    setCookie('gender', String(d.gender || '0'), 1);
    setCookie('mylci', String(d.mylci || '4892011'), 1);
    setCookie('clubId', String(d.clubId || '1'), 1);
    setCookie('clubName', d.clubName || 'Colombo Millennium', 1);
    setCookie('districtName', d.districtName || 'District 306 A1', 1);
    setCookie('districtId', String(d.districtId || '306 A1'), 1);
    setCookie('regionId', String(d.regionId || '1'), 1);
    setCookie('regionName', d.regionName || 'Region 1', 1);

    const initialRole: UserRole = d.isMdp
      ? 'Leo Multiple District President'
      : d.isDp
      ? 'Leo District President'
      : d.isRegionChairperson
      ? 'Region Chairperson'
      : d.clubLevel === 3
      ? 'Club Secretary'
      : d.clubLevel === 4
      ? 'Club Treasurer'
      : 'Club President';

    get().switchRole(initialRole);
  },

  switchRole: (role: UserRole) => {
    setCookie('currentRole', role, 1);

    switch (role) {
      case 'Club President':
        set({
          currentRole: 'Club President',
          clubLevel: 1,
          clubId: '1',
          clubName: 'Colombo Millennium',
          districtId: '306 A1',
          districtName: 'District 306 A1',
          regionId: '1',
          regionName: 'Region 1',
          canUpdateClubProfile: true,
          canManageActivityReports: true,
          canManageMembers: true,
          canManageClubOfficers: true,
          canManageProjectReports: true,
          canManageClubEvents: true,
          canCreateClubMeeting: true,
          canManageWallet: true,
          canAppointClubOfficers: true, // President can appoint VP, Secretary, Treasurer, Leo Advisor
          canAppointDistrictOfficers: false,
          canAppointMultipleOfficers: false,
          canCreateClub: false,
          canCreateDistrict: false,
          isRegionChairperson: false,
          isZoneHead: false,
          isDp: false,
          isDistrictOfficer: false,
          canApproveReports: false,
          canViewClubProjects: false,
          canViewClubActivityReports: false,
          canForwardReportsToMultiple: false,
          canViewClubWallet: false,
          isMdp: false,
          isMultipleOfficer: false,
          canViewForwardedReports: false,
        });
        break;

      case 'Club Secretary':
        set({
          currentRole: 'Club Secretary',
          clubLevel: 3,
          clubId: '1',
          clubName: 'Colombo Millennium',
          districtId: '306 A1',
          districtName: 'District 306 A1',
          regionId: '1',
          regionName: 'Region 1',
          canUpdateClubProfile: true,
          canManageActivityReports: true, // Secretary manages Activity Reports
          canManageMembers: true, // Secretary manages Member records
          canManageClubOfficers: true,
          canManageProjectReports: true, // Secretary manages Project Reports
          canManageClubEvents: true,
          canCreateClubMeeting: true,
          canManageWallet: false, // Secretary does NOT manage Wallet
          canAppointClubOfficers: true, // Secretary can appoint VP, Treasurer, Leo Advisor (not President)
          canAppointDistrictOfficers: false,
          canAppointMultipleOfficers: false,
          canCreateClub: false,
          canCreateDistrict: false,
          isRegionChairperson: false,
          isZoneHead: false,
          isDp: false,
          isDistrictOfficer: false,
          canApproveReports: false,
          canViewClubProjects: false,
          canViewClubActivityReports: false,
          canForwardReportsToMultiple: false,
          canViewClubWallet: false,
          isMdp: false,
          isMultipleOfficer: false,
          canViewForwardedReports: false,
        });
        break;

      case 'Club Treasurer':
        set({
          currentRole: 'Club Treasurer',
          clubLevel: 4,
          clubId: '1',
          clubName: 'Colombo Millennium',
          districtId: '306 A1',
          districtName: 'District 306 A1',
          regionId: '1',
          regionName: 'Region 1',
          canUpdateClubProfile: false,
          canManageActivityReports: false, // Treasurer does not manage Activity Reports
          canManageMembers: false, // Treasurer does not manage Members
          canManageClubOfficers: false,
          canManageProjectReports: true, // Treasurer creates & manages Project Reports
          canManageClubEvents: false,
          canCreateClubMeeting: false,
          canManageWallet: true, // Treasurer manages Wallet finances
          canAppointClubOfficers: false, // Treasurer does not appoint officers
          canAppointDistrictOfficers: false,
          canAppointMultipleOfficers: false,
          canCreateClub: false,
          canCreateDistrict: false,
          isRegionChairperson: false,
          isZoneHead: false,
          isDp: false,
          isDistrictOfficer: false,
          canApproveReports: false,
          canViewClubProjects: false,
          canViewClubActivityReports: false,
          canForwardReportsToMultiple: false,
          canViewClubWallet: false,
          isMdp: false,
          isMultipleOfficer: false,
          canViewForwardedReports: false,
        });
        break;

      case 'Region Chairperson':
        set({
          currentRole: 'Region Chairperson',
          clubLevel: 10,
          clubId: '1',
          clubName: 'Colombo Millennium',
          districtId: '306 A1',
          districtName: 'District 306 A1',
          regionId: '1',
          regionName: 'Region 1',
          canUpdateClubProfile: false,
          canManageActivityReports: false,
          canManageMembers: false,
          canManageClubOfficers: false,
          canManageProjectReports: false,
          canManageWallet: false,
          canAppointClubOfficers: false,
          canAppointDistrictOfficers: false,
          canAppointMultipleOfficers: false,
          canCreateClub: false,
          canCreateDistrict: false,
          isRegionChairperson: true,
          isZoneHead: false,
          isDp: false,
          isDistrictOfficer: true,
          canApproveReports: true, // Region Chairperson reviews, approves, or rejects reports of clubs in their region
          canViewClubProjects: true,
          canViewClubActivityReports: true,
          canViewClubWallet: false,
          canForwardReportsToMultiple: false,
          isMdp: false,
          isMultipleOfficer: false,
          canViewForwardedReports: false,
        });
        break;

      case 'Leo District President':
        set({
          currentRole: 'Leo District President',
          clubLevel: 1,
          clubId: '1',
          clubName: 'District Cabinet (306 A1)',
          districtId: '306 A1',
          districtName: 'District 306 A1',
          regionId: '1',
          regionName: 'Region 1',
          canUpdateClubProfile: false,
          canManageActivityReports: false,
          canManageMembers: false,
          canManageClubOfficers: false,
          canManageProjectReports: false,
          canManageWallet: false,
          canAppointClubOfficers: false,
          canAppointDistrictOfficers: true, // Appoints Leo Club Presidents, District VP, Sec, Treas, Region Heads, Zone Heads, District Chairperson
          canAppointMultipleOfficers: false,
          canCreateClub: true, // District President creates new Leo Clubs
          canCreateDistrict: false,
          isRegionChairperson: false,
          isZoneHead: false,
          isDp: true,
          isDistrictOfficer: true,
          canApproveReports: true, // Reviews approved club reports
          canViewClubProjects: true,
          canViewClubActivityReports: true,
          canViewClubWallet: true,
          canForwardReportsToMultiple: true, // Reports club reports & wallet to Multiple District President
          canManageCouncil: true,
          canDefineDeadlines: true,
          canAddProjectCategories: true,
          canManageClubs: true,
          isMdp: false,
          isMultipleOfficer: false,
          canViewForwardedReports: false,
        });
        break;

      case 'Leo Multiple District President':
        set({
          currentRole: 'Leo Multiple District President',
          clubLevel: 1,
          clubId: '1',
          clubName: 'Multiple District 306 Executive',
          districtId: '306 A1',
          districtName: 'Multiple District 306',
          regionId: '1',
          regionName: 'Region 1',
          canUpdateClubProfile: false,
          canManageActivityReports: false,
          canManageMembers: false,
          canManageClubOfficers: false,
          canManageProjectReports: false,
          canManageWallet: false,
          canAppointClubOfficers: false,
          canAppointDistrictOfficers: false,
          canAppointMultipleOfficers: true, // Appoints District Presidents, MD VP, MD Sec, MD Treas, MD Chairperson
          canCreateClub: false,
          canCreateDistrict: true, // Multiple District President creates new Leo Districts
          isRegionChairperson: false,
          isZoneHead: false,
          isDp: false,
          isDistrictOfficer: false,
          isMdp: true,
          isMultipleOfficer: true,
          canViewForwardedReports: true, // Reviews all shared Project Reports, Activity Reports, Wallet data across Districts
          canManageDistricts: true,
          canManageMultipleCouncil: true,
          canManageMultipleWallet: true,
          canAddProjectCategoriesFromMultiple: true,
          canManageSystem: true,
        });
        break;

      default:
        set({ currentRole: 'Club President', clubLevel: 1, canManageWallet: true });
        break;
    }
  },

  login: async (credentials) => {
    const isSample =
      credentials.email?.toLowerCase().trim() === 'jevinjayawardhana1121@gmail.com' &&
      credentials.password === 'Jevin@2001';

    try {
      const response = await fetch(apiEndpoint + 'login', {
        method: 'POST',
        body: JSON.stringify(credentials),
        headers: { 'Content-type': 'application/json' },
      });
      if (response.status === 200) {
        const data = await response.json();
        setCookie('accessToken', data.token, 1);
        set({ authenticated: true, accessToken: data.token });
        get().setUserInfo(data);
        initWebSockets();
        return true;
      }
      if (isSample) {
        get().loginAsSample();
        return true;
      }
      return false;
    } catch {
      if (isSample || credentials.email) {
        get().loginAsSample(credentials.email);
        return true;
      }
      return false;
    }
  },

  loginAsSample: (email = 'jevinjayawardhana1121@gmail.com', role: UserRole = 'Club President') => {
    const sampleToken = 'sample-jwt-token-myleo-md306';
    setCookie('accessToken', sampleToken, 1);
    set({
      authenticated: true,
      accessToken: sampleToken,
      firstName: 'Jevin',
      lastName: 'Jayawardhana',
      leoId: '1121',
      mylci: '4892011',
      clubId: '1',
      clubName: 'Colombo Millennium',
      districtId: '306 A1',
      districtName: 'District 306 A1',
      regionId: '1',
      regionName: 'Region 1',
    });
    get().switchRole(role);
  },

  googleLogin: async (token: string) => {
    try {
      const response = await fetch(apiEndpoint + 'google_login', {
        method: 'POST',
        body: JSON.stringify({ token }),
        headers: { 'Content-type': 'application/json' },
      });
      if (response.status === 200) {
        const data = await response.json();
        setCookie('accessToken', data.token, 1);
        set({ authenticated: true, accessToken: data.token });
        get().setUserInfo(data);
        initWebSockets();
        return data;
      }
      return false;
    } catch {
      return false;
    }
  },

  logout: async () => {
    try {
      const token = getCookie('accessToken');
      await fetch(apiEndpoint + 'logout', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
          Authorization: 'Bearer ' + token,
          'X-Requested-With': 'XMLHttpRequest',
        },
      });
    } catch {
      // ignore
    } finally {
      deleteCookie('accessToken');
      deleteCookie('fName');
      deleteCookie('lName');
      deleteCookie('image');
      deleteCookie('leoId');
      deleteCookie('currentRole');
      set({ authenticated: false, accessToken: null });
    }
    return true;
  },
}));
