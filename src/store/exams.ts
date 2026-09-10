import { create } from "zustand";
import { api } from "@/lib/api";

function _filenameFromResponse(
  response: { headers: Record<string, unknown> },
  fallbackPrefix: string,
  ext: string
): string {
  const disposition = response.headers["content-disposition"];
  if (typeof disposition === "string") {
    const match = disposition.match(/filename="?([^";]+)"?/i);
    if (match) return match[1];
  }
  return `mathiis_${fallbackPrefix}.${ext}`;
}

export interface Exam {
  id: string;
  title: string;
  subject: string;
  level: string | null;
  description: string | null;
  num_questions: number;
  duration_minutes: number | null;
  difficulty: string;
  question_type: string;
  topics: string[];
  content: Record<string, unknown> | null;
  status: "pending" | "generating" | "completed" | "failed";
  error_message: string | null;
  generation_time: number | null;
  pdf_url: string | null;
  is_public: boolean;
  engine: "free" | "standard" | "premium";
  created_at: string;
  updated_at: string;
}

interface ExamState {
  exams: Exam[];
  total: number;
  page: number;
  pages: number;
  loading: boolean;
  fetchExams: (params?: { page?: number; search?: string; status?: string }) => Promise<void>;
  createExam: (data: Record<string, unknown>) => Promise<Exam>;
  deleteExam: (id: string) => Promise<void>;
  refreshExam: (id: string) => Promise<Exam>;
  downloadPdf: (id: string, answers?: boolean) => Promise<void>;
  downloadDocx: (id: string, answers?: boolean) => Promise<void>;
}

export const useExamStore = create<ExamState>((set, get) => ({
  exams: [],
  total: 0,
  page: 1,
  pages: 1,
  loading: false,

  fetchExams: async (params = {}) => {
    set({ loading: true });
    try {
      const { data } = await api.get("/exams", { params: { per_page: 12, ...params } });
      set({
        exams: data.items,
        total: data.total,
        page: data.page,
        pages: data.pages,
      });
    } finally {
      set({ loading: false });
    }
  },

  createExam: async (data) => {
    const res = await api.post("/exams", data);
    await get().fetchExams();
    return res.data;
  },

  deleteExam: async (id) => {
    await api.delete(`/exams/${id}`);
    set((state) => ({ exams: state.exams.filter((e) => e.id !== id) }));
  },

  refreshExam: async (id) => {
    const { data } = await api.get(`/exams/${id}`);
    set((state) => ({
      exams: state.exams.map((e) => (e.id === id ? data : e)),
    }));
    return data;
  },

  downloadPdf: async (id, answers = false) => {
    const response = await api.get(`/exams/${id}/pdf`, {
      params: { answers },
      responseType: "blob",
      timeout: answers ? 600000 : 120000,
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      _filenameFromResponse(response, answers ? "correction" : "epreuve", "pdf")
    );
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    setTimeout(() => { link.remove(); window.URL.revokeObjectURL(url); }, 200);
  },

  downloadDocx: async (id, answers = false) => {
    const response = await api.get(`/exams/${id}/docx`, {
      params: { answers },
      responseType: "blob",
      timeout: answers ? 600000 : 120000,
    });
    const url = window.URL.createObjectURL(
      new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      })
    );
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      _filenameFromResponse(response, answers ? "correction" : "epreuve", "docx")
    );
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    setTimeout(() => { link.remove(); window.URL.revokeObjectURL(url); }, 200);
  },
}));
