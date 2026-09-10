import Link from "next/link";
import { ArrowRight, Sparkles, FileText, Upload, Download, Shield, Zap, Users } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "Génération IA avancée",
    description: "Votre modèle IA génère des épreuves complètes et cohérentes en quelques secondes.",
    color: "bg-slate-100 text-slate-900",
  },
  {
    icon: Upload,
    title: "Import de documents",
    description: "Importez vos épreuves (PDF, Word, texte) pour générer un corrigé détaillé et cohérent.",
    color: "bg-slate-100 text-slate-900",
  },
  {
    icon: Download,
    title: "Export PDF professionnel",
    description: "Téléchargez vos épreuves en PDF mise en page, avec ou sans corrigé.",
    color: "bg-slate-100 text-slate-900",
  },
  {
    icon: FileText,
    title: "Types variés",
    description: "QCM, vrai/faux, questions ouvertes, textes à trous, tous les formats.",
    color: "bg-slate-100 text-slate-900",
  },
  {
    icon: Shield,
    title: "Sécurisé & privé",
    description: "Vos données restent privées.",
    color: "bg-slate-100 text-slate-900",
  },
  {
    icon: Zap,
    title: "Streaming temps réel",
    description: "Visualisez la génération en direct grâce au WebSocket streaming.",
    color: "bg-slate-100 text-slate-900",
  },
];

const stats = [
  { value: "< 60s", label: "Temps de génération" },
  { value: "20+", label: "Questions par épreuve" },
  { value: "5", label: "Types de questions" },
  { value: "∞", label: "Épreuves créées" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 glass border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-slate-900 text-lg">Mathiis</span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-4 py-2"
              >
                Connexion
              </Link>
              <Link
                href="/auth/register"
                className="text-sm font-medium bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Commencer gratuitement
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-slate-200/40 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-6">
            Générez des épreuves professionnelles
            <br />
            en quelques secondes grâce à l&apos;IA.
          </h1>

          <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Plateforme intelligente de création et de correction d&apos;épreuves académiques au Bénin. Importez vos épreuves et laissez l&apos;IA les corriger avec une analyse détaillée.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/auth/register"
              className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-slate-800 transition-all hover:shadow-lg hover:shadow-slate-300 hover:-translate-y-0.5"
            >
              Créer mon compte
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/auth/login"
              className="flex items-center gap-2 bg-white text-slate-700 px-8 py-4 rounded-xl font-semibold text-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-slate-100 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-bold text-slate-900 mb-1">{stat.value}</div>
                <div className="text-slate-500 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Tout ce dont vous avez besoin</h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">
              Une suite complète d&apos;outils pour créer, gérer et distribuer vos épreuves.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl border border-slate-100 bg-white hover:border-slate-300 hover:shadow-lg hover:shadow-slate-100/50 transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.color}`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-slate-900 text-lg mb-2">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition-all hover:shadow-xl"
          >
            Commencer maintenant, c&apos;est gratuit
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-900 rounded-md flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold text-slate-700">Mathiis</span>
          </div>
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} Mathiis. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}
