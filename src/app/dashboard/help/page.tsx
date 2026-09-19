"use client";

import { useMemo, useState } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { ChevronDown, Loader2, Send, HelpCircle, Search, FileText, FileCheck2, UserRound, ArrowRight, MessageCircle } from "lucide-react";
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

function FaqAccordionItem({ item }: { item: FaqItem }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-100 last:border-b-0">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 py-3.5 text-left"
      >
        <span className="text-sm font-medium text-slate-800">{item.question}</span>
        <ChevronDown
          className={cn("w-4 h-4 text-slate-400 flex-shrink-0 transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <p className="pb-4 text-sm text-slate-500 leading-relaxed">{item.answer}</p>
      )}
    </div>
  );
}

export default function HelpPage() {
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [sending, setSending] = useState(false);

  const filteredFaq = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("fr");
    if (!query) return FAQ;
    return FAQ.map((category) => ({
      ...category,
      items: category.items.filter((item) => `${item.question} ${item.answer}`.toLocaleLowerCase("fr").includes(query)),
    })).filter((category) => category.items.length > 0);
  }, [search]);

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
    <div className="space-y-7">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-indigo-500">Bon retour</p>
        <h1 className="flex items-center gap-3 text-3xl font-extrabold tracking-tight text-[#071a3d] sm:text-4xl">
          Centre d&apos;aide <HelpCircle className="h-8 w-8 text-indigo-600" />
        </h1>
        <p className="mt-1 text-lg text-slate-500">
          Trouvez rapidement une réponse ou contactez notre équipe.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-indigo-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher dans l’aide…" className="h-16 w-full rounded-2xl border border-white bg-white pl-14 pr-5 text-sm shadow-xl shadow-slate-200/40 outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {([
          [FileText, "Génération d’épreuves", "Questions sur la création d’épreuves avec l’IA", "text-indigo-600", "bg-indigo-50"],
          [FileCheck2, "Import & correction", "Importer vos épreuves et comprendre les corrigés", "text-emerald-600", "bg-emerald-50"],
          [UserRound, "Compte & abonnement", "Gérer votre compte, abonnement et facturation", "text-orange-600", "bg-orange-50"],
        ] as const).map(([Icon, title, copy, color, bg]) => (
          <div key={String(title)} className="flex items-center gap-4 rounded-3xl border border-white bg-white p-5 shadow-lg shadow-slate-200/40">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${bg}`}><Icon className={`h-6 w-6 ${color}`} /></div>
            <div className="min-w-0 flex-1"><h2 className="font-bold text-[#071a3d]">{String(title)}</h2><p className="mt-1 text-xs leading-relaxed text-slate-500">{String(copy)}</p></div><ArrowRight className="h-5 w-5 text-indigo-500" />
          </div>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {filteredFaq.map((category) => (
          <div key={category.title} className="rounded-3xl border border-white bg-white p-6 shadow-xl shadow-slate-200/40">
            <h2 className="mb-2 text-lg font-extrabold text-[#071a3d]">{category.title}</h2>
            <div>
              {category.items.map((item) => (
                <FaqAccordionItem key={item.question} item={item} />
              ))}
            </div>
          </div>
        ))}
        {filteredFaq.length === 0 && <div className="col-span-full rounded-3xl bg-white p-10 text-center text-slate-500 shadow-lg">Aucune réponse ne correspond à cette recherche.</div>}
      </div>

      <div className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-r from-indigo-50 via-white to-blue-50 p-7 shadow-xl shadow-slate-200/40 sm:p-8">
        <div className="absolute -left-8 -top-8 h-32 w-32 rounded-full bg-indigo-200/40 blur-2xl" />
        <div>
          <h2 className="relative flex items-center gap-3 text-xl font-extrabold text-[#071a3d]"><MessageCircle className="h-6 w-6 text-indigo-600" />Vous ne trouvez pas votre réponse ?</h2>
          <p className="text-sm text-slate-500 mt-1">
            Une question, un bug à signaler, une suggestion ? Écrivez-nous directement.
          </p>
        </div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="Votre message..."
          className="relative mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={handleSend}
          disabled={sending}
          className="relative mt-4 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:shadow-xl disabled:opacity-60"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Envoyer
        </button>
      </div>
    </div>
  );
}
