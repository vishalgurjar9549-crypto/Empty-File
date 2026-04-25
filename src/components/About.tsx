import React from 'react';
import { motion } from 'framer-motion';
export function About() {
  return <section className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto bg-neutral-100/50 my-12 rounded-sm">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
        <div className="lg:col-span-5">
          <motion.h2 initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.6
        }} className="text-5xl md:text-6xl font-serif text-neutral-900 leading-tight">
            Design with purpose and precision.
          </motion.h2>
        </div>

        <div className="lg:col-span-7 space-y-8">
          <motion.p initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.6,
          delay: 0.2
        }} className="text-xl md:text-2xl text-neutral-600 leading-relaxed font-light">
            I'm a multidisciplinary designer focused on creating meaningful
            experiences that bridge the gap between physical and digital worlds.
            With a background in architecture and interaction design, I bring a
            structural approach to digital problem solving.
          </motion.p>

          <motion.div initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.6,
          delay: 0.3
        }} className="grid grid-cols-2 gap-8 pt-8 border-t border-neutral-200">
            <div>
              <h4 className="text-sm uppercase tracking-widest text-neutral-400 mb-4">
                Services
              </h4>
              <ul className="space-y-2 text-neutral-700">
                <li>Art Direction</li>
                <li>Brand Identity</li>
                <li>UI/UX Design</li>
                <li>Web Development</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm uppercase tracking-widest text-neutral-400 mb-4">
                Recognition
              </h4>
              <ul className="space-y-2 text-neutral-700">
                <li>Awwwards SOTD</li>
                <li>Type Directors Club</li>
                <li>Behance Featured</li>
                <li>SiteInspire</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>;
}