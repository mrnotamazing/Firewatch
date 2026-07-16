import { create } from 'zustand';
import type { HazardReport, ReportStatus } from './types';
import { fetchReports, createReport, updateReportStatus, sendTicketEmail } from './api';

interface HazardStore {
  reports: HazardReport[];
  init: () => Promise<void>;
  addReport: (report: Omit<HazardReport, 'id' | 'status' | 'createdAt' | 'dueAt'>) => Promise<HazardReport>;
  setStatus: (id: string, status: ReportStatus) => Promise<void>;
  sendTicket: (id: string) => Promise<void>;
}

export const useHazardStore = create<HazardStore>()((set) => ({
  reports: [],

  // Fetches quietly in the background — pages render immediately with whatever data is
  // available (initially none), rather than blocking on a possibly-slow cold backend.
  init: async () => {
    try {
      const reports = await fetchReports();
      set({ reports });
    } catch {
      // Heatmap, gallery, and quiz all work fine with zero live reports.
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
