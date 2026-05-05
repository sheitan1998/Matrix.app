import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AgeGate({ onVerified }) {
  const [birthYear, setBirthYear] = useState("");
  const [birthMonth, setBirthMonth] = useState("");
  const [birthDay, setBirthDay] = useState("");
  const [error, setError] = useState("");

  const verify = () => {
    const year = parseInt(birthYear);
    const month = parseInt(birthMonth) - 1;
    const day = parseInt(birthDay);
    if (!year || !month === undefined || !day) { setError("Remplis tous les champs."); return; }
    const birth = new Date(year, month, day);
    const now = new Date();
    const age = now.getFullYear() - birth.getFullYear() -
      (now < new Date(now.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0);
    if (isNaN(age) || age < 0 || year < 1900) { setError("Date invalide."); return; }
    if (age < 18) { setError("Tu dois avoir 18 ans ou plus pour accéder au casino."); return; }
    onVerified();
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center p-6">
      <div className="absolute inset-0 grid-bg opacity-10" />
      <Link to="/" className="absolute top-4 left-4 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-5 h-5" />
      </Link>

      <div className="relative z-10 w-full max-w-sm text-center space-y-6">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto"
          style={{ background: "hsl(45 100% 55% / 0.15)", border: "1px solid hsl(45 100% 55% / 0.3)" }}>
          <ShieldCheck className="w-10 h-10 text-trix" />
        </div>

        <div>
          <h1 className="text-3xl font-black">
            <span className="text-trix">M</span>ATRIX Casino
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            L'accès au casino est réservé aux personnes majeures (18 ans et plus).
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 space-y-4 text-left">
          <p className="text-sm font-semibold">Entrez votre date de naissance</p>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs text-muted-foreground">Jour</label>
              <Input placeholder="DD" value={birthDay} onChange={(e) => setBirthDay(e.target.value)} maxLength={2} className="mt-1" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Mois</label>
              <Input placeholder="MM" value={birthMonth} onChange={(e) => setBirthMonth(e.target.value)} maxLength={2} className="mt-1" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Année</label>
              <Input placeholder="AAAA" value={birthYear} onChange={(e) => setBirthYear(e.target.value)} maxLength={4} className="mt-1" />
            </div>
          </div>
          {error && (
            <div className="flex items-center gap-2 text-destructive text-xs">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {error}
            </div>
          )}
          <Button onClick={verify} className="w-full h-11 font-bold" style={{ background: "hsl(45 100% 55%)", color: "hsl(0 0% 5%)" }}>
            Vérifier mon âge
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          ⚠️ Jeux fictifs uniquement. Aucune mise d'argent réel.
        </p>
      </div>
    </div>
  );
}