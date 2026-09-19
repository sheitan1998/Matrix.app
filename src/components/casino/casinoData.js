// Shared casino data — game catalog, live tables, VIP tiers, etc.

export const SPACE_BG = "/media/tuto-gaming/e20a0d5be_ChatGPTImage2juil202604_45_31.png";

export const GAMES = [
  { key: "slots", name: "Diamond Slots", provider: "MATRIX Originals", rtp: "96.5%", minBet: 10, maxBet: 5000, players: 1247, badge: "jackpot", isHot: true, category: "slots", img: "/media/tuto-gaming/39db2083e_generated_image.png" },
  { key: "blackjack", name: "Blackjack VIP", provider: "MATRIX Originals", rtp: "99.5%", minBet: 50, maxBet: 10000, players: 856, badge: null, category: "cards", img: "/media/tuto-gaming/ee51ca22c_generated_image.png" },
  { key: "roulette", name: "Neon Roulette", provider: "MATRIX Live", rtp: "97.3%", minBet: 5, maxBet: 2000, players: 2103, badge: "live", category: "roulette", img: "/media/tuto-gaming/733333d5b_generated_image.png" },
  { key: "poker", name: "Texas Hold'em", provider: "MATRIX Originals", rtp: "98.1%", minBet: 100, maxBet: 20000, players: 643, badge: "live", isHot: true, category: "poker", img: "/media/tuto-gaming/dbd40dfba_generated_image.png" },
  { key: "bingo", name: "Cosmic Bingo", provider: "MATRIX Originals", rtp: "95.8%", minBet: 5, maxBet: 500, players: 432, badge: null, category: "instant", img: "/media/tuto-gaming/7d54fc913_generated_image.png" },
  { key: "lotto", name: "Mega Lotto", provider: "MATRIX Originals", rtp: "94.2%", minBet: 20, maxBet: 1000, players: 1789, badge: "jackpot", isHot: true, category: "instant", img: "/media/tuto-gaming/a6e5e5334_generated_image.png" },
  { key: "crash", name: "Crash X", provider: "MATRIX Originals", rtp: "97.0%", minBet: 10, maxBet: 5000, players: 3210, badge: "new", isHot: true, category: "instant", img: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=300&fit=crop" },
  { key: "mines", name: "Mines", provider: "MATRIX Originals", rtp: "97.5%", minBet: 10, maxBet: 3000, players: 1876, badge: "new", category: "instant", img: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=300&fit=crop" },
  { key: "dice", name: "Dice", provider: "MATRIX Originals", rtp: "98.0%", minBet: 5, maxBet: 5000, players: 987, badge: null, category: "instant", img: "https://images.unsplash.com/photo-1606092195730-5d7b9af1efb5?w=400&h=300&fit=crop" },
  { key: "baccarat", name: "Baccarat Pro", provider: "MATRIX Live", rtp: "98.9%", minBet: 50, maxBet: 15000, players: 421, badge: "exclusive", category: "cards", img: "/media/tuto-gaming/06ebad4f6_generated_image.png" },
  { key: "leaderboard", name: "Top League", provider: "MATRIX Originals", rtp: "—", minBet: 0, maxBet: 0, players: 5421, badge: "exclusive", category: "other", img: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&h=300&fit=crop" },
];

export const LIVE_TABLES = [
  { name: "Lightning Roulette", dealer: "Sofia", players: 842, status: "open", wait: "0:30", type: "Roulette Live" },
  { name: "Blackjack VIP", dealer: "Marcus", players: 6, status: "open", wait: "1:15", type: "Blackjack Live" },
  { name: "Baccarat Squeeze", dealer: "Yuki", players: 12, status: "full", wait: "3:00", type: "Baccarat Live" },
  { name: "Crazy Time", dealer: "Elena", players: 2154, status: "open", wait: "0:45", type: "Game Show" },
  { name: "Dream Catcher", dealer: "James", players: 876, status: "open", wait: "1:00", type: "Game Show" },
  { name: "Poker Cash", dealer: "Diego", players: 9, status: "open", wait: "2:30", type: "Poker Live" },
];

export const VIP_TIERS = [
  { name: "Bronze", color: "#cd7f32", min: 0, cashback: "2%", bonus: "5%", perks: ["Retrait standard", "Support email"] },
  { name: "Silver", color: "#c0c0c0", min: 10000, cashback: "5%", bonus: "10%", perks: ["Retrait prioritaire", "Support chat"] },
  { name: "Gold", color: "#ffd700", min: 50000, cashback: "8%", bonus: "15%", perks: ["Retrait prioritaire", "Support dédié", "Bonus hebdo"] },
  { name: "Platinum", color: "#e5e4e2", min: 250000, cashback: "12%", bonus: "25%", perks: ["Retrait express", "Manager VIP", "Cadeaux mensuels"] },
  { name: "Diamond", color: "#b9f2ff", min: 1000000, cashback: "15%", bonus: "35%", perks: ["Retrait instantané", "Concierge 24/7", "Événements exclusifs"] },
  { name: "Master", color: "#a855f7", min: 5000000, cashback: "18%", bonus: "50%", perks: ["Retrait instantané", "Concierge 24/7", "Limo & Hôtel", "Cadre profil exclusif"] },
  { name: "Elite", color: "#3b82f6", min: 10000000, cashback: "20%", bonus: "75%", perks: ["Tout Master +", "Voyages de luxe", "Mises illimitées"] },
  { name: "Legend", color: "#fbbf24", min: 50000000, cashback: "25%", bonus: "100%", perks: ["Tout Elite +", "Statut à vie", "Fondation caritative"] },
];

export const PROMOTIONS = [
  { title: "Bonus de Bienvenue", desc: "+200% sur votre premier dépôt jusqu'à 50 000 Coins", icon: "🎁", badge: "NOUVEAU", color: "#a855f7" },
  { title: "Cashback Hebdo", desc: "Récupérez jusqu'à 20% de vos pertes chaque dimanche", icon: "💰", badge: "VIP", color: "#3b82f6" },
  { title: "Free Spins Vendredi", desc: "50 tours gratuits sur Diamond Slots", icon: "🎰", badge: "POPULAIRE", color: "#fbbf24" },
  { title: "Défi Quotidien", desc: "Complétez 3 missions et gagnez 500 Coins", icon: "⚡", badge: "JOURNALIER", color: "#06b6d4" },
  { title: "Offre Limitée", desc: "Double XP pendant 24h uniquement", icon: "⏰", badge: "LIMITÉ", color: "#ef4444" },
  { title: "Événement Spécial", desc: "Tournoi Diamant — Prize Pool 1 000 000 Coins", icon: "🏆", badge: "ÉVÉNEMENT", color: "#8b5cf6" },
];

export const QUESTS = [
  { title: "Premier Pas", desc: "Jouez votre première partie", reward: "100 XP + 50 Coins", progress: 1, total: 1, done: true },
  { title: "Joueur Régulier", desc: "Jouez 10 parties", reward: "500 XP + 200 Coins", progress: 7, total: 10, done: false },
  { title: "Champion", desc: "Remportez 5 parties", reward: "1000 XP + Badge", progress: 3, total: 5, done: false },
  { title: "Social Butterfly", desc: "Invitez un ami", reward: "2000 XP + 1000 Coins", progress: 0, total: 1, done: false },
  { title: "Ascension VIP", desc: "Atteignez le niveau Gold", reward: "5000 XP + Bonus exclusif", progress: 0, total: 1, done: false },
];

export const ACHIEVEMENTS = [
  { title: "Premier Jackpot", desc: "Remportez le jackpot", icon: "💎", unlocked: true, rarity: "légendaire" },
  { title: "Centurion", desc: "Jouez 100 parties", icon: "💯", unlocked: true, rarity: "rare" },
  { title: "Millésime", desc: "Jouez 1000 parties", icon: "🎖️", unlocked: false, rarity: "épique" },
  { title: "Premier Tournoi", desc: "Participez à un tournoi", icon: "🏆", unlocked: true, rarity: "commun" },
  { title: "Millionnaire", desc: "Gagnez 1 000 000 Coins", icon: "💰", unlocked: false, rarity: "légendaire" },
  { title: "VIP", desc: "Atteignez le niveau VIP", icon: "👑", unlocked: true, rarity: "épique" },
  { title: "Légende", desc: "Atteignez le statut Legend", icon: "⚡", unlocked: false, rarity: "légendaire" },
];

export const SIDEBAR_MENU = [
  { section: "Navigation", items: [
    { label: "Accueil", icon: "Home", target: "home" },
    { label: "Favoris", icon: "Heart", target: "favorites" },
    { label: "Historique", icon: "History", target: "history" },
  ]},
  { section: "Jeux", items: [
    { label: "Machines à sous", icon: "Cherry", target: "slots", gameKey: "slots" },
    { label: "Casino Live", icon: "Radio", target: "live" },
    { label: "Blackjack", icon: "Spade", target: "blackjack", gameKey: "blackjack" },
    { label: "Roulette", icon: "Disc", target: "roulette", gameKey: "roulette" },
    { label: "Poker", icon: "Club", target: "poker", gameKey: "poker" },
    { label: "Baccarat", icon: "Diamond", target: "baccarat", gameKey: "baccarat" },
    { label: "Bingo", icon: "Grid3x3", target: "bingo", gameKey: "bingo" },
    { label: "Loto", icon: "Ticket", target: "lotto", gameKey: "lotto" },
  ]},
  { section: "Jeux Instantanés", items: [
    { label: "Crash", icon: "TrendingUp", target: "crash", gameKey: "crash" },
    { label: "Mines", icon: "Bomb", target: "mines", gameKey: "mines" },
    { label: "Dice", icon: "Dices", target: "dice", gameKey: "dice" },
  ]},
  { section: "Communauté", items: [
    { label: "VIP Club", icon: "Crown", target: "vip" },
    { label: "Tournois", icon: "Trophy", target: "tournaments" },
    { label: "Promotions", icon: "Gift", target: "promotions" },
    { label: "Classements", icon: "BarChart3", target: "leaderboards" },
    { label: "Messagerie", icon: "MessageSquare", target: "messages" },
    { label: "Support", icon: "LifeBuoy", target: "support" },
  ]},
];

export const CATEGORIES = [
  { label: "Tous les jeux", value: "all" },
  { label: "Nouveautés", value: "new" },
  { label: "Populaires", value: "hot" },
  { label: "Jackpot", value: "jackpot" },
  { label: "Machines à sous", value: "slots" },
  { label: "Live Casino", value: "live" },
  { label: "Jeux de cartes", value: "cards" },
  { label: "Roulette", value: "roulette" },
  { label: "Poker", value: "poker" },
  { label: "Blackjack", value: "blackjack" },
  { label: "Tournois", value: "tournaments" },
  { label: "Favoris", value: "favorites" },
];

export const RECENT_WINNERS_SEED = [
  { pseudo: "NeoBlaze", game: "Diamond Slots", amount: 45200, time: "Il y a 2 min", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&h=60&fit=crop" },
  { pseudo: "CyberQueen", game: "Lightning Roulette", amount: 18750, time: "Il y a 5 min", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop" },
  { pseudo: "VoidWalker", game: "Crash X", amount: 89000, time: "Il y a 8 min", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=60&h=60&fit=crop" },
  { pseudo: "LunaFox", game: "Mega Lotto", amount: 125000, time: "Il y a 12 min", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop" },
  { pseudo: "SynthKing", game: "Blackjack VIP", amount: 23000, time: "Il y a 15 min", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop" },
  { pseudo: "QuantumAce", game: "Poker Cash", amount: 67000, time: "Il y a 18 min", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=60&h=60&fit=crop" },
];

export const TOURNAMENT = {
  name: "Diamond Cup #42",
  prizePool: 1000000,
  participants: 847,
  timeLeft: { h: 4, m: 32, s: 15 },
  leaderboard: [
    { rank: 1, pseudo: "NeoBlaze", score: 458200, avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop" },
    { rank: 2, pseudo: "VoidWalker", score: 421000, avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop" },
    { rank: 3, pseudo: "QuantumAce", score: 398500, avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=40&h=40&fit=crop" },
  ],
};

export const LEADERBOARD_TABS = [
  { label: "Top Gains", value: "winnings" },
  { label: "Top Jackpot", value: "jackpot" },
  { label: "Top Joueurs", value: "players" },
  { label: "Top VIP", value: "vip" },
  { label: "Top Tournois", value: "tournaments" },
  { label: "Top Hebdo", value: "weekly" },
];