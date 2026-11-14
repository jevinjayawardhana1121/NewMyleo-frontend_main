// @ts-nocheck
import { create } from 'zustand';
import { getData, postData } from '@/lib/api';

interface ReportState {
  reports: any[];
  regionReports: any[];
  currentReport: any | null;
  loading: boolean;

  fetchReports: () => Promise<any>;
  fetchRegionReports: () => Promise<any>;
  getReport: (id: string | number) => Promise<any>;
  createReport: (formData: any) => Promise<any>;
  updateStep: (id: string | number, step: number, data: any) => Promise<any>;
  approveReport: (id: string | number) => Promise<any>;
  rejectReport: (id: string | number, note: string) => Promise<any>;
}

export const useReportStore = create<ReportState>((set) => ({
  reports: [],
  regionReports: [],
  currentReport: null,
  loading: false,

  fetchReports: async () => {
    const res = await getData('report/all');
    if (res && res.data) {
      set({ reports: res.data });
      return res.data;
    }
    return [];
  },

  fetchRegionReports: async () => {
    const res = await getData('report/regional');
    if (res && res.data) {
      set({ regionReports: res.data });
      return res.data;
    }
    return [];
  },

  getReport: async (id) => {
    const res = await getData(`report/view/${id}`);
    if (res && res.data) {
      set({ currentReport: res.data });
      return res.data;
    }
    return null;
  },

  createReport: async (formData) => {
    return await postData('report/create', formData, 'Activity report was initiated!');
  },

  updateStep: async (id, step, data) => {
    return await postData(`report/update/${id}/step/${step}`, data, `Step 0${step} was saved successfully!`);
  },

  approveReport: async (id) => {
    return await postData(`report/approve/${id}`, {}, 'Report was approved successfully!');
  },

  rejectReport: async (id, note) => {
    const fd = new FormData();
    fd.append('reason', note);
    return await postData(`report/reject/${id}`, fd, 'Report was rejected with amendment note');
  },
}));

