import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Zap, Shield, Clock, FileJson, AlertTriangle, Activity, Globe, Cpu, Layers, ArrowRight, CheckCircle2, XCircle, Lock, RefreshCw, Menu, X, Mail, Server, Repeat } from 'lucide-react';
import { Button } from '../../components/ui/Button';
// ============================================================================
// SHARED COMPONENTS (Matched exactly to IdempotencyArchitecture)
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
export function OutboxArchitecture() {
  const [activeSection, setActiveSection] = useState('hero');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const sections = [{
    id: 'problem',
    title: 'The Ghost Booking Problem',
    icon: AlertTriangle
  }, {
    id: 'schema',
    title: 'Outbox Table Schema',
    icon: Database
  }, {
    id: 'poller',
    title: 'Poller vs CDC',
    icon: RefreshCw
  }, {
    id: 'retry',
    title: 'Retry Strategy',
    icon: Repeat
  }, {
    id: 'idempotency',
    title: 'Idempotent Consumers',
    icon: Shield
  }, {
    id: 'failure',
    title: 'Failure Scenarios',
    icon: XCircle
  }, {
    id: 'ordering',
    title: 'Ordering Guarantees',
    icon: Layers
  }, {
    id: 'throughput',
    title: 'Throughput Capacity',
    icon: Activity
  }, {
    id: 'observability',
    title: 'Observability',
    icon: Zap
  }, {
    id: 'risks',
    title: 'Remaining Risks',
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
        <span className="font-bold text-slate-100">Outbox Docs</span>
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
              <p>Updated: Feb 8, 2026</p>
              <p>Version: 1.0.0 (Outbox)</p>
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
              Transactional Outbox <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
                Pattern
              </span>
            </h1>
            <p className="text-xl text-slate-400 max-w-3xl leading-relaxed mb-10">
              Zero lost events. Atomic writes with guaranteed delivery.
              Eliminates "ghost bookings" by coupling database transactions with
              event publishing.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[{
              label: 'Reliability',
              value: 'Atomic Writes'
            }, {
              label: 'Retry Logic',
              value: 'Exponential'
            }, {
              label: 'Safety',
              value: 'Dead Letter Queue'
            }, {
              label: 'Delivery',
              value: 'At Least Once'
            }].map((stat, i) => <div key={i} className="bg-slate-900 border border-slate-800 p-4 rounded-lg">

                  <div className="text-slate-500 text-xs uppercase tracking-wider mb-1">
                    {stat.label}
                  </div>
                  <div className="text-slate-200 font-bold">{stat.value}</div>
                </div>)}
            </div>
          </motion.div>

          {/* SECTION 1: THE GHOST BOOKING PROBLEM */}
          <Section id="problem" title="Why Outbox Exists" icon={AlertTriangle}>
            <p className="text-slate-400 mb-8 leading-relaxed">
              Without the outbox pattern, we risk "ghost bookings" — where a
              booking is committed to the database, but the notification or
              downstream event is lost due to a server crash immediately after
              the commit.
            </p>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {/* BEFORE */}
              <div className="bg-rose-950/10 border border-rose-900/30 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4 text-rose-400 font-bold">
                  <XCircle size={20} />
                  BEFORE: Fire-and-Forget
                </div>
                <div className="space-y-4 text-sm font-mono">
                  <div className="bg-slate-900 p-3 rounded border border-slate-800">
                    1. BEGIN TRANSACTION
                  </div>
                  <div className="bg-slate-900 p-3 rounded border border-slate-800">
                    2. INSERT Booking ✅
                  </div>
                  <div className="bg-slate-900 p-3 rounded border border-slate-800">
                    3. COMMIT TRANSACTION ✅
                  </div>
                  <div className="flex items-center justify-center py-2 text-rose-500 font-bold">
                    💥 SERVER CRASH 💥
                  </div>
                  <div className="bg-rose-900/20 p-3 rounded border border-rose-900/50 text-rose-300 opacity-50">
                    4. Send Notification (LOST FOREVER)
                  </div>
                </div>
              </div>

              {/* AFTER */}
              <div className="bg-emerald-950/10 border border-emerald-900/30 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4 text-emerald-400 font-bold">
                  <CheckCircle2 size={20} />
                  AFTER: Transactional Outbox
                </div>
                <div className="space-y-4 text-sm font-mono">
                  <div className="bg-slate-900 p-3 rounded border border-slate-800">
                    1. BEGIN TRANSACTION
                  </div>
                  <div className="bg-slate-900 p-3 rounded border border-slate-800">
                    2. INSERT Booking ✅
                  </div>
                  <div className="bg-emerald-900/20 p-3 rounded border border-emerald-900/50 text-emerald-300">
                    3. INSERT Outbox Event ✅
                  </div>
                  <div className="bg-slate-900 p-3 rounded border border-slate-800">
                    4. COMMIT TRANSACTION ✅
                  </div>
                  <div className="flex items-center justify-center py-2 text-slate-500 text-xs italic">
                    (Worker picks up event later)
                  </div>
                </div>
              </div>
            </div>

            <Card>
              <h3 className="font-bold text-slate-200 mb-2 flex items-center gap-2">
                <Zap size={16} className="text-amber-400" />
                Key Insight
              </h3>
              <p className="text-sm text-slate-400">
                The outbox event is just another row in PostgreSQL, in the{' '}
                <strong>SAME transaction</strong> as the business entity. If the
                booking exists, the event is guaranteed to exist. Zero data
                loss.
              </p>
            </Card>
          </Section>

          {/* SECTION 2: OUTBOX TABLE SCHEMA */}
          <Section id="schema" title="Outbox Table Schema" icon={Database}>
            <p className="text-slate-400 mb-6">
              The schema is designed for high-performance polling and
              reliability.
            </p>

            <CodeBlock code={`model OutboxEvent {
  id            String   @id @default(uuid())
  aggregateType String   // e.g., BOOKING
  aggregateId   String   // e.g., booking-uuid
  eventType     String   // e.g., BOOKING_CREATED
  payload       Json     // Full event data
  
  status        String   @default("PENDING")
  retryCount    Int      @default(0)
  maxRetries    Int      @default(5)
  nextRetryAt   DateTime?
  lastError     String?
  
  processedAt   DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // INDEXES
  @@index([status, nextRetryAt, createdAt]) // Worker Poll (HOT PATH)
  @@index([aggregateType, aggregateId])     // Debugging
  @@index([status])                         // Dashboard
  @@index([status, processedAt])            // Cleanup
}`} />


            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              {['PENDING', 'PROCESSING', 'DELIVERED', 'DEAD_LETTER'].map((status) => <div key={status} className="bg-slate-900 border border-slate-800 p-3 rounded text-center">

                    <div className="text-xs text-slate-500 font-mono mb-1">
                      Status
                    </div>
                    <div className={`font-bold text-sm ${status === 'DELIVERED' ? 'text-emerald-400' : status === 'DEAD_LETTER' ? 'text-rose-400' : status === 'PROCESSING' ? 'text-amber-400' : 'text-slate-300'}`}>

                      {status}
                    </div>
                  </div>)}
            </div>
          </Section>

          {/* SECTION 3: POLLER vs CDC */}
          <Section id="poller" title="Poller vs CDC vs Logical Replication" icon={RefreshCw}>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2">
                  <Badge color="amber">Current Choice</Badge>
                </div>
                <h3 className="font-bold text-amber-400 mb-2">DB Polling</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Simple worker polling the table every 5s.
                </p>
                <ul className="space-y-2 text-xs text-slate-300">
                  <li>• Zero infrastructure</li>
                  <li>• 0-5s latency</li>
                  <li>• Works up to ~100K/day</li>
                </ul>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 opacity-70">
                <h3 className="font-bold text-slate-300 mb-2">Debezium CDC</h3>
                <p className="text-xs text-slate-500 mb-4">
                  Real-time WAL capture via Kafka.
                </p>
                <ul className="space-y-2 text-xs text-slate-500">
                  <li>• Requires Kafka + Zookeeper</li>
                  <li>• &lt;100ms latency</li>
                  <li>• For 100K-1M/day scale</li>
                </ul>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 opacity-70">
                <h3 className="font-bold text-slate-300 mb-2">
                  Logical Replication
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  PostgreSQL native streaming.
                </p>
                <ul className="space-y-2 text-xs text-slate-500">
                  <li>• Complex setup</li>
                  <li>• Low overhead</li>
                  <li>• Best for multi-region</li>
                </ul>
              </div>
            </div>
            <p className="mt-6 text-sm text-slate-400 italic">
              * Decision: Polling is perfect for current scale. We upgrade to
              CDC only when latency requirements tighten or volume exceeds 100K
              events/day.
            </p>
          </Section>

          {/* SECTION 4: RETRY STRATEGY */}
          <Section id="retry" title="Exponential Backoff Strategy" icon={Repeat}>

            <p className="text-slate-400 mb-6">
              We use an aggressive exponential backoff to handle transient
              failures without overwhelming downstream services.
            </p>

            <div className="bg-[#0d1117] border border-slate-800 rounded-xl p-6 mb-8">
              <div className="space-y-4 relative">
                <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-slate-800" />

                {[{
                time: '10:00:00',
                event: 'Event Created (PENDING)',
                color: 'text-slate-300'
              }, {
                time: '10:00:05',
                event: 'Attempt 1 FAILS → Retry in 1 min',
                color: 'text-amber-400'
              }, {
                time: '10:01:05',
                event: 'Attempt 2 FAILS → Retry in 4 min',
                color: 'text-amber-400'
              }, {
                time: '10:05:05',
                event: 'Attempt 3 FAILS → Retry in 16 min',
                color: 'text-amber-400'
              }, {
                time: '10:21:05',
                event: 'Attempt 4 FAILS → Retry in 64 min',
                color: 'text-amber-400'
              }, {
                time: '11:25:05',
                event: 'Attempt 5 FAILS → Retry in 256 min',
                color: 'text-amber-400'
              }, {
                time: '15:41:05',
                event: 'Attempt 6 FAILS → DEAD LETTER ☠️',
                color: 'text-rose-500 font-bold'
              }].map((item, i) => <div key={i} className="flex items-center gap-4 relative z-10">

                    <div className={`w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-mono ${i === 6 ? 'border-rose-500 text-rose-500' : 'text-slate-500'}`}>

                      {i}
                    </div>
                    <div>
                      <div className="text-xs font-mono text-slate-500">
                        {item.time}
                      </div>
                      <div className={`text-sm ${item.color}`}>
                        {item.event}
                      </div>
                    </div>
                  </div>)}
              </div>
            </div>

            <CodeBlock code={`export const RETRY_CONFIG = {
  maxRetries: 5,
  baseDelayMs: 60_000,    // 1 minute
  backoffFactor: 4,       // 4x multiplier
  maxDelayMs: 256 * 60_000 // ~4.3 hours cap
}`} />

          </Section>

          {/* SECTION 5: IDEMPOTENT CONSUMERS */}
          <Section id="idempotency" title="Idempotent Consumers" icon={Shield}>
            <p className="text-slate-400 mb-6">
              The Outbox Worker guarantees <strong>at-least-once</strong>{' '}
              delivery. This means consumers MUST be idempotent to handle
              duplicate events.
            </p>

            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <h4 className="font-bold text-slate-200 mb-2">
                  Notification Service
                </h4>
                <p className="text-sm text-slate-400 mb-4">
                  Uses a unique constraint on{' '}
                  <code>(recipientId, type, referenceId)</code>.
                </p>
                <div className="bg-slate-950 p-3 rounded text-xs font-mono text-emerald-400">
                  referenceId = outboxEvent.id
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Even if the worker processes the same event 10 times, only 1
                  notification is created.
                </p>
              </Card>

              <Card>
                <h4 className="font-bold text-slate-200 mb-2">
                  Payment Service (Future)
                </h4>
                <p className="text-sm text-slate-400 mb-4">
                  Will check <code>transactionId</code> before processing.
                </p>
                <div className="bg-slate-950 p-3 rounded text-xs font-mono text-emerald-400">
                  IF exists(txnId) RETURN success
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Standard idempotency key pattern for financial transactions.
                </p>
              </Card>
            </div>
          </Section>

          {/* SECTION 6: FAILURE SCENARIOS */}
          <Section id="failure" title="Failure Scenarios & Recovery" icon={XCircle}>

            <div className="space-y-4">
              {[{
              scenario: 'Server crashes after commit but before publish',
              impact: 'None. Event is in DB.',
              recovery: 'Worker picks it up on next poll.',
              status: 'safe'
            }, {
              scenario: 'Worker crashes mid-processing',
              impact: 'Event stuck in PROCESSING state.',
              recovery: 'Timeout logic resets to PENDING after 1 min.',
              status: 'safe'
            }, {
              scenario: 'Redis is down',
              impact: 'None. Outbox is DB-only.',
              recovery: 'System continues to function.',
              status: 'safe'
            }, {
              scenario: 'Database is down',
              impact: 'System unavailable.',
              recovery: 'No data inconsistency (atomic writes).',
              status: 'critical'
            }].map((item, i) => <div key={i} className="flex items-center gap-4 p-4 bg-slate-900 border border-slate-800 rounded-lg">

                  <div className={`w-2 h-2 rounded-full ${item.status === 'safe' ? 'bg-emerald-500' : 'bg-rose-500'}`} />

                  <div className="flex-1">
                    <div className="font-bold text-slate-200 text-sm">
                      {item.scenario}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Recovery: {item.recovery}
                    </div>
                  </div>
                  <Badge color={item.status === 'safe' ? 'emerald' : 'rose'}>
                    {item.status === 'safe' ? 'Auto-Recover' : 'Downtime'}
                  </Badge>
                </div>)}
            </div>
          </Section>

          {/* SECTION 7: ORDERING */}
          <Section id="ordering" title="Ordering Guarantees" icon={Layers}>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-bold text-slate-200 mb-2">
                  Per-Aggregate Ordering
                </h4>
                <p className="text-sm text-slate-400 mb-4">
                  Events for the same entity (e.g., Booking A) are processed in
                  order.
                </p>
                <div className="flex flex-col gap-2">
                  <div className="p-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-300">
                    1. BOOKING_CREATED (10:00)
                  </div>
                  <div className="flex justify-center">
                    <ArrowRight className="rotate-90 text-slate-600" size={16} />

                  </div>
                  <div className="p-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-300">
                    2. BOOKING_APPROVED (10:05)
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-200 mb-2">
                  Global Ordering
                </h4>
                <p className="text-sm text-slate-400 mb-4">
                  Not guaranteed across different aggregates (and not needed).
                </p>
                <div className="flex gap-4">
                  <div className="flex-1 p-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-300 opacity-50">
                    Booking A Created
                  </div>
                  <div className="flex-1 p-2 bg-slate-900 border border-slate-800 rounded text-xs text-slate-300 opacity-50">
                    Booking B Created
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Processed in parallel batches.
                </p>
              </div>
            </div>
          </Section>

          {/* SECTION 8: THROUGHPUT */}
          <Section id="throughput" title="Throughput Capacity" icon={Activity}>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-slate-900 rounded border border-slate-800">
                  <span className="text-sm text-slate-400">
                    10K bookings/day
                  </span>
                  <span className="font-mono text-emerald-400">
                    ~0.12 events/sec
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-900 rounded border border-slate-800">
                  <span className="text-sm text-slate-400">
                    100K bookings/day
                  </span>
                  <span className="font-mono text-emerald-400">
                    ~1.2 events/sec
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-900 rounded border border-slate-800">
                  <span className="text-sm text-slate-400">
                    1M bookings/day
                  </span>
                  <span className="font-mono text-amber-400">
                    ~12 events/sec
                  </span>
                </div>
              </div>

              <Card>
                <h4 className="font-bold text-slate-200 mb-2">
                  Scaling Threshold
                </h4>
                <p className="text-sm text-slate-400 mb-4">
                  Single worker handles up to ~50 events/sec comfortably.
                </p>
                <div className="text-xs text-slate-500">
                  <strong>When to move to Kafka?</strong>
                  <br />
                  1. When volume exceeds 100K/day
                  <br />
                  2. When latency requirements drop below 1s
                  <br />
                  3. When multiple downstream services need the same event
                </div>
              </Card>
            </div>
          </Section>

          {/* SECTION 9: OBSERVABILITY */}
          <Section id="observability" title="Observability Metrics" icon={Zap}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[{
              name: 'events_processed',
              color: 'text-emerald-400'
            }, {
              name: 'events_failed',
              color: 'text-rose-400'
            }, {
              name: 'dead_letter_count',
              color: 'text-rose-500'
            }, {
              name: 'poll_lag_ms',
              color: 'text-amber-400'
            }].map((metric) => <div key={metric.name} className="bg-slate-900 p-4 rounded-lg border border-slate-800">

                  <div className={`font-mono font-bold text-xs ${metric.color}`}>

                    {metric.name}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Counter / Gauge
                  </div>
                </div>)}
            </div>
            <p className="text-sm text-slate-400">
              Metrics are exposed via <code>/health/detailed</code> and logged
              every 60s.
            </p>
          </Section>

          {/* SECTION 10: RISKS */}
          <Section id="risks" title="Remaining Architectural Risks" icon={Lock}>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-lg">
                <h4 className="font-bold text-amber-400 mb-2 flex items-center gap-2">
                  <AlertTriangle size={16} />
                  No Distributed Tracing
                </h4>
                <p className="text-sm text-slate-400">
                  Hard to trace an event from API request → DB → Outbox → Worker
                  → Notification.
                  <br />
                  <br />
                  <strong>Fix:</strong> Implement OpenTelemetry with trace ID
                  propagation.
                </p>
              </div>

              <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-lg">
                <h4 className="font-bold text-amber-400 mb-2 flex items-center gap-2">
                  <AlertTriangle size={16} />
                  Worker Single Point of Failure
                </h4>
                <p className="text-sm text-slate-400">
                  If the worker process dies, events pile up.
                  <br />
                  <br />
                  <strong>Fix:</strong> Run multiple worker instances (locking
                  handles concurrency).
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