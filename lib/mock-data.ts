import type { Currency } from './format';

/* -------------------------------------------------------------------------- */
/* Countries & local money rails                                              */
/* -------------------------------------------------------------------------- */
export type CountryCode = 'NG' | 'GH' | 'KE' | 'ZA';

export const COUNTRIES: { code: CountryCode; name: string; currency: Currency; rails: string[]; buyerRails: string[] }[] = [
  { code: 'NG', name: 'Nigeria', currency: 'NGN', rails: ['GTBank', 'Opay', 'Palmpay', 'Cash'], buyerRails: ['Opay', 'Palmpay', 'Bank transfer'] },
  { code: 'GH', name: 'Ghana', currency: 'GHS', rails: ['MTN MoMo', 'GCB Bank', 'Vodafone Cash', 'Cash'], buyerRails: ['MTN MoMo', 'Vodafone Cash', 'AirtelTigo Money'] },
  { code: 'KE', name: 'Kenya', currency: 'KES', rails: ['M-Pesa', 'KCB', 'Airtel Money', 'Cash'], buyerRails: ['M-Pesa', 'Airtel Money'] },
  { code: 'ZA', name: 'South Africa', currency: 'ZAR', rails: ['Capitec', 'FNB', 'Cash', 'Retail wallet'], buyerRails: ['Instant EFT', 'Capitec Pay'] },
];
export const country = (code: CountryCode) => COUNTRIES.find((c) => c.code === code)!;

/* -------------------------------------------------------------------------- */
/* Money dashboard (all amounts in NGN, converted for display)                */
/* -------------------------------------------------------------------------- */
export const MONTH = {
  income: 620_000,
  expenses: 412_300,
  incomeSources: [
    { name: 'Design clients', amount: 420_000 },
    { name: 'Banana Market', amount: 150_000 },
    { name: 'Family gifts', amount: 50_000 },
  ],
};

export const CATEGORIES = [
  { name: 'Food', amount: 96_500, icon: '🍲' },
  { name: 'School', amount: 85_000, icon: '🎓' },
  { name: 'Transport', amount: 68_000, icon: '🚌' },
  { name: 'Family', amount: 60_000, icon: '🏠' },
  { name: 'Data', amount: 24_000, icon: '📶' },
  { name: 'Airtime', amount: 12_500, icon: '📞' },
];

export const WEEK = [
  { d: 'Mon', in: 0, out: 14_200 },
  { d: 'Tue', in: 85_000, out: 22_800 },
  { d: 'Wed', in: 0, out: 9_400 },
  { d: 'Thu', in: 150_000, out: 31_000 },
  { d: 'Fri', in: 0, out: 46_500 },
  { d: 'Sat', in: 30_000, out: 38_200 },
  { d: 'Sun', in: 0, out: 12_100 },
];

export const SOURCES: Record<CountryCode, { name: string; kind: string; balance: number }[]> = {
  NG: [
    { name: 'GTBank', kind: 'Bank', balance: 184_500 },
    { name: 'Opay', kind: 'Mobile money', balance: 62_300 },
    { name: 'Palmpay', kind: 'Mobile money', balance: 22_400 },
    { name: 'Cash', kind: 'On hand', balance: 15_000 },
  ],
  GH: [
    { name: 'MTN MoMo', kind: 'Mobile money', balance: 96_000 },
    { name: 'GCB Bank', kind: 'Bank', balance: 148_000 },
    { name: 'Vodafone Cash', kind: 'Mobile money', balance: 18_400 },
    { name: 'Cash', kind: 'On hand', balance: 9_000 },
  ],
  KE: [
    { name: 'M-Pesa', kind: 'Mobile money', balance: 88_000 },
    { name: 'KCB', kind: 'Bank', balance: 162_000 },
    { name: 'Airtel Money', kind: 'Mobile money', balance: 12_000 },
    { name: 'Cash', kind: 'On hand', balance: 11_000 },
  ],
  ZA: [
    { name: 'Capitec', kind: 'Bank', balance: 171_000 },
    { name: 'FNB', kind: 'Bank', balance: 94_000 },
    { name: 'Cash', kind: 'On hand', balance: 8_000 },
    { name: 'Retail wallet', kind: 'Prepaid', balance: 5_500 },
  ],
};

export const BILLS: Record<CountryCode, { name: string; amount: number; due: string; icon: string }[]> = {
  NG: [
    { name: 'Electricity token', amount: 15_000, due: 'Fri', icon: '💡' },
    { name: 'MTN data bundle', amount: 6_500, due: 'Sun', icon: '📶' },
    { name: 'DStv Compact', amount: 15_700, due: 'in 6 days', icon: '📺' },
    { name: 'Rent · Yaba', amount: 120_000, due: 'in 11 days', icon: '🏠' },
  ],
  GH: [
    { name: 'ECG prepaid', amount: 14_000, due: 'Fri', icon: '💡' },
    { name: 'MTN data bundle', amount: 6_000, due: 'Sun', icon: '📶' },
    { name: 'DStv Compact', amount: 16_000, due: 'in 6 days', icon: '📺' },
    { name: 'Rent · Osu', amount: 110_000, due: 'in 11 days', icon: '🏠' },
  ],
  KE: [
    { name: 'KPLC tokens', amount: 12_500, due: 'Fri', icon: '💡' },
    { name: 'Safaricom data', amount: 6_200, due: 'Sun', icon: '📶' },
    { name: 'Showmax', amount: 4_800, due: 'in 6 days', icon: '📺' },
    { name: 'Rent · Kilimani', amount: 118_000, due: 'in 11 days', icon: '🏠' },
  ],
  ZA: [
    { name: 'Eskom prepaid', amount: 16_000, due: 'Fri', icon: '💡' },
    { name: 'Vodacom data', amount: 7_000, due: 'Sun', icon: '📶' },
    { name: 'DStv Compact', amount: 17_000, due: 'in 6 days', icon: '📺' },
    { name: 'Rent · Rosebank', amount: 130_000, due: 'in 11 days', icon: '🏠' },
  ],
};

export const SUBSCRIPTIONS = [
  { name: 'Spotify', amount: 1_700 },
  { name: 'Figma', amount: 12_000 },
  { name: 'Netflix', amount: 4_400 },
];

export const GOALS = [
  { name: 'Emergency fund', saved: 240_000, target: 600_000, note: '3 months of costs' },
  { name: 'New laptop', saved: 310_000, target: 480_000, note: 'For client work' },
  { name: 'School fees · Term 2', saved: 85_000, target: 150_000, note: 'Due in 5 weeks' },
];

/* -------------------------------------------------------------------------- */
/* Learn money                                                                */
/* -------------------------------------------------------------------------- */
export type Lesson = {
  slug: string;
  title: string;
  minutes: number;
  blurb: string;
  screens: { title: string; body: string; emoji: string }[];
  quiz: { q: string; options: string[]; answer: number; why: string };
};

export const LESSONS: Lesson[] = [
  {
    slug: 'inflation',
    title: 'What is inflation?',
    minutes: 3,
    blurb: 'Why the same ₦1,000 buys less than it did last year.',
    screens: [
      { emoji: '🛒', title: 'Prices go up. Money buys less.', body: 'Inflation is the slow rise in prices over time. The rice you bought for ₦50,000 last year may cost ₦80,000 today.' },
      { emoji: '📉', title: 'Your money quietly shrinks', body: 'Cash under the mattress loses buying power every month. The number stays the same — what it can buy does not.' },
      { emoji: '🧭', title: 'How people protect themselves', body: 'Some keep savings in a stable currency, some buy things they will need anyway, and some earn in more than one currency.' },
      { emoji: '🍌', title: 'Where Banana fits', body: 'Later you will meet stablecoins — digital dollars built to hold their value. First, we make sure the idea makes sense.' },
    ],
    quiz: {
      q: 'If prices rise 20% but your savings stay the same, what happened to your buying power?',
      options: ['It went up', 'It went down', 'Nothing changed'],
      answer: 1,
      why: 'Same number, higher prices — so the money buys less.',
    },
  },
  {
    slug: 'scams',
    title: 'How do I protect myself from scams?',
    minutes: 4,
    blurb: 'Five patterns behind almost every money scam. Required before large sends.',
    screens: [
      { emoji: '🚩', title: 'Scams create pressure', body: '“Act now.” “Only 10 minutes left.” Real payments and real jobs can wait while you check.' },
      { emoji: '🎁', title: 'If it sounds too good…', body: 'Guaranteed returns, doubled deposits, or a stranger who wants to “invest for you” are the classic signs.' },
      { emoji: '🔑', title: 'Never share codes or PINs', body: 'Nobody from Banana, your bank, or your mobile-money provider will ever ask for your PIN or a one-time code.' },
      { emoji: '🔎', title: 'Check before you send', body: 'Confirm the name, ask a friend, and start with a small test amount. Sent money is usually hard to bring back.' },
    ],
    quiz: {
      q: 'Someone you met online says they will double your money if you send it today. What do you do?',
      options: ['Send a small amount to test', 'Ignore it — this is a scam pattern', 'Ask them for more proof'],
      answer: 1,
      why: 'Guaranteed doubling plus a deadline is the textbook pattern. Walk away.',
    },
  },
  {
    slug: 'stablecoin',
    title: 'How does a stablecoin work?',
    minutes: 4,
    blurb: 'Digital money that stays worth one dollar.',
    screens: [
      { emoji: '💵', title: 'A digital dollar', body: 'A stablecoin is a digital token designed to stay worth about one US dollar — so $10 today is still $10 next week.' },
      { emoji: '🏦', title: 'Backed by real reserves', body: 'The company that issues it holds real dollars and short-term government bonds to back every token in circulation.' },
      { emoji: '⚡', title: 'Moves like a message', body: 'You can send it across borders in seconds, any day of the week, for a tiny fee. No bank holiday. No wire delay.' },
      { emoji: '⚠️', title: 'Not risk-free', body: 'Not every stablecoin is equal. Choose ones that are regulated, audited, and widely used. We will start with the best-known.' },
    ],
    quiz: {
      q: 'What makes a stablecoin “stable”?',
      options: ['It is backed by real reserves', 'It only goes up in price', 'A celebrity endorses it'],
      answer: 0,
      why: 'Reserves held by the issuer are what keep the value close to one dollar.',
    },
  },
  {
    slug: 'usdc',
    title: 'What’s USDC?',
    minutes: 3,
    blurb: 'The digital dollar Banana uses to pay creators.',
    screens: [
      { emoji: '🪙', title: 'USDC is a digital dollar', body: 'One USDC is designed to always be worth one US dollar. It is issued by Circle, a regulated US company.' },
      { emoji: '🌍', title: 'Why Africans use it', body: 'Freelancers get paid from abroad without waiting days. Small businesses hold value when the local currency wobbles.' },
      { emoji: '🍌', title: 'How Banana uses it', body: 'When someone buys your product, they pay in naira, cedis or shillings. You receive USDC in your Digital Wallet — and can cash out to local money whenever you like.' },
      { emoji: '👛', title: 'You need somewhere to keep it', body: 'That somewhere is a Digital Wallet. It is like a bank account you control — and Banana can set one up for you in seconds.' },
    ],
    quiz: {
      q: 'You sell a design for ₦15,000. In Banana Market, what do you receive?',
      options: ['A cheque', 'About $9 in USDC in your Digital Wallet', 'A meme coin'],
      answer: 1,
      why: 'Buyers pay in local money; sellers receive stablecoin settlement.',
    },
  },
  {
    slug: 'wallet',
    title: 'What’s a wallet?',
    minutes: 3,
    blurb: 'A safe place for digital money — and how Banana keeps yours safe.',
    screens: [
      { emoji: '👛', title: 'A wallet holds digital money', body: 'Just like a physical wallet holds notes, a digital wallet holds stablecoins so you can receive, save, and send them.' },
      { emoji: '🔐', title: 'Only you can spend from it', body: 'Access is protected by your account, your PIN, and your phone. Banana never shows you a scary string of words to memorise.' },
      { emoji: '🧾', title: 'Every move leaves a receipt', body: 'Each payment creates a receipt you can open later. Most people never need the technical details — but they are there.' },
      { emoji: '🚪', title: 'It is yours, not ours', body: 'As you grow, you can export your Digital Wallet and use it anywhere. Start simple. Leave the door open.' },
    ],
    quiz: {
      q: 'What can you do with a Digital Wallet on Banana?',
      options: ['Only look at it', 'Receive, save and send stablecoins', 'Buy lottery tickets'],
      answer: 1,
      why: 'Receive creator income and bounties, save, send, and cash out.',
    },
  },
  {
    slug: 'gas',
    title: 'What does gas mean?',
    minutes: 3,
    blurb: 'The tiny network fee you almost never see — and why.',
    screens: [
      { emoji: '⛽', title: 'Gas is a network fee', body: 'Every time money moves on a blockchain, computers around the world do a little work to record it. Gas is the small fee that pays them.' },
      { emoji: '🪙', title: 'Usually a fraction of a cent', body: 'On the networks Banana uses, fees are tiny. Banana covers them for normal payments so you never have to think about it.' },
      { emoji: '✍️', title: 'Signing and approving', body: 'Some apps ask you to “sign a transaction” or “approve a token”. That is a permission slip. Only ever approve things you started yourself.' },
      { emoji: '🗝️', title: 'Seed phrases: never share them', body: 'A seed phrase is a master password written as words. Anyone who has it can take everything. Banana keeps your access safe so you never have to hold one — but if another app asks, never type it anywhere.' },
    ],
    quiz: {
      q: 'A stranger asks for your seed phrase to “fix” your wallet. What do you do?',
      options: ['Send it quickly', 'Refuse and report it', 'Send half of it'],
      answer: 1,
      why: 'Nobody legitimate will ever ask for it.',
    },
  },
];
export const lesson = (slug: string) => LESSONS.find((l) => l.slug === slug);

export const TRACKS = [
  { id: 'freshman', level: 'Freshman', title: 'Money basics', blurb: 'Prices, savings, and how to stay safe.', lessons: ['inflation', 'scams'] },
  { id: 'sophomore', level: 'Sophomore', title: 'Stablecoins, plainly', blurb: 'Digital dollars, explained without jargon.', lessons: ['stablecoin', 'usdc'] },
  { id: 'junior', level: 'Junior', title: 'Your Digital Wallet', blurb: 'What it is, how it stays safe, and what fees mean.', lessons: ['wallet', 'gas'] },
];

/* -------------------------------------------------------------------------- */
/* Earn                                                                       */
/* -------------------------------------------------------------------------- */
export type EarnType = 'Bounty' | 'Hackathon' | 'Freelance' | 'Grant';
export type Opportunity = {
  id: string;
  title: string;
  org: string;
  type: EarnType;
  reward: number; // USDC
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  deadline: string;
  blurb: string;
  requirements: string[];
};

export const OPPORTUNITIES: Opportunity[] = [
  { id: 'b1', title: 'Design a welcome banner for a creator store', org: 'Banana Community', type: 'Bounty', reward: 25, difficulty: 'Beginner', deadline: '6 days left', blurb: 'One 1600×600 banner for a new creator store. Purple and gold palette provided.', requirements: ['Deliver a PNG and the source file', 'Original work only', 'One revision round'] },
  { id: 'b2', title: 'Translate the “What’s USDC?” lesson into Yoruba or Pidgin', org: 'Banana Community', type: 'Bounty', reward: 20, difficulty: 'Beginner', deadline: '9 days left', blurb: 'Keep it short and friendly. Someone’s auntie should understand it on first read.', requirements: ['Native or fluent speaker', 'Keep the four-screen format', 'Reviewed by a second speaker'] },
  { id: 'h1', title: 'Onchain Lagos — 48h mini hackathon', org: 'Lagos Builders Guild', type: 'Hackathon', reward: 1500, difficulty: 'Intermediate', deadline: 'Starts in 12 days', blurb: 'Build a tool that helps small merchants get paid across borders. Teams of up to 4.', requirements: ['Working demo at the end of 48h', 'Open-source repo', 'A 3-minute video walkthrough'] },
  { id: 'f1', title: 'Community manager for a creator collective', org: 'Accra Design Collective', type: 'Freelance', reward: 300, difficulty: 'Intermediate', deadline: 'Rolling', blurb: 'Part-time, 10 hours a week. Run WhatsApp and Telegram communities for 4 creators.', requirements: ['Fluent English', 'Comfortable with WhatsApp Communities', 'Portfolio or references'] },
  { id: 'g1', title: 'Grant: Financial education for market women', org: 'Nairobi Money Lab', type: 'Grant', reward: 2000, difficulty: 'Advanced', deadline: '3 weeks left', blurb: 'Fund a six-week pilot teaching budgeting and mobile money to market traders.', requirements: ['A community you already serve', 'A simple budget', 'Two-page proposal'] },
  { id: 'b3', title: 'Record a 60-second explainer on scam safety', org: 'Joburg Founders Club', type: 'Bounty', reward: 40, difficulty: 'Intermediate', deadline: '11 days left', blurb: 'One vertical video. Real-life scenario, clear advice, subtitles.', requirements: ['Vertical 9:16', 'Subtitles', 'No stock footage'] },
  { id: 'f2', title: 'Landing page in Next.js for an African startup', org: 'Kigali Build Hub', type: 'Freelance', reward: 450, difficulty: 'Advanced', deadline: 'Rolling', blurb: 'Marketing site, five sections, responsive, delivered in two weeks.', requirements: ['Next.js + Tailwind', 'Lighthouse 90+', 'Two references'] },
  { id: 'b4', title: 'Test-buy three products and write down what confused you', org: 'Banana Market Team', type: 'Bounty', reward: 15, difficulty: 'Beginner', deadline: '4 days left', blurb: 'Try checkout with mobile money. Tell us where you paused.', requirements: ['Use a real phone', 'Screenshots of each step', 'Honest feedback'] },
];

/* -------------------------------------------------------------------------- */
/* Market                                                                     */
/* -------------------------------------------------------------------------- */
export type ArtKind = 'logo' | 'chart' | 'kit' | 'people' | 'ticket' | 'course' | 'game';
export type Product = {
  id: string;
  handle: string;
  title: string;
  blurb: string;
  price: { amount: number; currency: Currency };
  category: string;
  art: ArtKind;
  file: { name: string; size: string };
  includes: string[];
};
export type Store = { handle: string; name: string; tagline: string; country: CountryCode; hue: number };

export const CATEGORIES_MARKET = ['All', 'Designs', 'Templates', 'Courses', 'Services', 'Tickets', 'Gaming items'];

export const STORES: Store[] = [
  { handle: 'rhydar', name: 'Rhydar’s Store', tagline: 'Nigerian designer. Digital products. Instant delivery.', country: 'NG', hue: 268 },
  { handle: 'amara', name: 'Amara Templates', tagline: 'Templates for community builders. Made in Accra.', country: 'GH', hue: 38 },
  { handle: 'kofi', name: 'Kofi Dev', tagline: 'Playbooks for shipping and growing products.', country: 'GH', hue: 165 },
  { handle: 'wanjiru', name: 'Wanjiru Live', tagline: 'Tickets and passes for Nairobi creative nights.', country: 'KE', hue: 330 },
  { handle: 'thabo', name: 'Thabo Plays', tagline: 'Game items and skins from Johannesburg.', country: 'ZA', hue: 210 },
];

export const PRODUCTS: Product[] = [
  { id: 'logo-design', handle: 'rhydar', title: 'Logo Design', blurb: 'A custom logo pack: three concepts, a final mark, and full brand files for social, print and web.', price: { amount: 15000, currency: 'NGN' }, category: 'Designs', art: 'logo', file: { name: 'rhydar-logo-design-pack.zip', size: '48 MB' }, includes: ['3 initial concepts', 'Final logo in SVG, PNG and PDF', 'Colour and font guide', 'Social media avatars'] },
  { id: 'monad-africa-growth-playbook', handle: 'rhydar', title: 'Monad Africa Growth Playbook', blurb: 'A practical playbook for growing an onchain community in Africa: content, partnerships, ambassadors.', price: { amount: 5, currency: 'USD' }, category: 'Courses', art: 'chart', file: { name: 'monad-africa-growth-playbook.pdf', size: '6 MB' }, includes: ['42-page PDF', 'Content calendar template', 'Ambassador program outline'] },
  { id: 'web3-community-templates', handle: 'rhydar', title: 'Web3 Community Templates', blurb: 'Notion and Figma templates for onboarding, announcements and community rules.', price: { amount: 3, currency: 'USD' }, category: 'Templates', art: 'kit', file: { name: 'web3-community-templates.zip', size: '12 MB' }, includes: ['12 Notion templates', 'Figma announcement pack', 'Community rules starter'] },
  { id: 'community-management', handle: 'rhydar', title: 'Community Management Service', blurb: 'One month of community management for your Telegram or WhatsApp group.', price: { amount: 50, currency: 'USD' }, category: 'Services', art: 'people', file: { name: 'community-management-onboarding.pdf', size: '1 MB' }, includes: ['Weekly content plan', 'Daily moderation', 'End-of-month report'] },

  { id: 'web3-community-kit', handle: 'amara', title: 'Web3 Community Kit', blurb: 'Everything you need to launch a community: welcome flows, roles, event checklists.', price: { amount: 3, currency: 'USD' }, category: 'Templates', art: 'kit', file: { name: 'web3-community-kit.zip', size: '9 MB' }, includes: ['Welcome message pack', 'Roles and permissions guide', 'Event checklist'] },
  { id: 'brand-story-template', handle: 'amara', title: 'Brand Story Template', blurb: 'Tell your brand story in one page. Notion template with prompts.', price: { amount: 5000, currency: 'NGN' }, category: 'Templates', art: 'course', file: { name: 'brand-story-template.zip', size: '3 MB' }, includes: ['Notion template', 'Worked example', 'Prompt cheat sheet'] },

  { id: 'growth-playbook', handle: 'kofi', title: 'Growth Playbook', blurb: 'Ship, measure, and grow a small product without a marketing team.', price: { amount: 10, currency: 'USD' }, category: 'Courses', art: 'chart', file: { name: 'kofi-growth-playbook.pdf', size: '14 MB' }, includes: ['60-page PDF', 'Metrics spreadsheet', 'Launch checklist'] },
  { id: 'dev-portfolio-kit', handle: 'kofi', title: 'Developer Portfolio Kit', blurb: 'A polished portfolio template in Next.js, ready to deploy in an afternoon.', price: { amount: 8000, currency: 'NGN' }, category: 'Templates', art: 'kit', file: { name: 'dev-portfolio-kit.zip', size: '22 MB' }, includes: ['Next.js starter', 'Three colour themes', 'Deploy guide'] },

  { id: 'night-market-pass', handle: 'wanjiru', title: 'Night Market · Nairobi', blurb: 'Entry pass for the monthly creative night market. Delivered as a QR ticket.', price: { amount: 6, currency: 'USD' }, category: 'Tickets', art: 'ticket', file: { name: 'night-market-ticket.pdf', size: '1 MB' }, includes: ['QR entry ticket', 'One free drink token'] },

  { id: 'starter-skin-pack', handle: 'thabo', title: 'Starter Skin Pack', blurb: 'Twelve cosmetic skins for popular mobile games. Instant code delivery.', price: { amount: 4, currency: 'USD' }, category: 'Gaming items', art: 'game', file: { name: 'starter-skin-pack-codes.txt', size: '4 KB' }, includes: ['12 redemption codes', 'Instructions'] },
];
export const store = (handle: string) => STORES.find((s) => s.handle === handle);
export const productsOf = (handle: string) => PRODUCTS.filter((p) => p.handle === handle);
