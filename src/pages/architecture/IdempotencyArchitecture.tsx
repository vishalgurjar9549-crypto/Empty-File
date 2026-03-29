import React, { useEffect, useState, memo } from 'react';
import { motion } from 'framer-motion';
import { Server, Database, Zap, Shield, Clock, FileJson, AlertTriangle, Activity, Globe, Cpu, Layers, ArrowRight, CheckCircle2, XCircle, Lock, RefreshCw, Menu, X } from 'lucide-react';
import { Button } from '../../components/ui/Button';
// ============================================================================
// SHARED COMPONENTS
// ============================================================================
const Section = ({
  id,
  title,
  icon: Icon,
  children





}: {id: string;title: string;icon: any;children: React.ReactNode;}) => <motion.section id={id} initial={{
  opacity: 0,
  y: 20
}} whileInView={{
  opacity: 1,
  y: 0
}} viewport={{
  once: true,
  margin: '-100px'
}} transition={{
  duration: 0.5
}} className="mb-24 scroll-mt-24">

    <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
      <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
        <Icon size={24} />
      </div>
      <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
        {title}
      </h2>
    </div>
    {children}
  </motion.section>;
const Card = ({
  children,
  className = ''



}: {children: React.ReactNode;className?: string;}) => <div className={`bg-slate-900/50 border border-slate-800 rounded-xl p-6 backdrop-blur-sm ${className}`}>

    {children}
  </div>;
const Badge = ({
  children,
  color = 'indigo'



}: {children: React.ReactNode;color?: 'indigo' | 'rose' | 'emerald' | 'amber' | 'slate';}) => {
  const colors = {
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    slate: 'bg-slate-800 text-slate-400 border-slate-700'
  };
  return <span className={`px-2 py-1 rounded text-xs font-medium border ${colors[color]}`}>

      {children}
    </span>;
};
const CodeBlock = ({
  code,
  language = 'typescript'



}: {code: string;language?: string;}) => <div className="relative group rounded-lg overflow-hidden bg-[#0d1117] border border-slate-800 font-mono text-sm my-4">
    <div className="flex items-center justify-between px-4 py-2 bg-slate-900/50 border-b border-slate-800 text-xs text-slate-500">
      <span>{language}</span>
      <div className="flex gap-1.5">
        <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
        <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
        <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
      </div>
    </div>
    <div className="p-4 overflow-x-auto text-slate-300">
      <pre>{code}</pre>
    </div>
  </div>;

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================
export function IdempotencyArchitecture() {
  const [activeSection, setActiveSection] = useState('hero');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const sections = [{
    id: 'request-flow',
    title: 'Request Flow',
    icon: Layers
  }, {
    id: 'stampede',
    title: 'Stampede Prevention',
    icon: Shield
  }, {
    id: 'ttl',
    title: 'TTL Strategy',
    icon: Clock
  }, {
    id: 'serialization',
    title: 'Serialization',
    icon: FileJson
  }, {
    id: 'failure',
    title: 'Failure Modes',
    icon: AlertTriangle
  }, {
    id: 'memory',
    title: 'Memory Strategy',
    icon: Cpu
  }, {
    id: 'hot-key',
    title: 'Hot Key Protection',
    icon: Zap
  }, {
    id: 'observability',
    title: 'Observability',
    icon: Activity
  }, {
    id: 'multi-region',
    title: 'Multi-Region Future',
    icon: Globe
  }, {
    id: 'risks',
    title: 'Architectural Risks',
    icon: Lock
  }];

  // Handle scroll spy
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element && element.offsetTop <= scrollPosition) {
          setActiveSection(section.id);
        }
      }
      if (window.scrollY < 200) setActiveSection('hero');
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth'
      });
      setMobileMenuOpen(false);
    }
  };
  return <div className="min-h-screen bg-slate-950 text-slate-300 selection:bg-indigo-500/30 font-sans">
      {/* MOBILE HEADER */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 p-4 flex items-center justify-between">
        <span className="font-bold text-slate-100">Architecture Docs</span>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-400">

          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && <div className="fixed inset-0 z-40 bg-slate-950 pt-20 px-6 lg:hidden">
          <nav className="flex flex-col gap-4">
            {sections.map((section) => <button key={section.id} onClick={() => scrollTo(section.id)} className="text-left py-3 border-b border-slate-800 text-slate-400 hover:text-indigo-400">

                {section.title}
              </button>)}
          </nav>
        </div>}

      <div className="max-w-screen-2xl mx-auto flex">
        {/* SIDEBAR NAVIGATION (Desktop) */}
        <aside className="hidden lg:block w-72 fixed h-screen overflow-y-auto border-r border-slate-800 bg-slate-950/50 backdrop-blur-sm pt-12 pb-12 px-6">
          <div className="mb-8">
            <h1 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
              Contents
            </h1>
            <nav className="space-y-1">
              {sections.map((section) => <button key={section.id} onClick={() => scrollTo(section.id)} className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-3 ${activeSection === section.id ? 'bg-indigo-500/10 text-indigo-400 font-medium' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900'}`}>

                  <section.icon size={16} />
                  {section.title}
                </button>)}
            </nav>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-800">
            <div className="text-xs text-slate-600 mb-4">
              <p className="font-bold text-slate-500 mb-1">
                ENGINEERING RESOURCES
              </p>
              <p>Updated: Feb 7, 2026</p>
              <p>Version: 2.4.0 (Hybrid)</p>
            </div>
            <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => window.history.back()}>

              Back to App
            </Button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 lg:ml-72 p-6 lg:p-16 max-w-5xl">
          {/* HERO SECTION */}
          <motion.div id="hero" initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.6
        }} className="mb-24 pt-12 lg:pt-0">

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold mb-6">
              <Zap size={12} />
              PRINCIPAL ENGINEER GRADE
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
              Hybrid Idempotency <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                Architecture
              </span>
            </h1>
            <p className="text-xl text-slate-400 max-w-3xl leading-relaxed mb-10">
              A high-scale, exactly-once processing system leveraging a hybrid
              Redis + PostgreSQL strategy. Designed for sub-millisecond latency,
              stampede protection, and zero-downtime fallback.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[{
              label: 'Architecture',
              value: '3-Layer Cache'
            }, {
              label: 'Latency',
              value: '< 1ms Replay'
            }, {
              label: 'Reliability',
              value: 'Zero Downtime'
            }, {
              label: 'Protection',
              value: 'Stampede Proof'
            }].map((stat, i) => <div key={i} className="bg-slate-900 border border-slate-800 p-4 rounded-lg">

                  <div className="text-slate-500 text-xs uppercase tracking-wider mb-1">
                    {stat.label}
                  </div>
                  <div className="text-slate-200 font-bold">{stat.value}</div>
                </div>)}
            </div>
          </motion.div>

          {/* SECTION 1: REQUEST FLOW */}
          <Section id="request-flow" title="Redis-First Lookup Pattern" icon={Layers}>

            <p className="text-slate-400 mb-8 leading-relaxed">
              The system implements a tiered lookup strategy to minimize
              database load while ensuring data consistency. Requests traverse
              three layers of caching before processing.
            </p>

            {/* VISUAL DIAGRAM */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-8 mb-8 overflow-x-auto">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 min-w-[800px]">
                {/* Request */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
                    <Globe size={24} />
                  </div>
                  <span className="text-xs font-mono text-slate-500">
                    REQUEST
                  </span>
                </div>

                <ArrowRight className="text-slate-700" />

                {/* L0 Cache */}
                <div className="relative group">
                  <div className="w-40 h-48 bg-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex flex-col items-center justify-center gap-3 transition-all hover:bg-amber-500/10">
                    <div className="p-3 bg-amber-500/10 rounded-lg text-amber-400">
                      <Zap size={24} />
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-amber-400">L0 Cache</div>
                      <div className="text-xs text-amber-500/70 mt-1">
                        Local Memory
                      </div>
                      <div className="text-[10px] font-mono bg-amber-950/50 px-2 py-1 rounded mt-2 text-amber-300">
                        ~0.001ms
                      </div>
                    </div>
                  </div>
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Hot Key Protection
                  </div>
                </div>

                <ArrowRight className="text-slate-700" />

                {/* L1 Redis */}
                <div className="relative group">
                  <div className="w-40 h-48 bg-rose-500/5 border border-rose-500/20 rounded-xl p-4 flex flex-col items-center justify-center gap-3 transition-all hover:bg-rose-500/10">
                    <div className="p-3 bg-rose-500/10 rounded-lg text-rose-400">
                      <Server size={24} />
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-rose-400">L1 Redis</div>
                      <div className="text-xs text-rose-500/70 mt-1">
                        Distributed Cache
                      </div>
                      <div className="text-[10px] font-mono bg-rose-950/50 px-2 py-1 rounded mt-2 text-rose-300">
                        ~0.1ms
                      </div>
                    </div>
                  </div>
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Primary Lookup
                  </div>
                </div>

                <ArrowRight className="text-slate-700" />

                {/* L2 Database */}
                <div className="relative group">
                  <div className="w-40 h-48 bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4 flex flex-col items-center justify-center gap-3 transition-all hover:bg-indigo-500/10">
                    <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-400">
                      <Database size={24} />
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-indigo-400">L2 DB</div>
                      <div className="text-xs text-indigo-500/70 mt-1">
                        PostgreSQL
                      </div>
                      <div className="text-[10px] font-mono bg-indigo-950/50 px-2 py-1 rounded mt-2 text-indigo-300">
                        ~5.0ms
                      </div>
                    </div>
                  </div>
                  {/* Hydration Arrow */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-full">
                    <div className="flex items-center justify-center gap-2 text-[10px] text-indigo-400/70">
                      <RefreshCw size={10} />
                      <span>Hydrates L1</span>
                    </div>
                  </div>
                </div>

                <ArrowRight className="text-slate-700" />

                {/* Process */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 size={24} />
                  </div>
                  <span className="text-xs font-mono text-emerald-500">
                    PROCESS
                  </span>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <h3 className="font-bold text-slate-200 mb-2 flex items-center gap-2">
                  <Zap size={16} className="text-amber-400" />
                  Why this is optimal
                </h3>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-1">•</span>
                    <span>
                      95%+ of retries served from Redis (L1) instantly.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-1">•</span>
                    <span>
                      DB remains the source of truth, surviving Redis restarts.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-1">•</span>
                    <span>
                      Hydration on DB hit prevents future DB queries for the
                      same key.
                    </span>
                  </li>
                </ul>
              </Card>
              <Card>
                <h3 className="font-bold text-slate-200 mb-2 flex items-center gap-2">
                  <Shield size={16} className="text-rose-400" />
                  Defense in Depth
                </h3>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-1">•</span>
                    <span>
                      Circuit breaker ensures Redis failures never block
                      bookings.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-1">•</span>
                    <span>
                      L0 cache absorbs "hot key" bursts (e.g., aggressive client
                      retry loops).
                    </span>
                  </li>
                </ul>
              </Card>
            </div>
          </Section>

          {/* SECTION 2: STAMPEDE PREVENTION */}
          <Section id="stampede" title="Stampede Prevention" icon={Shield}>
            <p className="text-slate-400 mb-6">
              When 20 identical requests arrive simultaneously (e.g., user
              mashes the "Book" button), the system uses a{' '}
              <span className="text-indigo-400 font-mono">SETNX</span>{' '}
              distributed lock to ensure only one processes.
            </p>

            <div className="bg-[#0d1117] border border-slate-800 rounded-xl p-6 mb-8">
              <div className="flex flex-col gap-4">
                {/* Request 1 */}
                <div className="flex items-center gap-4">
                  <div className="w-24 text-xs font-mono text-slate-500">
                    Request #1
                  </div>
                  <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div initial={{
                    width: 0
                  }} whileInView={{
                    width: '100%'
                  }} transition={{
                    duration: 1,
                    delay: 0.2
                  }} className="h-full bg-emerald-500" />

                  </div>
                  <Badge color="emerald">Acquired Lock</Badge>
                </div>

                {/* Request 2-5 */}
                {[2, 3, 4, 5].map((i) => <div key={i} className="flex items-center gap-4 opacity-50">
                    <div className="w-24 text-xs font-mono text-slate-500">
                      Request #{i}
                    </div>
                    <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div initial={{
                    width: 0
                  }} whileInView={{
                    width: '20%'
                  }} transition={{
                    duration: 0.5,
                    delay: 0.2 + i * 0.1
                  }} className="h-full bg-rose-500" />

                    </div>
                    <Badge color="rose">409 Conflict</Badge>
                  </div>)}
                <div className="text-center text-xs text-slate-600 mt-2 italic">
                  ...and 15 more rejected
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-bold text-slate-200 mb-4">
                  SETNX vs Redlock
                </h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-indigo-500/5 border border-indigo-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-indigo-400">
                        SETNX (Chosen)
                      </span>
                      <Badge color="indigo">Current</Badge>
                    </div>
                    <p className="text-sm text-slate-400 mb-2">
                      Simple, single-instance lock.
                    </p>
                    <div className="flex gap-2 text-xs font-mono text-slate-500">
                      <span>~0.1ms Latency</span>
                      <span>•</span>
                      <span>Single Master</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-900 border border-slate-800 opacity-60">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-400">Redlock</span>
                      <Badge color="slate">Future</Badge>
                    </div>
                    <p className="text-sm text-slate-500 mb-2">
                      Multi-master consensus algorithm.
                    </p>
                    <div className="flex gap-2 text-xs font-mono text-slate-600">
                      <span>~5ms Latency</span>
                      <span>•</span>
                      <span>Complex Setup</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-200 mb-4">
                  Lock Configuration
                </h3>
                <CodeBlock code={`const LOCK_TTL_SECONDS = 30;
// Covers:
// 1. Slow DB queries
// 2. Payment gateway latency
// 3. Network hiccups`} />

              </div>
            </div>
          </Section>

          {/* SECTION 3: TTL STRATEGY */}
          <Section id="ttl" title="TTL Strategy" icon={Clock}>
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <Card className="relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Zap size={100} />
                </div>
                <h3 className="text-xl font-bold text-rose-400 mb-2">
                  Redis TTL: 2 Hours
                </h3>
                <p className="text-sm text-slate-400 mb-4">
                  Covers the "Hot Retry Window". Most retries happen within
                  minutes.
                </p>
                <div className="space-y-2">
                  {['Client auto-retry (1s, 2s, 4s)', 'User manual retry', 'Payment webhook delays'].map((item, i) => <div key={i} className="flex items-center gap-2 text-xs text-slate-300">

                      <CheckCircle2 size={12} className="text-rose-500" />
                      {item}
                    </div>)}
                </div>
              </Card>

              <Card className="relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Database size={100} />
                </div>
                <h3 className="text-xl font-bold text-indigo-400 mb-2">
                  DB TTL: 24 Hours
                </h3>
                <p className="text-sm text-slate-400 mb-4">
                  Covers the "Long Tail". Ensures consistency across sessions.
                </p>
                <div className="space-y-2">
                  {['Overnight retries', 'Session resumption', 'Business day cycle'].map((item, i) => <div key={i} className="flex items-center gap-2 text-xs text-slate-300">

                      <CheckCircle2 size={12} className="text-indigo-500" />
                      {item}
                    </div>)}
                </div>
              </Card>
            </div>
            <p className="text-sm text-slate-500 italic">
              * After 24 hours, requests are treated as new. This matches
              Stripe's idempotency window strategy.
            </p>
          </Section>

          {/* SECTION 4: SERIALIZATION */}
          <Section id="serialization" title="Full Response Serialization" icon={FileJson}>

            <p className="text-slate-400 mb-6">
              We store the{' '}
              <strong className="text-slate-200">complete HTTP response</strong>{' '}
              (status, headers, body). Storing partial responses is dangerous
              and leads to client-side crashes.
            </p>

            <div className="grid lg:grid-cols-2 gap-8">
              <CodeBlock code={`interface SerializedResponse {
  statusCode: number;      // e.g., 201
  headers: Record<string, string>; // Content-Type
  body: any;              // Full JSON payload
  requestHash: string;    // SHA-256
  userId: string;         // Ownership check
  createdAt: string;      // ISO Date
}`} />


              <div className="space-y-4">
                <h4 className="font-bold text-slate-200 text-sm uppercase tracking-wider">
                  Why partial storage is dangerous
                </h4>

                <div className="flex gap-4 p-4 rounded-lg bg-red-500/5 border border-red-500/10">
                  <AlertTriangle className="text-red-500 shrink-0" size={20} />
                  <div>
                    <div className="font-bold text-red-400 text-sm">
                      Status Code Mismatch
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Client expects 201 Created, gets 200 OK. Mobile apps often
                      break.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 rounded-lg bg-red-500/5 border border-red-500/10">
                  <FileJson className="text-red-500 shrink-0" size={20} />
                  <div>
                    <div className="font-bold text-red-400 text-sm">
                      Missing Headers
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Without <code>Content-Type: application/json</code>,
                      parsers may fail.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Section>

          {/* SECTION 5: FAILURE MODES */}
          <Section id="failure" title="Failure Mode Design" icon={AlertTriangle}>

            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-800">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <h4 className="font-bold text-slate-200">Happy Path</h4>
                  </div>
                  <p className="text-sm text-slate-400">
                    Redis L1 Hit → Return instantly.
                  </p>
                  <div className="mt-4 text-xs font-mono text-emerald-400">
                    Latency: ~0.5ms
                  </div>
                </div>

                <div className="p-6 bg-amber-500/5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <h4 className="font-bold text-slate-200">Redis Down</h4>
                  </div>
                  <p className="text-sm text-slate-400">
                    Circuit breaker opens. Fallback to DB L2.
                  </p>
                  <div className="mt-4 text-xs font-mono text-amber-400">
                    Latency: ~5.0ms
                  </div>
                </div>

                <div className="p-6 bg-red-500/5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <h4 className="font-bold text-slate-200">Total Failure</h4>
                  </div>
                  <p className="text-sm text-slate-400">
                    Both caches fail. Process as new request.
                  </p>
                  <div className="mt-4 text-xs font-mono text-red-400">
                    Safe Degradation
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700 text-sm text-slate-300 flex items-center gap-3">
              <CheckCircle2 className="text-emerald-500" size={16} />
              <strong>Invariant:</strong> No booking ever fails solely because
              the idempotency layer is down.
            </div>
          </Section>

          {/* SECTION 6: MEMORY STRATEGY */}
          <Section id="memory" title="Memory Strategy" icon={Cpu}>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <p className="text-slate-400 mb-4">
                  Redis memory usage is negligible even at scale due to short
                  TTLs and small payloads.
                </p>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-slate-900 rounded border border-slate-800">
                    <span className="text-sm text-slate-400">
                      10K bookings/day
                    </span>
                    <span className="font-mono text-emerald-400">~1.7 MB</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-900 rounded border border-slate-800">
                    <span className="text-sm text-slate-400">
                      100K bookings/day
                    </span>
                    <span className="font-mono text-emerald-400">~17.0 MB</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-slate-200 mb-2">
                  Eviction Policy
                </h4>
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg">
                  <div className="font-mono text-indigo-400 mb-1">
                    volatile-lru
                  </div>
                  <p className="text-xs text-slate-500">
                    Evicts only keys with an expire set. Since all idempotency
                    keys have TTLs, they are eligible for eviction if memory
                    fills up, preserving other persistent keys.
                  </p>
                </div>
              </div>
            </div>
          </Section>

          {/* SECTION 7: HOT KEY PROTECTION */}
          <Section id="hot-key" title="Hot Key Protection" icon={Zap}>
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1">
                <p className="text-slate-400 mb-4">
                  To prevent a single Redis node from being hammered by a tight
                  retry loop on a single key, we implement a tiny{' '}
                  <strong>L0 Local Cache</strong>.
                </p>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Capacity: 200 items (LRU)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    TTL: 5 seconds
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Purpose: Absorb burst retries
                  </li>
                </ul>
              </div>
              <div className="flex-1 bg-slate-900 p-6 rounded-xl border border-slate-800">
                <div className="text-xs font-mono text-slate-500 mb-2">
                  Scenario: Client retry loop (100ms)
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Request 1</span>
                    <span className="text-rose-400">Redis Hit</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Request 2</span>
                    <span className="text-amber-400">L0 Hit (Memory)</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Request 3</span>
                    <span className="text-amber-400">L0 Hit (Memory)</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Request 4</span>
                    <span className="text-amber-400">L0 Hit (Memory)</span>
                  </div>
                  <div className="border-t border-slate-800 pt-2 mt-2 text-xs text-slate-500 text-center">
                    Network calls saved: 75%
                  </div>
                </div>
              </div>
            </div>
          </Section>

          {/* SECTION 8: OBSERVABILITY */}
          <Section id="observability" title="Observability & Metrics" icon={Activity}>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[{
              name: 'redis_hit',
              color: 'text-emerald-400'
            }, {
              name: 'db_hit',
              color: 'text-indigo-400'
            }, {
              name: 'miss',
              color: 'text-slate-400'
            }, {
              name: 'conflict',
              color: 'text-rose-400'
            }].map((metric) => <div key={metric.name} className="bg-slate-900 p-4 rounded-lg border border-slate-800">

                  <div className={`font-mono font-bold ${metric.color}`}>
                    {metric.name}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Counter</div>
                </div>)}
            </div>
            <Card>
              <h4 className="font-bold text-slate-200 mb-2">
                Health Indicators
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Healthy</span>
                  <span className="font-mono text-emerald-400">
                    {'>'} 85% Redis Hit Rate
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Warning</span>
                  <span className="font-mono text-amber-400">
                    {'<'} 50% Redis Hit Rate
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400">Critical</span>
                  <span className="font-mono text-rose-400">
                    Redis Fallback Increasing
                  </span>
                </div>
              </div>
            </Card>
          </Section>

          {/* SECTION 9: MULTI-REGION */}
          <Section id="multi-region" title="Multi-Region Future" icon={Globe}>
            <p className="text-slate-400 mb-6">
              As we scale globally, the idempotency architecture must evolve to
              handle cross-region consistency.
            </p>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center gap-8 mb-6">
                <div className="text-center">
                  <div className="text-xs text-slate-500 mb-1">US-EAST</div>
                  <div className="w-12 h-12 rounded bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                    <Server size={20} />
                  </div>
                </div>
                <div className="flex-1 h-px bg-slate-700 relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 px-2 text-xs text-slate-500">
                    Async Replication
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-slate-500 mb-1">EU-WEST</div>
                  <div className="w-12 h-12 rounded bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                    <Server size={20} />
                  </div>
                </div>
              </div>
              <p className="text-sm text-slate-400">
                <strong>Strategy:</strong> Regional Redis for low-latency locks
                + Global DB for truth. Cross-region double-booking is prevented
                by the Global DB unique constraint.
              </p>
            </div>
          </Section>

          {/* SECTION 10: RISKS */}
          <Section id="risks" title="Remaining Architectural Risks" icon={Lock}>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-lg">
                <h4 className="font-bold text-amber-400 mb-2 flex items-center gap-2">
                  <AlertTriangle size={16} />
                  Notification Loss
                </h4>
                <p className="text-sm text-slate-400">
                  Current "fire-and-forget" notification callback can lose
                  events if the server crashes immediately after booking.
                  <br />
                  <br />
                  <strong>Fix:</strong> Implement transactional outbox pattern
                  or persistent event queue (Bull/Kafka).
                </p>
              </div>

              <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-lg">
                <h4 className="font-bold text-amber-400 mb-2 flex items-center gap-2">
                  <AlertTriangle size={16} />
                  Rate Limiter Reset
                </h4>
                <p className="text-sm text-slate-400">
                  In-memory rate limiter resets on server restart.
                  <br />
                  <br />
                  <strong>Fix:</strong> Move rate limiting state to Redis (using{' '}
                  <code>rate-limit-redis</code>).
                </p>
              </div>
            </div>
          </Section>

          {/* FOOTER */}
          <footer className="mt-24 pt-8 border-t border-slate-800 text-center text-slate-600 text-sm">
            <p>© 2026 Homilivo Engineering. Internal Documentation.</p>
          </footer>
        </main>
      </div>
    </div>;
}