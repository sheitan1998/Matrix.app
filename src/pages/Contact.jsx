import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error("Veuillez remplir tous les champs.");
      return;
    }
    setLoading(true);
    try {
      const mailtoLink = `mailto:contact@matrix-hub.base44.app?subject=Contact MATRIX - ${encodeURIComponent(name)}&body=${encodeURIComponent(`Nom: ${name}\nEmail: ${email}\n\n${message}`)}`;
      window.location.href = mailtoLink;
      toast.success("Votre client mail va s'ouvrir.");
    } catch {
      toast.error("Une erreur est survenue. Réessayez plus tard.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground px-4 sm:px-6 lg:px-10 py-8 max-w-2xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition mb-8 tap-sm">
        <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
      </Link>

      <h1 className="text-3xl md:text-4xl font-black mb-6">Contactez-nous</h1>

      <div className="grid gap-6 sm:grid-cols-2 mb-8">
        <a href="mailto:contact@matrix-hub.base44.app" className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/50 transition">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold">Email</p>
            <p className="text-xs text-muted-foreground">contact@matrix-hub.base44.app</p>
          </div>
        </a>
        <Link to="/sondages" className="flex items-center gap-3 p-4 rounded-xl border border-border hover:border-primary/50 transition">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <MessageCircle className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold">Sondages</p>
            <p className="text-xs text-muted-foreground">Donnez votre avis</p>
          </div>
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-1.5 block">Nom</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Votre nom" />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Email</label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" />
        </div>
        <div>
          <label className="text-sm font-medium mb-1.5 block">Message</label>
          <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Votre message..." rows={5} />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Envoi..." : "Envoyer"}
        </Button>
      </form>
    </div>
  );
}