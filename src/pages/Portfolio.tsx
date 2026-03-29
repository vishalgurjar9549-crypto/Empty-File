import React from 'react';
import { Hero } from '../components/Hero';
import { WorkGrid } from '../components/WorkGrid';
import { About } from '../components/About';
import { Contact } from '../components/Contact';
import { motion, useScroll, useSpring } from 'framer-motion';
export function Portfolio() {
  const {
    scrollYProgress
  } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });
  return <div className="bg-neutral-50 min-h-screen w-full selection:bg-accent selection:text-white">
      {/* Progress Bar */}
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-accent origin-left z-50" style={{
      scaleX
    }} />

      {/* Navigation (Simple) */}
      <nav className="fixed top-0 left-0 right-0 p-8 flex justify-between items-center z-40 mix-blend-difference text-white pointer-events-none">
        <span className="font-serif text-xl font-bold tracking-tight">JD.</span>
        <div className="hidden md:flex gap-8 text-sm uppercase tracking-widest pointer-events-auto">
          <a href="#" className="hover:opacity-70 transition-opacity">
            Work
          </a>
          <a href="#" className="hover:opacity-70 transition-opacity">
            About
          </a>
          <a href="#" className="hover:opacity-70 transition-opacity">
            Contact
          </a>
        </div>
      </nav>

      <main>
        <Hero />
        <WorkGrid />
        <About />
        <Contact />
      </main>
    </div>;
}