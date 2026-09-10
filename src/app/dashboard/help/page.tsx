"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { ChevronDown, Loader2, Send, HelpCircle } from "lucide-react";
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
  const [sending, setSending] = useState(false);

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
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <HelpCircle className="w-6 h-6 text-indigo-600" />
          Aide
        </h1>
        <p className="text-slate-500 mt-1">
          Questions fréquentes et moyen de nous contacter directement.
        </p>
      </div>

      <div className="space-y-6">
        {FAQ.map((category) => (
          <div key={category.title} className="bg-white rounded-2xl border border-slate-100 p-6">
            <h2 className="font-semibold text-slate-900 mb-2">{category.title}</h2>
            <div>
              {category.items.map((item) => (
                <FaqAccordionItem key={item.question} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
        <div>
          <h2 className="font-semibold text-slate-900">Nous contacter</h2>
          <p className="text-sm text-slate-500 mt-1">
            Une question, un bug à signaler, une suggestion ? Écrivez-nous directement.
          </p>
        </div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="Votre message..."
          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={handleSend}
          disabled={sending}
          className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Envoyer
        </button>
      </div>
    </div>
  );
}
