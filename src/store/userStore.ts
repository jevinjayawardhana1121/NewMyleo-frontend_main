// @ts-nocheck
import { create } from 'zustand';
import { getCookie, setCookie, deleteCookie } from '@/lib/cookie';
import { initWebSockets } from '@/lib/broadcast';
import { authApi, ApiUser, ApiRole } from '@/lib/backendService';
import { notify } from '@/lib/api';

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
  email: string;
  contactNumber: string;
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
  rolesList: ApiRole[];

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
  login: (credentials: { email: string; password: string; device_name?: string }) => Promise<boolean>;
  checkAuth: () => Promise<boolean>;
  loginAsSample: (email?: string, role?: UserRole) => void;
  switchRole: (role: UserRole) => void;
  logout: () => Promise<boolean>;
  setUserInfo: (payload: any) => void;
  initFromCookies: () => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  authenticated: !!getCookie('accessToken'),
  accessToken: getCookie('accessToken') || null,
  firstName: getCookie('fName') || 'Jevin',
  lastName: getCookie('lName') || 'Jayawardhana',
  email: getCookie('userEmail') || 'admin@leomd306.org',
  contactNumber: getCookie('contactNumber') || '+94771234567',
  image: getCookie('image') || '',
  gender: getCookie('gender') || 'Male',
  leoId: getCookie('leoId') || '1',
  mylci: getCookie('mylci') || 'LCI123456',
  clubId: getCookie('clubId') || '1',
  clubName: getCookie('clubName') || 'Leo Club of Colombo Central',
  districtId: getCookie('districtId') || '1',
  districtName: getCookie('districtName') || 'District 306 A1',
  regionId: getCookie('regionId') || '1',
  regionName: getCookie('regionName') || 'Region 1',
  zoneId: getCookie('zoneId') || '1',
  zoneName: getCookie('zoneName') || 'Zone 1',
  clubLevel: parseInt(getCookie('clubLevel') || '1', 10),
  currentRole: (getCookie('currentRole') as UserRole) || 'Club President',
  rolesList: [],

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

  isDp: false,
  districtLevel: 1,
  isDistrictOfficer: false,
  canViewClubProjects: false,
  canViewClubActivityReports: false,
  canForwardReportsToMultiple: false,
  canViewClubWallet: false,
  canManageCouncil: false,
  canDefineDeadlines: false,
  canAddProjectCategories: false,
  canManageDistrictWallet: false,
  canCreateCouncilMeetings: false,
  canCreateDistrictEvents: false,
  canApproveReports: false,
  canManageClubs: false,
  canCreateClub: false,
  canAppointDistrictOfficers: false,
  canUpdateDistrictProfile: false,

  isMdp: false,
  isMultipleOfficer: false,
  multipleLevel: 1,
  canCreateMultipleCouncilMeetings: false,
  canCreateMultipleCouncilEvents: false,
  canManageMultipleCouncil: false,
  canManageMultipleWallet: false,
  canAddProjectCategoriesFromMultiple: false,
  canManageDistricts: false,
  canCreateDistrict: false,
  canAppointMultipleOfficers: false,
  canUpdateMultipleProfile: false,
  canUpdateResourceCenter: false,
  canViewForwardedReports: false,
  canManageSystem: false,

  initFromCookies: () => {
    const token = getCookie('accessToken');
    if (!token) return;
    const role = (getCookie('currentRole') as UserRole) || 'Club President';
    get().switchRole(role);
    // Background verify token with /api/me
    get().checkAuth();
  },

  checkAuth: async () => {
    const token = getCookie('accessToken');
    if (!token) {
      set({ authenticated: false, accessToken: null });
      return false;
    }

    try {
      const res = await authApi.me();
      if (res && res.user) {
        get().setUserInfo(res.user);
        set({ authenticated: true });
        return true;
      }
    } catch {
      // Backend offline -> keep local session
      return true;
    }
    return false;
  },

  setUserInfo: (payload: any) => {
    const u: ApiUser = payload.user || payload.data || payload;
    const firstName = u.first_name || u.fName || u.name?.split(' ')[0] || 'Leo';
    const lastName = u.last_name || u.lName || u.name?.split(' ').slice(1).join(' ') || 'Member';
    const mylci = u.mylci || 'LCI123456';
    const leoId = String(u.id || u.leoId || '1');
    const email = u.email || 'admin@leomd306.org';
    const contactNumber = u.contact_number || '+94771234567';
    const gender = u.gender || 'Male';

    const clubId = String(u.clubs_id || u.club?.id || u.clubId || '1');
    const clubName = u.club?.name || u.clubName || 'Leo Club of Colombo Central';
    const regionName = u.club?.club_region || u.regionName || 'Region 1';
    const districtId = String(u.club?.district?.id || u.districtId || '1');
    const districtName = u.club?.district?.name || u.districtName || 'District 306 A1';

    setCookie('fName', firstName, 7);
    setCookie('lName', lastName, 7);
    setCookie('userEmail', email, 7);
    setCookie('contactNumber', contactNumber, 7);
    setCookie('gender', gender, 7);
    setCookie('mylci', mylci, 7);
    setCookie('leoId', leoId, 7);
    setCookie('clubId', clubId, 7);
    setCookie('clubName', clubName, 7);
    setCookie('districtId', districtId, 7);
    setCookie('districtName', districtName, 7);
    setCookie('regionName', regionName, 7);

    // Map user.roles from backend
    const rolesList: ApiRole[] = Array.isArray(u.roles) ? u.roles : [];
    let initialRole: UserRole = 'Member';

    const mdRole = rolesList.find((r) => r.level === 'MULTIPLE_DISTRICT');
    const distRole = rolesList.find((r) => r.level === 'DISTRICT');
    const clubRole = rolesList.find((r) => r.level === 'CLUB');

    if (mdRole) {
      initialRole = 'Leo Multiple District President';
    } else if (distRole) {
      const dName = distRole.name?.toLowerCase() || '';
      if (dName.includes('president')) {
        initialRole = 'Leo District President';
      } else if (dName.includes('region') || dName.includes('chairperson') || dName.includes('coordinator')) {
        initialRole = 'Region Chairperson';
      } else if (dName.includes('zone')) {
        initialRole = 'Zone Head';
      } else {
        initialRole = 'Leo District President';
      }
    } else if (clubRole) {
      const cName = clubRole.name?.toLowerCase() || '';
      if (cName.includes('president') && !cName.includes('vice')) {
        initialRole = 'Club President';
      } else if (cName.includes('secretary')) {
        initialRole = 'Club Secretary';
      } else if (cName.includes('treasurer')) {
        initialRole = 'Club Treasurer';
      } else if (cName.includes('vice')) {
        initialRole = 'Club Vice President';
      } else if (cName.includes('advisor')) {
        initialRole = 'Leo Advisor';
      } else {
        initialRole = 'Member';
      }
    } else {
      initialRole = (getCookie('currentRole') as UserRole) || 'Club President';
    }

    set({
      firstName,
      lastName,
      email,
      contactNumber,
      gender,
      mylci,
      leoId,
      clubId,
      clubName,
      regionName,
      districtId,
      districtName,
      rolesList,
    });

    get().switchRole(initialRole);
  },

  switchRole: (role: UserRole) => {
    setCookie('currentRole', role, 7);

    switch (role) {
      case 'Club President':
        set({
          currentRole: 'Club President',
          clubLevel: 1,
          canUpdateClubProfile: true,
          canManageActivityReports: true,
          canManageMembers: true,
          canManageClubOfficers: true,
          canManageProjectReports: true,
          canManageClubEvents: true,
          canCreateClubMeeting: true,
          canManageWallet: true,
          canAppointClubOfficers: true,
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
          canUpdateClubProfile: true,
          canManageActivityReports: true,
          canManageMembers: true,
          canManageClubOfficers: true,
          canManageProjectReports: true,
          canManageClubEvents: true,
          canCreateClubMeeting: true,
          canManageWallet: false,
          canAppointClubOfficers: true,
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
          canUpdateClubProfile: false,
          canManageActivityReports: false,
          canManageMembers: false,
          canManageClubOfficers: false,
          canManageProjectReports: true,
          canManageClubEvents: false,
          canCreateClubMeeting: false,
          canManageWallet: true,
          canAppointClubOfficers: false,
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
          canApproveReports: true,
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
          canUpdateClubProfile: false,
          canManageActivityReports: false,
          canManageMembers: false,
          canManageClubOfficers: false,
          canManageProjectReports: false,
          canManageWallet: false,
          canAppointClubOfficers: false,
          canAppointDistrictOfficers: true,
          canAppointMultipleOfficers: false,
          canCreateClub: true,
          canCreateDistrict: false,
          isRegionChairperson: false,
          isZoneHead: false,
          isDp: true,
          isDistrictOfficer: true,
          canApproveReports: true,
          canViewClubProjects: true,
          canViewClubActivityReports: true,
          canViewClubWallet: true,
          canForwardReportsToMultiple: true,
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
          canUpdateClubProfile: false,
          canManageActivityReports: false,
          canManageMembers: false,
          canManageClubOfficers: false,
          canManageProjectReports: false,
          canManageWallet: false,
          canAppointClubOfficers: false,
          canAppointDistrictOfficers: false,
          canAppointMultipleOfficers: true,
          canCreateClub: false,
          canCreateDistrict: true,
          isRegionChairperson: false,
          isZoneHead: false,
          isDp: false,
          isDistrictOfficer: false,
          isMdp: true,
          isMultipleOfficer: true,
          canViewForwardedReports: true,
          canManageDistricts: true,
          canManageMultipleCouncil: true,
          canManageMultipleWallet: true,
          canAddProjectCategoriesFromMultiple: true,
          canManageSystem: true,
        });
        break;

      default:
        set({ currentRole: role, clubLevel: 1, canManageWallet: true });
        break;
    }
  },

  login: async (credentials) => {
    try {
      const res = await authApi.login(credentials);
      if (res && res.token) {
        setCookie('accessToken', res.token, 7);
        set({ authenticated: true, accessToken: res.token });
        if (res.user) {
          get().setUserInfo(res.user);
        }
        initWebSockets();
        return true;
      }
    } catch {
      // Backend server is offline -> fallback to offline sample mode
    }

    // Fallback if backend is not running or unreachable
    notify('Backend unreachable. Initiating offline demo session.', 'info');
    get().loginAsSample(credentials.email);
    return true;
  },

  loginAsSample: (email = 'admin@leomd306.org', role: UserRole = 'Club President') => {
    const sampleToken = 'sample-sanctum-token-myleo-md306';
    setCookie('accessToken', sampleToken, 7);
    set({
      authenticated: true,
      accessToken: sampleToken,
      firstName: 'Admin',
      lastName: 'User',
      email,
      contactNumber: '+94771234567',
      leoId: '1',
      mylci: 'LCI123456',
      clubId: '1',
      clubName: 'Leo Club of Colombo Central',
      districtId: '1',
      districtName: 'District 306 A1',
      regionId: '1',
      regionName: 'Region 1',
    });
    get().switchRole(role);
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    } finally {
      deleteCookie('accessToken');
      deleteCookie('fName');
      deleteCookie('lName');
      deleteCookie('userEmail');
      deleteCookie('contactNumber');
      deleteCookie('image');
      deleteCookie('leoId');
      deleteCookie('mylci');
      deleteCookie('clubId');
      deleteCookie('clubName');
      deleteCookie('districtId');
      deleteCookie('districtName');
      deleteCookie('regionName');
      deleteCookie('currentRole');
      set({ authenticated: false, accessToken: null });
      notify('Logged out successfully.', 'info');
    }
    return true;
  },
}));
