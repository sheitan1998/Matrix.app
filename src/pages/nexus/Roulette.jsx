import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { ROULETTE_BACKGROUND_IMAGE } from '@/lib/rouletteAssets';
import { SPEECH_LOCALES, buildDealerMessage, resolveRouletteLang, rouletteStrings } from '@/lib/rouletteI18n';
import useSpeechAnnounce from '@/hooks/useSpeechAnnounce';
import RouletteImageWheel from '@/components/roulette/RouletteImageWheel';
import RouletteBetGrid from '@/components/roulette/RouletteBetGrid';
import RouletteControls from '@/components/roulette/RouletteControls';
import RouletteHistory from '@/components/roulette/RouletteHistory';
import RouletteDealer from '@/components/roulette/RouletteDealer';
import RouletteWallet from '@/components/roulette/RouletteWallet';

export default function Roulette() {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [chip, setChip] = useState(100);
  const [bets, setBets] = useState({});
  const [spinning, setSpinning] = useState(false);
  const [spinToken, setSpinToken] = useState(0);
  const [targetNumber, setTargetNumber] = useState(0);
  const [lastGain, setLastGain] = useState(0);
  const [history, setHistory] = useState([]);
  const [bubble, setBubble] = useState({ visible: false, message: '', number: null });

  const pendingRef = useRef(null);
  const bubbleTimer = useRef(null);
  const { speak } = useSpeechAnnounce();

  const language = resolveRouletteLang(user);
  const labels = useMemo(() => rouletteStrings(language), [language]);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    base44.functions
      .invoke('casinoEngine', { action: 'getBalance' })
      .then((res) => setBalance(res?.data?.balance ?? 0))
      .catch(() => {});
    return () => clearTimeout(bubbleTimer.current);
  }, []);

  const totalStake = useMemo(
    () => Object.values(bets).reduce((sum, value) => sum + value, 0),
    [bets],
  );

  const placeBet = (key) => {
    if (spinning) return;
    const amount = Math.max(0, Math.floor(Number(chip) || 0));
    if (amount <= 0) return;
    if (totalStake + amount > balance) {
      toast.error(labels.insufficient);
      return;
    }
    setBets((current) => ({ ...current, [key]: (current[key] || 0) + amount }));
  };

  const finishSpin = useCallback(() => {
    const result = pendingRef.current;
    pendingRef.current = null;
    setSpinning(false);
    if (!result) return;

    setBalance(result.balance);
    setBets({});
    setLastGain(result.net > 0 ? result.net : 0);
    setHistory((current) =>
      [{ number: result.number, gain: Math.max(0, result.net), at: Date.now() }, ...current].slice(0, 12),
    );

    const message = buildDealerMessage(language, {
      number: result.number,
      gain: Math.max(0, result.net),
      win: result.net > 0,
    });
    setBubble({ visible: true, message, number: result.number });
    speak(message, SPEECH_LOCALES[language] || 'en-US');

    clearTimeout(bubbleTimer.current);
    bubbleTimer.current = setTimeout(
      () => setBubble((current) => ({ ...current, visible: false })),
      5000,
    );
  }, [language, speak]);

  const spin = async () => {
    if (spinning) return;
    if (totalStake <= 0) {
      toast.error(labels.noBets);
      return;
    }
    if (totalStake > balance) {
      toast.error(labels.insufficient);
      return;
    }

    setSpinning(true);
    setBubble((current) => ({ ...current, visible: false }));
    clearTimeout(bubbleTimer.current);

    try {
      const res = await base44.functions.invoke('rouletteSpin', {
        bets: Object.entries(bets).map(([key, amount]) => ({ key, amount })),
      });
      const data = res?.data || res;
      if (data?.error) {
        setSpinning(false);
        toast.error(data.error);
        return;
      }
      pendingRef.current = data;
      setTargetNumber(data.number ?? 0);
      setSpinToken((token) => token + 1);
    } catch (error) {
      setSpinning(false);
      toast.error(error?.message || 'Erreur de connexion');
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#07040b]">
      {/* Décor : salon de casino violet et or */}
      <img
        src={ROULETTE_BACKGROUND_IMAGE}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="pointer-events-none absolute inset-0 bg-[#06030a]/70" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 12% 4%, rgba(139,92,246,0.26), transparent 46%), radial-gradient(circle at 88% 0%, rgba(230,192,105,0.16), transparent 44%), radial-gradient(circle at 50% 108%, rgba(76,29,149,0.32), transparent 58%)',
        }}
      />

      <div className="relative mx-auto w-full max-w-[1440px] px-4 pb-8 pt-5 lg:px-6">
        {/* Header */}
        <header className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-full border"
              style={{
                borderColor: 'rgba(230,192,105,0.5)',
                background: 'radial-gradient(circle at 35% 30%, #3b2410, #0c0710)',
                boxShadow: '0 0 20px rgba(230,192,105,0.25)',
              }}
            >
              <Sparkles className="h-5 w-5 text-amber-300" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">{labels.title}</h1>
              <p className="text-xs text-white/45 sm:text-sm">{labels.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-1.5 pl-1.5 pr-4">
            <span
              className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full text-[11px] font-black text-white"
              style={{ background: 'linear-gradient(135deg, #8B5CF6, #4c1d95)' }}
            >
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                (user?.full_name || 'M').charAt(0).toUpperCase()
              )}
            </span>
            <span className="max-w-[140px] truncate text-xs font-bold text-white/85">
              {user?.full_name || 'MatrixUser'}
            </span>
          </div>
        </header>

        <div className="grid gap-4 xl:grid-cols-12">
          {/* Roue + croupière */}
          <div className="xl:col-span-5">
            <div
              className="rounded-3xl border p-3 sm:p-4"
              style={{
                borderColor: 'rgba(230,192,105,0.24)',
                background: 'linear-gradient(160deg, rgba(24,12,32,0.80), rgba(8,5,12,0.90))',
                backdropFilter: 'blur(6px)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 24px 60px rgba(0,0,0,0.6)',
              }}
            >
              <div className="relative">
                <RouletteImageWheel
                  spinToken={spinToken}
                  targetNumber={targetNumber}
                  onDone={finishSpin}
                />
                <RouletteDealer message={bubble.message} number={bubble.number} visible={bubble.visible} />
              </div>

              <RouletteWallet
                balance={balance}
                lastGain={lastGain}
                labels={labels}
                language={language}
              />
            </div>
          </div>

          {/* Grille de paris + historique */}
          <div className="space-y-3 xl:col-span-7">
            <RouletteBetGrid
              bets={bets}
              onBet={placeBet}
              onClear={() => !spinning && setBets({})}
              disabled={spinning}
              labels={labels}
              language={language}
            />

            <RouletteHistory history={history} labels={labels} />
          </div>
        </div>

        {/* Panneau de mise */}
        <div className="mt-4">
          <RouletteControls
            chip={chip}
            onChangeChip={setChip}
            onSpin={spin}
            spinning={spinning}
            canSpin={totalStake > 0}
            totalStake={totalStake}
            labels={labels}
            language={language}
          />
        </div>
      </div>
    </div>
  );
}