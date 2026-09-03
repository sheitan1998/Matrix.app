import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { X, Loader2, Check, AlertCircle } from "lucide-react";
import { base44 } from "@/api/base44Client";

/**
 * Modal de paiement Stripe embarqué.
 * @param {string} functionName - Nom de la fonction backend (ex: "stripePayment", "cosmeticShop")
 * @param {object} params - Paramètres à passer à la fonction (ex: { action: "createTrixPurchase", packId: "pack_500" })
 * @param {function} onClose - Callback de fermeture
 * @param {function} onSuccess - Callback appelé après vérification du paiement réussi
 */
export default function CheckoutModal({ functionName, params, onClose, onSuccess }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [clientSecret, setClientSecret] = useState(null);
  const [publishableKey, setPublishableKey] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [stripePromise, setStripePromise] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await base44.functions.invoke(functionName, params);
        const data = res?.data || res;
        if (data?.clientSecret) {
          setClientSecret(data.clientSecret);
          setPublishableKey(data.publishableKey);
          setSessionId(data.sessionId);
          if (data.publishableKey) {
            setStripePromise(loadStripe(data.publishableKey));
          }
        } else {
          setError(data?.error || "Erreur lors de la création du paiement");
        }
      } catch (err) {
        setError(err?.response?.data?.error || err?.message || "Erreur de connexion");
      }
      setLoading(false);
    };
    init();
  }, []);

  const handleComplete = async () => {
    setVerifying(true);
    try {
      if (sessionId) {
        // Poll verification (webhook might not have processed yet)
        let attempts = 0;
        let verified = false;
        while (attempts < 5 && !verified) {
          const res = await base44.functions.invoke("stripePayment", {
            action: "verifySession",
            sessionId,
          });
          if (res?.data?.success) {
            verified = true;
            setSuccess(true);
            if (onSuccess) onSuccess(res.data);
          } else {
            attempts++;
            if (attempts < 5) await new Promise((r) => setTimeout(r, 800));
          }
        }
        if (!verified) {
          // Webhook will handle it eventually
          setSuccess(true);
          if (onSuccess) onSuccess({});
        }
      } else {
        setSuccess(true);
        if (onSuccess) onSuccess({});
      }
    } catch {
      setSuccess(true);
      if (onSuccess) onSuccess({});
    }
    setVerifying(false);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden bg-white"
        style={{ maxHeight: "90vh", display: "flex", flexDirection: "column" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 shrink-0"
          style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}
        >
          <h2 className="text-sm font-black text-gray-900">Paiement sécurisé</h2>
          {!verifying && !success && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-900 transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto" style={{ minHeight: "300px" }}>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              <p className="mt-4 text-sm font-bold text-gray-500">
                Préparation du paiement...
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 px-6">
              <AlertCircle className="w-10 h-10 text-red-500" />
              <p className="mt-4 text-sm font-bold text-gray-700 text-center">
                {error}
              </p>
              <button
                onClick={onClose}
                className="mt-6 px-4 py-2 rounded-lg text-xs font-bold text-white"
                style={{ background: "#1a1a1a" }}
              >
                Fermer
              </button>
            </div>
          ) : verifying ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              <p className="mt-4 text-sm font-bold text-gray-600">
                Vérification du paiement...
              </p>
            </div>
          ) : success ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <p className="mt-4 text-sm font-black text-gray-900">
                Paiement réussi !
              </p>
              <button
                onClick={onClose}
                className="mt-6 px-6 py-2 rounded-lg text-xs font-bold text-white"
                style={{ background: "linear-gradient(135deg, #22c55e, #16a34a)" }}
              >
                Continuer
              </button>
            </div>
          ) : (
            stripePromise &&
            clientSecret && (
              <EmbeddedCheckoutProvider
                stripe={stripePromise}
                options={{ clientSecret }}
                onComplete={handleComplete}
              >
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            )
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}