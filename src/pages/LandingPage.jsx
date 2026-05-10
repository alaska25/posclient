import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const NAV_LINKS = ['Services', 'Pricing', 'About', 'Testimonials', 'Contact'];

const SERVICES = [
  { icon: '⚡', title: 'Electrical Repairs', desc: 'Wiring, outlets, panels, and full electrical diagnostics by certified technicians.', price: 'From ₱800' },
  { icon: '🔧', title: 'Plumbing Services', desc: 'Leak fixes, pipe installation, drain cleaning, and emergency plumbing support.', price: 'From ₱600' },
  { icon: '❄️', title: 'HVAC & Aircon', desc: 'Installation, cleaning, refrigerant recharge, and preventive maintenance.', price: 'From ₱1,200' },
  { icon: '🖥️', title: 'Appliance Repair', desc: 'Washing machines, refrigerators, ovens, and all major home appliances.', price: 'From ₱500' },
  { icon: '🏠', title: 'Home Renovation', desc: 'Painting, tiling, carpentry, and general home improvement projects.', price: 'From ₱2,000' },
  { icon: '🔒', title: 'Security Systems', desc: 'CCTV installation, smart locks, alarm systems, and security audits.', price: 'From ₱3,500' },
];

const PRICING = [
  {
    name: 'Basic',
    price: '₱499',
    period: '/visit',
    desc: 'Perfect for single repairs',
    features: ['1 technician visit', 'Diagnostic included', 'Basic warranty (7 days)', 'Email support'],
    cta: 'Book Now',
    highlight: false,
  },
  {
    name: 'Standard',
    price: '₱1,299',
    period: '/month',
    desc: 'Most popular for households',
    features: ['3 technician visits', 'Priority scheduling', '30-day warranty', 'Phone & email support', 'Free follow-up check'],
    cta: 'Get Started',
    highlight: true,
  },
  {
    name: 'Premium',
    price: '₱2,999',
    period: '/month',
    desc: 'Ideal for businesses',
    features: ['Unlimited visits', '24/7 emergency support', '90-day warranty', 'Dedicated technician', 'Monthly maintenance report', 'Free parts on minor repairs'],
    cta: 'Contact Us',
    highlight: false,
  },
];

const TESTIMONIALS = [
  { name: 'Maria Santos', role: 'Homeowner, Quezon City', text: 'FlowPOS technicians fixed our aircon in under 2 hours. Professional, fast, and very affordable. Will definitely call again!', rating: 5, avatar: 'MS' },
  { name: 'Carlo Reyes', role: 'Restaurant Owner, BGC', text: 'We use the Premium plan for our restaurant and it has been a game changer. Zero downtime on our equipment since we signed up.', rating: 5, avatar: 'CR' },
  { name: 'Jasmine Lim', role: 'Property Manager, Makati', text: 'Managing 12 units is so much easier now. One call and everything gets fixed. The reporting feature is a huge plus.', rating: 5, avatar: 'JL' },
  { name: 'Rico Dela Cruz', role: 'Small Business Owner', text: 'Honest pricing, skilled workers, and they always show up on time. Exactly what I was looking for in a repair service.', rating: 5, avatar: 'RD' },
];

const STATS = [
  { value: '5,000+', label: 'Jobs Completed' },
  { value: '98%', label: 'Satisfaction Rate' },
  { value: '150+', label: 'Technicians' },
  { value: '24/7', label: 'Support Available' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', service: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const heroRef = useRef(null);

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
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#080b14', color: '#e8edf5', overflowX: 'hidden' }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />

      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: #a855f7; color: #fff; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #080b14; }
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
          font-size: 14px; font-weight: 500; color: rgba(232,237,245,0.65);
          cursor: pointer; transition: color 0.2s; text-decoration: none;
          letter-spacing: 0.3px;
        }
        .nav-link:hover { color: #fff; }

        /* Mobile menu */
        .mobile-menu {
          display: none;
          position: fixed;
          top: 72px; left: 0; right: 0;
          background: rgba(8,11,20,0.98);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          padding: 24px 24px 32px;
          flex-direction: column;
          gap: 0;
          z-index: 99;
        }
        .mobile-menu.open { display: flex; }
        .mobile-menu-link {
          padding: 14px 0;
          font-size: 16px; font-weight: 500;
          color: rgba(232,237,245,0.75);
          cursor: pointer;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          transition: color 0.2s;
        }
        .mobile-menu-link:hover { color: #fff; }
        .mobile-menu-link:last-of-type { border-bottom: none; }

        .service-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
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
        .service-card:hover { border-color: rgba(99,102,241,0.4); transform: translateY(-6px); }
        .service-card:hover::before { opacity: 1; }

        .pricing-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
          padding: 40px 32px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .pricing-card.highlight {
          background: linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.15));
          border-color: rgba(168,85,247,0.5);
          box-shadow: 0 0 60px rgba(99,102,241,0.2);
        }
        .pricing-card:hover { transform: translateY(-4px); }

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
          background: transparent; color: #e8edf5;
          border: 1px solid rgba(255,255,255,0.2); border-radius: 100px;
          padding: 14px 32px; font-size: 15px; font-weight: 500;
          cursor: pointer; transition: all 0.25s ease;
          font-family: 'DM Sans', sans-serif; text-decoration: none;
        }
        .btn-outline:hover { border-color: rgba(255,255,255,0.5); background: rgba(255,255,255,0.05); }

        .testimonial-card {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px; padding: 32px;
          transition: all 0.3s ease;
        }
        .testimonial-card:hover { border-color: rgba(99,102,241,0.3); transform: translateY(-4px); }

        .input-field {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px; padding: 14px 18px;
          font-size: 14px; color: #e8edf5;
          font-family: 'DM Sans', sans-serif;
          transition: border-color 0.2s; outline: none;
        }
        .input-field:focus { border-color: #6366f1; }
        .input-field::placeholder { color: rgba(232,237,245,0.35); }
        select.input-field option { background: #0f1120; color: #e8edf5; }

        /* Grid system */
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
        .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }

        /* About grid */
        .about-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
        }

        /* Stats grid inside about */
        .about-stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        /* Hero buttons row */
        .hero-buttons {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        /* Hero stats row */
        .hero-stats {
          display: flex;
          gap: 32px;
          margin-top: 52px;
          flex-wrap: wrap;
        }

        /* Section padding */
        .section-pad {
          padding: 100px clamp(20px, 5vw, 40px);
        }

        .orb {
          position: absolute; border-radius: 50%;
          filter: blur(80px); opacity: 0.18; pointer-events: none;
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
        }

        /* ── RESPONSIVE ── */

        /* Tablet */
        @media (max-width: 1024px) {
          .grid-3 { grid-template-columns: 1fr 1fr; }
        }

        @media (max-width: 900px) {
          .grid-4 { grid-template-columns: 1fr 1fr; }
          .about-grid { grid-template-columns: 1fr; gap: 48px; }
          .pricing-card { padding: 32px 24px; }
        }

        /* Mobile */
        @media (max-width: 768px) {
          .grid-2 { grid-template-columns: 1fr; }
          .grid-3 { grid-template-columns: 1fr; }
          .grid-4 { grid-template-columns: 1fr 1fr; }
          .hide-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
          .hero-title { font-size: clamp(34px, 8vw, 52px); letter-spacing: -1px; }
          .hero-stats { gap: 20px; margin-top: 36px; }
          .hero-buttons { flex-direction: column; width: 100%; }
          .hero-buttons .btn-primary,
          .hero-buttons .btn-outline { width: 100%; justify-content: center; }
          .about-stats-grid { grid-template-columns: 1fr 1fr; }
          .testimonial-card { padding: 24px; }
        }

        @media (max-width: 640px) {
          .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; }
          .section-title { font-size: 28px; }
          .service-card { padding: 24px 20px; }
          .pricing-card { padding: 28px 20px; }
          .about-stats-grid { grid-template-columns: 1fr 1fr; }
          .contact-form { padding: 24px !important; }
          .footer-inner {
            flex-direction: column;
            align-items: flex-start;
            gap: 20px;
          }
          .footer-links { flex-wrap: wrap; gap: 16px; }
        }

        /* Nav hamburger */
        .show-mobile { display: none; }
        @media (max-width: 768px) {
          .show-mobile { display: flex; }
        }
      `}</style>

      {/* ── MOBILE MENU ── */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        {NAV_LINKS.map(l => (
          <div key={l} className="mobile-menu-link" onClick={() => scrollTo(l.toLowerCase())}>{l}</div>
        ))}
        <button
          className="btn-outline"
          onClick={() => { navigate('/login'); setMenuOpen(false); }}
          style={{ marginTop: 20, justifyContent: 'center' }}
        >
          Login
        </button>
        <button
          className="btn-primary"
          onClick={() => scrollTo('contact')}
          style={{ marginTop: 10, justifyContent: 'center' }}
        >
          Book a Service
        </button>
      </div>

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '0 clamp(20px, 5vw, 40px)', height: 72,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'rgba(8,11,20,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
        transition: 'all 0.3s ease',
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg,#6366f1,#a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 800,
          }}>⚡</div>
          <span style={{ fontSize: 20, fontWeight: 700, fontFamily: 'Playfair Display, serif', letterSpacing: '-0.5px' }}>
            Flow<span style={{ color: '#a855f7' }}>POS</span>
          </span>
        </div>

        {/* Desktop links */}
        <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
          {NAV_LINKS.map(l => (
            <span key={l} className="nav-link" onClick={() => scrollTo(l.toLowerCase())}>{l}</span>
          ))}
        </div>

        {/* Desktop CTAs — Login + Book */}
        <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            className="btn-outline"
            onClick={() => navigate('/login')}
            style={{ padding: '10px 24px', fontSize: 14 }}
          >
            Login
          </button>
          <button
            className="btn-primary"
            onClick={() => scrollTo('contact')}
            style={{ padding: '10px 24px', fontSize: 14 }}
          >
            Book a Service
          </button>
        </div>

        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="show-mobile"
          style={{
            background: 'none', border: '1px solid rgba(255,255,255,0.15)',
            color: '#e8edf5', fontSize: 20, cursor: 'pointer',
            width: 40, height: 40, borderRadius: 8,
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </nav>

      {/* ── HERO ── */}
      <section id="hero" ref={heroRef} style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        position: 'relative', overflow: 'hidden',
        padding: 'clamp(100px, 15vw, 140px) clamp(20px, 5vw, 40px) 80px',
      }}>
        <div className="orb" style={{ width: 600, height: 600, background: '#6366f1', top: -100, right: -100 }} />
        <div className="orb" style={{ width: 400, height: 400, background: '#a855f7', bottom: 0, left: -100 }} />

        {/* Floating shapes */}
        <div className="hide-mobile" style={{ position: 'absolute', top: '20%', right: '8%', animation: 'float 6s ease-in-out infinite', opacity: 0.6 }}>
          <div style={{ width: 80, height: 80, borderRadius: 20, background: 'linear-gradient(135deg,#6366f1,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>🔧</div>
        </div>
        <div className="hide-mobile" style={{ position: 'absolute', top: '55%', right: '18%', animation: 'float 8s ease-in-out infinite 2s', opacity: 0.5 }}>
          <div style={{ width: 60, height: 60, borderRadius: 14, background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>⚡</div>
        </div>
        <div className="hide-mobile" style={{ position: 'absolute', top: '35%', right: '30%', animation: 'float 7s ease-in-out infinite 1s', opacity: 0.4 }}>
          <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>❄️</div>
        </div>

        <div style={{ maxWidth: 700, position: 'relative', zIndex: 2, width: '100%' }}>
          <div className="fade-up section-label">Professional Multi-Service Solutions</div>

          <h1 className="fade-up delay-1 hero-title">
            Expert Repairs,<br />
            <span className="gradient-text">On Your Schedule.</span>
          </h1>

          <p className="fade-up delay-2" style={{ fontSize: 'clamp(15px, 2vw, 18px)', lineHeight: 1.7, color: 'rgba(232,237,245,0.65)', margin: '24px 0 36px', maxWidth: 520 }}>
            From electrical to plumbing, HVAC to appliances — FlowPOS connects you with certified technicians ready to fix anything, fast.
          </p>

          <div className="fade-up delay-3 hero-buttons">
            <button className="btn-primary" onClick={() => scrollTo('contact')}>
              Book a Service ↗
            </button>
            <button className="btn-outline" onClick={() => scrollTo('services')}>
              View Services
            </button>
          </div>

          <div className="fade-up delay-4 hero-stats">
            {STATS.map(s => (
              <div key={s.label}>
                <div style={{ fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 700, fontFamily: 'Playfair Display, serif', color: '#fff' }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'rgba(232,237,245,0.5)', marginTop: 2, letterSpacing: '0.3px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className="section-pad" style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div className="section-label">What We Offer</div>
          <h2 className="section-title">Services Built for<br /><span className="gradient-text">Every Need</span></h2>
          <p style={{ color: 'rgba(232,237,245,0.55)', fontSize: 16, maxWidth: 480, margin: '0 auto' }}>
            Our certified technicians handle everything from quick fixes to major installations.
          </p>
        </div>

        <div className="grid-3">
          {SERVICES.map((s, i) => (
            <div key={i} className="service-card">
              <div style={{ fontSize: 36, marginBottom: 18 }}>{s.icon}</div>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 10, color: '#fff' }}>{s.title}</h3>
              <p style={{ fontSize: 14, color: 'rgba(232,237,245,0.55)', lineHeight: 1.7, marginBottom: 20 }}>{s.desc}</p>
              <div style={{
                display: 'inline-block', fontSize: 13, fontWeight: 600,
                color: '#a78bfa', background: 'rgba(167,139,250,0.1)',
                border: '1px solid rgba(167,139,250,0.2)', borderRadius: 100,
                padding: '5px 14px',
              }}>{s.price}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" style={{
        padding: '100px clamp(20px, 5vw, 40px)',
        background: 'rgba(255,255,255,0.02)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div className="about-grid">
          <div>
            <div className="section-label">About FlowPOS</div>
            <h2 className="section-title">Trusted by Thousands<br /><span className="gradient-text">Across the Philippines</span></h2>
            <p style={{ color: 'rgba(232,237,245,0.6)', fontSize: 16, lineHeight: 1.8, marginBottom: 24 }}>
              FlowPOS is a multi-service platform connecting homeowners and businesses with skilled, background-checked technicians. We handle scheduling, invoicing, and follow-ups so you can focus on what matters.
            </p>
            <p style={{ color: 'rgba(232,237,245,0.6)', fontSize: 16, lineHeight: 1.8, marginBottom: 36 }}>
              Founded with a mission to make quality repairs accessible and transparent, we've grown to serve thousands of satisfied customers with a 98% satisfaction rate.
            </p>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {['Licensed Technicians', 'Insured Services', 'Transparent Pricing', 'On-Time Guarantee'].map(tag => (
                <span key={tag} style={{
                  fontSize: 13, color: '#e8edf5', background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 100, padding: '6px 16px',
                }}>✓ {tag}</span>
              ))}
            </div>
          </div>

          <div className="about-stats-grid">
            {STATS.map((s, i) => (
              <div key={i} style={{
                background: i === 1 ? 'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(168,85,247,0.2))' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${i === 1 ? 'rgba(168,85,247,0.4)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 20, padding: '32px 24px', textAlign: 'center',
              }}>
                <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: '#fff', marginBottom: 8 }}>{s.value}</div>
                <div style={{ fontSize: 13, color: 'rgba(232,237,245,0.55)', letterSpacing: '0.3px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="section-pad" style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div className="section-label">Pricing Plans</div>
          <h2 className="section-title">Simple, Transparent<br /><span className="gradient-text">Pricing</span></h2>
          <p style={{ color: 'rgba(232,237,245,0.55)', fontSize: 16, maxWidth: 420, margin: '0 auto' }}>
            No hidden fees. Choose a plan that fits your home or business needs.
          </p>
        </div>

        <div className="grid-3">
          {PRICING.map((p, i) => (
            <div key={i} className={`pricing-card${p.highlight ? ' highlight' : ''}`}>
              {p.highlight && (
                <div style={{
                  position: 'absolute', top: 20, right: 20,
                  fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
                  background: 'linear-gradient(135deg,#6366f1,#a855f7)',
                  color: '#fff', padding: '4px 12px', borderRadius: 100,
                  textTransform: 'uppercase',
                }}>Most Popular</div>
              )}
              <div style={{ fontSize: 13, color: 'rgba(232,237,245,0.5)', marginBottom: 8 }}>{p.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 'clamp(36px, 5vw, 48px)', fontWeight: 800, color: '#fff' }}>{p.price}</span>
                <span style={{ fontSize: 14, color: 'rgba(232,237,245,0.45)' }}>{p.period}</span>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(232,237,245,0.5)', marginBottom: 28 }}>{p.desc}</p>
              <div style={{ marginBottom: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {p.features.map((f, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: 'rgba(232,237,245,0.8)' }}>
                    <span style={{ color: '#a78bfa', fontSize: 16 }}>✓</span> {f}
                  </div>
                ))}
              </div>
              <button
                className={p.highlight ? 'btn-primary' : 'btn-outline'}
                onClick={() => scrollTo('contact')}
                style={{ width: '100%', justifyContent: 'center' }}
              >{p.cta}</button>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" style={{
        padding: '100px clamp(20px, 5vw, 40px)',
        background: 'rgba(255,255,255,0.02)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div className="section-label">Customer Stories</div>
            <h2 className="section-title">What Our Clients<br /><span className="gradient-text">Are Saying</span></h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="testimonial-card">
                <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <span key={j} style={{ color: '#f59e0b', fontSize: 16 }}>★</span>
                  ))}
                </div>
                <p style={{ fontSize: 15, lineHeight: 1.75, color: 'rgba(232,237,245,0.75)', marginBottom: 24, fontStyle: 'italic' }}>
                  "{t.text}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'linear-gradient(135deg,#6366f1,#a855f7)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0,
                  }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: 'rgba(232,237,245,0.45)' }}>{t.role}</div>
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
          <div className="section-label">Get In Touch</div>
          <h2 className="section-title">Book a Service<br /><span className="gradient-text">Today</span></h2>
          <p style={{ color: 'rgba(232,237,245,0.55)', fontSize: 16, maxWidth: 400, margin: '0 auto' }}>
            Fill out the form and a technician will reach out within 2 hours.
          </p>
        </div>

        {submitted ? (
          <div style={{
            textAlign: 'center', padding: '60px 40px',
            background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: 24,
          }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
            <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8, fontFamily: 'Playfair Display, serif' }}>Request Received!</h3>
            <p style={{ color: 'rgba(232,237,245,0.6)', fontSize: 16 }}>We'll contact you within 2 hours to confirm your booking.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="contact-form" style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 24, padding: '48px',
            display: 'flex', flexDirection: 'column', gap: 20,
          }}>
            <div className="grid-2">
              <div>
                <label style={{ fontSize: 13, color: 'rgba(232,237,245,0.6)', marginBottom: 8, display: 'block' }}>Full Name *</label>
                <input className="input-field" required placeholder="Juan dela Cruz"
                  value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: 13, color: 'rgba(232,237,245,0.6)', marginBottom: 8, display: 'block' }}>Email Address *</label>
                <input className="input-field" type="email" required placeholder="juan@email.com"
                  value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
              </div>
            </div>
            <div className="grid-2">
              <div>
                <label style={{ fontSize: 13, color: 'rgba(232,237,245,0.6)', marginBottom: 8, display: 'block' }}>Phone Number *</label>
                <input className="input-field" required placeholder="+63 9XX XXX XXXX"
                  value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: 13, color: 'rgba(232,237,245,0.6)', marginBottom: 8, display: 'block' }}>Service Needed *</label>
                <select className="input-field" required
                  value={formData.service} onChange={e => setFormData({ ...formData, service: e.target.value })}>
                  <option value="" disabled>Select a service</option>
                  {SERVICES.map(s => <option key={s.title} value={s.title}>{s.title}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label style={{ fontSize: 13, color: 'rgba(232,237,245,0.6)', marginBottom: 8, display: 'block' }}>Message / Details</label>
              <textarea className="input-field" rows={4} placeholder="Describe your issue or request..."
                style={{ resize: 'vertical' }}
                value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} />
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '16px', fontSize: 16 }}>
              Submit Booking Request ↗
            </button>
          </form>
        )}
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.07)',
        padding: 'clamp(24px, 4vw, 40px) clamp(20px, 5vw, 40px)',
      }}>
        <div className="footer-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'linear-gradient(135deg,#6366f1,#a855f7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
            }}>⚡</div>
            <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, fontWeight: 700 }}>
              Flow<span style={{ color: '#a855f7' }}>POS</span>
            </span>
          </div>
          <p style={{ fontSize: 13, color: 'rgba(232,237,245,0.35)' }}>
            © 2026 FlowPOS. All rights reserved.
          </p>
          <div className="footer-links" style={{ display: 'flex', gap: 24 }}>
            {['Services', 'Pricing', 'About', 'Contact'].map(l => (
              <span key={l} className="nav-link" style={{ fontSize: 13 }} onClick={() => scrollTo(l.toLowerCase())}>{l}</span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}