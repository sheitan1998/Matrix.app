import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const CGU_LINK = "/privacy";

export function TermsCheckbox({ checked, onChange, id = "terms" }) {
  return (
    <div className="flex items-start gap-2.5">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        className="mt-0.5"
      />
      <label htmlFor={id} className="text-sm text-muted-foreground cursor-pointer select-none">
        J'accepte les{" "}
        <Link to={CGU_LINK} className="text-primary font-medium hover:underline" target="_blank">
          Conditions Générales d'Utilisation
        </Link>
        .
      </label>
    </div>
  );
}

export function TermsAcceptanceModal({ open, onAccept, onCancel, loading, providerLabel }) {
  const [checked, setChecked] = useState(false);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-md bg-card rounded-2xl border border-border p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-primary/10">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Conditions d'utilisation</h2>
            <p className="text-xs text-muted-foreground">
              {providerLabel ? `Connexion via ${providerLabel}` : "Nouveau compte"}
            </p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Pour finaliser la création de votre compte, vous devez accepter nos Conditions Générales d'Utilisation.
        </p>
        <div className="flex items-start gap-2.5 mb-5">
          <Checkbox
            id="terms-modal"
            checked={checked}
            onCheckedChange={setChecked}
            className="mt-0.5"
          />
          <label htmlFor="terms-modal" className="text-sm text-muted-foreground cursor-pointer select-none">
            J'accepte les{" "}
            <Link to={CGU_LINK} className="text-primary font-medium hover:underline" target="_blank">
              Conditions Générales d'Utilisation
            </Link>
            .
          </label>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 h-11" onClick={onCancel} disabled={loading}>
            Annuler
          </Button>
          <Button
            className="flex-1 h-11"
            onClick={onAccept}
            disabled={!checked || loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Patientez...
              </>
            ) : (
              "Continuer"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function TermsGateScreen({ onAccept, onDecline, loading }) {
  const [checked, setChecked] = useState(false);
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary mb-4">
            <FileText className="w-7 h-7 text-primary-foreground" aria-hidden="true" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Conditions d'utilisation
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Finalisez votre inscription
          </p>
        </div>
        <div className="bg-card rounded-2xl shadow-sm border border-border p-8">
          <p className="text-sm text-muted-foreground mb-4">
            Pour finaliser la création de votre compte, vous devez accepter nos Conditions Générales d'Utilisation.
          </p>
          <div className="flex items-start gap-2.5 mb-6">
            <Checkbox
              id="terms-gate"
              checked={checked}
              onCheckedChange={setChecked}
              className="mt-0.5"
            />
            <label htmlFor="terms-gate" className="text-sm text-muted-foreground cursor-pointer select-none">
              J'accepte les{" "}
              <Link to={CGU_LINK} className="text-primary font-medium hover:underline" target="_blank">
                Conditions Générales d'Utilisation
              </Link>
              .
            </label>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1 h-12" onClick={onDecline} disabled={loading}>
              Refuser
            </Button>
            <Button
              className="flex-1 h-12"
              onClick={onAccept}
              disabled={!checked || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Validation...
                </>
              ) : (
                "Accepter et continuer"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export const CGU_SESSION_KEY = "cgu_accepted";

export function hasCguSessionFlag() {
  try {
    return sessionStorage.getItem(CGU_SESSION_KEY) === "true";
  } catch {
    return false;
  }
}

export function setCguSessionFlag() {
  try {
    sessionStorage.setItem(CGU_SESSION_KEY, "true");
  } catch {}
}

export function clearCguSessionFlag() {
  try {
    sessionStorage.removeItem(CGU_SESSION_KEY);
  } catch {}
}