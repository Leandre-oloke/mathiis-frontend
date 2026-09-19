"use client";

import { useState, useEffect, useRef } from "react";
import { useQuotaStore } from "@/store/quota";
import { api } from "@/lib/api";
import { formatDate, formatFileSize } from "@/lib/utils";
import toast from "react-hot-toast";
import {
  CloudUpload, File, Trash2, Loader2, X, GraduationCap, CheckCircle2, Download,
} from "lucide-react";

interface Document {
  id: string;
  original_filename: string;
  file_type: string;
  file_size: number;
  subject: string | null;
  key_topics: string[];
  created_at: string;
  has_correction: boolean;
}

const CLASSES = [
  "6e","5e","4e","3e",
  "2nde AB","2nde C","2nde D",
  "1ère AB","1ère C","1ère D",
  "Tle AB","Tle C","Tle D",
];

const FILE_ICONS: Record<string, string> = {
  pdf: "📄", docx: "📝", txt: "📃", markdown: "📋",
};

export default function DocumentsPage() {
  const { openPaywall } = useQuotaStore();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Modal correction
  const [correctModal, setCorrectModal] = useState<{ doc: Document } | null>(null);
  const [correctClass, setCorrectClass] = useState("Tle D");
  const [correcting, setCorrecting] = useState(false);

  const fetchDocs = async () => {
    try {
      const { data } = await api.get("/documents");
      setDocuments(data);
    } catch {
      toast.error("Erreur lors du chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.get<Document[]>("/documents")
      .then(({ data }) => setDocuments(data))
      .catch(() => toast.error("Erreur lors du chargement"))
      .finally(() => setLoading(false));
  }, []);

  const uploadFile = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) { toast.error("Fichier trop volumineux (max 5 Mo)"); return; }
    const allowed = ["application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain", "text/markdown"];
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!allowed.includes(file.type) && !["pdf","docx","txt","md"].includes(ext || "")) {
      toast.error("Format non supporté. Utilisez PDF, DOCX ou TXT.");
      return;
    }
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    try {
      await api.post("/documents", form, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success(`"${file.name}" importé avec succès`);
      await fetchDocs();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Erreur lors de l'import";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      await api.delete(`/documents/${id}`);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      toast.success(`"${name}" supprimé`);
    } catch { toast.error("Erreur lors de la suppression"); }
  };

  const openCorrectModal = (doc: Document) => {
    setCorrectModal({ doc });
    setCorrectClass("Tle D");
  };

  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const downloadCorrection = async (doc: Document) => {
    setDownloadingId(doc.id);
    try {
      const resp = await api.get(`/documents/${doc.id}/correction`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([resp.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      const safeName = doc.original_filename.replace(/\.[^.]+$/, "");
      link.setAttribute("download", `correction_${safeName}.pdf`);
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      setTimeout(() => { link.remove(); window.URL.revokeObjectURL(url); }, 200);
    } catch {
      toast.error("Erreur lors du téléchargement");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleCorrect = async () => {
    if (!correctModal) return;
    setCorrecting(true);
    const toastId = toast.loading("Correction en cours… (peut prendre 1-3 min)");

    // SSE (au lieu d'une requête HTTP unique bloquante) : la correction d'une
    // épreuve complexe peut prendre plusieurs minutes, ce qu'aucun proxy/
    // pare-feu intermédiaire ne garantit de laisser passer sans réponse
    // intermédiaire sur une connexion HTTP classique.
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    const docId = correctModal.doc.id;
    const originalName = correctModal.doc.original_filename;

    try {
      const resp = await fetch(
        `${apiUrl}/documents/${docId}/correct/stream?classe=${encodeURIComponent(correctClass)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (!resp.ok) {
        if (resp.status === 402) {
          toast.dismiss(toastId);
          setCorrectModal(null);
          openPaywall("correction");
          return;
        }
        throw new Error(`Erreur ${resp.status}`);
      }

      const reader = resp.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let done_ = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          let event: Record<string, unknown>;
          try {
            event = JSON.parse(line.slice(6));
          } catch {
            continue;
          }

          if (event.type === "progress") {
            toast.loading(event.message as string, { id: toastId });
          } else if (event.type === "complete") {
            done_ = true;
            const base64 = event.pdf_base64 as string;
            const byteChars = atob(base64);
            const byteNumbers = new Array(byteChars.length);
            for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
            const blob = new Blob([new Uint8Array(byteNumbers)], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            const safeName = originalName.replace(/\.[^.]+$/, "");
            link.setAttribute("download", (event.filename as string) || `correction_${safeName}.pdf`);
            link.style.display = "none";
            document.body.appendChild(link);
            link.click();
            setTimeout(() => { link.remove(); window.URL.revokeObjectURL(url); }, 200);
            toast.success("Corrigé téléchargé !", { id: toastId });
            setDocuments((prev) => prev.map((d) => d.id === docId ? { ...d, has_correction: true } : d));
            setCorrectModal(null);
          } else if (event.type === "error") {
            if (event.code === "QUOTA_EXCEEDED") {
              toast.dismiss(toastId);
              setCorrectModal(null);
              openPaywall("correction");
              return;
            }
            throw new Error((event.message as string) || "Erreur lors de la correction");
          }
        }
      }

      if (!done_) {
        throw new Error("La connexion a été interrompue. Le serveur a peut-être redémarré, réessayez.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur lors de la correction. Réessayez.";
      toast.error(msg, { id: toastId });
    } finally {
      setCorrecting(false);
    }
  };

  return (
    <div className="space-y-7">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-indigo-500">Retour à l&apos;accueil</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#071a3d] sm:text-4xl">Mes corrigés</h1>
        <p className="mt-1 text-lg text-slate-500">
          Importez une épreuve : le modèle IA génère automatiquement le corrigé en PDF.
        </p>
      </div>

      {/* Zone de dépôt */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && fileRef.current?.click()}
        className={`relative overflow-hidden rounded-3xl border-2 border-dashed p-12 text-center shadow-xl shadow-slate-200/40 transition-all sm:p-16 ${
          dragOver
            ? "border-indigo-400 bg-indigo-50"
            : "border-indigo-200 bg-white hover:border-indigo-400 hover:bg-indigo-50/30"
        }`}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.docx,.txt,.md"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); e.target.value = ""; }}
        />
        <div className="flex flex-col items-center gap-3">
          <div className={`flex h-20 w-20 items-center justify-center rounded-3xl transition-colors ${
            dragOver ? "bg-indigo-100" : "bg-gradient-to-br from-indigo-50 to-blue-100"
          }`}>
            {uploading
              ? <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              : <CloudUpload className={`w-8 h-8 ${dragOver ? "text-indigo-500" : "text-slate-400"}`} />
            }
          </div>
          <div>
            <p className="text-lg font-bold text-[#071a3d]">
              {uploading ? "Import en cours…" : "Glissez-déposez ou cliquez pour importer"}
            </p>
            <p className="text-sm text-slate-400 mt-1">PDF, DOCX, TXT (max 5 Mo)</p>
            {!uploading && <span className="mt-5 inline-flex rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200">Choisir un fichier</span>}
          </div>
        </div>
      </div>

      {/* Liste des documents */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-20 bg-slate-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="rounded-3xl border border-white bg-white py-16 text-center shadow-xl shadow-slate-200/40">
          <File className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Aucun document importé</p>
          <p className="text-slate-400 text-sm mt-1">
            Importez une épreuve en PDF ou DOCX pour obtenir son corrigé
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-4 rounded-3xl border border-white bg-white p-5 shadow-lg shadow-slate-200/40 transition hover:-translate-y-0.5 hover:border-indigo-100"
            >
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                {FILE_ICONS[doc.file_type] || "📄"}
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-medium text-slate-900 truncate">{doc.original_filename}</div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-slate-400 uppercase font-medium">{doc.file_type}</span>
                  <span className="text-xs text-slate-400">{formatFileSize(doc.file_size)}</span>
                  <span className="text-xs text-slate-400">{formatDate(doc.created_at)}</span>
                </div>
              </div>

              {/* Bouton Corriger / Télécharger (corrigé déjà généré) */}
              {doc.has_correction ? (
                <button
                  onClick={() => downloadCorrection(doc)}
                  disabled={downloadingId === doc.id}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors flex-shrink-0 disabled:opacity-60"
                >
                  {downloadingId === doc.id
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <Download className="w-4 h-4" />}
                  Télécharger
                </button>
              ) : (
                <button
                  onClick={() => openCorrectModal(doc)}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors flex-shrink-0"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Corriger l&apos;épreuve
                </button>
              )}

              <button
                onClick={() => handleDelete(doc.id, doc.original_filename)}
                aria-label={`Supprimer ${doc.original_filename}`}
                className="rounded-xl p-2 text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal correction */}
      {correctModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-bold text-slate-900 text-lg">Corriger l&apos;épreuve</h2>
                <p className="text-slate-500 text-sm mt-0.5 truncate max-w-xs">
                  {correctModal.doc.original_filename}
                </p>
              </div>
              <button
                onClick={() => setCorrectModal(null)}
                disabled={correcting}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg disabled:opacity-40"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  <GraduationCap className="inline w-3.5 h-3.5 mr-1 text-slate-400" />
                  Classe de l&apos;épreuve *
                </label>
                <select
                  value={correctClass}
                  onChange={(e) => setCorrectClass(e.target.value)}
                  disabled={correcting}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                >
                  {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Info */}
              <div className="p-3 bg-emerald-50 rounded-xl flex gap-2">
                <Download className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-700 leading-relaxed">
                  Le modèle IA va analyser votre épreuve et générer un corrigé complet
                  question par question. Le PDF sera téléchargé automatiquement.
                  <br /><span className="font-medium">Durée estimée : 1 à 3 minutes.</span>
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setCorrectModal(null)}
                disabled={correcting}
                className="flex-1 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-40"
              >
                Annuler
              </button>
              <button
                onClick={handleCorrect}
                disabled={correcting}
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-60"
              >
                {correcting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />Correction en cours…</>
                ) : (
                  <><CheckCircle2 className="w-4 h-4" />Générer le corrigé</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
