"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { ChevronDown, Loader2, Search, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Kbd, PageHead } from "@/components/espace/parts";
import { faq } from "@/lib/faq";
import { api } from "@/lib/api";

// Accent-insensitive search ("epreuve" finds "épreuve").
export const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export default function HelpPage() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  // A link such as /dashboard/help#formats-fichiers-acceptes (from the Ctrl+K palette) opens and shows that answer.
  useEffect(() => {
    const show = () => {
      const id = window.location.hash.slice(1);
      if (!id) return;
      setOpen(id);
      requestAnimationFrame(() => document.getElementById(`q-${id}`)?.scrollIntoView({ block: "center", behavior: "smooth" }));
    };
    show();
    window.addEventListener("hashchange", show);
    return () => window.removeEventListener("hashchange", show);
  }, []);

  const groups = useMemo(() => {
    const q = fold(query.trim());
    return faq.map((g) => ({ ...g, items: g.items.filter((i) => !q || fold(`${i.q} ${i.a}`).includes(q)) })).filter((g) => g.items.length);
  }, [query]);
  const count = groups.reduce((n, g) => n + g.items.length, 0);

  const send = async (e: FormEvent) => {
    e.preventDefault();
    if (message.trim().length < 5) { toast.error("Votre message est trop court."); return; }
    setSending(true);
    try {
      await api.post("/suggestions", { message: message.trim() });
      toast.success("Merci, votre message a bien été envoyé !");
      setMessage("");
    } catch {
      toast.error("Erreur lors de l'envoi. Réessayez.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="esp-page">
      <PageHead eyebrow="Aide" title="Questions fréquentes" subtitle="Trouvez une réponse en quelques secondes, ou écrivez-nous directement." />
      <label className="esp-search big"><Search /><input data-page-search placeholder="Rechercher : PDF, quota, mot de passe…" value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Rechercher dans l’aide" /><Kbd>/</Kbd></label>
      {!query && <nav className="esp-chips" aria-label="Catégories">{faq.map((g) => <a key={g.id} href={`#g-${g.id}`}>{g.title}</a>)}</nav>}
      {query && <p className="esp-hint">{count} réponse{count > 1 ? "s" : ""} pour « {query} »</p>}

      <div className="esp-faq">
        {groups.map((g) => (
          <section key={g.id} id={`g-${g.id}`} className="esp-panel esp-faq-group">
            <h2>{g.title}</h2>
            {g.items.map((item) => {
              const isOpen = open === item.id || !!query;
              return (
                <div key={item.id} id={`q-${item.id}`} className={`esp-faq-item${isOpen ? " is-open" : ""}`}>
                  <button type="button" aria-expanded={isOpen} aria-controls={`a-${item.id}`} onClick={() => setOpen(open === item.id ? null : item.id)}>{item.q}<ChevronDown /></button>
                  <div id={`a-${item.id}`} className="esp-faq-answer" hidden={!isOpen}><p>{item.a}</p></div>
                </div>
              );
            })}
          </section>
        ))}
        {groups.length === 0 && <div className="esp-panel esp-faq-none"><p>Aucune réponse ne correspond. Posez votre question ci-dessous : nous vous répondrons.</p></div>}
      </div>

      <section className="esp-panel esp-contact" id="contact">
        <h2>Nous contacter</h2>
        <p>Une question, un bug à signaler, une suggestion ? Écrivez-nous directement.</p>
        <form onSubmit={send}>
          <label htmlFor="help-message" className="sr-only">Votre message</label>
          <textarea id="help-message" className="esp-input" rows={5} placeholder="Votre message…" value={message} onChange={(e) => setMessage(e.target.value)} />
          <Button type="submit" className="esp-primary" disabled={sending || message.trim().length < 5}>{sending ? <Loader2 className="animate-spin" /> : <Send />} Envoyer</Button>
        </form>
      </section>
    </div>
  );
}
