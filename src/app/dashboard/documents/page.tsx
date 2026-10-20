"use client";

import { useState, useEffect, useRef } from "react";
import { useQuotaStore } from "@/store/quota";
import { api } from "@/lib/api";
import { formatDate, formatFileSize } from "@/lib/utils";
import toast from "react-hot-toast";
import { CheckCircle2, ChevronDown, CloudUpload, Download, File, FileText, FileType2, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState, PageHead } from "@/components/espace/parts";

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

  useEffect(() => {
    let alive = true;
    api.get("/documents")
      .then(({ data }) => { if (alive) setDocuments(data); })
      .catch(() => toast.error("Erreur lors du chargement"))
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
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
    <div className="esp-page">
      <PageHead eyebrow="Correction" title="Importer" subtitle="Importez une épreuve : le modèle IA génère automatiquement le corrigé en PDF." />

      <button
        type="button"
        className={`esp-drop${dragOver ? " is-over" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && fileRef.current?.click()}
        aria-busy={uploading}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.docx,.txt,.md"
          hidden
          onChange={(e) => { const f = e.target.files?.[0]; if (f) void uploadFile(f); e.target.value = ""; }}
        />
        <span className="esp-drop-icon">{uploading ? <Loader2 className="animate-spin" /> : <CloudUpload />}</span>
        <strong>{uploading ? "Import en cours…" : dragOver ? "Déposez pour importer" : "Glissez-déposez ou cliquez pour importer"}</strong>
        <span className="esp-drop-formats">{["PDF", "DOCX", "TXT"].map((f) => <i key={f}>{f}</i>)}<em>max 5 Mo</em></span>
      </button>

      <section className="esp-block">
        <div className="esp-block-head"><h2>Documents importés</h2></div>
        {loading ? (
          <div className="esp-panel esp-loading" aria-busy="true"><Loader2 className="animate-spin" /> Chargement…</div>
        ) : documents.length === 0 ? (
          <div className="esp-panel"><EmptyState icon={<FileText />} title="Aucun document importé" text="Importez une épreuve (PDF, DOCX ou TXT) pour obtenir son corrigé." /></div>
        ) : (
          <ul className="esp-panel esp-files">
            {documents.map((doc) => {
              const Icon = FILE_ICONS[doc.file_type] ?? FileText;
              return (
                <li key={doc.id}>
                  <span className="esp-file-icon"><Icon /></span>
                  <span className="esp-file-main">
                    <strong>{doc.original_filename}</strong>
                    <small>
                      {doc.file_type.toUpperCase()} · {formatFileSize(doc.file_size)} · {formatDate(doc.created_at)}
                      {doc.has_correction && " · corrigé prêt"}
                    </small>
                  </span>
                  <span className="esp-row-actions">
                    {doc.has_correction ? (
                      <Button variant="framed" size="sm" onClick={() => void downloadCorrection(doc)} disabled={downloadingId === doc.id}>
                        {downloadingId === doc.id ? <Loader2 className="animate-spin" /> : <Download />} Corrigé PDF
                      </Button>
                    ) : (
                      <Button size="sm" className="esp-primary" onClick={() => openCorrectModal(doc)}><CheckCircle2 /> Corriger</Button>
                    )}
                    <Button variant="framed" size="sm" className="esp-danger"
                      onClick={() => void handleDelete(doc.id, doc.original_filename)}
                      onBlur={() => setConfirmDelete((c) => (c === doc.id ? null : c))}
                      aria-label={confirmDelete === doc.id ? `Confirmer la suppression de ${doc.original_filename}` : `Supprimer ${doc.original_filename}`}>
                      <Trash2 />{confirmDelete === doc.id && "Confirmer"}
                    </Button>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <Dialog open={!!correctModal} onOpenChange={(open) => { if (!open && !correcting) setCorrectModal(null); }}>
        <DialogContent className="esp-dialog">
          <DialogHeader>
            <DialogTitle>Corriger l’épreuve</DialogTitle>
            <DialogDescription className="truncate">{correctModal?.doc.original_filename}</DialogDescription>
          </DialogHeader>
          <div className="esp-field">
            <label htmlFor="correct-class">Classe de l’épreuve</label>
            <div className="esp-select">
              <select id="correct-class" value={correctClass} onChange={(e) => setCorrectClass(e.target.value)} disabled={correcting}>
                {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown aria-hidden="true" />
            </div>
          </div>
          <p className="esp-hint">Le modèle IA analyse votre épreuve et génère un corrigé complet, question par question. Le PDF se télécharge automatiquement. <strong>Durée estimée : 1 à 3 minutes.</strong></p>
          <div className="esp-dialog-actions">
            <Button variant="framed" onClick={() => setCorrectModal(null)} disabled={correcting}>Annuler</Button>
            <Button className="esp-primary" onClick={() => void handleCorrect()} disabled={correcting}>
              {correcting ? <><Loader2 className="animate-spin" /> Correction en cours…</> : <><CheckCircle2 /> Générer le corrigé</>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
