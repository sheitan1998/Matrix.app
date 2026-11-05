import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Coins, Trophy, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { formatCoins, rouletteColor } from '@/lib/rouletteTable';
import { SPEECH_LOCALES, buildDealerMessage, resolveRouletteLang, rouletteStrings } from '@/lib/rouletteI18n';
import useSpeechAnnounce from '@/hooks/useSpeechAnnounce';
import RouletteWheel from '@/components/roulette/RouletteWheel';
import RouletteBetGrid from '@/components/roulette/RouletteBetGrid';
import RouletteControls from '@/components/roulette/RouletteControls';
import RouletteHistory from '@/components/roulette/RouletteHistory';
import RouletteDealer from '@/components/roulette/RouletteDealer';

const CHIP_STACKS = [
  { color: '#f43f5e', count: 6 },
  { color: '#facc15', count: 4 },
  { color: '#22c55e', count: 3 },
];

export default function Roulette() {
  const [user, setUser] = useState(null);
  const [balance, setBalance] = useState(0);
  const [chip, setChip] = useState(100);
  const [bets, setBets] = useState({});
  const [spinning, setSpinning] = useState(false);
  const [spinToken, setSpinToken] = useState(0);
  const [targetNumber, setTargetNumber] = useState(null);
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
      setTargetNumber(data.number);
      setSpinToken((token) => token + 1);
    } catch (error) {
      setSpinning(false);
      toast.error(error?.message || 'Erreur de connexion');
    }
  };

  const resultTone = bubble.number === null ? '#a855f7' : rouletteColor(bubble.number) === 'red'
    ? '#ef4444'
    : rouletteColor(bubble.number) === 'green'
      ? '#22c55e'
      : '#d4d4d8';

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: '#07040b' }}>
      {/* Ambience */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 18% 8%, rgba(168,85,247,0.20), transparent 45%), radial-gradient(circle at 82% 0%, rgba(230,192,105,0.13), transparent 42%), radial-gradient(circle at 50% 100%, rgba(76,29,149,0.22), transparent 55%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />

      <div className="relative mx-auto w-full max-w-[1420px] px-4 pb-8 pt-5 lg:px-6">
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

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-1.5 pl-1.5 pr-4">
              <span
                className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full text-[11px] font-black text-white"
                style={{ background: 'linear-gradient(135deg, #a855f7, #4c1d95)' }}
              >
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  (user?.full_name || 'M').charAt(0).toUpperCase()
                )}
              </span>
              <span className="max-w-[120px] truncate text-xs font-bold text-white/85">
                {user?.full_name || 'MatrixUser'}
              </span>
            </div>
            <div
              className="flex items-center gap-2 rounded-full border px-4 py-2"
              style={{ borderColor: 'rgba(230,192,105,0.45)', background: 'rgba(230,192,105,0.08)' }}
            >
              <Coins className="h-4 w-4 text-amber-300" />
              <span className="font-mono text-sm font-black text-amber-200">{formatCoins(balance, language)}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300/60">TRIX</span>
            </div>
          </div>
        </header>

        <div className="grid gap-4 xl:grid-cols-12">
          {/* Wheel + dealer */}
          <div className="xl:col-span-5">
            <div
              className="relative overflow-hidden rounded-3xl border p-4 sm:p-6"
              style={{
                borderColor: 'rgba(168,85,247,0.22)',
                background:
                  'linear-gradient(165deg, rgba(24,12,32,0.92), rgba(9,5,14,0.96))',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 24px 60px rgba(0,0,0,0.55)',
              }}
            >
              <div className="relative mx-auto w-full max-w-[430px]" style={{ perspective: '1400px' }}>
                <div
                  className="relative"
                  style={{ transform: 'rotateX(36deg) rotateZ(-6deg)', transformStyle: 'preserve-3d' }}
                >
                  <RouletteWheel targetNumber={targetNumber} spinToken={spinToken} onDone={finishSpin} />
                </div>

                {/* Table depth */}
                <div
                  className="pointer-events-none absolute inset-x-3 bottom-2 h-16 rounded-[50%] blur-2xl"
                  style={{ background: 'rgba(0,0,0,0.75)' }}
                />

                {/* Chip piles */}
                <div className="absolute bottom-4 left-2 flex items-end gap-2 sm:left-4">
                  {CHIP_STACKS.map((stack) => (
                    <div key={stack.color} className="flex flex-col-reverse items-center">
                      {Array.from({ length: stack.count }).map((_, index) => (
                        <span
                          key={index}
                          className="-mb-1 block h-2 w-6 rounded-full border border-black/40"
                          style={{
                            background: `linear-gradient(180deg, ${stack.color}, ${stack.color}99)`,
                            boxShadow: '0 1px 0 rgba(255,255,255,0.25) inset',
                            marginBottom: index === stack.count - 1 ? 0 : -5,
                          }}
                        />
                      ))}
                    </div>
                  ))}
                  <div className="ml-1 flex h-7 w-7 items-center justify-center rounded-full border border-amber-200/60 bg-gradient-to-b from-amber-300 to-amber-600 text-[9px] font-black text-black/80 shadow-lg">
                    1k
                  </div>
                </div>
              </div>

              <div className="mt-5 flex justify-center">
                <RouletteDealer message={bubble.message} number={bubble.number} visible={bubble.visible} />
              </div>

              {!bubble.visible && (
                <p className="mt-3 text-center text-[11px] text-white/30">
                  {formatCoins(totalStake, language)} TRIX · {Object.keys(bets).length} {labels.bet.toLowerCase()}
                </p>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="space-y-3 xl:col-span-7">
            <div className="grid grid-cols-2 gap-3">
              <div
                className="flex items-center gap-3 rounded-2xl border border-white/10 px-4 py-3"
                style={{ background: 'linear-gradient(150deg, rgba(20,12,28,0.9), rgba(9,5,14,0.9))' }}
              >
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ background: 'rgba(230,192,105,0.12)', border: '1px solid rgba(230,192,105,0.3)' }}
                >
                  <Coins className="h-4 w-4 text-amber-300" />
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">{labels.balance}</p>
                  <p className="font-mono text-lg font-black text-white">{formatCoins(balance, language)}</p>
                </div>
              </div>

              <div
                className="flex items-center gap-3 rounded-2xl border border-white/10 px-4 py-3"
                style={{ background: 'linear-gradient(150deg, rgba(20,12,28,0.9), rgba(9,5,14,0.9))' }}
              >
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ background: 'rgba(168,85,247,0.14)', border: '1px solid rgba(168,85,247,0.35)' }}
                >
                  <Trophy className="h-4 w-4 text-purple-300" />
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">{labels.lastWin}</p>
                  <p className="font-mono text-lg font-black" style={{ color: lastGain > 0 ? '#4ade80' : '#ffffff' }}>
                    {lastGain > 0 ? `+ ${formatCoins(lastGain, language)}` : '+ 0'}
                  </p>
                </div>
              </div>
            </div>

            <RouletteBetGrid
              bets={bets}
              onBet={placeBet}
              onClear={() => !spinning && setBets({})}
              disabled={spinning}
              labels={labels}
              language={language}
            />

            <div className="flex items-center gap-2 text-[11px] text-white/35">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: resultTone, boxShadow: `0 0 10px ${resultTone}` }}
              />
              {labels.subtitle}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="mt-4 grid gap-3 xl:grid-cols-12">
          <div className="xl:col-span-8">
            <RouletteControls
              chip={chip}
              onChangeChip={setChip}
              onSpin={spin}
              spinning={spinning}
              canSpin={totalStake > 0}
              labels={labels}
              language={language}
            />
          </div>
          <div className="xl:col-span-4">
            <RouletteHistory history={history} labels={labels} />
          </div>
        </div>
      </div>
    </div>
  );
}