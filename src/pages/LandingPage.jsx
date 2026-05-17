import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// ── TRANSLATIONS ──────────────────────────────────────────────────────────────
const TRANSLATIONS = {
  en: {
    navLinks: ['Services', 'Pricing', 'About', 'Testimonials', 'Contact'],
    navLogin: 'Login',
    navBook: 'Book a Service',
    heroLabel: 'Professional Multi-Service Solutions',
    heroTitle1: 'Expert Repairs,',
    heroTitle2: 'On Your Schedule.',
    heroSub: 'From electrical to plumbing, HVAC to appliances — FlowPOS connects you with certified technicians ready to fix anything, fast.',
    heroCta1: 'Book a Service ↗',
    heroCta2: 'View Services',
    servicesLabel: 'What We Offer',
    servicesTitle1: 'Services Built for',
    servicesTitle2: 'Every Need',
    servicesSub: 'Our certified technicians handle everything from quick fixes to major installations.',
    aboutLabel: 'About FlowPOS',
    aboutTitle1: 'Trusted by Thousands',
    aboutTitle2: 'Across the Philippines',
    aboutP1: 'FlowPOS is a multi-service platform connecting homeowners and businesses with skilled, background-checked technicians. We handle scheduling, invoicing, and follow-ups so you can focus on what matters.',
    aboutP2: "Founded with a mission to make quality repairs accessible and transparent, we've grown to serve thousands of satisfied customers with a 98% satisfaction rate.",
    aboutTags: ['Licensed Technicians', 'Insured Services', 'Transparent Pricing', 'On-Time Guarantee'],
    pricingLabel: 'Pricing Plans',
    pricingTitle1: 'Simple, Transparent',
    pricingTitle2: 'Pricing',
    pricingSub: 'No hidden fees. Choose a plan that fits your home or business needs.',
    pricingPopular: 'Most Popular',
    testimonialsLabel: 'Customer Stories',
    testimonialsTitle1: 'What Our Clients',
    testimonialsTitle2: 'Are Saying',
    contactLabel: 'Get In Touch',
    contactTitle1: 'Book a Service',
    contactTitle2: 'Today',
    contactSub: 'Fill out the form and a technician will reach out within 2 hours.',
    formName: 'Full Name',
    formNamePh: 'Juan dela Cruz',
    formEmail: 'Email Address',
    formEmailPh: 'juan@email.com',
    formPhone: 'Phone Number',
    formPhonePh: '+63 9XX XXX XXXX',
    formService: 'Service Needed',
    formServicePh: 'Select a service',
    formMessage: 'Message / Details',
    formMessagePh: 'Describe your issue or request...',
    formSubmit: 'Submit Booking Request ↗',
    successTitle: 'Request Received!',
    successSub: "We'll contact you within 2 hours to confirm your booking.",
    footerRights: '© 2026 FlowPOS. All rights reserved.',
    footerLinks: ['Services', 'Pricing', 'About', 'Contact'],
    quoteOpen: '"',
    quoteClose: '"',
  },
  fil: {
    navLinks: ['Serbisyo', 'Presyo', 'Tungkol', 'Testimonya', 'Makipag-ugnayan'],
    navLogin: 'Mag-login',
    navBook: 'Mag-book ng Serbisyo',
    heroLabel: 'Propesyonal na Multi-Serbisyo',
    heroTitle1: 'Dalubhasang Pag-aayos,',
    heroTitle2: 'Sa Iyong Oras.',
    heroSub: 'Mula sa kuryente hanggang tubero, HVAC hanggang appliances — ikinokonekta kayo ng FlowPOS sa mga sertipikadong teknisyan na handa sa lahat.',
    heroCta1: 'Mag-book ng Serbisyo ↗',
    heroCta2: 'Tingnan ang Serbisyo',
    servicesLabel: 'Aming Inaalok',
    servicesTitle1: 'Serbisyong Para sa',
    servicesTitle2: 'Bawat Pangangailangan',
    servicesSub: 'Ang aming mga sertipikadong teknisyan ay humahawak ng lahat mula sa mabilis na pag-aayos hanggang malalaking installation.',
    aboutLabel: 'Tungkol sa FlowPOS',
    aboutTitle1: 'Pinagkakatiwalaan ng Libo-libo',
    aboutTitle2: 'Sa Buong Pilipinas',
    aboutP1: 'Ang FlowPOS ay isang multi-serbisyo na platform na nagkokonekta sa mga may-bahay at negosyo sa mga bihasang teknisyan. Kami ang bahala sa scheduling, invoicing, at follow-up.',
    aboutP2: 'Itinatag na may misyon na gawing accessible at malinaw ang kalidad na pag-aayos, lumago kami upang maglingkod sa libu-libong nasisiyahang customer na may 98% satisfaction rate.',
    aboutTags: ['Lisensyadong Teknisyan', 'May Insurance', 'Malinaw na Presyo', 'Garantisadong Nasa Oras'],
    pricingLabel: 'Mga Plano sa Presyo',
    pricingTitle1: 'Simple at Malinaw',
    pricingTitle2: 'na Presyo',
    pricingSub: 'Walang nakatagong bayarin. Pumili ng planong angkop sa inyong tahanan o negosyo.',
    pricingPopular: 'Pinakasikat',
    testimonialsLabel: 'Mga Kwento ng Customer',
    testimonialsTitle1: 'Mga Sinabi',
    testimonialsTitle2: 'ng Aming mga Kliyente',
    contactLabel: 'Makipag-ugnayan',
    contactTitle1: 'Mag-book ng Serbisyo',
    contactTitle2: 'Ngayon',
    contactSub: 'Punan ang form at makikipag-ugnayan sa inyo ang isang teknisyan sa loob ng 2 oras.',
    formName: 'Buong Pangalan',
    formNamePh: 'Juan dela Cruz',
    formEmail: 'Email Address',
    formEmailPh: 'juan@email.com',
    formPhone: 'Numero ng Telepono',
    formPhonePh: '+63 9XX XXX XXXX',
    formService: 'Kinakailangang Serbisyo',
    formServicePh: 'Pumili ng serbisyo',
    formMessage: 'Mensahe / Detalye',
    formMessagePh: 'Ilarawan ang inyong problema o kahilingan...',
    formSubmit: 'Isumite ang Booking ↗',
    successTitle: 'Natanggap ang Kahilingan!',
    successSub: 'Makikipag-ugnayan kami sa inyo sa loob ng 2 oras upang kumpirmahin ang inyong booking.',
    footerRights: '© 2026 FlowPOS. Lahat ng karapatan ay nakalaan.',
    footerLinks: ['Serbisyo', 'Presyo', 'Tungkol', 'Makipag-ugnayan'],
    quoteOpen: '"',
    quoteClose: '"',
  },
  ja: {
    navLinks: ['サービス', '料金', '私たちについて', 'お客様の声', 'お問い合わせ'],
    navLogin: 'ログイン',
    navBook: 'サービスを予約',
    heroLabel: 'プロフェッショナル・マルチサービス',
    heroTitle1: '確かな修理を、',
    heroTitle2: 'あなたのペースで。',
    heroSub: '電気工事から配管、空調から家電まで — FlowPOSが認定技術者とあなたをつなぎ、素早く解決します。',
    heroCta1: 'サービスを予約 ↗',
    heroCta2: 'サービス一覧を見る',
    servicesLabel: '提供サービス',
    servicesTitle1: 'あらゆるニーズに',
    servicesTitle2: '応えるサービス',
    servicesSub: '認定技術者が、小さな修理から大規模な設置工事まで幅広く対応します。',
    aboutLabel: 'FlowPOSについて',
    aboutTitle1: '数千人に信頼される',
    aboutTitle2: 'フィリピン全土のサービス',
    aboutP1: 'FlowPOSは、住宅オーナーや企業と、審査済みの熟練技術者をつなぐマルチサービスプラットフォームです。スケジュール管理、請求書発行、フォローアップを代行し、あなたは本業に集中できます。',
    aboutP2: '質の高い修理サービスをわかりやすく、誰でも利用しやすくするという使命のもと創業し、満足度98%を誇る数千人のお客様にご利用いただいています。',
    aboutTags: ['認定技術者', '保険適用サービス', '明確な料金', '時間厳守保証'],
    pricingLabel: '料金プラン',
    pricingTitle1: 'シンプルで透明な',
    pricingTitle2: '料金体系',
    pricingSub: '隠れた費用は一切なし。ご自宅やビジネスに合ったプランをお選びください。',
    pricingPopular: '人気No.1',
    testimonialsLabel: 'お客様の声',
    testimonialsTitle1: 'ご利用いただいた',
    testimonialsTitle2: 'お客様の感想',
    contactLabel: 'お問い合わせ',
    contactTitle1: '今すぐサービスを',
    contactTitle2: '予約する',
    contactSub: 'フォームにご記入いただくと、2時間以内に技術者よりご連絡いたします。',
    formName: 'お名前',
    formNamePh: '山田 太郎',
    formEmail: 'メールアドレス',
    formEmailPh: 'taro@example.com',
    formPhone: '電話番号',
    formPhonePh: '090-XXXX-XXXX',
    formService: '必要なサービス',
    formServicePh: 'サービスを選択',
    formMessage: 'メッセージ / 詳細',
    formMessagePh: 'お困りの内容やご要望をご記入ください...',
    formSubmit: '予約リクエストを送信 ↗',
    successTitle: 'ご依頼を受け付けました！',
    successSub: '2時間以内にご予約の確認のためご連絡いたします。',
    footerRights: '© 2026 FlowPOS. All rights reserved.',
    footerLinks: ['サービス', '料金', '私たちについて', 'お問い合わせ'],
    quoteOpen: '「',
    quoteClose: '」',
  },
};

const NAV_IDS = ['services', 'pricing', 'about', 'testimonials', 'contact'];
const L = (en, fil, ja) => ({ en, fil, ja });

const SERVICES = [
  { icon: '⚡', title: L('Electrical Repairs','Pag-aayos ng Kuryente','電気修理'), desc: L('Wiring, outlets, panels, and full electrical diagnostics by certified technicians.','Wiring, outlets, panels, at kumpletong electrical diagnostics ng mga sertipikadong teknisyan.','配線、コンセント、配電盤、認定技術者による電気診断まで幅広く対応。'), price: 'Mula ₱800' },
  { icon: '🔧', title: L('Plumbing Services','Serbisyo sa Tubero','配管サービス'), desc: L('Leak fixes, pipe installation, drain cleaning, and emergency plumbing support.','Pag-aayos ng tagas, pag-install ng tubo, paglilinis ng kanal, at emergency na tulong sa tubero.','水漏れ修理、配管設置、排水清掃、緊急配管サポートに対応。'), price: 'Mula ₱600' },
  { icon: '❄️', title: L('HVAC & Aircon','HVAC at Aircon','空調・エアコン'), desc: L('Installation, cleaning, refrigerant recharge, and preventive maintenance.','Pag-install, paglilinis, refrigerant recharge, at preventive maintenance.','設置、清掃、冷媒補充、予防メンテナンスまで対応。'), price: 'Mula ₱1,200' },
  { icon: '🖥️', title: L('Appliance Repair','Pag-aayos ng Appliance','家電修理'), desc: L('Washing machines, refrigerators, ovens, and all major home appliances.','Washing machine, ref, oven, at lahat ng mahahalagang appliance sa tahanan.','洗濯機、冷蔵庫、オーブンなど主要家電製品の修理に対応。'), price: 'Mula ₱500' },
  { icon: '🏠', title: L('Home Renovation','Renovasyon ng Bahay','ホームリノベーション'), desc: L('Painting, tiling, carpentry, and general home improvement projects.','Pagpipinta, paglalagay ng tiles, karpinterya, at pangkalahatang pagpapabuti ng tahanan.','塗装、タイル工事、大工仕事、一般的な住宅改善プロジェクトに対応。'), price: 'Mula ₱2,000' },
  { icon: '🔒', title: L('Security Systems','Mga Sistema ng Seguridad','セキュリティシステム'), desc: L('CCTV installation, smart locks, alarm systems, and security audits.','Pag-install ng CCTV, smart locks, alarm systems, at security audits.','CCTV設置、スマートロック、警報システム、セキュリティ診断に対応。'), price: 'Mula ₱3,500' },
];

const PRICING = [
  {
    name: L('Basic','Básiko','ベーシック'),
    price: '₱499', period: '/visit',
    desc: L('Perfect for single repairs','Perpekto para sa isang pag-aayos','単発修理に最適'),
    features: L(
      ['1 technician visit','Diagnostic included','Basic warranty (7 days)','Email support'],
      ['1 pagbisita ng teknisyan','Kasama ang diagnostic','Basikong warranty (7 araw)','Email support'],
      ['技術者1回訪問','診断込み','基本保証（7日間）','メールサポート']
    ),
    cta: L('Book Now','Mag-book Na','今すぐ予約'),
    highlight: false,
  },
  {
    name: L('Standard','Karaniwan','スタンダード'),
    price: '₱1,299', period: '/month',
    desc: L('Most popular for households','Pinakasikat para sa mga pamilya','家庭向け人気No.1'),
    features: L(
      ['3 technician visits','Priority scheduling','30-day warranty','Phone & email support','Free follow-up check'],
      ['3 pagbisita ng teknisyan','Priority scheduling','30-araw na warranty','Telepono at email support','Libreng follow-up check'],
      ['技術者3回訪問','優先スケジュール','30日間保証','電話・メールサポート','無料フォローアップ確認']
    ),
    cta: L('Get Started','Magsimula Na','始める'),
    highlight: true,
  },
  {
    name: L('Premium','Premium','プレミアム'),
    price: '₱2,999', period: '/month',
    desc: L('Ideal for businesses','Perpekto para sa mga negosyo','ビジネスに最適'),
    features: L(
      ['Unlimited visits','24/7 emergency support','90-day warranty','Dedicated technician','Monthly maintenance report','Free parts on minor repairs'],
      ['Walang limitasyong pagbisita','24/7 emergency support','90-araw na warranty','Dedikadong teknisyan','Buwanang maintenance report','Libreng parts sa maliliit na pag-aayos'],
      ['訪問回数無制限','24時間緊急サポート','90日間保証','専任技術者','月次メンテナンスレポート','軽微な修理の部品代無料']
    ),
    cta: L('Contact Us','Makipag-ugnayan','お問い合わせ'),
    highlight: false,
  },
];

const TESTIMONIALS = [
  { name: 'Maria Santos', role: 'Homeowner, Quezon City', text: L('FlowPOS technicians fixed our aircon in under 2 hours. Professional, fast, and very affordable. Will definitely call again!','Inayos ng mga teknisyan ng FlowPOS ang aming aircon sa loob ng 2 oras. Propesyonal, mabilis, at napaka-abot-kaya. Tiyak na tatawag ulit!','FlowPOSの技術者が2時間以内にエアコンを修理してくれました。プロフェッショナルで迅速、かつリーズナブル。また絶対に呼びます！'), rating: 5, avatar: 'MS' },
  { name: 'Carlo Reyes', role: 'Restaurant Owner, BGC', text: L('We use the Premium plan for our restaurant and it has been a game changer. Zero downtime on our equipment since we signed up.','Gumagamit kami ng Premium plan para sa aming restaurant at napakaganda nito. Zero downtime sa aming mga kagamitan mula nang mag-sign up kami.','レストランでプレミアムプランを使用しており、本当に革命的です。契約以来、設備のダウンタイムがゼロになりました。'), rating: 5, avatar: 'CR' },
  { name: 'Jasmine Lim', role: 'Property Manager, Makati', text: L('Managing 12 units is so much easier now. One call and everything gets fixed. The reporting feature is a huge plus.','Mas madali na ang pamamahala ng 12 units ngayon. Isang tawag lang at ayos na lahat. Malaking tulong ang reporting feature.','12室の管理がとても楽になりました。1本の電話ですべて解決。レポート機能は大きなメリットです。'), rating: 5, avatar: 'JL' },
  { name: 'Rico Dela Cruz', role: 'Small Business Owner', text: L('Honest pricing, skilled workers, and they always show up on time. Exactly what I was looking for in a repair service.','Tapat na presyo, bihasang manggagawa, at lagi silang nasa oras. Eksakto ito ang hinahanap ko sa isang serbisyo ng pag-aayos.','正直な料金、熟練した職人、そして常に時間通り。修理サービスに求めていたまさにこれです。'), rating: 5, avatar: 'RD' },
];

const STATS = [
  { value: '5,000+', label: L('Jobs Completed','Natapos na Trabaho','完了した仕事') },
  { value: '98%', label: L('Satisfaction Rate','Satisfaction Rate','満足度') },
  { value: '150+', label: L('Technicians','Mga Teknisyan','技術者数') },
  { value: '24/7', label: L('Support Available','Available na Suporta','サポート対応') },
];

// ── LANG TOGGLE ───────────────────────────────────────────────────────────────
const LANG_CYCLE = { en: 'fil', fil: 'ja', ja: 'en' };
const LANG_FLAGS = { en: '🇬🇧', fil: '🇵🇭', ja: '🇯🇵' };
const LANG_TITLES = { en: 'Switch to Filipino', fil: '日本語に切り替える', ja: 'Switch to English' };

function LangToggle({ lang, setLang, isLight }) {
  const border = isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.12)';
  const bg = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.06)';
  const bgHover = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.1)';
  const borderHover = isLight ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.25)';
  const color = isLight ? 'rgba(17,24,39,0.75)' : 'rgba(232,237,245,0.85)';

  return (
    <div
      onClick={() => setLang(l => LANG_CYCLE[l])}
      title={LANG_TITLES[lang]}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: bg, border: `1px solid ${border}`,
        borderRadius: 100, padding: '6px 14px 6px 10px',
        cursor: 'pointer', transition: 'all 0.2s',
        userSelect: 'none', fontSize: 13, fontWeight: 600,
        color, letterSpacing: '0.3px', flexShrink: 0,
      }}
      onMouseEnter={e => { e.currentTarget.style.background = bgHover; e.currentTarget.style.borderColor = borderHover; }}
      onMouseLeave={e => { e.currentTarget.style.background = bg; e.currentTarget.style.borderColor = border; }}
    >
      <div style={{ display: 'flex', background: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)', borderRadius: 100, padding: '2px', gap: 2 }}>
        {['en','fil','ja'].map(code => (
          <span key={code} style={{
            padding: '2px 8px', borderRadius: 100, fontSize: 12, fontWeight: 700,
            background: lang === code ? 'linear-gradient(135deg,#6366f1,#a855f7)' : 'transparent',
            color: lang === code ? '#fff' : isLight ? 'rgba(17,24,39,0.4)' : 'rgba(232,237,245,0.45)',
            transition: 'all 0.2s',
          }}>{code === 'en' ? 'EN' : code === 'fil' ? 'FIL' : 'JA'}</span>
        ))}
      </div>
      <span style={{ fontSize: 14 }}>{LANG_FLAGS[lang]}</span>
    </div>
  );
}

// ── THEME TOGGLE ──────────────────────────────────────────────────────────────
function ThemeToggle({ theme, setTheme }) {
  const isLight = theme === 'light';
  const bg = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.06)';
  const bgHover = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.1)';
  const border = isLight ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.12)';
  const borderHover = isLight ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.25)';

  return (
    <div
      onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
      title={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 38, height: 38,
        background: bg, border: `1px solid ${border}`,
        borderRadius: 100, cursor: 'pointer',
        transition: 'all 0.2s', userSelect: 'none', fontSize: 16, flexShrink: 0,
      }}
      onMouseEnter={e => { e.currentTarget.style.background = bgHover; e.currentTarget.style.borderColor = borderHover; }}
      onMouseLeave={e => { e.currentTarget.style.background = bg; e.currentTarget.style.borderColor = border; }}
    >
      {isLight ? '🌙' : '☀️'}
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const [lang, setLang] = useState('en');
  const [theme, setTheme] = useState('dark');
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', service: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const heroRef = useRef(null);
  const t = TRANSLATIONS[lang];
  const isLight = theme === 'light';

  // Derived theme values
  const th = {
    bg: isLight ? '#f4f6fb' : '#080b14',
    color: isLight ? '#111827' : '#e8edf5',
    navBg: isLight ? 'rgba(244,246,251,0.92)' : 'rgba(8,11,20,0.92)',
    navBorder: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)',
    cardBg: isLight ? '#ffffff' : 'rgba(255,255,255,0.03)',
    cardBorder: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.07)',
    cardHoverBorder: isLight ? 'rgba(99,102,241,0.5)' : 'rgba(99,102,241,0.4)',
    sectionBg: isLight ? '#edf0f7' : 'rgba(255,255,255,0.02)',
    sectionBorder: isLight ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.05)',
    subText: isLight ? 'rgba(17,24,39,0.55)' : 'rgba(232,237,245,0.55)',
    bodyText: isLight ? 'rgba(17,24,39,0.7)' : 'rgba(232,237,245,0.65)',
    mutedText: isLight ? 'rgba(17,24,39,0.4)' : 'rgba(232,237,245,0.35)',
    tagBg: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.06)',
    tagBorder: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
    inputBg: isLight ? '#ffffff' : 'rgba(255,255,255,0.05)',
    inputBorder: isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.1)',
    highlightCardBg: isLight
      ? 'linear-gradient(135deg,rgba(99,102,241,0.1),rgba(168,85,247,0.1))'
      : 'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(168,85,247,0.15))',
    statCardBg: (i) => i === 1
      ? 'linear-gradient(135deg,rgba(99,102,241,0.15),rgba(168,85,247,0.15))'
      : (isLight ? '#ffffff' : 'rgba(255,255,255,0.03)'),
    statCardBorder: (i) => i === 1
      ? 'rgba(168,85,247,0.4)'
      : (isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.07)'),
    mobileMenuBg: isLight ? 'rgba(244,246,251,0.98)' : 'rgba(8,11,20,0.98)',
    mobileMenuBorder: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)',
    mobileMenuLinkBorder: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)',
    mobileMenuLinkColor: isLight ? 'rgba(17,24,39,0.75)' : 'rgba(232,237,245,0.75)',
    scrollbarThumb: isLight ? '#6366f1' : '#6366f1',
    scrollbarTrack: isLight ? '#f4f6fb' : '#080b14',
    orbOpacity: isLight ? 0.1 : 0.18,
  };

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    setTimeout(() => {
      window.scrollTo(0, 0);
      document.documentElement.style.scrollBehavior = 'smooth';
    }, 500);
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
      setFormData({ name: '', email: '', phone: '', service: '', message: '' });
    } catch (err) {
      alert('Something went wrong. Please try again.');
    }
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: th.bg, color: th.color, overflowX: 'hidden', transition: 'background 0.3s, color 0.3s' }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { overflow-x: hidden; max-width: 100vw; }
        ::selection { background: #a855f7; color: #fff; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${th.scrollbarTrack}; }
        ::-webkit-scrollbar-thumb { background: #6366f1; border-radius: 3px; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          50%      { transform: translateY(-18px) rotate(3deg); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .fade-up { animation: fadeUp 0.7s ease both; }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.22s; }
        .delay-3 { animation-delay: 0.34s; }
        .delay-4 { animation-delay: 0.46s; }

        .hero-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(36px, 7vw, 88px);
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -2px;
        }
        .gradient-text {
          background: linear-gradient(135deg, #a78bfa 0%, #60a5fa 50%, #f472b6 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
        .nav-link {
          font-size: 14px; font-weight: 500;
          color: ${isLight ? 'rgba(17,24,39,0.6)' : 'rgba(232,237,245,0.65)'};
          cursor: pointer; transition: color 0.2s; text-decoration: none;
          letter-spacing: 0.3px;
        }
        .nav-link:hover { color: ${isLight ? '#111827' : '#fff'}; }

        .mobile-menu {
          display: none;
          position: fixed;
          top: 72px; left: 0; right: 0;
          background: ${th.mobileMenuBg};
          backdrop-filter: blur(20px);
          border-bottom: 1px solid ${th.mobileMenuBorder};
          padding: 24px 24px 32px;
          flex-direction: column;
          gap: 0;
          z-index: 99;
        }
        .mobile-menu.open { display: flex; }
        .mobile-menu-link {
          padding: 14px 0;
          font-size: 16px; font-weight: 500;
          color: ${th.mobileMenuLinkColor};
          cursor: pointer;
          border-bottom: 1px solid ${th.mobileMenuLinkBorder};
          transition: color 0.2s;
        }
        .mobile-menu-link:hover { color: ${isLight ? '#111827' : '#fff'}; }
        .mobile-menu-link:last-of-type { border-bottom: none; }

        .service-card {
          background: ${th.cardBg};
          border: 1px solid ${th.cardBorder};
          border-radius: 20px;
          padding: 32px 28px;
          transition: all 0.3s ease;
          cursor: default;
          position: relative;
          overflow: hidden;
        }
        .service-card::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(99,102,241,0.08), rgba(168,85,247,0.08));
          opacity: 0; transition: opacity 0.3s;
        }
        .service-card:hover { border-color: ${th.cardHoverBorder}; transform: translateY(-6px); box-shadow: ${isLight ? '0 12px 40px rgba(99,102,241,0.12)' : 'none'}; }
        .service-card:hover::before { opacity: 1; }

        .pricing-card {
          background: ${th.cardBg};
          border: 1px solid ${isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)'};
          border-radius: 24px;
          padding: clamp(24px,4vw,40px) clamp(20px,3vw,32px);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .pricing-card.highlight {
          background: ${th.highlightCardBg};
          border-color: rgba(168,85,247,0.5);
          box-shadow: 0 0 60px rgba(99,102,241,${isLight ? '0.12' : '0.2'});
        }
        .pricing-card:hover { transform: translateY(-4px); box-shadow: ${isLight ? '0 12px 40px rgba(99,102,241,0.1)' : 'none'}; }

        .btn-primary {
          display: inline-flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          color: #fff; border: none; border-radius: 100px;
          padding: 14px 32px; font-size: 15px; font-weight: 600;
          cursor: pointer; transition: all 0.25s ease;
          font-family: 'DM Sans', sans-serif; text-decoration: none;
          letter-spacing: 0.2px;
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(99,102,241,0.4); }
        .btn-primary:active { transform: scale(0.98); }

        .btn-outline {
          display: inline-flex; align-items: center; gap: 8px;
          background: transparent;
          color: ${isLight ? '#111827' : '#e8edf5'};
          border: 1px solid ${isLight ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.2)'};
          border-radius: 100px;
          padding: 14px 32px; font-size: 15px; font-weight: 500;
          cursor: pointer; transition: all 0.25s ease;
          font-family: 'DM Sans', sans-serif; text-decoration: none;
        }
        .btn-outline:hover {
          border-color: ${isLight ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.5)'};
          background: ${isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'};
        }

        .testimonial-card {
          background: ${th.cardBg};
          border: 1px solid ${th.cardBorder};
          border-radius: 20px; padding: 32px;
          transition: all 0.3s ease;
        }
        .testimonial-card:hover {
          border-color: rgba(99,102,241,0.3);
          transform: translateY(-4px);
          box-shadow: ${isLight ? '0 12px 40px rgba(99,102,241,0.1)' : 'none'};
        }

        .input-field {
          width: 100%;
          background: ${th.inputBg};
          border: 1px solid ${th.inputBorder};
          border-radius: 12px; padding: 14px 18px;
          font-size: 14px; color: ${th.color};
          font-family: 'DM Sans', sans-serif;
          transition: border-color 0.2s; outline: none;
        }
        .input-field:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.15); }
        .input-field::placeholder { color: ${th.mutedText}; }
        select.input-field option { background: ${isLight ? '#fff' : '#0f1120'}; color: ${th.color}; }

        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }

        .about-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
        }
        .about-stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .hero-buttons { display: flex; gap: 16px; flex-wrap: wrap; }
        .hero-stats { display: flex; gap: 32px; margin-top: 52px; flex-wrap: wrap; }
        .section-pad { padding: 100px clamp(20px, 5vw, 40px); }

        .orb {
          position: absolute; border-radius: 50%;
          filter: blur(80px); opacity: ${th.orbOpacity}; pointer-events: none;
        }
        .section-label {
          display: inline-block;
          font-size: 11px; font-weight: 600; letter-spacing: 2.5px;
          text-transform: uppercase; color: #a78bfa;
          background: rgba(167,139,250,0.1); border: 1px solid rgba(167,139,250,0.2);
          padding: 6px 16px; border-radius: 100px; margin-bottom: 20px;
        }
        .section-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(28px, 4vw, 52px);
          font-weight: 800; line-height: 1.1; letter-spacing: -1px;
          margin-bottom: 16px;
          color: ${th.color};
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 1024px) { .grid-3 { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 900px) {
          .grid-4 { grid-template-columns: 1fr 1fr; }
          .about-grid { grid-template-columns: 1fr; gap: 40px; }
          .pricing-card { padding: 32px 24px; }
        }
        @media (max-width: 768px) {
          .grid-2 { grid-template-columns: 1fr; }
          .grid-3 { grid-template-columns: 1fr 1fr; }
          .grid-4 { grid-template-columns: 1fr 1fr; }
          .hide-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
          .hero-title { font-size: clamp(32px, 8vw, 48px); letter-spacing: -1px; }
          .hero-stats { gap: 16px; margin-top: 32px; flex-wrap: wrap; }
          .hero-buttons { flex-direction: column; width: 100%; }
          .hero-buttons .btn-primary,
          .hero-buttons .btn-outline { width: 100%; justify-content: center; padding: 14px 24px; }
          .about-stats-grid { grid-template-columns: 1fr 1fr; }
          .testimonial-card { padding: 24px 20px; }
          .section-pad { padding: 64px clamp(16px, 4vw, 24px); }
          .section-title { font-size: clamp(26px, 5vw, 40px); }
          .section-label { font-size: 10px; }
          .contact-form { padding: 28px 20px !important; }
          .grid-2.form-row { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .grid-2 { grid-template-columns: 1fr; }
          .grid-3 { grid-template-columns: 1fr; }
          .grid-4 { grid-template-columns: 1fr 1fr; }
          .section-title { font-size: 26px; letter-spacing: -0.5px; }
          .service-card { padding: 24px 18px; }
          .pricing-card { padding: 24px 18px; }
          .about-stats-grid { grid-template-columns: 1fr 1fr; }
          .contact-form { padding: 20px 16px !important; }
          .footer-inner { flex-direction: column; align-items: flex-start; gap: 16px; }
          .footer-links { flex-wrap: wrap; gap: 12px; }
          .hero-stats { gap: 12px; }
          .section-pad { padding: 56px 16px; }
          .btn-primary, .btn-outline { font-size: 14px; padding: 12px 22px; }
          .input-field { padding: 12px 14px; font-size: 13px; }
          select.input-field { padding: 12px 14px; }
        }
        @media (max-width: 400px) {
          .grid-3 { grid-template-columns: 1fr; }
          .grid-4 { grid-template-columns: 1fr 1fr; }
          .hero-title { font-size: 30px; }
          .section-title { font-size: 23px; }
          .about-stats-grid { grid-template-columns: 1fr 1fr; }
        }
        .show-mobile { display: none; }
        @media (max-width: 768px) { .show-mobile { display: flex; } }
      `}</style>

      {/* ── MOBILE MENU ── */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        {t.navLinks.map((l, i) => (
          <div key={l} className="mobile-menu-link" onClick={() => scrollTo(NAV_IDS[i])}>{l}</div>
        ))}
        <div style={{ paddingTop: 16, paddingBottom: 4, display: 'flex', justifyContent: 'center', gap: 10 }}>
          <ThemeToggle theme={theme} setTheme={setTheme} />
          <LangToggle lang={lang} setLang={setLang} isLight={isLight} />
        </div>
        <button className="btn-outline" onClick={() => { navigate('/login'); setMenuOpen(false); }} style={{ marginTop: 12, justifyContent: 'center' }}>
          {t.navLogin}
        </button>
        <button className="btn-primary" onClick={() => scrollTo('contact')} style={{ marginTop: 10, justifyContent: 'center' }}>
          {t.navBook}
        </button>
      </div>

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 clamp(20px, 5vw, 40px)', height: 72,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? th.navBg : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? `1px solid ${th.navBorder}` : 'none',
        transition: 'all 0.3s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800 }}>⚡</div>
          <span style={{ fontSize: 20, fontWeight: 700, fontFamily: 'Playfair Display, serif', letterSpacing: '-0.5px', color: th.color }}>
            Flow<span style={{ color: '#a855f7' }}>POS</span>
          </span>
        </div>

        <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
          {t.navLinks.map((l, i) => (
            <span key={l} className="nav-link" onClick={() => scrollTo(NAV_IDS[i])}>{l}</span>
          ))}
        </div>

        <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ThemeToggle theme={theme} setTheme={setTheme} />
          <LangToggle lang={lang} setLang={setLang} isLight={isLight} />
          <button className="btn-outline" onClick={() => navigate('/login')} style={{ padding: '10px 24px', fontSize: 14 }}>
            {t.navLogin}
          </button>
          <button className="btn-primary" onClick={() => scrollTo('contact')} style={{ padding: '10px 24px', fontSize: 14 }}>
            {t.navBook}
          </button>
        </div>

        <button onClick={() => setMenuOpen(!menuOpen)} className="show-mobile" style={{ background: 'none', border: `1px solid ${isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.15)'}`, color: th.color, fontSize: 20, cursor: 'pointer', width: 40, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }}>
          {menuOpen ? '✕' : '☰'}
        </button>
      </nav>

      {/* ── HERO ── */}
      <section id="hero" ref={heroRef} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden', padding: 'clamp(100px, 15vw, 140px) clamp(16px, 5vw, 40px) clamp(48px,6vw,80px)' }}>
        <div className="orb" style={{ width: 600, height: 600, background: '#6366f1', top: -100, right: -100 }} />
        <div className="orb" style={{ width: 400, height: 400, background: '#a855f7', bottom: 0, left: -100 }} />
        <div className="hide-mobile" style={{ position: 'absolute', top: '20%', right: '8%', animation: 'float 6s ease-in-out infinite', opacity: 0.6 }}>
          <div style={{ width: 80, height: 80, borderRadius: 20, background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>🔧</div>
        </div>
        <div className="hide-mobile" style={{ position: 'absolute', top: '55%', right: '18%', animation: 'float 8s ease-in-out infinite 2s', opacity: 0.5 }}>
          <div style={{ width: 60, height: 60, borderRadius: 14, background: isLight ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>⚡</div>
        </div>
        <div className="hide-mobile" style={{ position: 'absolute', top: '35%', right: '30%', animation: 'float 7s ease-in-out infinite 1s', opacity: 0.4 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: isLight ? 'rgba(168,85,247,0.12)' : 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>❄️</div>
        </div>

        <div style={{ maxWidth: 700, position: 'relative', zIndex: 2, width: '100%' }}>
          <div className="fade-up section-label">{t.heroLabel}</div>
          <h1 className="fade-up delay-1 hero-title">
            {t.heroTitle1}<br />
            <span className="gradient-text">{t.heroTitle2}</span>
          </h1>
          <p className="fade-up delay-2" style={{ fontSize: 'clamp(14px, 3.5vw, 18px)', lineHeight: 1.7, color: th.bodyText, margin: '24px 0 32px', maxWidth: 520 }}>
            {t.heroSub}
          </p>
          <div className="fade-up delay-3 hero-buttons">
            <button className="btn-primary" onClick={() => scrollTo('contact')}>{t.heroCta1}</button>
            <button className="btn-outline" onClick={() => scrollTo('services')}>{t.heroCta2}</button>
          </div>
          <div className="fade-up delay-4 hero-stats">
            {STATS.map(s => (
              <div key={s.label.en}>
                <div style={{ fontSize: 'clamp(17px, 4vw, 26px)', fontWeight: 700, fontFamily: 'Playfair Display, serif', color: th.color }}>{s.value}</div>
                <div style={{ fontSize: 'clamp(10px, 2.5vw, 12px)', color: th.mutedText, marginTop: 2, letterSpacing: '0.3px' }}>{s.label[lang]}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className="section-pad" style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div className="section-label">{t.servicesLabel}</div>
          <h2 className="section-title">{t.servicesTitle1}<br /><span className="gradient-text">{t.servicesTitle2}</span></h2>
          <p style={{ color: th.subText, fontSize: 16, maxWidth: 480, margin: '0 auto' }}>{t.servicesSub}</p>
        </div>
        <div className="grid-3">
          {SERVICES.map((s, i) => (
            <div key={i} className="service-card">
              <div style={{ fontSize: 36, marginBottom: 18 }}>{s.icon}</div>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 10, color: th.color }}>{s.title[lang]}</h3>
              <p style={{ fontSize: 14, color: th.subText, lineHeight: 1.7, marginBottom: 20 }}>{s.desc[lang]}</p>
              <div style={{ display: 'inline-block', fontSize: 13, fontWeight: 600, color: '#a78bfa', background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 100, padding: '5px 14px' }}>{s.price}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" style={{ padding: 'clamp(56px,8vw,100px) clamp(16px, 5vw, 40px)', background: th.sectionBg, borderTop: `1px solid ${th.sectionBorder}`, borderBottom: `1px solid ${th.sectionBorder}` }}>
        <div className="about-grid">
          <div>
            <div className="section-label">{t.aboutLabel}</div>
            <h2 className="section-title">{t.aboutTitle1}<br /><span className="gradient-text">{t.aboutTitle2}</span></h2>
            <p style={{ color: th.bodyText, fontSize: 'clamp(14px,2vw,16px)', lineHeight: 1.8, marginBottom: 24 }}>{t.aboutP1}</p>
            <p style={{ color: th.bodyText, fontSize: 'clamp(14px,2vw,16px)', lineHeight: 1.8, marginBottom: 36 }}>{t.aboutP2}</p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {t.aboutTags.map(tag => (
                <span key={tag} style={{ fontSize: 13, color: th.color, background: th.tagBg, border: `1px solid ${th.tagBorder}`, borderRadius: 100, padding: '6px 16px' }}>✓ {tag}</span>
              ))}
            </div>
          </div>
          <div className="about-stats-grid">
            {STATS.map((s, i) => (
              <div key={i} style={{ background: th.statCardBg(i), border: `1px solid ${th.statCardBorder(i)}`, borderRadius: 20, padding: 'clamp(20px,3vw,32px) clamp(16px,2vw,24px)', textAlign: 'center' }}>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 800, color: th.color, marginBottom: 8 }}>{s.value}</div>
                <div style={{ fontSize: 13, color: th.subText, letterSpacing: '0.3px' }}>{s.label[lang]}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="section-pad" style={{ maxWidth: 1100, margin: '0 auto', overflowX: 'hidden' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div className="section-label">{t.pricingLabel}</div>
          <h2 className="section-title">{t.pricingTitle1}<br /><span className="gradient-text">{t.pricingTitle2}</span></h2>
          <p style={{ color: th.subText, fontSize: 16, maxWidth: 420, margin: '0 auto' }}>{t.pricingSub}</p>
        </div>
        <div className="grid-3">
          {PRICING.map((p, i) => (
            <div key={i} className={`pricing-card${p.highlight ? ' highlight' : ''}`}>
              {p.highlight && (
                <div style={{ position: 'absolute', top: 16, right: 16, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, background: 'linear-gradient(135deg,#6366f1,#a855f7)', color: '#fff', padding: '4px 12px', borderRadius: 100, textTransform: 'uppercase' }}>{t.pricingPopular}</div>
              )}
              <div style={{ fontSize: 13, color: th.subText, marginBottom: 8 }}>{p.name[lang]}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(28px, 6vw, 48px)', fontWeight: 800, color: th.color }}>{p.price}</span>
                <span style={{ fontSize: 14, color: th.mutedText }}>{p.period}</span>
              </div>
              <p style={{ fontSize: 13, color: th.subText, marginBottom: 28 }}>{p.desc[lang]}</p>
              <div style={{ marginBottom: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {p.features[lang].map((f, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: th.bodyText }}>
                    <span style={{ color: '#a78bfa', fontSize: 16 }}>✓</span> {f}
                  </div>
                ))}
              </div>
              <button className={p.highlight ? 'btn-primary' : 'btn-outline'} onClick={() => scrollTo('contact')} style={{ width: '100%', justifyContent: 'center' }}>
                {p.cta[lang]}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" style={{ padding: 'clamp(56px,8vw,100px) clamp(16px,5vw,40px)', background: th.sectionBg, borderTop: `1px solid ${th.sectionBorder}` }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div className="section-label">{t.testimonialsLabel}</div>
            <h2 className="section-title">{t.testimonialsTitle1}<br /><span className="gradient-text">{t.testimonialsTitle2}</span></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))', gap: 24 }}>
            {TESTIMONIALS.map((testimonial, i) => (
              <div key={i} className="testimonial-card">
                <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
                  {Array.from({ length: testimonial.rating }).map((_, j) => <span key={j} style={{ color: '#f59e0b', fontSize: 16 }}>★</span>)}
                </div>
                <p style={{ fontSize: 15, lineHeight: 1.75, color: th.bodyText, marginBottom: 24, fontStyle: 'italic' }}>
                  {t.quoteOpen}{testimonial.text[lang]}{t.quoteClose}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{testimonial.avatar}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: th.color }}>{testimonial.name}</div>
                    <div style={{ fontSize: 12, color: th.mutedText }}>{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contact" className="section-pad" style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <div className="section-label">{t.contactLabel}</div>
          <h2 className="section-title">{t.contactTitle1}<br /><span className="gradient-text">{t.contactTitle2}</span></h2>
          <p style={{ color: th.subText, fontSize: 16, maxWidth: 400, margin: '0 auto' }}>{t.contactSub}</p>
        </div>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: 'clamp(32px,6vw,60px) clamp(20px,5vw,40px)', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 24 }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
            <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, fontFamily: 'Playfair Display, serif', color: th.color }}>{t.successTitle}</h3>
            <p style={{ color: th.subText, fontSize: 16 }}>{t.successSub}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="contact-form" style={{ background: th.cardBg, border: `1px solid ${th.cardBorder}`, borderRadius: 24, padding: '48px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="grid-2 form-row">
              <div>
                <label style={{ fontSize: 13, color: th.subText, marginBottom: 8, display: 'block' }}>{t.formName} *</label>
                <input className="input-field" required placeholder={t.formNamePh} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: 13, color: th.subText, marginBottom: 8, display: 'block' }}>{t.formEmail} *</label>
                <input className="input-field" type="email" required placeholder={t.formEmailPh} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
              </div>
            </div>
            <div className="grid-2 form-row">
              <div>
                <label style={{ fontSize: 13, color: th.subText, marginBottom: 8, display: 'block' }}>{t.formPhone} *</label>
                <input className="input-field" required placeholder={t.formPhonePh} value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: 13, color: th.subText, marginBottom: 8, display: 'block' }}>{t.formService} *</label>
                <select className="input-field" required value={formData.service} onChange={e => setFormData({ ...formData, service: e.target.value })}>
                  <option value="" disabled>{t.formServicePh}</option>
                  {SERVICES.map(s => <option key={s.title.en} value={s.title.en}>{s.title[lang]}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={{ fontSize: 13, color: th.subText, marginBottom: 8, display: 'block' }}>{t.formMessage}</label>
              <textarea className="input-field" rows={4} placeholder={t.formMessagePh} style={{ resize: 'vertical' }} value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} />
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: 16 }}>
              {t.formSubmit}
            </button>
          </form>
        )}
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: `1px solid ${th.sectionBorder}`, padding: 'clamp(24px, 4vw, 40px) clamp(20px, 5vw, 40px)' }}>
        <div className="footer-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, rowGap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>⚡</div>
            <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, fontWeight: 700, color: th.color }}>Flow<span style={{ color: '#a855f7' }}>POS</span></span>
          </div>
          <p style={{ fontSize: 13, color: th.mutedText }}>{t.footerRights}</p>
          <p style={{ fontSize: 12, color: th.mutedText }}>
            Engineered by{' '}
            <a
              href="https://yourportfolio.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#a78bfa', textDecoration: 'none', fontWeight: 600, transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#c084fc'}
              onMouseLeave={e => e.currentTarget.style.color = '#a78bfa'}
            >
              Arman Villegas
            </a>
          </p>
          <div className="footer-links" style={{ display: 'flex', gap: 24 }}>
            {t.footerLinks.map((l, i) => (
              <span key={l} className="nav-link" style={{ fontSize: 13 }} onClick={() => scrollTo(NAV_IDS[i])}>{l}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}