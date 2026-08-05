import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Heart, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import DonationModal from './DonationModal';

const RANK_COLORS = ['#a855f7', '#c084fc', '#9ca3af'];

export default function ProjectSupportBlock() {
  const nav = useNavigate();
  const [searchParams] = useSearchParams();
  const [topDonors, setTopDonors] = useState([]);
  const [showDonation, setShowDonation] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    // Mock data — remplacé par de vraies données quand la page de dons sera en ligne
    setTopDonors([
      { pseudo: 'NeoMatrix#1234', amount: 150 },
      { pseudo: 'CyberWolf#5678', amount: 75 },
      { pseudo: 'VoidRunner#9012', amount: 30 },
    ]);
  }, []);

  // Handle Stripe redirect: verify donation session
  useEffect(() => {
    const donationStatus = searchParams.get('donation');
    const sessionId = searchParams.get('session_id');
    if (donationStatus === 'success' && sessionId && !verifying) {
      setVerifying(true);
      base44.functions.invoke('stripePayment', { action: 'verifySession', sessionId })
        .then(res => {
          if (res?.data?.success) {
            toast.success('Merci pour ton don ! 💚', { description: 'Ton soutien compte énormément.' });
          }
        })
        .catch(() => {})
        .finally(() => setVerifying(false));
    }
  }, [searchParams]);

  const handleSupport = () => {
    setShowDonation(true);
  };

  return (
    <div className="mt-4 rounded-2xl p-5"
      style={{
        background: 'rgba(15,10,25,0.6)',
        border: '1px solid rgba(168,85,247,0.15)',
      }}>
      {/* Support button */}
      <div className="flex flex-col items-center mb-4">
        <p className="text-xs text-white/50 text-center mb-3">
          Soutenez le développement de MATRIX et débloquez des récompenses exclusives
        </p>
        <button
          onClick={handleSupport}
          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black text-white transition hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, #a855f7, #6d28d9)',
            boxShadow: '0 0 25px rgba(168,85,247,0.5), 0 0 10px rgba(168,85,247,0.3)',
          }}
        >
          <Heart className="w-4 h-4" fill="white" />
          Soutenir
        </button>
      </div>

      <DonationModal open={showDonation} onClose={() => setShowDonation(false)} />

      {/* Top 3 Donors */}
      <div className="pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-4 h-4" style={{ color: '#a855f7' }} />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Top 3 Donateurs (90 derniers jours)
          </h3>
        </div>
        {topDonors.length === 0 ? (
          <p className="text-xs text-white/40 text-center py-4">Aucun donateur pour le moment.</p>
        ) : (
          <div className="space-y-2">
            {topDonors.map((donor, i) => (
              <div key={i}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: `1px solid ${RANK_COLORS[i]}20`,
                }}
              >
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                  style={{ background: `${RANK_COLORS[i]}20`, color: RANK_COLORS[i] }}>
                  {i + 1}
                </span>
                <span className="flex-1 text-sm font-bold text-white truncate">{donor.pseudo}</span>
                <span className="text-xs font-mono font-bold shrink-0" style={{ color: RANK_COLORS[i] }}>
                  {donor.amount}€
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}