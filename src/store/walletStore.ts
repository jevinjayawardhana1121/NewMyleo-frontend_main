// @ts-nocheck
import { create } from 'zustand';
import { getData, postData, deleteData } from '@/lib/api';

interface WalletState {
  financialRecords: any[];
  dues: number;
  bankBalance: number;
  bankAdminBalance: number;
  loading: boolean;

  fetchWallet: (clubId?: string | number) => Promise<any>;
  addRecord: (data: any) => Promise<any>;
  updateBankBalance: (data: any) => Promise<any>;
  updateBBF: (data: any) => Promise<any>;
  updateNonCurrentAsset: (data: any) => Promise<any>;
  deleteRecord: (id: string | number) => Promise<any>;
}

export const useWalletStore = create<WalletState>((set) => ({
  financialRecords: [],
  dues: 0,
  bankBalance: 0,
  bankAdminBalance: 0,
  loading: false,

  fetchWallet: async (clubId) => {
    const url = clubId ? `wallet/records/${clubId}` : 'wallet/records';
    const res = await getData(url);
    if (res && res.data) {
      set({
        financialRecords: res.data.financial_records || [],
        dues: parseFloat(res.data.dues) || 0,
        bankBalance: parseFloat(res.data.bank_balance) || 0,
        bankAdminBalance: parseFloat(res.data.bank_admin_balance) || 0,
      });
      return res.data;
    }
    return null;
  },

  addRecord: async (data) => {
    return await postData('wallet/addRecord', data, 'Financial record was recorded!');
  },

  updateBankBalance: async (data) => {
    return await postData('wallet/updateBankBalance', data, 'Bank balance was updated!');
  },

  updateBBF: async (data) => {
    return await postData('wallet/updateBBF', data, 'Balance Brought Forward was updated!');
  },

  updateNonCurrentAsset: async (data) => {
    return await postData('wallet/updateNonCurrentAsset', data, 'Non-current asset was updated!');
  },

  deleteRecord: async (id) => {
    return await deleteData(`wallet/record/${id}`, undefined, 'Record was removed');
  },
}));

