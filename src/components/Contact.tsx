import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Instagram, Linkedin, Twitter } from 'lucide-react';
export function Contact() {
  return <section className="py-24 lg:py-40 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} whileInView={{
      opacity: 1,
      y: 0
    }} viewport={{
      once: true
    }} transition={{
      duration: 0.6
    }} className="text-center max-w-3xl mx-auto">
        <h2 className="text-5xl md:text-7xl font-serif text-neutral-900 mb-8">
          Let's create something timeless.
        </h2>
        <p className="text-xl text-neutral-500 mb-12 font-light">
          Currently available for freelance projects and open to collaboration.
        </p>

        <motion.a href="mailto:hello@janedoe.com" whileHover={{
        scale: 1.05
      }} whileTap={{
        scale: 0.95
      }} className="inline-block text-3xl md:text-4xl font-serif text-neutral-900 border-b-2 border-neutral-900 hover:text-accent hover:border-accent transition-colors duration-300 pb-1 mb-16">
          hello@janedoe.com
        </motion.a>

        <div className="flex justify-center gap-8">
          {[{
          icon: Instagram,
          label: 'Instagram'
        }, {
          icon: Linkedin,
          label: 'LinkedIn'
        }, {
          icon: Twitter,
          label: 'Twitter'
        }].map((social, index) => <motion.a key={social.label} href="#" whileHover={{
          y: -4,
          color: '#d97706'
        }} className="text-neutral-400 transition-colors duration-300" aria-label={social.label}>
              <social.icon size={24} />
            </motion.a>)}
        </div>

        <div className="mt-24 text-sm text-neutral-400">
          © {new Date().getFullYear()} Jane Doe. All Rights Reserved.
        </div>
      </motion.div>
    </section>;
}