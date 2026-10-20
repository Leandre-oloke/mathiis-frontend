"use client";

import { useState, useEffect, useRef } from "react";
import { useQuotaStore } from "@/store/quota";
import { api } from "@/lib/api";
import { formatDate, formatFileSize } from "@/lib/utils";
import toast from "react-hot-toast";
import {
  CloudUpload, File, Trash2, Loader2, X, GraduationCap, CheckCircle2, Download, FileText, FileType2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/ui/kit";

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

const FILE_ICONS: Record<string, React.ElementType> = {
  pdf: FileText, docx: FileType2, txt: File, markdown: File,
};

export default function DocumentsPage() {
  const { openPaywall } = useQuotaStore();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  // Deleting is final: the first click asks for confirmation, the second one deletes.
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

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

  useEffect(() => { fetchDocs(); }, []);

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
    if (confirmDelete !== id) { setConfirmDelete(id); return; }
    setConfirmDelete(null);
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
    <div className="space-y-6">
      <PageHeader eyebrow="Correction" title="Mes corrigés" subtitle="Importez une épreuve : le modèle IA génère automatiquement le corrigé en PDF." />

      {/* Zone de dépôt */}
      <button
        type="button"
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && fileRef.current?.click()}
        className={cn(
          "grid w-full justify-items-center gap-3 rounded-[22px] border-2 border-dashed border-foreground bg-card px-5 py-12 text-center transition-[transform,box-shadow]",
          dragOver ? "-translate-y-0.5 border-solid shadow-[0_5px_0_var(--foreground)]" : "hover:-translate-y-0.5 hover:border-solid hover:shadow-[0_5px_0_var(--foreground)]"
        )}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.docx,.txt,.md"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); e.target.value = ""; }}
        />
        <span className="grid h-16 w-16 place-items-center rounded-full bg-foreground text-background">
          {uploading ? <Loader2 className="h-7 w-7 animate-spin" /> : <CloudUpload className="h-7 w-7" />}
        </span>
        <span className="font-display text-lg font-bold">{uploading ? "Import en cours…" : dragOver ? "Déposez pour importer" : "Glissez-déposez ou cliquez pour importer"}</span>
        <span className="flex flex-wrap items-center justify-center gap-1.5">
          {["PDF", "DOCX", "TXT"].map((f) => <span key={f} className="rounded-md border border-foreground/25 px-2 py-0.5 font-mono text-[11px]">{f}</span>)}
          <span className="ml-1 text-xs text-muted">max 5 Mo</span>
        </span>
      </button>

      {/* Liste des documents */}
      {loading ? (
        <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>
      ) : documents.length === 0 ? (
        <div className="card-ink px-5 py-14 text-center">
          <span className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full border-[1.5px] border-dashed border-foreground"><File className="h-6 w-6" /></span>
          <p className="font-semibold">Aucun document importé</p>
          <p className="mt-1 text-sm text-muted">Importez une épreuve en PDF ou DOCX pour obtenir son corrigé.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border-[1.5px] border-foreground bg-card">
          {documents.map((doc) => {
            const Icon = FILE_ICONS[doc.file_type] ?? FileText;
            return (
              <div key={doc.id} className="flex items-center gap-4 border-b border-foreground/10 p-4 last:border-0">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border-[1.5px] border-foreground"><Icon className="h-5 w-5" /></span>

                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{doc.original_filename}</div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-muted">
                    <span className="font-mono uppercase">{doc.file_type}</span>
                    <span>{formatFileSize(doc.file_size)}</span>
                    <span>{formatDate(doc.created_at)}</span>
                    {doc.has_correction && <span className="inline-flex items-center gap-1 font-semibold text-foreground"><CheckCircle2 className="h-3.5 w-3.5" />Corrigé prêt</span>}
                  </div>
                </div>

                {doc.has_correction ? (
                  <button onClick={() => downloadCorrection(doc)} disabled={downloadingId === doc.id} className="btn-framed shrink-0">
                    {downloadingId === doc.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                    Télécharger
                  </button>
                ) : (
                  <button onClick={() => openCorrectModal(doc)} className="btn-ink h-10 shrink-0">
                    <CheckCircle2 className="h-4 w-4" />Corriger l’épreuve
                  </button>
                )}

                <button
                  onClick={() => handleDelete(doc.id, doc.original_filename)}
                  onBlur={() => setConfirmDelete((c) => (c === doc.id ? null : c))}
                  aria-label={confirmDelete === doc.id ? `Confirmer la suppression de ${doc.original_filename}` : `Supprimer ${doc.original_filename}`}
                  className={cn("shrink-0 rounded-lg p-2 text-xs font-semibold transition-colors",
                    confirmDelete === doc.id ? "bg-red-600 px-3 text-white" : "text-muted hover:bg-red-50 hover:text-red-600")}
                >
                  {confirmDelete === doc.id ? "Supprimer ?" : <Trash2 className="h-4 w-4" />}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal correction */}
      {correctModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="correct-title">
          <div className="w-full max-w-md rounded-2xl border-[1.5px] border-foreground bg-card p-6 shadow-[0_6px_0_var(--foreground)]">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 id="correct-title" className="font-display text-xl font-bold">Corriger l’épreuve</h2>
                <p className="mt-0.5 max-w-xs truncate text-sm text-muted">{correctModal.doc.original_filename}</p>
              </div>
              <button onClick={() => setCorrectModal(null)} disabled={correcting} aria-label="Fermer" className="rounded-lg p-2 hover:bg-foreground/5 disabled:opacity-40">
                <X className="h-5 w-5" />
              </button>
            </div>

            <label className="mb-1.5 block text-sm font-semibold" htmlFor="correct-class">
              <GraduationCap className="mr-1 inline h-3.5 w-3.5" />Classe de l’épreuve
            </label>
            <select
              id="correct-class"
              value={correctClass}
              onChange={(e) => setCorrectClass(e.target.value)}
              disabled={correcting}
              className="h-11 w-full rounded-xl border-[1.5px] border-foreground bg-background px-3 text-sm outline-none focus:shadow-[var(--shadow-ink)] disabled:opacity-50"
            >
              {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>

            <p className="mt-4 flex gap-2 rounded-xl bg-foreground/[0.05] p-3 text-xs leading-relaxed">
              <Download className="mt-0.5 h-4 w-4 shrink-0" />
              <span>Le modèle IA analyse votre épreuve et génère un corrigé complet, question par question. Le PDF se télécharge automatiquement. <strong>Durée estimée : 1 à 3 minutes.</strong></span>
            </p>

            <div className="mt-5 flex gap-3">
              <button onClick={() => setCorrectModal(null)} disabled={correcting} className="btn-framed flex-1">Annuler</button>
              <button onClick={handleCorrect} disabled={correcting} className="btn-ink flex-1">
                {correcting ? <><Loader2 className="h-4 w-4 animate-spin" />Correction en cours…</> : <><CheckCircle2 className="h-4 w-4" />Générer le corrigé</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
