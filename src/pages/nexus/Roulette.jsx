import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';
import { ROULETTE_BACKGROUND_IMAGE } from '@/lib/rouletteAssets';
import {
  SPEECH_LOCALES,
  buildDealerMessage,
  dealerDetails,
  resolveRouletteLang,
  rouletteStrings } from
'@/lib/rouletteI18n';
import { formatCoins } from '@/lib/rouletteTable';
import useSpeechAnnounce from '@/hooks/useSpeechAnnounce';
import useRouletteConfig from '@/hooks/useRouletteConfig';
import useIsDesktop from '@/hooks/useIsDesktop';
import RouletteLuxuryWheel from '@/components/roulette/RouletteLuxuryWheel';
import RouletteBetGrid from '@/components/roulette/RouletteBetGrid';
import RouletteControls from '@/components/roulette/RouletteControls';
import RouletteHistory from '@/components/roulette/RouletteHistory';
import RouletteDealer from '@/components/roulette/RouletteDealer';
import RouletteWallet from '@/components/roulette/RouletteWallet';

const panelStyle = (x, y, width, scale = 100) => ({
  position: 'absolute',
  left: `${Number(x) || 0}%`,
  top: `${Number(y) || 0}%`,
  width: `${width * (Number(scale) || 100) / 100}%`,
  transform: 'translate(-50%, -50%)'
});

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
  const [bubble, setBubble] = useState({ message: '', number: null });

  const pendingRef = useRef(null);
  const config = useRouletteConfig();
  const isDesktop = useIsDesktop();
  const { speak } = useSpeechAnnounce();

  const language = resolveRouletteLang(user);
  const labels = useMemo(() => rouletteStrings(language), [language]);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
    base44.functions.
    invoke('casinoEngine', { action: 'getBalance' }).
    then((res) => setBalance(res?.data?.balance ?? 0)).
    catch(() => {});
  }, []);

  const totalStake = useMemo(
    () => Object.values(bets).reduce((sum, value) => sum + value, 0),
    [bets]
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

  const composeDealerMessage = (result) => {
    const gain = Math.max(0, result.net);
    const template =
    result.number === 0 ?
    config.dealer_message_zero :
    result.net > 0 ?
    config.dealer_message_win :
    config.dealer_message_lose;

    if (!template) {
      return buildDealerMessage(language, { number: result.number, gain, win: result.net > 0 });
    }

    return template.
    replaceAll('{n}', String(result.number)).
    replaceAll('{details}', dealerDetails(language, result.number)).
    replaceAll('{gain}', formatCoins(gain, language));
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
    [{ number: result.number, gain: Math.max(0, result.net), at: Date.now() }, ...current].slice(0, 12)
    );

    const message = composeDealerMessage(result);
    setBubble({ message, number: result.number });
    speak(message, SPEECH_LOCALES[language] || 'en-US');
  }, [language, speak, config]);

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

    try {
      const res = await base44.functions.invoke('rouletteSpin', {
        bets: Object.entries(bets).map(([key, amount]) => ({ key, amount }))
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

  const dealerMessage = bubble.message || config.dealer_message_greeting || labels.subtitle;

  const wheelCard =
  <div>
      <RouletteLuxuryWheel
      spinToken={spinToken}
      targetNumber={targetNumber}
      onDone={finishSpin}
      railScale={config.accoudoir_scale} />
      <RouletteWallet balance={balance} lastGain={lastGain} labels={labels} language={language} />
    </div>;


  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#07040b]">
      {/* Décor : salon de casino violet et or */}
      <img
        src={ROULETTE_BACKGROUND_IMAGE}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center" />
      
      <div className="pointer-events-none absolute inset-0 bg-[#06030a]/70" />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
          'radial-gradient(circle at 12% 4%, rgba(139,92,246,0.26), transparent 46%), radial-gradient(circle at 88% 0%, rgba(230,192,105,0.16), transparent 44%), radial-gradient(circle at 50% 108%, rgba(76,29,149,0.32), transparent 58%)'
        }} />
      

      <div className="relative mx-auto w-full max-w-[1440px] px-4 pb-8 pt-5 lg:px-6">
        {/* Header */}
        <header className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-full border"
              style={{
                borderColor: 'rgba(230,192,105,0.5)',
                background: 'radial-gradient(circle at 35% 30%, #3b2410, #0c0710)',
                boxShadow: '0 0 20px rgba(230,192,105,0.25)'
              }}>
              
              <Sparkles className="h-5 w-5 text-amber-300" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">{labels.title}</h1>
              <p className="text-xs text-white/45 sm:text-sm">{labels.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] py-1.5 pl-1.5 pr-4 hidden">
            <span
              className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full text-[11px] font-black text-white"
              style={{ background: 'linear-gradient(135deg, #8B5CF6, #4c1d95)' }}>
              
              {user?.avatar_url ?
              <img src={user.avatar_url} alt="" className="h-full w-full object-cover" /> :

              (user?.full_name || 'M').charAt(0).toUpperCase()
              }
            </span>
            <span className="max-w-[140px] truncate text-xs font-bold text-white/85">
              {user?.full_name || 'MatrixUser'}
            </span>
          </div>
        </header>

        {isDesktop ?
        <div className="relative h-[820px]">
            {/* Croupière à gauche */}
            <div style={panelStyle(13, 45, 22, config.dealer_scale)}>
              <RouletteDealer
              message={dealerMessage}
              number={bubble.number}
              scale={config.dealer_scale} />
            </div>

            {/* Roue */}
            <div style={panelStyle(43, 46, 40, config.wheel_scale)}>{wheelCard}</div>

            {/* Panneau de mises + historique */}
            <div
            style={panelStyle(config.bet_panel_pos_x, config.bet_panel_pos_y, 36, config.bet_panel_scale)}
            className="space-y-3">
            
              <RouletteBetGrid
              bets={bets}
              onBet={placeBet}
              onClear={() => !spinning && setBets({})}
              disabled={spinning}
              labels={labels}
              language={language} />
            
              <RouletteHistory history={history} labels={labels} />
            </div>

            {/* Boutons de l'interface */}
            <div style={panelStyle(config.controls_pos_x, config.controls_pos_y, 36, config.controls_scale)}>
              <RouletteControls
              chip={chip}
              onChangeChip={setChip}
              onSpin={spin}
              spinning={spinning}
              canSpin={totalStake > 0}
              totalStake={totalStake}
              labels={labels}
              language={language} />
            
            </div>
          </div> :

        <div className="mt-4 space-y-4">
            <RouletteDealer
            message={dealerMessage}
            number={bubble.number}
            scale={config.dealer_scale} />
            {wheelCard}
            <RouletteBetGrid
            bets={bets}
            onBet={placeBet}
            onClear={() => !spinning && setBets({})}
            disabled={spinning}
            labels={labels}
            language={language} />
          
            <RouletteHistory history={history} labels={labels} />
            <RouletteControls
            chip={chip}
            onChangeChip={setChip}
            onSpin={spin}
            spinning={spinning}
            canSpin={totalStake > 0}
            totalStake={totalStake}
            labels={labels}
            language={language} />
          
          </div>
        }
      </div>
    </div>);

}