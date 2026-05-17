import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// ── TRANSLATIONS ──────────────────────────────────────────────────────────────
const TRANSLATIONS = {
  en: {
    navLinks: ['Services', 'Pricing', 'About', 'Testimonials', 'Contact'],
    navLogin: 'Login', navBook: 'Book Now',
    heroLabel: 'Professional Multi-Service Solutions',
    heroTitle1: 'Expert Repairs,', heroTitle2: 'On Your Schedule.',
    heroSub: 'From electrical to plumbing, HVAC to appliances — FlowPOS connects you with certified technicians ready to fix anything, fast.',
    heroCta1: 'Book a Service ↗', heroCta2: 'View Services',
    servicesLabel: 'What We Offer', servicesTitle1: 'Services Built for', servicesTitle2: 'Every Need',
    servicesSub: 'Our certified technicians handle everything from quick fixes to major installations.',
    aboutLabel: 'About FlowPOS', aboutTitle1: 'Trusted by Thousands', aboutTitle2: 'Across the Philippines',
    aboutP1: 'FlowPOS is a multi-service platform connecting homeowners and businesses with skilled, background-checked technicians. We handle scheduling, invoicing, and follow-ups so you can focus on what matters.',
    aboutP2: "Founded with a mission to make quality repairs accessible and transparent, we've grown to serve thousands of satisfied customers with a 98% satisfaction rate.",
    aboutTags: ['Licensed Technicians', 'Insured Services', 'Transparent Pricing', 'On-Time Guarantee'],
    pricingLabel: 'Pricing Plans', pricingTitle1: 'Simple, Transparent', pricingTitle2: 'Pricing',
    pricingSub: 'No hidden fees. Choose a plan that fits your home or business needs.', pricingPopular: 'Most Popular',
    testimonialsLabel: 'Customer Stories', testimonialsTitle1: 'What Our Clients', testimonialsTitle2: 'Are Saying',
    contactLabel: 'Get In Touch', contactTitle1: 'Book a Service', contactTitle2: 'Today',
    contactSub: 'Fill out the form and a technician will reach out within 2 hours.',
    formName: 'Full Name', formNamePh: 'Juan dela Cruz',
    formEmail: 'Email Address', formEmailPh: 'juan@email.com',
    formPhone: 'Phone Number', formPhonePh: '+63 9XX XXX XXXX',
    formService: 'Service Needed', formServicePh: 'Select a service',
    formMessage: 'Message / Details', formMessagePh: 'Describe your issue or request...',
    formSubmit: 'Submit Booking Request ↗',
    successTitle: 'Request Received!', successSub: "We'll contact you within 2 hours to confirm your booking.",
    footerRights: '© 2026 FlowPOS. All rights reserved.',
    footerLinks: ['Services', 'Pricing', 'About', 'Contact'],
    quoteOpen: '"', quoteClose: '"',
  },
  fil: {
    navLinks: ['Serbisyo', 'Presyo', 'Tungkol', 'Testimonya', 'Makipag-ugnayan'],
    navLogin: 'Mag-login', navBook: 'Mag-book',
    heroLabel: 'Propesyonal na Multi-Serbisyo',
    heroTitle1: 'Dalubhasang Pag-aayos,', heroTitle2: 'Sa Iyong Oras.',
    heroSub: 'Mula sa kuryente hanggang tubero, HVAC hanggang appliances — ikinokonekta kayo ng FlowPOS sa mga sertipikadong teknisyan na handa sa lahat.',
    heroCta1: 'Mag-book ng Serbisyo ↗', heroCta2: 'Tingnan ang Serbisyo',
    servicesLabel: 'Aming Inaalok', servicesTitle1: 'Serbisyong Para sa', servicesTitle2: 'Bawat Pangangailangan',
    servicesSub: 'Ang aming mga sertipikadong teknisyan ay humahawak ng lahat mula sa mabilis na pag-aayos hanggang malalaking installation.',
    aboutLabel: 'Tungkol sa FlowPOS', aboutTitle1: 'Pinagkakatiwalaan ng Libo-libo', aboutTitle2: 'Sa Buong Pilipinas',
    aboutP1: 'Ang FlowPOS ay isang multi-serbisyo na platform na nagkokonekta sa mga may-bahay at negosyo sa mga bihasang teknisyan. Kami ang bahala sa scheduling, invoicing, at follow-up.',
    aboutP2: 'Itinatag na may misyon na gawing accessible at malinaw ang kalidad na pag-aayos, lumago kami upang maglingkod sa libu-libong nasisiyahang customer na may 98% satisfaction rate.',
    aboutTags: ['Lisensyadong Teknisyan', 'May Insurance', 'Malinaw na Presyo', 'Garantisadong Nasa Oras'],
    pricingLabel: 'Mga Plano sa Presyo', pricingTitle1: 'Simple at Malinaw', pricingTitle2: 'na Presyo',
    pricingSub: 'Walang nakatagong bayarin. Pumili ng planong angkop sa inyong tahanan o negosyo.', pricingPopular: 'Pinakasikat',
    testimonialsLabel: 'Mga Kwento ng Customer', testimonialsTitle1: 'Mga Sinabi', testimonialsTitle2: 'ng Aming mga Kliyente',
    contactLabel: 'Makipag-ugnayan', contactTitle1: 'Mag-book ng Serbisyo', contactTitle2: 'Ngayon',
    contactSub: 'Punan ang form at makikipag-ugnayan sa inyo ang isang teknisyan sa loob ng 2 oras.',
    formName: 'Buong Pangalan', formNamePh: 'Juan dela Cruz',
    formEmail: 'Email Address', formEmailPh: 'juan@email.com',
    formPhone: 'Numero ng Telepono', formPhonePh: '+63 9XX XXX XXXX',
    formService: 'Kinakailangang Serbisyo', formServicePh: 'Pumili ng serbisyo',
    formMessage: 'Mensahe / Detalye', formMessagePh: 'Ilarawan ang inyong problema o kahilingan...',
    formSubmit: 'Isumite ang Booking ↗',
    successTitle: 'Natanggap ang Kahilingan!', successSub: 'Makikipag-ugnayan kami sa inyo sa loob ng 2 oras upang kumpirmahin ang inyong booking.',
    footerRights: '© 2026 FlowPOS. Lahat ng karapatan ay nakalaan.',
    footerLinks: ['Serbisyo', 'Presyo', 'Tungkol', 'Makipag-ugnayan'],
    quoteOpen: '"', quoteClose: '"',
  },
  ja: {
    navLinks: ['サービス', '料金', '私たちについて', 'お客様の声', 'お問い合わせ'],
    navLogin: 'ログイン', navBook: '予約する',
    heroLabel: 'プロフェッショナル・マルチサービス',
    heroTitle1: '確かな修理を、', heroTitle2: 'あなたのペースで。',
    heroSub: '電気工事から配管、空調から家電まで — FlowPOSが認定技術者とあなたをつなぎ、素早く解決します。',
    heroCta1: 'サービスを予約 ↗', heroCta2: 'サービス一覧を見る',
    servicesLabel: '提供サービス', servicesTitle1: 'あらゆるニーズに', servicesTitle2: '応えるサービス',
    servicesSub: '認定技術者が、小さな修理から大規模な設置工事まで幅広く対応します。',
    aboutLabel: 'FlowPOSについて', aboutTitle1: '数千人に信頼される', aboutTitle2: 'フィリピン全土のサービス',
    aboutP1: 'FlowPOSは、住宅オーナーや企業と、審査済みの熟練技術者をつなぐマルチサービスプラットフォームです。スケジュール管理、請求書発行、フォローアップを代行し、あなたは本業に集中できます。',
    aboutP2: '質の高い修理サービスをわかりやすく、誰でも利用しやすくするという使命のもと創業し、満足度98%を誇る数千人のお客様にご利用いただいています。',
    aboutTags: ['認定技術者', '保険適用サービス', '明確な料金', '時間厳守保証'],
    pricingLabel: '料金プラン', pricingTitle1: 'シンプルで透明な', pricingTitle2: '料金体系',
    pricingSub: '隠れた費用は一切なし。ご自宅やビジネスに合ったプランをお選びください。', pricingPopular: '人気No.1',
    testimonialsLabel: 'お客様の声', testimonialsTitle1: 'ご利用いただいた', testimonialsTitle2: 'お客様の感想',
    contactLabel: 'お問い合わせ', contactTitle1: '今すぐサービスを', contactTitle2: '予約する',
    contactSub: 'フォームにご記入いただくと、2時間以内に技術者よりご連絡いたします。',
    formName: 'お名前', formNamePh: '山田 太郎',
    formEmail: 'メールアドレス', formEmailPh: 'taro@example.com',
    formPhone: '電話番号', formPhonePh: '090-XXXX-XXXX',
    formService: '必要なサービス', formServicePh: 'サービスを選択',
    formMessage: 'メッセージ / 詳細', formMessagePh: 'お困りの内容やご要望をご記入ください...',
    formSubmit: '予約リクエストを送信 ↗',
    successTitle: 'ご依頼を受け付けました！', successSub: '2時間以内にご予約の確認のためご連絡いたします。',
    footerRights: '© 2026 FlowPOS. All rights reserved.',
    footerLinks: ['サービス', '料金', '私たちについて', 'お問い合わせ'],
    quoteOpen: '「', quoteClose: '」',
  },
};

const NAV_IDS = ['services', 'pricing', 'about', 'testimonials', 'contact'];
const L = (en, fil, ja) => ({ en, fil, ja });

const SERVICES = [
  { icon: '⚡', title: L('Electrical Repairs','Pag-aayos ng Kuryente','電気修理'), desc: L('Wiring, outlets, panels, and full electrical diagnostics by certified technicians.','Wiring, outlets, panels, at kumpletong electrical diagnostics.','配線・コンセント・配電盤の診断まで対応。'), price: 'Mula ₱800' },
  { icon: '🔧', title: L('Plumbing Services','Serbisyo sa Tubero','配管サービス'), desc: L('Leak fixes, pipe installation, drain cleaning, and emergency plumbing support.','Pag-aayos ng tagas, pag-install ng tubo, at emergency na tulong.','水漏れ修理・配管設置・排水清掃・緊急対応。'), price: 'Mula ₱600' },
  { icon: '❄️', title: L('HVAC & Aircon','HVAC at Aircon','空調・エアコン'), desc: L('Installation, cleaning, refrigerant recharge, and preventive maintenance.','Pag-install, paglilinis, refrigerant recharge, at preventive maintenance.','設置・清掃・冷媒補充・予防メンテナンス。'), price: 'Mula ₱1,200' },
  { icon: '🖥️', title: L('Appliance Repair','Pag-aayos ng Appliance','家電修理'), desc: L('Washing machines, refrigerators, ovens, and all major home appliances.','Washing machine, ref, oven, at lahat ng mahahalagang appliance.','洗濯機・冷蔵庫・オーブンなど主要家電修理。'), price: 'Mula ₱500' },
  { icon: '🏠', title: L('Home Renovation','Renovasyon ng Bahay','ホームリノベーション'), desc: L('Painting, tiling, carpentry, and general home improvement projects.','Pagpipinta, tiles, karpinterya, at pangkalahatang pagpapabuti.','塗装・タイル・大工仕事・住宅改善全般。'), price: 'Mula ₱2,000' },
  { icon: '🔒', title: L('Security Systems','Mga Sistema ng Seguridad','セキュリティシステム'), desc: L('CCTV installation, smart locks, alarm systems, and security audits.','Pag-install ng CCTV, smart locks, alarm systems, at security audits.','CCTV・スマートロック・警報システム設置。'), price: 'Mula ₱3,500' },
];

const PRICING = [
  {
    name: L('Basic','Básiko','ベーシック'), price: '₱499', period: '/visit',
    desc: L('Perfect for single repairs','Perpekto para sa isang pag-aayos','単発修理に最適'),
    features: L(
      ['1 technician visit','Diagnostic included','Basic warranty (7 days)','Email support'],
      ['1 pagbisita ng teknisyan','Kasama ang diagnostic','Basikong warranty (7 araw)','Email support'],
      ['技術者1回訪問','診断込み','基本保証（7日間）','メールサポート']
    ),
    cta: L('Book Now','Mag-book Na','今すぐ予約'), highlight: false,
  },
  {
    name: L('Standard','Karaniwan','スタンダード'), price: '₱1,299', period: '/month',
    desc: L('Most popular for households','Pinakasikat para sa mga pamilya','家庭向け人気No.1'),
    features: L(
      ['3 technician visits','Priority scheduling','30-day warranty','Phone & email support','Free follow-up check'],
      ['3 pagbisita ng teknisyan','Priority scheduling','30-araw na warranty','Telepono at email support','Libreng follow-up check'],
      ['技術者3回訪問','優先スケジュール','30日間保証','電話・メールサポート','無料フォローアップ']
    ),
    cta: L('Get Started','Magsimula Na','始める'), highlight: true,
  },
  {
    name: L('Premium','Premium','プレミアム'), price: '₱2,999', period: '/month',
    desc: L('Ideal for businesses','Perpekto para sa mga negosyo','ビジネスに最適'),
    features: L(
      ['Unlimited visits','24/7 emergency support','90-day warranty','Dedicated technician','Monthly report','Free parts on minor repairs'],
      ['Walang limitasyong pagbisita','24/7 emergency support','90-araw na warranty','Dedikadong teknisyan','Buwanang report','Libreng parts sa maliliit na pag-aayos'],
      ['訪問回数無制限','24時間緊急サポート','90日間保証','専任技術者','月次レポート','軽微な修理の部品代無料']
    ),
    cta: L('Contact Us','Makipag-ugnayan','お問い合わせ'), highlight: false,
  },
];

const TESTIMONIALS = [
  { name: 'Maria Santos', role: 'Homeowner, Quezon City', text: L('FlowPOS technicians fixed our aircon in under 2 hours. Professional, fast, and very affordable. Will definitely call again!','Inayos ng mga teknisyan ng FlowPOS ang aming aircon sa loob ng 2 oras. Propesyonal, mabilis, at napaka-abot-kaya!','FlowPOSの技術者が2時間以内にエアコンを修理。プロフェッショナルで迅速、リーズナブルです。'), rating: 5, avatar: 'MS' },
  { name: 'Carlo Reyes', role: 'Restaurant Owner, BGC', text: L('We use the Premium plan for our restaurant and it has been a game changer. Zero downtime on our equipment since we signed up.','Gumagamit kami ng Premium plan para sa aming restaurant. Zero downtime sa aming mga kagamitan mula nang mag-sign up.','レストランでプレミアムプランを使用。契約以来、設備のダウンタイムがゼロになりました。'), rating: 5, avatar: 'CR' },
  { name: 'Jasmine Lim', role: 'Property Manager, Makati', text: L('Managing 12 units is so much easier now. One call and everything gets fixed. The reporting feature is a huge plus.','Mas madali na ang pamamahala ng 12 units. Isang tawag lang at ayos na lahat. Malaking tulong ang reporting feature.','12室の管理がとても楽に。1本の電話ですべて解決。レポート機能は大きなメリットです。'), rating: 5, avatar: 'JL' },
  { name: 'Rico Dela Cruz', role: 'Small Business Owner', text: L('Honest pricing, skilled workers, and they always show up on time. Exactly what I was looking for in a repair service.','Tapat na presyo, bihasang manggagawa, at lagi silang nasa oras. Eksakto ito ang hinahanap ko.','正直な料金、熟練した職人、常に時間通り。修理サービスに求めていたまさにこれです。'), rating: 5, avatar: 'RD' },
];

const STATS = [
  { value: '5,000+', label: L('Jobs Completed','Natapos na Trabaho','完了した仕事') },
  { value: '98%',    label: L('Satisfaction Rate','Satisfaction Rate','満足度') },
  { value: '150+',   label: L('Technicians','Mga Teknisyan','技術者数') },
  { value: '24/7',   label: L('Support','Suporta','サポート') },
];

// ── SINGLE CORRECT API URL ────────────────────────────────────────────────────
const CHAT_API_URL = 'https://pos-server-b4li.onrender.com/api/chat/support';

// ── LANG TOGGLE ───────────────────────────────────────────────────────────────
const LANG_CYCLE  = { en: 'fil', fil: 'ja', ja: 'en' };
const LANG_FLAGS  = { en: '🇬🇧', fil: '🇵🇭', ja: '🇯🇵' };
const LANG_TITLES = { en: 'Switch to Filipino', fil: '日本語に切り替える', ja: 'Switch to English' };

function LangToggle({ lang, setLang, isLight }) {
  const bg     = isLight ? 'rgba(0,0,0,0.05)'  : 'rgba(255,255,255,0.06)';
  const border = isLight ? 'rgba(0,0,0,0.12)'  : 'rgba(255,255,255,0.12)';
  const color  = isLight ? 'rgba(17,24,39,0.75)' : 'rgba(232,237,245,0.85)';
  return (
    <div onClick={() => setLang(l => LANG_CYCLE[l])} title={LANG_TITLES[lang]}
      style={{ display:'flex', alignItems:'center', gap:6, background:bg, border:`1px solid ${border}`, borderRadius:100, padding:'5px 12px 5px 8px', cursor:'pointer', userSelect:'none', fontSize:13, fontWeight:600, color, flexShrink:0, transition:'all 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.background = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.1)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = bg; }}
    >
      <div style={{ display:'flex', background: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)', borderRadius:100, padding:'2px', gap:2 }}>
        {['en','fil','ja'].map(code => (
          <span key={code} style={{ padding:'2px 7px', borderRadius:100, fontSize:11, fontWeight:700,
            background: lang===code ? 'linear-gradient(135deg,#6366f1,#a855f7)' : 'transparent',
            color: lang===code ? '#fff' : isLight ? 'rgba(17,24,39,0.4)' : 'rgba(232,237,245,0.4)',
            transition:'all 0.2s' }}>
            {code==='en'?'EN':code==='fil'?'FIL':'JA'}
          </span>
        ))}
      </div>
      <span style={{ fontSize:14 }}>{LANG_FLAGS[lang]}</span>
    </div>
  );
}

// ── THEME TOGGLE ──────────────────────────────────────────────────────────────
function ThemeToggle({ theme, setTheme, isLight }) {
  const bg     = isLight ? 'rgba(0,0,0,0.05)'  : 'rgba(255,255,255,0.06)';
  const border = isLight ? 'rgba(0,0,0,0.12)'  : 'rgba(255,255,255,0.12)';
  return (
    <div onClick={() => setTheme(t => t==='dark'?'light':'dark')}
      title={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
      style={{ display:'flex', alignItems:'center', justifyContent:'center', width:36, height:36, background:bg, border:`1px solid ${border}`, borderRadius:'50%', cursor:'pointer', transition:'all 0.2s', userSelect:'none', fontSize:15, flexShrink:0 }}
      onMouseEnter={e => { e.currentTarget.style.background = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.1)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = bg; }}
    >{isLight ? '🌙' : '☀️'}</div>
  );
}

// ── AI CHAT WIDGET ────────────────────────────────────────────────────────────
function AIChatWidget({ th, isLight }) {
  const [open, setOpen]         = useState(false);
  const [messages, setMessages] = useState([{ role:'assistant', content:"Hi! 👋 I'm the FlowPOS assistant. How can I help you today?" }]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const endRef   = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => endRef.current?.scrollIntoView({ behavior:'smooth' }), 100);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open, messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next = [...messages, { role:'user', content:text }];
    setMessages(next); setInput(''); setLoading(true);
    try {
      const res = await fetch(CHAT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next.map(m => ({ role: m.role, content: m.content })) }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setMessages(p => [...p, { role:'assistant', content: data.reply || 'Sorry, no response. Try again.' }]);
    } catch {
      setMessages(p => [...p, { role:'assistant', content:'⚠️ Something went wrong. Please try again or contact us directly.' }]);
    } finally { setLoading(false); }
  };

  return (
    <>
      <style>{`
        @keyframes chatPop { from{opacity:0;transform:scale(0.88) translateY(20px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes fabPulse { 0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,0.45)} 60%{box-shadow:0 0 0 12px rgba(99,102,241,0)} }
        @keyframes dot { 0%,80%,100%{transform:translateY(0);opacity:.4} 40%{transform:translateY(-5px);opacity:1} }
        .chat-fab { position:fixed; bottom:24px; right:20px; z-index:1000; width:54px; height:54px; border-radius:50%; background:linear-gradient(135deg,#6366f1,#a855f7); border:none; cursor:pointer; color:#fff; font-size:22px; display:flex; align-items:center; justify-content:center; box-shadow:0 8px 28px rgba(99,102,241,0.45); transition:transform 0.2s; animation:fabPulse 2.5s ease-in-out infinite; }
        .chat-fab:hover { transform:scale(1.1); }
        .chat-win { position:fixed; bottom:88px; right:20px; z-index:1000; width:min(360px,calc(100vw - 24px)); border-radius:20px; overflow:hidden; animation:chatPop 0.22s ease both; box-shadow:0 20px 60px rgba(0,0,0,0.28); }
        .chat-msgs::-webkit-scrollbar { width:3px; }
        .chat-msgs::-webkit-scrollbar-thumb { background:rgba(99,102,241,0.25); border-radius:2px; }
        .tdot { width:6px; height:6px; border-radius:50%; background:#a78bfa; display:inline-block; margin:0 2px; }
        .tdot:nth-child(1){animation:dot 1.2s ease-in-out infinite 0s}
        .tdot:nth-child(2){animation:dot 1.2s ease-in-out infinite .2s}
        .tdot:nth-child(3){animation:dot 1.2s ease-in-out infinite .4s}
        @media(max-width:480px){ .chat-win { bottom:84px; right:12px; left:12px; width:auto; } .chat-fab { bottom:20px; right:16px; } }
      `}</style>

      <button className="chat-fab" onClick={() => setOpen(o => !o)}>{open ? '✕' : '💬'}</button>

      {open && (
        <div className="chat-win">
          {/* Header */}
          <div style={{ background:'linear-gradient(135deg,#6366f1,#a855f7)', padding:'14px 18px', display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36,height:36,borderRadius:'50%',background:'rgba(255,255,255,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:17,flexShrink:0 }}>⚡</div>
            <div style={{ flex:1 }}>
              <div style={{ color:'#fff', fontWeight:700, fontSize:14 }}>FlowPOS Support</div>
              <div style={{ color:'rgba(255,255,255,0.75)', fontSize:11, display:'flex', alignItems:'center', gap:5 }}>
                <span style={{ width:6,height:6,borderRadius:'50%',background:'#4ade80',display:'inline-block' }}/>AI Assistant · Online
              </div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background:'rgba(255,255,255,0.15)',border:'none',color:'#fff',width:26,height:26,borderRadius:'50%',cursor:'pointer',fontSize:13,display:'flex',alignItems:'center',justifyContent:'center' }}>✕</button>
          </div>

          {/* Messages */}
          <div className="chat-msgs" style={{ height:300, overflowY:'auto', padding:'14px 12px', background: isLight ? '#f8f9fc' : '#0d1020', display:'flex', flexDirection:'column', gap:10 }}>
            {messages.map((m,i) => (
              <div key={i} style={{ display:'flex', justifyContent: m.role==='user'?'flex-end':'flex-start', alignItems:'flex-end', gap:7 }}>
                {m.role==='assistant' && <div style={{ width:26,height:26,borderRadius:'50%',background:'linear-gradient(135deg,#6366f1,#a855f7)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,flexShrink:0 }}>⚡</div>}
                <div style={{ maxWidth:'76%', padding:'9px 13px',
                  borderRadius: m.role==='user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: m.role==='user' ? 'linear-gradient(135deg,#6366f1,#a855f7)' : (isLight ? '#fff' : 'rgba(255,255,255,0.07)'),
                  color: m.role==='user' ? '#fff' : th.color,
                  border: m.role==='user' ? 'none' : `1px solid ${isLight?'rgba(0,0,0,0.08)':'rgba(255,255,255,0.1)'}`,
                  fontSize:13, lineHeight:1.55,
                  boxShadow: isLight && m.role==='assistant' ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
                }}>{m.content}</div>
              </div>
            ))}
            {loading && (
              <div style={{ display:'flex', alignItems:'flex-end', gap:7 }}>
                <div style={{ width:26,height:26,borderRadius:'50%',background:'linear-gradient(135deg,#6366f1,#a855f7)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,flexShrink:0 }}>⚡</div>
                <div style={{ padding:'10px 14px', borderRadius:'16px 16px 16px 4px', background: isLight?'#fff':'rgba(255,255,255,0.07)', border:`1px solid ${isLight?'rgba(0,0,0,0.08)':'rgba(255,255,255,0.1)'}`, display:'flex', alignItems:'center' }}>
                  <span className="tdot"/><span className="tdot"/><span className="tdot"/>
                </div>
              </div>
            )}
            <div ref={endRef}/>
          </div>

          {/* Quick suggestions */}
          {messages.length === 1 && (
            <div style={{ padding:'8px 12px', background: isLight?'#f8f9fc':'#0d1020', display:'flex', gap:6, flexWrap:'wrap' }}>
              {['Services?','Pricing?','How to book?'].map(q => (
                <button key={q} onClick={() => { setInput(q); setTimeout(()=>inputRef.current?.focus(),50); }}
                  style={{ fontSize:11, padding:'4px 10px', borderRadius:100, background:'transparent', border:`1px solid ${isLight?'rgba(99,102,241,0.3)':'rgba(99,102,241,0.4)'}`, color:'#a78bfa', cursor:'pointer', transition:'all 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background='rgba(99,102,241,0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background='transparent'}
                >{q}</button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding:'10px 12px', background: isLight?'#fff':'#0a0e1a', borderTop:`1px solid ${isLight?'rgba(0,0,0,0.07)':'rgba(255,255,255,0.07)'}`, display:'flex', gap:8, alignItems:'flex-end' }}>
            <textarea ref={inputRef} value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();} }}
              placeholder="Type a message..." rows={1}
              style={{ flex:1, background: isLight?'#f4f6fb':'rgba(255,255,255,0.06)', border:`1px solid ${isLight?'rgba(0,0,0,0.1)':'rgba(255,255,255,0.1)'}`, borderRadius:10, padding:'9px 12px', fontSize:13, color:th.color, resize:'none', outline:'none', lineHeight:1.5, maxHeight:90, overflowY:'auto', fontFamily:"'DM Sans',sans-serif" }}
              onFocus={e=>e.target.style.borderColor='#6366f1'}
              onBlur={e=>e.target.style.borderColor=isLight?'rgba(0,0,0,0.1)':'rgba(255,255,255,0.1)'}
            />
            <button onClick={send} disabled={!input.trim()||loading}
              style={{ width:36,height:36,borderRadius:'50%',flexShrink:0, background: input.trim()&&!loading?'linear-gradient(135deg,#6366f1,#a855f7)':(isLight?'rgba(0,0,0,0.07)':'rgba(255,255,255,0.07)'), border:'none', cursor: input.trim()&&!loading?'pointer':'not-allowed', color: input.trim()&&!loading?'#fff':(isLight?'rgba(0,0,0,0.3)':'rgba(255,255,255,0.3)'), fontSize:16, display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.2s' }}
            >↑</button>
          </div>
        </div>
      )}
    </>
  );
}

// ── SECTION HEADER helper ─────────────────────────────────────────────────────
function SectionHeader({ label, title1, title2, sub, center = true }) {
  return (
    <div style={{ textAlign: center ? 'center' : 'left', marginBottom: 52 }}>
      <div className="sec-label">{label}</div>
      <h2 className="sec-title">{title1}<br /><span className="grad-text">{title2}</span></h2>
      {sub && <p className="sec-sub" style={{ margin: center ? '0 auto' : 0 }}>{sub}</p>}
    </div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const [lang, setLang]         = useState('en');
  const [theme, setTheme]       = useState('dark');
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [formData, setFormData] = useState({ name:'', email:'', phone:'', service:'', message:'' });
  const [submitted, setSubmitted] = useState(false);
  const t       = TRANSLATIONS[lang];
  const isLight = theme === 'light';

  // ── theme tokens ────────────────────────────────────────────────────────────
  const th = {
    bg:         isLight ? '#f5f7fc' : '#080b14',
    color:      isLight ? '#111827' : '#e8edf5',
    navBg:      isLight ? 'rgba(245,247,252,0.95)' : 'rgba(8,11,20,0.93)',
    navBorder:  isLight ? 'rgba(0,0,0,0.07)' : 'rgba(255,255,255,0.06)',
    cardBg:     isLight ? '#ffffff' : 'rgba(255,255,255,0.035)',
    cardBorder: isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.07)',
    secBg:      isLight ? '#eef1f8' : 'rgba(255,255,255,0.02)',
    secBorder:  isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.05)',
    sub:        isLight ? 'rgba(17,24,39,0.55)' : 'rgba(232,237,245,0.55)',
    body:       isLight ? 'rgba(17,24,39,0.7)'  : 'rgba(232,237,245,0.65)',
    muted:      isLight ? 'rgba(17,24,39,0.38)' : 'rgba(232,237,245,0.35)',
    tagBg:      isLight ? 'rgba(0,0,0,0.05)'    : 'rgba(255,255,255,0.06)',
    tagBorder:  isLight ? 'rgba(0,0,0,0.09)'    : 'rgba(255,255,255,0.1)',
    inputBg:    isLight ? '#ffffff'              : 'rgba(255,255,255,0.05)',
    inputBorder:isLight ? 'rgba(0,0,0,0.14)'    : 'rgba(255,255,255,0.1)',
    hlCard:     isLight
      ? 'linear-gradient(135deg,rgba(99,102,241,0.09),rgba(168,85,247,0.09))'
      : 'linear-gradient(135deg,rgba(99,102,241,0.14),rgba(168,85,247,0.14))',
    statBg:  (i) => i===1
      ? 'linear-gradient(135deg,rgba(99,102,241,0.14),rgba(168,85,247,0.14))'
      : (isLight ? '#ffffff' : 'rgba(255,255,255,0.035)'),
    statBdr: (i) => i===1 ? 'rgba(168,85,247,0.4)' : (isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.07)'),
    menuBg:  isLight ? 'rgba(245,247,252,0.98)' : 'rgba(8,11,20,0.98)',
  };

  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0,0);
    setTimeout(() => { window.scrollTo(0,0); document.documentElement.style.scrollBehavior = 'smooth'; }, 400);
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const fn = () => { if (window.innerWidth > 768) setMenuOpen(false); };
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  const go = (id) => { document.getElementById(id)?.scrollIntoView({ behavior:'smooth' }); setMenuOpen(false); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch('http://localhost:5000/api/bookings', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(formData) });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
      setFormData({ name:'', email:'', phone:'', service:'', message:'' });
    } catch { alert('Something went wrong. Please try again.'); }
  };

  return (
    <div style={{ fontFamily:"'DM Sans',sans-serif", background:th.bg, color:th.color, overflowX:'hidden', transition:'background 0.3s,color 0.3s' }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700&family=Playfair+Display:wght@700;800;900&display=swap" rel="stylesheet"/>

      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body{overflow-x:hidden;max-width:100vw}
        ::selection{background:#a855f7;color:#fff}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-track{background:${th.bg}}
        ::-webkit-scrollbar-thumb{background:#6366f1;border-radius:3px}

        @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        @keyframes float{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-16px) rotate(3deg)}}
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes slideDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}

        .fu{animation:fadeUp 0.65s ease both}
        .d1{animation-delay:.08s}.d2{animation-delay:.18s}.d3{animation-delay:.28s}.d4{animation-delay:.38s}

        .grad-text{
          background:linear-gradient(135deg,#a78bfa 0%,#60a5fa 50%,#f472b6 100%);
          background-size:200% auto;
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
          animation:shimmer 4s linear infinite;
        }

        .sec-label{
          display:inline-block;font-size:10.5px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;
          color:#a78bfa;background:rgba(167,139,250,0.1);border:1px solid rgba(167,139,250,0.22);
          padding:5px 14px;border-radius:100px;margin-bottom:16px;
        }
        .sec-title{
          font-family:'Playfair Display',serif;
          font-size:clamp(26px,4.5vw,50px);font-weight:800;line-height:1.08;letter-spacing:-0.5px;
          color:${th.color};margin-bottom:14px;
        }
        .sec-sub{
          font-size:clamp(14px,2vw,16px);color:${th.sub};line-height:1.7;
          max-width:480px;
        }

        .nav-link{font-size:14px;font-weight:500;color:${isLight?'rgba(17,24,39,0.6)':'rgba(232,237,245,0.65)'};cursor:pointer;transition:color 0.2s;letter-spacing:0.2px}
        .nav-link:hover{color:${isLight?'#111827':'#fff'}}

        .btn-p{
          display:inline-flex;align-items:center;justify-content:center;gap:7px;
          background:linear-gradient(135deg,#6366f1,#a855f7);color:#fff;border:none;border-radius:100px;
          padding:12px 26px;font-size:14px;font-weight:600;cursor:pointer;
          transition:all 0.22s;font-family:'DM Sans',sans-serif;white-space:nowrap;
        }
        .btn-p:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(99,102,241,0.38)}
        .btn-p:active{transform:scale(0.97)}
        .btn-o{
          display:inline-flex;align-items:center;justify-content:center;gap:7px;
          background:transparent;color:${isLight?'#111827':'#e8edf5'};
          border:1.5px solid ${isLight?'rgba(0,0,0,0.18)':'rgba(255,255,255,0.2)'};border-radius:100px;
          padding:12px 26px;font-size:14px;font-weight:500;cursor:pointer;
          transition:all 0.22s;font-family:'DM Sans',sans-serif;white-space:nowrap;
        }
        .btn-o:hover{border-color:${isLight?'rgba(0,0,0,0.35)':'rgba(255,255,255,0.45)'};background:${isLight?'rgba(0,0,0,0.04)':'rgba(255,255,255,0.05)'}}

        .card{
          background:${th.cardBg};border:1px solid ${th.cardBorder};border-radius:18px;
          transition:all 0.28s ease;position:relative;overflow:hidden;
        }
        .card::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(99,102,241,0.07),rgba(168,85,247,0.07));opacity:0;transition:opacity 0.28s}
        .card:hover{border-color:rgba(99,102,241,0.4);transform:translateY(-5px);box-shadow:${isLight?'0 12px 36px rgba(99,102,241,0.1)':'0 12px 36px rgba(0,0,0,0.2)'}}
        .card:hover::before{opacity:1}

        .p-card{
          background:${th.cardBg};
          border:1px solid ${isLight?'rgba(0,0,0,0.08)':'rgba(255,255,255,0.08)'};
          border-radius:20px;transition:all 0.28s ease;position:relative;overflow:hidden;
        }
        .p-card.hl{background:${th.hlCard};border-color:rgba(168,85,247,0.45);box-shadow:0 0 50px rgba(99,102,241,${isLight?'0.1':'0.18'})}
        .p-card:hover{transform:translateY(-4px);box-shadow:${isLight?'0 14px 40px rgba(99,102,241,0.1)':'0 14px 40px rgba(0,0,0,0.2)'}}

        .t-card{background:${th.cardBg};border:1px solid ${th.cardBorder};border-radius:18px;transition:all 0.28s}
        .t-card:hover{border-color:rgba(99,102,241,0.3);transform:translateY(-4px);box-shadow:${isLight?'0 10px 32px rgba(99,102,241,0.08)':'none'}}

        .inp{
          width:100%;background:${th.inputBg};border:1.5px solid ${th.inputBorder};
          border-radius:11px;padding:13px 16px;font-size:14px;color:${th.color};
          font-family:'DM Sans',sans-serif;transition:border-color 0.2s,box-shadow 0.2s;outline:none;
        }
        .inp:focus{border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,0.12)}
        .inp::placeholder{color:${th.muted}}
        select.inp option{background:${isLight?'#fff':'#0f1120'};color:${th.color}}

        .mob-menu{
          display:none;position:fixed;top:68px;left:0;right:0;z-index:99;
          background:${th.menuBg};backdrop-filter:blur(20px);
          border-bottom:1px solid ${isLight?'rgba(0,0,0,0.08)':'rgba(255,255,255,0.07)'};
          padding:8px 0 24px;flex-direction:column;
          animation:slideDown 0.2s ease both;
        }
        .mob-menu.open{display:flex}
        .mob-link{
          padding:14px 24px;font-size:15px;font-weight:500;
          color:${isLight?'rgba(17,24,39,0.75)':'rgba(232,237,245,0.75)'};
          cursor:pointer;transition:all 0.18s;border-bottom:1px solid ${isLight?'rgba(0,0,0,0.05)':'rgba(255,255,255,0.05)'};
        }
        .mob-link:hover{color:${isLight?'#111827':'#fff'};background:${isLight?'rgba(0,0,0,0.03)':'rgba(255,255,255,0.03)'};padding-left:30px}
        .mob-link:last-of-type{border-bottom:none}

        .wrap{max-width:1200px;margin:0 auto;padding:0 clamp(16px,4vw,40px)}
        .sec{padding:clamp(64px,8vw,108px) clamp(16px,4vw,40px)}
        .orb{position:absolute;border-radius:50%;filter:blur(90px);pointer-events:none;opacity:${isLight?'0.09':'0.17'}}

        .g3{display:grid;grid-template-columns:repeat(3,1fr);gap:22px}
        .g4{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
        .g2-about{display:grid;grid-template-columns:1fr 1fr;gap:72px;align-items:center}
        .g2-stats{display:grid;grid-template-columns:1fr 1fr;gap:14px}

        @media(max-width:1024px){.g3{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:900px){.g2-about{grid-template-columns:1fr;gap:40px}.g4{grid-template-columns:repeat(2,1fr)}}
        @media(max-width:768px){
          .g3{grid-template-columns:repeat(2,1fr);gap:14px}
          .g4{grid-template-columns:repeat(2,1fr)}
          .hide-m{display:none!important}
          .show-m{display:flex!important}
          .sec{padding:clamp(48px,7vw,80px) clamp(16px,4vw,24px)}
          .sec-title{font-size:clamp(24px,5.5vw,38px)}
          .p-card{padding:24px 20px!important}
        }
        @media(max-width:560px){
          .g3{grid-template-columns:1fr}
          .g4{grid-template-columns:repeat(2,1fr)}
          .sec-title{font-size:clamp(22px,6vw,32px)}
          .btn-p,.btn-o{font-size:13px;padding:11px 20px}
        }
        @media(max-width:400px){.g4{grid-template-columns:repeat(2,1fr)}}
        .show-m{display:none}
      `}</style>

      {/* ── MOBILE MENU ─────────────────────────────────────────────────── */}
      <div className={`mob-menu${menuOpen?' open':''}`}>
        {t.navLinks.map((l,i) => <div key={l} className="mob-link" onClick={()=>go(NAV_IDS[i])}>{l}</div>)}
        <div style={{ padding:'16px 24px 0', display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
          <ThemeToggle theme={theme} setTheme={setTheme} isLight={isLight}/>
          <LangToggle lang={lang} setLang={setLang} isLight={isLight}/>
        </div>
        <div style={{ padding:'14px 24px 0', display:'flex', flexDirection:'column', gap:10 }}>
          <button className="btn-o" onClick={()=>{navigate('/login');setMenuOpen(false)}} style={{ width:'100%' }}>{t.navLogin}</button>
          <button className="btn-p" onClick={()=>go('contact')} style={{ width:'100%' }}>{t.navBook}</button>
        </div>
      </div>

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <nav style={{
        position:'fixed',top:0,left:0,right:0,zIndex:100,height:68,
        padding:'0 clamp(16px,4vw,40px)',display:'flex',alignItems:'center',justifyContent:'space-between',
        background: scrolled ? th.navBg : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? `1px solid ${th.navBorder}` : 'none',
        transition:'all 0.3s',
      }}>
        <div style={{ display:'flex',alignItems:'center',gap:9,flexShrink:0 }}>
          <div style={{ width:34,height:34,borderRadius:9,background:'linear-gradient(135deg,#6366f1,#a855f7)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,fontWeight:800 }}>⚡</div>
          <span style={{ fontSize:19,fontWeight:700,fontFamily:"'Playfair Display',serif",letterSpacing:'-0.4px',color:th.color }}>
            Flow<span style={{ color:'#a855f7' }}>POS</span>
          </span>
        </div>
        <div className="hide-m" style={{ display:'flex',alignItems:'center',gap:32 }}>
          {t.navLinks.map((l,i)=><span key={l} className="nav-link" onClick={()=>go(NAV_IDS[i])}>{l}</span>)}
        </div>
        <div className="hide-m" style={{ display:'flex',alignItems:'center',gap:8 }}>
          <ThemeToggle theme={theme} setTheme={setTheme} isLight={isLight}/>
          <LangToggle lang={lang} setLang={setLang} isLight={isLight}/>
          <button className="btn-o" onClick={()=>navigate('/login')} style={{ padding:'9px 20px',fontSize:13 }}>{t.navLogin}</button>
          <button className="btn-p" onClick={()=>go('contact')} style={{ padding:'9px 20px',fontSize:13 }}>{t.navBook}</button>
        </div>
        <button onClick={()=>setMenuOpen(!menuOpen)} className="show-m"
          style={{ background:'none',border:`1.5px solid ${isLight?'rgba(0,0,0,0.14)':'rgba(255,255,255,0.15)'}`,color:th.color,fontSize:18,cursor:'pointer',width:38,height:38,borderRadius:8,alignItems:'center',justifyContent:'center',transition:'all 0.2s' }}>
          {menuOpen?'✕':'☰'}
        </button>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section id="hero" style={{ minHeight:'100vh',display:'flex',alignItems:'center',position:'relative',overflow:'hidden',padding:'clamp(100px,14vw,140px) clamp(16px,4vw,40px) clamp(48px,6vw,80px)' }}>
        <div className="orb" style={{ width:580,height:580,background:'#6366f1',top:-80,right:-80 }}/>
        <div className="orb" style={{ width:380,height:380,background:'#a855f7',bottom:-40,left:-80 }}/>
        <div className="hide-m" style={{ position:'absolute',top:'18%',right:'7%',animation:'float 6s ease-in-out infinite',opacity:0.55 }}>
          <div style={{ width:72,height:72,borderRadius:18,background:'linear-gradient(135deg,#6366f1,#a855f7)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:32 }}>🔧</div>
        </div>
        <div className="hide-m" style={{ position:'absolute',top:'52%',right:'17%',animation:'float 8s ease-in-out infinite 1.8s',opacity:0.45 }}>
          <div style={{ width:54,height:54,borderRadius:13,background:isLight?'rgba(99,102,241,0.12)':'rgba(99,102,241,0.2)',border:'1px solid rgba(99,102,241,0.4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24 }}>⚡</div>
        </div>
        <div className="hide-m" style={{ position:'absolute',top:'32%',right:'28%',animation:'float 7s ease-in-out infinite 0.9s',opacity:0.38 }}>
          <div style={{ width:42,height:42,borderRadius:10,background:isLight?'rgba(168,85,247,0.1)':'rgba(168,85,247,0.18)',border:'1px solid rgba(168,85,247,0.35)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:19 }}>❄️</div>
        </div>
        <div style={{ maxWidth:680,position:'relative',zIndex:2,width:'100%' }}>
          <div className="fu sec-label">{t.heroLabel}</div>
          <h1 className="fu d1" style={{ fontFamily:"'Playfair Display',serif",fontSize:'clamp(34px,7vw,86px)',fontWeight:900,lineHeight:1.04,letterSpacing:'-2px',margin:'0 0 20px',color:th.color }}>
            {t.heroTitle1}<br/><span className="grad-text">{t.heroTitle2}</span>
          </h1>
          <p className="fu d2" style={{ fontSize:'clamp(14px,2.5vw,17px)',lineHeight:1.75,color:th.body,maxWidth:500,marginBottom:32 }}>
            {t.heroSub}
          </p>
          <div className="fu d3" style={{ display:'flex',gap:12,flexWrap:'wrap',marginBottom:48 }}>
            <button className="btn-p" onClick={()=>go('contact')} style={{ fontSize:'clamp(13px,2vw,15px)',padding:'13px 28px' }}>{t.heroCta1}</button>
            <button className="btn-o" onClick={()=>go('services')} style={{ fontSize:'clamp(13px,2vw,15px)',padding:'13px 28px' }}>{t.heroCta2}</button>
          </div>
          <div className="fu d4" style={{ display:'flex',gap:'clamp(20px,4vw,40px)',flexWrap:'wrap',paddingTop:32,borderTop:`1px solid ${isLight?'rgba(0,0,0,0.07)':'rgba(255,255,255,0.07)'}` }}>
            {STATS.map(s=>(
              <div key={s.value}>
                <div style={{ fontSize:'clamp(18px,3.5vw,28px)',fontWeight:800,fontFamily:"'Playfair Display',serif",color:th.color,lineHeight:1.1 }}>{s.value}</div>
                <div style={{ fontSize:'clamp(10px,1.8vw,12px)',color:th.muted,marginTop:3,letterSpacing:'0.3px' }}>{s.label[lang]}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ────────────────────────────────────────────────────── */}
      <section id="services" className="sec" style={{ maxWidth:1200,margin:'0 auto' }}>
        <SectionHeader label={t.servicesLabel} title1={t.servicesTitle1} title2={t.servicesTitle2} sub={t.servicesSub}/>
        <div className="g3">
          {SERVICES.map((s,i)=>(
            <div key={i} className="card" style={{ padding:'clamp(20px,3vw,30px)' }}>
              <div style={{ width:48,height:48,borderRadius:13,background:isLight?'rgba(99,102,241,0.08)':'rgba(99,102,241,0.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,marginBottom:18 }}>{s.icon}</div>
              <h3 style={{ fontSize:'clamp(15px,2vw,17px)',fontWeight:700,marginBottom:9,color:th.color }}>{s.title[lang]}</h3>
              <p style={{ fontSize:13,color:th.sub,lineHeight:1.7,marginBottom:18 }}>{s.desc[lang]}</p>
              <span style={{ fontSize:12,fontWeight:700,color:'#a78bfa',background:'rgba(167,139,250,0.1)',border:'1px solid rgba(167,139,250,0.2)',borderRadius:100,padding:'4px 12px' }}>{s.price}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── ABOUT ───────────────────────────────────────────────────────── */}
      <section id="about" style={{ background:th.secBg,borderTop:`1px solid ${th.secBorder}`,borderBottom:`1px solid ${th.secBorder}` }}>
        <div className="wrap sec g2-about">
          <div>
            <SectionHeader label={t.aboutLabel} title1={t.aboutTitle1} title2={t.aboutTitle2} center={false}/>
            <p style={{ color:th.body,fontSize:'clamp(14px,1.8vw,15.5px)',lineHeight:1.85,marginBottom:20 }}>{t.aboutP1}</p>
            <p style={{ color:th.body,fontSize:'clamp(14px,1.8vw,15.5px)',lineHeight:1.85,marginBottom:32 }}>{t.aboutP2}</p>
            <div style={{ display:'flex',gap:8,flexWrap:'wrap' }}>
              {t.aboutTags.map(tag=>(
                <span key={tag} style={{ fontSize:12,color:th.color,background:th.tagBg,border:`1px solid ${th.tagBorder}`,borderRadius:100,padding:'6px 14px',fontWeight:500 }}>✓ {tag}</span>
              ))}
            </div>
          </div>
          <div className="g2-stats">
            {STATS.map((s,i)=>(
              <div key={i} style={{ background:th.statBg(i),border:`1px solid ${th.statBdr(i)}`,borderRadius:18,padding:'clamp(18px,3vw,28px)',textAlign:'center' }}>
                <div style={{ fontFamily:"'Playfair Display',serif",fontSize:'clamp(22px,4vw,38px)',fontWeight:800,color:th.color,lineHeight:1.1,marginBottom:6 }}>{s.value}</div>
                <div style={{ fontSize:12,color:th.sub,letterSpacing:'0.3px' }}>{s.label[lang]}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────────────── */}
      <section id="pricing" className="sec" style={{ maxWidth:1100,margin:'0 auto' }}>
        <SectionHeader label={t.pricingLabel} title1={t.pricingTitle1} title2={t.pricingTitle2} sub={t.pricingSub}/>
        <div className="g3">
          {PRICING.map((p,i)=>(
            <div key={i} className={`p-card${p.highlight?' hl':''}`} style={{ padding:'clamp(22px,3vw,36px)' }}>
              {p.highlight && (
                <div style={{ position:'absolute',top:14,right:14,fontSize:10,fontWeight:700,letterSpacing:1.5,background:'linear-gradient(135deg,#6366f1,#a855f7)',color:'#fff',padding:'4px 11px',borderRadius:100,textTransform:'uppercase' }}>{t.pricingPopular}</div>
              )}
              <div style={{ fontSize:12,color:th.sub,marginBottom:6,fontWeight:500 }}>{p.name[lang]}</div>
              <div style={{ display:'flex',alignItems:'baseline',gap:4,marginBottom:4 }}>
                <span style={{ fontFamily:"'Playfair Display',serif",fontSize:'clamp(26px,5vw,44px)',fontWeight:800,color:th.color,lineHeight:1.1 }}>{p.price}</span>
                <span style={{ fontSize:13,color:th.muted }}>{p.period}</span>
              </div>
              <p style={{ fontSize:12,color:th.sub,marginBottom:24,lineHeight:1.5 }}>{p.desc[lang]}</p>
              <div style={{ marginBottom:28,display:'flex',flexDirection:'column',gap:10 }}>
                {p.features[lang].map((f,j)=>(
                  <div key={j} style={{ display:'flex',alignItems:'flex-start',gap:9,fontSize:13,color:th.body,lineHeight:1.5 }}>
                    <span style={{ color:'#a78bfa',fontSize:14,flexShrink:0,marginTop:1 }}>✓</span>{f}
                  </div>
                ))}
              </div>
              <button className={p.highlight?'btn-p':'btn-o'} onClick={()=>go('contact')} style={{ width:'100%' }}>{p.cta[lang]}</button>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────────────────── */}
      <section id="testimonials" style={{ background:th.secBg,borderTop:`1px solid ${th.secBorder}` }}>
        <div className="wrap sec">
          <SectionHeader label={t.testimonialsLabel} title1={t.testimonialsTitle1} title2={t.testimonialsTitle2}/>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(min(260px,100%),1fr))',gap:20 }}>
            {TESTIMONIALS.map((tm,i)=>(
              <div key={i} className="t-card" style={{ padding:'clamp(20px,3vw,28px)' }}>
                <div style={{ display:'flex',gap:3,marginBottom:16 }}>
                  {Array.from({length:tm.rating}).map((_,j)=><span key={j} style={{ color:'#f59e0b',fontSize:14 }}>★</span>)}
                </div>
                <p style={{ fontSize:14,lineHeight:1.75,color:th.body,marginBottom:20,fontStyle:'italic' }}>
                  {t.quoteOpen}{tm.text[lang]}{t.quoteClose}
                </p>
                <div style={{ display:'flex',alignItems:'center',gap:11 }}>
                  <div style={{ width:38,height:38,borderRadius:'50%',background:'linear-gradient(135deg,#6366f1,#a855f7)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:'#fff',flexShrink:0 }}>{tm.avatar}</div>
                  <div>
                    <div style={{ fontSize:13,fontWeight:700,color:th.color }}>{tm.name}</div>
                    <div style={{ fontSize:11,color:th.muted }}>{tm.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ─────────────────────────────────────────────────────── */}
      <section id="contact" className="sec" style={{ maxWidth:780,margin:'0 auto' }}>
        <SectionHeader label={t.contactLabel} title1={t.contactTitle1} title2={t.contactTitle2} sub={t.contactSub}/>
        {submitted ? (
          <div style={{ textAlign:'center',padding:'clamp(32px,6vw,56px) clamp(20px,5vw,40px)',background:'rgba(99,102,241,0.08)',border:'1px solid rgba(99,102,241,0.25)',borderRadius:22 }}>
            <div style={{ fontSize:48,marginBottom:14 }}>✅</div>
            <h3 style={{ fontSize:'clamp(18px,3vw,24px)',fontWeight:700,marginBottom:8,fontFamily:"'Playfair Display',serif",color:th.color }}>{t.successTitle}</h3>
            <p style={{ color:th.sub,fontSize:15 }}>{t.successSub}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ background:th.cardBg,border:`1px solid ${th.cardBorder}`,borderRadius:22,padding:'clamp(24px,5vw,48px)',display:'flex',flexDirection:'column',gap:18 }}>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:16 }}>
              <div>
                <label style={{ fontSize:12,color:th.sub,marginBottom:7,display:'block',fontWeight:500 }}>{t.formName} *</label>
                <input className="inp" required placeholder={t.formNamePh} value={formData.name} onChange={e=>setFormData({...formData,name:e.target.value})}/>
              </div>
              <div>
                <label style={{ fontSize:12,color:th.sub,marginBottom:7,display:'block',fontWeight:500 }}>{t.formEmail} *</label>
                <input className="inp" type="email" required placeholder={t.formEmailPh} value={formData.email} onChange={e=>setFormData({...formData,email:e.target.value})}/>
              </div>
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:16 }}>
              <div>
                <label style={{ fontSize:12,color:th.sub,marginBottom:7,display:'block',fontWeight:500 }}>{t.formPhone} *</label>
                <input className="inp" required placeholder={t.formPhonePh} value={formData.phone} onChange={e=>setFormData({...formData,phone:e.target.value})}/>
              </div>
              <div>
                <label style={{ fontSize:12,color:th.sub,marginBottom:7,display:'block',fontWeight:500 }}>{t.formService} *</label>
                <select className="inp" required value={formData.service} onChange={e=>setFormData({...formData,service:e.target.value})}>
                  <option value="" disabled>{t.formServicePh}</option>
                  {SERVICES.map(s=><option key={s.title.en} value={s.title.en}>{s.title[lang]}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={{ fontSize:12,color:th.sub,marginBottom:7,display:'block',fontWeight:500 }}>{t.formMessage}</label>
              <textarea className="inp" rows={4} placeholder={t.formMessagePh} style={{ resize:'vertical',minHeight:100 }} value={formData.message} onChange={e=>setFormData({...formData,message:e.target.value})}/>
            </div>
            <button type="submit" className="btn-p" style={{ width:'100%',padding:'15px',fontSize:'clamp(13px,2vw,15px)' }}>{t.formSubmit}</button>
          </form>
        )}
      </section>

      {/* ── AI CHAT WIDGET ───────────────────────────────────────────────── */}
      <AIChatWidget th={th} isLight={isLight}/>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer style={{ borderTop:`1px solid ${th.secBorder}`,padding:'clamp(22px,4vw,36px) clamp(16px,4vw,40px)' }}>
        <div style={{ maxWidth:1200,margin:'0 auto',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:14,rowGap:16 }}>
          <div style={{ display:'flex',alignItems:'center',gap:9 }}>
            <div style={{ width:28,height:28,borderRadius:7,background:'linear-gradient(135deg,#6366f1,#a855f7)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13 }}>⚡</div>
            <span style={{ fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,color:th.color }}>Flow<span style={{ color:'#a855f7' }}>POS</span></span>
          </div>
          <div style={{ display:'flex',flexDirection:'column',alignItems:'center',gap:4,textAlign:'center' }}>
            <p style={{ fontSize:12,color:th.muted }}>{t.footerRights}</p>
            <p style={{ fontSize:11,color:th.muted }}>
              Sortware Engineered by{' '}
              <a href="https://yourportfolio.com" target="_blank" rel="noopener noreferrer"
                style={{ color:'#a78bfa',textDecoration:'none',fontWeight:600,transition:'color 0.2s' }}
                onMouseEnter={e=>e.currentTarget.style.color='#c084fc'}
                onMouseLeave={e=>e.currentTarget.style.color='#a78bfa'}
              >Arman Villegas</a>
            </p>
          </div>
          <div style={{ display:'flex',gap:20,flexWrap:'wrap' }}>
            {t.footerLinks.map((l,i)=>(
              <span key={l} className="nav-link" style={{ fontSize:12 }} onClick={()=>go(NAV_IDS[i])}>{l}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}