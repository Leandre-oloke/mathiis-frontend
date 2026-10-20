import Link from "next/link";
import { ArrowRight, Check, Download, FileText, ShieldCheck, Sparkles, Upload, Zap } from "lucide-react";
import { SiteFooter, SiteHeader } from "@/components/home/SiteChrome";
import { CorrectionDeck, CurvedMarquee, ExamWall, IdeaToExam, Reveal, RotatingWord } from "@/components/home/HomeMotion";
import { ExamMarkdown } from "@/components/exam/ExamMarkdown";
import { SAMPLE_EXAM } from "@/lib/sample-exam";

const FACTS = [
  { value: "6e → Tle", label: "toutes les classes et séries" },
  { value: "3", label: "matières : Maths, PCT, SVT" },
  { value: "PDF · Word", label: "prêts à imprimer" },
];

const TOOLS = [
  { icon: Sparkles, title: "Création par IA", text: "Une classe, des notions du programme. Mathiis rédige un contexte, une tâche et des problèmes cohérents." },
  { icon: Upload, title: "Import de documents", text: "Partez de vos sujets en PDF, Word ou texte, même scannés, et obtenez un corrigé détaillé." },
  { icon: Download, title: "Export PDF et Word", text: "Une mise en page propre pour vos épreuves, avec ou sans corrigé." },
  { icon: FileText, title: "Formules et figures", text: "Les formules mathématiques et les figures de géométrie sont rendues, pas recopiées en code." },
  { icon: ShieldCheck, title: "Un espace privé", text: "Vos épreuves et vos documents ne sont visibles que par vous." },
  { icon: Zap, title: "Génération en direct", text: "Suivez votre épreuve se rédiger étape par étape, et régénérez une partie si besoin." },
];

const STEPS = [
  { n: "01", title: "Donnez le point de départ.", text: "Choisissez la matière, la classe et les notions à évaluer." },
  { n: "02", title: "L’IA prend le relais.", text: "L’épreuve se rédige sous vos yeux, conforme au programme officiel." },
  { n: "03", title: "À vous de transmettre.", text: "Relisez, ajustez, puis téléchargez en PDF ou Word pour votre classe." },
];

const SUBJECTS = [
  { symbol: "∑", name: "Mathématiques", detail: "Algèbre, analyse, géométrie" },
  { symbol: "⚛", name: "PCT", detail: "Physique, chimie, technologie" },
  { symbol: "❦", name: "SVT", detail: "Sciences de la vie et de la Terre" },
];

const eyebrow = "font-mono text-[11px] uppercase tracking-[0.2em] text-muted";
const h2 = "font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl";

export default function LandingPage() {
  return (
    <div id="haut" className="min-h-screen overflow-x-clip bg-background">
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="mx-auto max-w-7xl px-4 pb-20 pt-20 text-center sm:px-6 sm:pt-28 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border-[1.5px] border-foreground px-3.5 py-1 text-xs font-semibold">
            <i className="h-1.5 w-1.5 animate-pulse rounded-full bg-foreground" aria-hidden="true" /> Générateur d’épreuves par IA
          </span>
          <h1 className="mx-auto mt-7 max-w-5xl font-display text-[2.6rem] font-bold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
            Vos épreuves de <em className="font-paper italic"><RotatingWord words={["mathématiques", "PCT", "SVT"]} /></em>
            <br />conformes au programme.
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-muted">
            Enseignants et élèves : choisissez la classe et les notions du programme officiel béninois. Mathiis rédige l’épreuve, et son corrigé détaillé, prêts à exporter.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/auth/register" className="btn-ink h-13 px-7 text-base">Commencer gratuitement <ArrowRight className="h-4 w-4" /></Link>
            <a href="#exemple" className="btn-framed h-13 px-7 text-base">Voir un exemple</a>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted">
            <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> Inscription gratuite</span>
            <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> Pour les enseignants et les élèves</span>
          </div>
        </section>

        {/* Facts */}
        <section aria-label="Mathiis en bref" className="border-y-[1.5px] border-foreground">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)] md:items-center lg:px-8">
            <p className="font-display text-xl font-medium leading-snug">Moins de tâches répétitives.<strong className="block font-bold">Plus de place pour enseigner.</strong></p>
            {FACTS.map((f) => (
              <div key={f.label} className="transition-transform hover:-translate-y-1">
                <strong className="block font-display text-3xl font-bold">{f.value}</strong>
                <span className="text-sm text-muted">{f.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Manifesto */}
        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <Reveal className="grid gap-10 lg:grid-cols-2 lg:items-end">
            <div>
              <span className={eyebrow}>L’expertise reste la vôtre.</span>
              <h2 className={`${h2} mt-4`}>Pas juste de l’IA.<br />Une longueur d’avance.</h2>
            </div>
            <p className="max-w-xl text-lg leading-relaxed text-muted">
              Préparer une épreuve demande du temps et de la précision. Mathiis accompagne votre travail, de la première question au corrigé final : vous gardez la main sur chaque partie.
            </p>
          </Reveal>
        </section>

        <CurvedMarquee text="Créer · Corriger · Exporter · Transmettre" />

        {/* 01 Créer */}
        <section className="bg-foreground text-background">
          <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:px-8">
            <Reveal>
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-background/60">01 / Créer</span>
              <h2 className={`${h2} mt-4`}>Une idée.<br />Une épreuve.<br />Votre signature.</h2>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-background/70">Une matière, une classe, des notions. Donnez le point de départ et gardez la main sur votre contenu.</p>
            </Reveal>
            <IdeaToExam />
          </div>
        </section>

        {/* 02 Corriger */}
        <section className="mx-auto grid max-w-7xl items-center gap-14 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:px-8">
          <Reveal>
            <span className={eyebrow}>02 / Corriger</span>
            <h2 className={`${h2} mt-4`}>Chaque question.<br />Chaque réponse.<br />Au clair.</h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">Importez un sujet et recevez un corrigé détaillé et structuré, pour vous concentrer sur ce qui compte : transmettre.</p>
          </Reveal>
          <CorrectionDeck />
        </section>

        {/* Real exam excerpt */}
        <section id="exemple" className="scroll-mt-20 border-t-[1.5px] border-foreground bg-foreground/[0.03]">
          <div className="mx-auto grid max-w-7xl gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[1fr_1.4fr] lg:px-8">
            <Reveal className="lg:sticky lg:top-28 lg:self-start">
              <span className={eyebrow}>Un vrai sujet</span>
              <h2 className={`${h2} mt-4`}>Lisez ce que Mathiis rédige.</h2>
              <p className="mt-6 max-w-md text-lg leading-relaxed text-muted">
                Extrait d’une épreuve générée pour la {SAMPLE_EXAM.level}, recopiée telle quelle : situation contextualisée, tâche, problèmes numérotés, formules et figure.
              </p>
              <Link href="/auth/register" className="btn-ink mt-8">Générer la mienne <ArrowRight className="h-4 w-4" /></Link>
            </Reveal>
            <article aria-label={`Extrait : ${SAMPLE_EXAM.title}`} className="rounded-md border-[1.5px] border-foreground bg-card p-6 shadow-[8px_8px_0_var(--foreground)] sm:p-10">
              <header className="mb-2 flex flex-wrap items-baseline justify-between gap-2 border-b-[1.5px] border-foreground pb-4">
                <p className="font-paper text-xl font-bold">{SAMPLE_EXAM.title}</p>
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">{SAMPLE_EXAM.subject} · {SAMPLE_EXAM.level}</p>
              </header>
              <ExamMarkdown text={SAMPLE_EXAM.markdown} />
            </article>
          </div>
        </section>

        {/* Tools */}
        <section id="fonctionnalites" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-24 sm:px-6 lg:px-8">
          <div className="mb-14 grid gap-6 lg:grid-cols-2 lg:items-end">
            <div>
              <span className={eyebrow}>Un espace. Tous vos outils.</span>
              <h2 className={`${h2} mt-4`}>Tout pour vos épreuves.<br /><span className="text-muted">Rien pour vous ralentir.</span></h2>
            </div>
            <p className="max-w-xl text-lg leading-relaxed text-muted">Créez, importez, corrigez et exportez. Vos outils essentiels, réunis au même endroit.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((t, i) => (
              <Reveal key={t.title} delay={(i % 3) * 80}>
                <article className="card-ink group h-full p-6 transition-[transform,box-shadow] hover:-translate-y-1 hover:shadow-[5px_6px_0_var(--foreground)]">
                  <div className="flex items-center justify-between">
                    <span className="grid h-11 w-11 place-items-center rounded-xl border-[1.5px] border-foreground transition-colors group-hover:bg-foreground group-hover:text-background">
                      <t.icon className="h-5 w-5" strokeWidth={1.7} />
                    </span>
                    <span className="font-mono text-xs text-muted">0{i + 1}</span>
                  </div>
                  <h3 className="mt-5 font-display text-lg font-bold">{t.title}</h3>
                  <p className="mt-2 leading-relaxed text-muted">{t.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Subjects */}
        <section id="matieres" aria-labelledby="matieres-titre" className="scroll-mt-20 border-y-[1.5px] border-foreground">
          <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div>
              <span className={eyebrow}>Matières disponibles</span>
              <h2 id="matieres-titre" className={`${h2} mt-4`}>Trois matières pour commencer.<br /><span className="text-muted">D’autres arrivent.</span></h2>
              <ul className="mt-10">
                {SUBJECTS.map((s) => (
                  <li key={s.name} className="flex items-center gap-4 border-t border-foreground/15 py-4 transition-transform first:border-t-0 hover:-translate-y-0.5">
                    <span aria-hidden="true" className="grid h-11 w-11 place-items-center rounded-xl border-[1.5px] border-foreground text-lg">{s.symbol}</span>
                    <span><strong className="block font-display text-lg">{s.name}</strong><small className="text-sm text-muted">{s.detail}</small></span>
                  </li>
                ))}
              </ul>
            </div>
            <ExamWall />
          </div>
        </section>

        {/* Method */}
        <section id="comment-ca-marche" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-24 sm:px-6 lg:px-8">
          <span className={eyebrow}>De l’idée à l’épreuve</span>
          <h2 className={`${h2} mt-4`}>Trois étapes.<br /><span className="text-muted">Et vous êtes prêt.</span></h2>
          <ol className="mt-14 grid gap-5 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.n}>
                <Reveal delay={i * 100} className="h-full border-t-[1.5px] border-foreground pt-6">
                  <span className="font-mono text-sm">{s.n}</span>
                  <h3 className="mt-4 font-display text-2xl font-bold">{s.title}</h3>
                  <p className="mt-3 leading-relaxed text-muted">{s.text}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </section>

        {/* Call to action */}
        <section className="px-4 pb-24 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-3xl border-[1.5px] border-foreground px-6 py-20 text-center shadow-[8px_8px_0_var(--foreground)] sm:px-12">
            <span className={eyebrow}>Votre prochaine épreuve commence ici</span>
            <h2 className={`${h2} mx-auto mt-4 max-w-3xl`}>Moins de préparation.<br />Plus de transmission.</h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted">Une nouvelle façon de préparer, sans changer votre façon d’enseigner.</p>
            <Link href="/auth/register" className="btn-ink mt-10 h-13 px-7 text-base">Commencer gratuitement <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
