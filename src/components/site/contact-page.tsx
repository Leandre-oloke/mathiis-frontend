"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Mail, MessageSquare, Send, User } from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { api } from "@/lib/api";

const CONTACT_EMAIL = "solutioner.bj@gmail.com";

export function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (message.trim().length < 10) { toast.error("Votre message est trop court."); return; }
    setSending(true);
    try {
      await api.post("/contact", { name: name.trim(), email: email.trim(), message: message.trim() });
      setSent(true);
      setName(""); setEmail(""); setMessage("");
      toast.success("Message envoyé, merci !");
    } catch {
      toast.error("Erreur lors de l'envoi. Réessayez plus tard.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="static-page">
      <SiteHeader />
      <main>
        <section className="static-hero shell">
          <span className="eyebrow">Contact</span>
          <h1>Une question, un bug, une suggestion ?</h1>
          <p>Écrivez-nous directement, nous répondons personnellement à chaque message.</p>
        </section>

        <section className="section shell contact-grid">
          <div className="contact-info">
            <h2>Nous écrire</h2>
            <p>Que vous soyez enseignant, élève ou simple visiteur curieux, votre message nous intéresse.</p>
            <a className="contact-email" href={`mailto:${CONTACT_EMAIL}`}><Mail size={17} /> {CONTACT_EMAIL}</a>
          </div>

          <form className="auth-form contact-form" onSubmit={onSubmit}>
            {sent ? (
              <p className="auth-done"><strong>Message envoyé !</strong> Nous revenons vers vous rapidement.</p>
            ) : (
              <>
                <div className="auth-field">
                  <div className="auth-label-row"><label htmlFor="contact-name">Nom</label></div>
                  <div className="auth-input"><User /><input id="contact-name" required placeholder="Votre nom" value={name} onChange={(e) => setName(e.target.value)} /></div>
                </div>
                <div className="auth-field">
                  <div className="auth-label-row"><label htmlFor="contact-email">Email</label></div>
                  <div className="auth-input"><Mail /><input id="contact-email" type="email" required placeholder="vous@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                </div>
                <div className="auth-field">
                  <div className="auth-label-row"><label htmlFor="contact-message">Message</label></div>
                  <div className="auth-input contact-textarea"><MessageSquare /><textarea id="contact-message" required rows={5} placeholder="Votre message…" value={message} onChange={(e) => setMessage(e.target.value)} /></div>
                </div>
                <Button type="submit" className="auth-submit" disabled={sending}>
                  {sending ? <><Loader2 className="animate-spin" /> Envoi…</> : <>Envoyer <Send /></>}
                </Button>
              </>
            )}
          </form>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
