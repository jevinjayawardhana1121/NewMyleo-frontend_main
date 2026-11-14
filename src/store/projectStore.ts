// @ts-nocheck
import { create } from 'zustand';
import { getData, postData, deleteData } from '@/lib/api';

interface ProjectState {
  hosted: any[];
  contributed: any[];
  organized: any[];
  invitations: any[];
  districtProjects: any[];
  sharedProjects: any[];
  loading: boolean;

  fetchHosted: () => Promise<any>;
  fetchContributed: () => Promise<any>;
  fetchOrganized: () => Promise<any>;
  fetchInvitations: () => Promise<any>;
  fetchDistrictProjects: () => Promise<any>;
  fetchSharedProjects: () => Promise<any>;
  createProject: (formData: any) => Promise<any>;
  updateStep: (id: string | number, step: number, data: any) => Promise<any>;
  getProject: (id: string | number) => Promise<any>;
  getEditHistory: (id: string | number) => Promise<any>;
  toggleAccessToMD: (id: string | number) => Promise<any>;
  updateApproval: (id: string | number, status: number, note?: string) => Promise<any>;
}

export const useProjectStore = create<ProjectState>((set) => ({
  hosted: [],
  contributed: [],
  organized: [],
  invitations: [],
  districtProjects: [],
  sharedProjects: [],
  loading: false,

  fetchHosted: async () => {
    const res = await getData('project/hosted');
    if (res && res.data) {
      set({ hosted: res.data });
      return res.data;
    }
    return [];
  },

  fetchContributed: async () => {
    const res = await getData('project/contributed');
    if (res && res.data) {
      set({ contributed: res.data });
      return res.data;
    }
    return [];
  },

  fetchOrganized: async () => {
    const res = await getData('project/organized');
    if (res && res.data) {
      set({ organized: res.data });
      return res.data;
    }
    return [];
  },

  fetchInvitations: async () => {
    const res = await getData('project/invitations');
    if (res && res.data) {
      set({ invitations: res.data });
      return res.data;
    }
    return [];
  },

  fetchDistrictProjects: async () => {
    const res = await getData('project/districtProjects');
    if (res && res.data) {
      set({ districtProjects: res.data });
      return res.data;
    }
    return [];
  },

  fetchSharedProjects: async () => {
    const res = await getData('project/multipleProjects');
    if (res && res.data) {
      set({ sharedProjects: res.data });
      return res.data;
    }
    return [];
  },

  createProject: async (formData: any) => {
    return await postData('project/create', formData, 'Project was successfully initiated!');
  },

  updateStep: async (id, step, data) => {
    return await postData(`project/update/${id}/step/${step}`, data, `Step 0${step} was saved successfully!`);
  },

  getProject: async (id) => {
    return await getData(`project/view/${id}`);
  },

  getEditHistory: async (id) => {
    return await getData(`project/history/${id}`);
  },

  toggleAccessToMD: async (id) => {
    return await postData(`toggleProjectAccessByMD/${id}`, {}, 'Sharing status was updated');
  },

  updateApproval: async (id, status, note = '') => {
    const formData = new FormData();
    formData.append('status', String(status));
    if (note) formData.append('note', note);
    return await postData(`setApprovalStatus/${id}`, formData, 'Approval status was updated');
  },
}));

