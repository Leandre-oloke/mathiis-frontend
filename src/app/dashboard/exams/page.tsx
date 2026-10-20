"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { ChevronDown, Download, FileType2, Loader2, LoaderCircle, Plus, Search, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EmptyState, Kbd, PageHead } from "@/components/espace/parts";
import { ExamTable } from "@/components/espace/exam-rows";
import { useExamStore, type Exam } from "@/store/exams";

const FILTERS = [
  { value: "", label: "Toutes" },
  { value: "completed", label: "Terminées" },
  { value: "generating", label: "En génération" },
  { value: "pending", label: "En attente" },
  { value: "failed", label: "Échouées" },
];

export default function ExamsPage() {
  const { exams, total, page, pages, fetchExams, deleteExam, downloadPdf, downloadDocx, refreshExam, loading } = useExamStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  // Deleting is final: the first click asks for confirmation, the second one deletes.
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    void fetchExams({ page: 1, search, status: statusFilter });
  }, [fetchExams, search, statusFilter]);

  // Exams still being written refresh every 3 s (for up to 30 min: some engines take 10-15 min).
  useEffect(() => {
    const MAX_AGE_MS = 30 * 60 * 1000;
    const now = Date.now();
    const running = exams.filter((e) => (e.status === "generating" || e.status === "pending") && now - new Date(e.created_at).getTime() < MAX_AGE_MS);
    if (running.length === 0) return;
    const timer = setInterval(() => running.forEach((e) => void refreshExam(e.id)), 3000);
    return () => clearInterval(timer);
  }, [exams, refreshExam]);

  const handleDelete = async (id: string) => {
    if (confirmDelete !== id) { setConfirmDelete(id); return; }
    setConfirmDelete(null);
    setBusy(id);
    try {
      await deleteExam(id);
      toast.success("Épreuve supprimée");
    } catch {
      toast.error("Erreur lors de la suppression");
    } finally {
      setBusy(null);
    }
  };

  const download = async (exam: Exam, format: "pdf" | "docx", withAnswers: boolean) => {
    setBusy(exam.id);
    try {
      await (format === "pdf" ? downloadPdf : downloadDocx)(exam.id, withAnswers);
    } catch {
      toast.error(format === "pdf" ? "Erreur lors du téléchargement" : "Erreur lors du téléchargement Word");
    } finally {
      setBusy(null);
    }
  };

  const actions = (exam: Exam) => <>
    {exam.status === "completed" && (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="framed" size="sm" disabled={busy === exam.id}>
            {busy === exam.id ? <Loader2 className="animate-spin" /> : <Download />} Télécharger <ChevronDown />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="esp-menu">
          <DropdownMenuItem onSelect={() => void download(exam, "pdf", false)}><Download />PDF</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => void download(exam, "pdf", true)}><Download />PDF avec corrigé</DropdownMenuItem>
          {(exam.engine === "standard" || exam.engine === "premium") && <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => void download(exam, "docx", false)}><FileType2 />Word</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => void download(exam, "docx", true)}><FileType2 />Word avec corrigé</DropdownMenuItem>
          </>}
        </DropdownMenuContent>
      </DropdownMenu>
    )}
    <Button variant="framed" size="sm" className="esp-danger" disabled={busy === exam.id}
      onClick={() => void handleDelete(exam.id)} onBlur={() => setConfirmDelete((c) => (c === exam.id ? null : c))}
      aria-label={confirmDelete === exam.id ? `Confirmer la suppression de ${exam.title}` : `Supprimer ${exam.title}`}>
      <Trash2 />{confirmDelete === exam.id && "Confirmer"}
    </Button>
  </>;

  const filtered = !!search || !!statusFilter;

  return (
    <div className="esp-page">
      <PageHead eyebrow="Bibliothèque" title="Mes épreuves" subtitle={`${total} épreuve${total > 1 ? "s" : ""} au total`}
        actions={<Button asChild className="esp-primary"><Link href="/dashboard/generate"><Plus /> Nouvelle épreuve <Kbd>N</Kbd></Link></Button>} />
      <div className="esp-toolbar">
        <label className="esp-search"><Search /><input data-page-search placeholder="Rechercher une épreuve…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Rechercher une épreuve" /><Kbd>/</Kbd></label>
        <div className="esp-seg" role="radiogroup" aria-label="Statut">
          {FILTERS.map((f) => <button type="button" role="radio" aria-checked={statusFilter === f.value} key={f.value} className={statusFilter === f.value ? "is-on" : ""} onClick={() => setStatusFilter(f.value)}>{f.label}</button>)}
        </div>
      </div>

      {loading && exams.length === 0 ? <div className="esp-panel esp-loading" aria-busy="true"><LoaderCircle className="animate-spin" /> Chargement…</div>
        : exams.length > 0 ? <ExamTable exams={exams} actions={actions} />
        : <div className="esp-panel">
            <EmptyState icon={<Sparkles />} title={filtered ? "Aucune épreuve ne correspond" : "Aucune épreuve trouvée"} text={filtered ? "Essayez un autre mot ou un autre statut." : "Créez votre première épreuve : elle sera rangée ici automatiquement."}>
              {filtered
                ? <Button variant="framed" onClick={() => { setSearch(""); setStatusFilter(""); }}>Effacer les filtres</Button>
                : <Button asChild className="esp-primary"><Link href="/dashboard/generate"><Sparkles /> Générer une épreuve</Link></Button>}
            </EmptyState>
          </div>}

      {pages > 1 && (
        <nav className="esp-pager" aria-label="Pages">
          <Button variant="framed" size="sm" disabled={page <= 1} onClick={() => void fetchExams({ page: page - 1, search, status: statusFilter })}>Précédent</Button>
          <span>{page} / {pages}</span>
          <Button variant="framed" size="sm" disabled={page >= pages} onClick={() => void fetchExams({ page: page + 1, search, status: statusFilter })}>Suivant</Button>
        </nav>
      )}
    </div>
  );
}
