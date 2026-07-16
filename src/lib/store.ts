import { create } from 'zustand';
import type { HazardReport, ReportStatus } from './types';
import { fetchReports, createReport, updateReportStatus, sendTicketEmail } from './api';

interface HazardStore {
  reports: HazardReport[];
  loading: boolean;
  error: string | null;
  init: () => Promise<void>;
  addReport: (report: Omit<HazardReport, 'id' | 'status' | 'createdAt' | 'dueAt'>) => Promise<HazardReport>;
  setStatus: (id: string, status: ReportStatus) => Promise<void>;
  sendTicket: (id: string) => Promise<void>;
}

export const useHazardStore = create<HazardStore>()((set) => ({
  reports: [],
  loading: true,
  error: null,

  init: async () => {
    set({ loading: true, error: null });
    try {
      const reports = await fetchReports();
      set({ reports, loading: false });
    } catch {
      // The heatmap, gallery, and quiz all work fine with zero live reports — only degrade
      // report submission and the officer dashboard, rather than blocking the whole site.
      set({ reports: [], loading: false, error: 'offline' });
    }
  },

  addReport: async (input) => {
    const report = await createReport(input);
    set((state) => ({ reports: [report, ...state.reports] }));
    return report;
  },

  setStatus: async (id, status) => {
    const report = await updateReportStatus(id, status);
    set((state) => ({ reports: state.reports.map((r) => (r.id === id ? report : r)) }));
  },

  sendTicket: async (id) => {
    const { sentAt, recipient } = await sendTicketEmail(id);
    set((state) => ({
      reports: state.reports.map((r) => (r.id === id ? { ...r, ticketSentAt: sentAt, ticketRecipient: recipient } : r)),
    }));
  },
}));
