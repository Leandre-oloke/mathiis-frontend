"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { ChevronDown, Loader2, Send, Search } from "lucide-react";
import { PageHeader } from "@/components/ui/kit";
import { cn } from "@/lib/utils";

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqCategory {
  title: string;
  items: FaqItem[];
}

const FAQ: FaqCategory[] = [
  {
    title: "Génération d'épreuves",
    items: [
      {
        question: "Comment générer une épreuve ?",
        answer:
          "Depuis \"Générer une épreuve\", choisissez la classe, les notions à couvrir et la durée, puis lancez la génération. L'IA crée un contexte, une tâche et plusieurs exercices adaptés au niveau choisi.",
      },
      {
        question: "Quelles classes sont supportées ?",
        answer: "De la 6e en Terminale (toutes les séries), selon le programme officiel béninois.",
      },
      {
        question: "Combien de temps prend la génération d'une épreuve ?",
        answer: "Généralement moins d'une minute, selon la complexité et la charge du serveur.",
      },
      {
        question: "Puis-je choisir les notions/chapitres à inclure dans l'épreuve ?",
        answer: "Oui, une liste de notions est proposée selon la classe sélectionnée ; vous pouvez en choisir plusieurs.",
      },
      {
        question: "Puis-je régénérer une partie de l'épreuve si elle ne me convient pas ?",
        answer: "Oui, vous pouvez régénérer un exercice précis sans relancer toute l'épreuve.",
      },
    ],
  },
  {
    title: "Import et correction d'épreuves",
    items: [
      {
        question: "Comment importer une épreuve existante pour la faire corriger ?",
        answer: "Depuis \"Mes corrigés\", importez votre fichier, puis choisissez la classe pour lancer la correction automatique.",
      },
      {
        question: "Quels formats de fichiers sont acceptés ?",
        answer: "PDF, Word (.docx) et texte brut, jusqu'à 5 Mo. Les PDF scannés (images) sont aussi acceptés grâce à la reconnaissance de texte automatique.",
      },
      {
        question: "Combien de temps prend la génération d'un corrigé ?",
        answer: "Quelques dizaines de secondes à quelques minutes selon la longueur de l'épreuve.",
      },
      {
        question: "Les graphiques et figures géométriques sont-ils bien pris en charge dans les corrigés ?",
        answer: "Oui, les courbes, figures géométriques et histogrammes sont générés automatiquement quand l'énoncé les demande.",
      },
    ],
  },
  {
    title: "Téléchargement et gestion des documents",
    items: [
      {
        question: "Sous quels formats puis-je télécharger mes épreuves et corrigés ?",
        answer: "PDF et Word (.docx).",
      },
      {
        question: "Où retrouver mes épreuves et corrigés précédemment générés ?",
        answer: "Dans \"Mes épreuves\" pour les épreuves générées, et \"Mes corrigés\" pour les documents importés.",
      },
      {
        question: "Puis-je supprimer une épreuve ou un document importé ?",
        answer: "Oui, depuis la liste correspondante.",
      },
    ],
  },
  {
    title: "Quotas et abonnement",
    items: [
      {
        question: "Combien d'épreuves/corrigés puis-je générer gratuitement ?",
        answer: "Un quota gratuit est offert à l'inscription ; au-delà, vous pouvez recharger votre compte via un paiement Mobile Money.",
      },
      {
        question: "Comment fonctionne le paiement ?",
        answer: "Le paiement se fait via FedaPay, en Mobile Money MTN, directement depuis la page Abonnement.",
      },
      {
        question: "Que se passe-t-il quand j'atteins ma limite de génération ?",
        answer: "Un message vous invite à recharger votre compte pour continuer à générer des épreuves/corrigés.",
      },
      {
        question: "Les crédits achetés expirent-ils ?",
        answer: "Non, vos crédits restent disponibles tant que vous ne les avez pas utilisés.",
      },
    ],
  },
  {
    title: "Compte et sécurité",
    items: [
      {
        question: "Comment créer un compte / réinitialiser mon mot de passe ?",
        answer:
          "Inscrivez-vous depuis la page d'accueil. En cas d'oubli du mot de passe, cliquez sur \"Mot de passe oublié\" sur la page de connexion pour recevoir un lien de réinitialisation par email.",
      },
      {
        question: "Mes données et mes épreuves sont-elles privées ?",
        answer: "Oui, seules vous pouvez accéder à vos épreuves et documents.",
      },
      {
        question: "Puis-je supprimer mon compte ?",
        answer: "Contactez-nous via le formulaire ci-dessous, nous traiterons votre demande.",
      },
    ],
  },
  {
    title: "Problèmes techniques",
    items: [
      {
        question: "Le téléchargement du PDF ne fonctionne pas, que faire ?",
        answer: "Vérifiez que vous êtes bien connecté, puis réessayez. Si le problème persiste, contactez-nous ci-dessous.",
      },
      {
        question: "L'épreuve générée affiche une erreur, que faire ?",
        answer: "Essayez de régénérer l'épreuve ou l'exercice concerné ; si l'erreur persiste, signalez-la nous.",
      },
      {
        question: "Le site indique que la plateforme est temporairement suspendue, que faire ?",
        answer: "Il s'agit d'une maintenance planifiée. Réessayez plus tard, ou contactez-nous si la suspension dure anormalement longtemps.",
      },
    ],
  },
];

function FaqAccordionItem({ item, forceOpen }: { item: FaqItem; forceOpen: boolean }) {
  const [open, setOpen] = useState(false);
  const shown = open || forceOpen;
  return (
    <div className="border-t border-foreground/10 first:border-t-0">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={shown}
        className="flex w-full items-center justify-between gap-4 py-4 text-left"
      >
        <span className={cn("text-[15px]", shown ? "font-semibold" : "font-medium")}>{item.question}</span>
        <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", shown && "rotate-180")} />
      </button>
      {shown && <p className="max-w-[70ch] pb-4 text-sm leading-relaxed text-muted">{item.answer}</p>}
    </div>
  );
}

// Accent-insensitive search ("epreuve" finds "épreuve").
const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export default function HelpPage() {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [query, setQuery] = useState("");

  const q = fold(query.trim());
  const groups = FAQ.map((c) => ({ ...c, items: c.items.filter((i) => !q || fold(`${i.question} ${i.answer}`).includes(q)) })).filter((c) => c.items.length);
  const count = groups.reduce((n, g) => n + g.items.length, 0);

  const handleSend = async () => {
    if (message.trim().length < 5) {
      toast.error("Votre message est trop court.");
      return;
    }
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
    <div className="space-y-6">
      <PageHeader eyebrow="Aide" title="Questions fréquentes" subtitle="Trouvez une réponse en quelques secondes, ou écrivez-nous directement." />

      <label className="relative flex h-13 items-center rounded-xl border-[1.5px] border-foreground bg-card focus-within:shadow-[var(--shadow-ink)]">
        <Search className="absolute left-4 h-4 w-4 text-muted" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher : PDF, quota, mot de passe…" aria-label="Rechercher dans l’aide" className="h-full w-full bg-transparent pl-11 pr-4 text-[15px] outline-none" />
      </label>
      {query && <p className="text-sm text-muted">{count} réponse{count > 1 ? "s" : ""} pour « {query} »</p>}

      <div className="space-y-4">
        {groups.map((category) => (
          <section key={category.title} className="card-ink px-6 pb-2 pt-5">
            <h2 className="mb-1 font-display text-lg font-bold">{category.title}</h2>
            {category.items.map((item) => <FaqAccordionItem key={item.question} item={item} forceOpen={!!q} />)}
          </section>
        ))}
        {groups.length === 0 && <p className="card-ink p-6 text-sm text-muted">Aucune réponse ne correspond. Posez votre question ci-dessous : nous vous répondrons.</p>}
      </div>

      <section className="card-ink space-y-4 p-6">
        <div>
          <h2 className="font-display text-xl font-bold">Nous contacter</h2>
          <p className="mt-1 text-sm text-muted">Une question, un bug à signaler, une suggestion ? Écrivez-nous directement.</p>
        </div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="Votre message…"
          aria-label="Votre message"
          className="w-full rounded-xl border-[1.5px] border-foreground bg-background px-3.5 py-3 text-sm outline-none focus:shadow-[var(--shadow-ink)]"
        />
        <button onClick={handleSend} disabled={sending} className="btn-ink">
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Envoyer
        </button>
      </section>
    </div>
  );
}
