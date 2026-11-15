import { getData, postData, putData, deleteData, checkBackendHealth, BackendHealth } from './api';

// ==========================================
// 1. DATA TYPES (from docs.postman)
// ==========================================

export interface ApiRole {
  id: number;
  name: string;
  level: 'CLUB' | 'DISTRICT' | 'MULTIPLE_DISTRICT';
}

export interface ApiDistrictSummary {
  id: number;
  name: string;
  sort_order: number;
  email?: string;
  website?: string;
  is_report_region_chairman_review_required?: boolean;
}

export interface ApiClubSummary {
  id: number;
  name: string;
  logo?: string;
  email?: string;
  club_region?: string;
  club_type?: string;
  is_active: boolean;
  districts_id: number;
  district?: ApiDistrictSummary;
}

export interface ApiUser {
  id: number;
  mylci: string;
  first_name: string;
  last_name: string;
  status: string;
  nic?: string;
  email: string;
  contact_number?: string;
  gender?: string;
  civil_status?: string;
  birthday?: string;
  joined_date?: string;
  is_active: boolean;
  clubs_id: number;
  roles: ApiRole[];
  club?: ApiClubSummary;
}

export interface LoginResponse {
  message: string;
  token: string;
  token_type: string;
  user: ApiUser;
}

export interface CreateMemberPayload {
  member_type: 'Member' | 'Prospect';
  first_name: string;
  last_name: string;
  email: string;
  contact_number?: string;
  gender: 'Male' | 'Female';
  civil_status?: string;
  birthday?: string;
  joined_date?: string;
  profile_image?: string;
}

export interface AssignRolePayload {
  user_id: number;
  role_name: string;
}

export interface AssignDistrictRolePayload {
  district_id: number;
  user_id: number;
  role_name: string;
}

export interface UpdateClubPayload {
  name?: string;
  logo?: string;
  email?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  linkedIn?: string;
  youtube?: string;
  advisor_name?: string;
  advisor_email?: string;
  advisor_contact_number?: string;
  club_region?: string;
  club_type?: string;
  start_date?: string;
  is_active?: boolean;
  districts_id?: number;
}

export interface UpdateDistrictPayload {
  name?: string;
  logo?: string;
  sort_order?: number;
  email?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  linkedIn?: string;
  youtube?: string;
  dcl_name?: string;
  dcl_email?: string;
  dcl_contact_number?: string;
  is_report_region_chairman_review_required?: boolean;
}

export interface CreateClubInDistrictPayload {
  name: string;
  logo?: string;
  email?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  linkedIn?: string;
  youtube?: string;
  advisor_name?: string;
  advisor_email?: string;
  advisor_contact_number?: string;
  club_region?: string;
  club_type?: string;
  start_date?: string;
  is_active?: boolean;
  districts_id?: number;
}

export interface CreateDistrictPayload {
  name: string;
  logo?: string;
  sort_order: number;
  email?: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  linkedIn?: string;
  youtube?: string;
  dcl_name?: string;
  dcl_email?: string;
  dcl_contact_number?: string;
}

// ==========================================
// 2. BACKEND API SERVICE
// ==========================================

export const authApi = {
  /**
   * POST /api/login
   * Authenticate member and obtain Laravel Sanctum token
   */
  login: async (credentials: { email: string; password: string; device_name?: string }) => {
    return postData<LoginResponse>(
      'api/login',
      {
        email: credentials.email.trim(),
        password: credentials.password,
        device_name: credentials.device_name || 'web',
      },
      null,
      'Authentication failed'
    );
  },

  /**
   * GET /api/me
   * Retrieve current authenticated user profile and roles
   */
  me: async () => {
    return getData<{ user: ApiUser; roles: ApiRole[] }>('api/me', null, 'Failed to retrieve profile', true);
  },

  /**
   * POST /api/logout
   * Invalidate current Sanctum personal access token
   */
  logout: async () => {
    return postData<{ message: string }>('api/logout', undefined, 'Logged out successfully');
  },

  /**
   * GET /api/health
   */
  health: async (): Promise<BackendHealth> => {
    return checkBackendHealth();
  },
};

export const clubsApi = {
  /**
   * GET /api/clubs
   * Filterable by district_id and keyword search
   */
  getAll: async (params?: { district_id?: number | string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.district_id) q.append('district_id', String(params.district_id));
    if (params?.search) q.append('search', params.search);
    const qs = q.toString() ? `?${q.toString()}` : '';
    return getData<{ data: ApiClubSummary[] }>(`api/clubs${qs}`);
  },

  /**
   * GET /api/clubs/:id
   * Detailed club info with officers list and membership list
   */
  getById: async (clubId: number | string) => {
    return getData<{
      data: ApiClubSummary & {
        officers_count: number;
        officers: any[];
        membership_count: number;
        membership: any[];
      };
    }>(`api/clubs/${clubId}`);
  },

  /**
   * POST /api/clubs/create-members
   * Register a new member/prospect for the club
   */
  createMember: async (payload: CreateMemberPayload) => {
    return postData<{ message: string; data: any }>(
      'api/clubs/create-members',
      payload,
      'Member registered successfully! Welcome email queued.'
    );
  },

  /**
   * POST /api/clubs/assign-role
   * Assign club officer role (President, Vice President, Secretary, Treasurer, etc.)
   */
  assignRole: async (payload: AssignRolePayload) => {
    return postData<{ message: string; data: any }>(
      'api/clubs/assign-role',
      payload,
      `Role '${payload.role_name}' assigned successfully!`
    );
  },

  /**
   * PUT /api/clubs/update-member/:user_id
   */
  updateMember: async (userId: number | string, payload: Partial<CreateMemberPayload>) => {
    return putData<{ message: string; data: any }>(
      `api/clubs/update-member/${userId}`,
      payload,
      'Member profile updated successfully!'
    );
  },

  /**
   * PUT /api/clubs/:club_id
   */
  updateClub: async (clubId: number | string, payload: UpdateClubPayload) => {
    return putData<{ message: string; data: any }>(
      `api/clubs/${clubId}`,
      payload,
      'Club profile updated successfully!'
    );
  },
};

export const districtsApi = {
  /**
   * GET /api/districts
   */
  getAll: async () => {
    return getData<{ data: (ApiDistrictSummary & { logo?: string; clubs_count: number })[] }>('api/districts');
  },

  /**
   * GET /api/districts/:district_id
   */
  getById: async (districtId: number | string) => {
    return getData<{
      data: ApiDistrictSummary & {
        logo?: string;
        clubs: any[];
        district_council: any[];
      };
    }>(`api/districts/${districtId}`);
  },

  /**
   * PUT /api/districts/:district_id
   * Update district profile and preferences (e.g. is_report_region_chairman_review_required)
   */
  updateDistrict: async (districtId: number | string, payload: UpdateDistrictPayload) => {
    return putData<{ message: string; data: any }>(
      `api/districts/${districtId}`,
      payload,
      'District profile updated successfully!'
    );
  },

  /**
   * POST /api/districts/:district_id/clubs
   * Charter a new Leo Club under the district
   */
  createClub: async (districtId: number | string, payload: CreateClubInDistrictPayload) => {
    return postData<{ message: string; data: any }>(
      `api/districts/${districtId}/clubs`,
      payload,
      `Leo Club of ${payload.name} chartered successfully!`
    );
  },

  /**
   * POST /api/districts/:district_id/assign-role
   * Assign district role to a member in this district
   */
  assignRole: async (districtId: number | string, payload: AssignRolePayload) => {
    return postData<{ message: string; data: any }>(
      `api/districts/${districtId}/assign-role`,
      {
        district_id: Number(districtId),
        user_id: payload.user_id,
        role_name: payload.role_name,
      },
      `District role '${payload.role_name}' assigned successfully!`
    );
  },
};

export const multipleDistrictApi = {
  /**
   * POST /api/districts
   * Charter a new Leo District under Multiple District 306
   */
  createDistrict: async (payload: CreateDistrictPayload) => {
    return postData<{ message: string; data: any }>(
      'api/districts',
      payload,
      `Leo District ${payload.name} created successfully!`
    );
  },

  /**
   * POST /api/multiple-district/assign-role
   * Assign Multiple District council role
   */
  assignRole: async (payload: AssignRolePayload) => {
    return postData<{ message: string; data: any }>(
      'api/multiple-district/assign-role',
      payload,
      `Multiple District role '${payload.role_name}' assigned successfully!`
    );
  },
};
