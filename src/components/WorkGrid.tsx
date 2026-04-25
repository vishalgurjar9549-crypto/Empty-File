import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
type Project = {
  id: number;
  title: string;
  category: string;
  image: string;
};
const projects: Project[] = [{
  id: 1,
  title: 'Lumina Interface',
  category: 'UI/UX Design',
  image: 'https://images.unsplash.com/photo-1481487484168-9b930d5b7d9d?q=80&w=2070&auto=format&fit=crop'
}, {
  id: 2,
  title: 'Vanguard Brand',
  category: 'Brand Identity',
  image: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2000&auto=format&fit=crop'
}, {
  id: 3,
  title: 'Echo Audio',
  category: 'Product Design',
  image: 'https://images.unsplash.com/photo-1558403194-611308249627?q=80&w=2070&auto=format&fit=crop'
}, {
  id: 4,
  title: 'Mono Architecture',
  category: 'Art Direction',
  image: 'https://images.unsplash.com/photo-1506097425191-7ad538b29cef?q=80&w=2070&auto=format&fit=crop'
}];
export function WorkGrid() {
  return <section className="py-24 lg:py-32 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} whileInView={{
      opacity: 1,
      y: 0
    }} viewport={{
      once: true,
      margin: '-100px'
    }} transition={{
      duration: 0.6
    }} className="mb-16 flex items-end justify-between">
        <h2 className="text-5xl md:text-6xl font-serif text-neutral-900">
          Selected Work
        </h2>
        <span className="hidden md:block text-neutral-500 mb-2">
          (2023 — 2024)
        </span>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-16 lg:gap-y-24">
        {projects.map((project, index) => <motion.div key={project.id} initial={{
        opacity: 0,
        y: 30
      }} whileInView={{
        opacity: 1,
        y: 0
      }} viewport={{
        once: true,
        margin: '-50px'
      }} transition={{
        duration: 0.6,
        delay: index * 0.1
      }} className="group cursor-pointer">
            <div className="relative overflow-hidden aspect-[4/3] mb-6 bg-neutral-200">
              <motion.div whileHover={{
            scale: 1.03
          }} transition={{
            duration: 0.5,
            ease: 'easeOut'
          }} className="w-full h-full">
                <img src={project.image} alt={project.title} className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              </motion.div>

              {/* Overlay Content */}
              <motion.div initial={{
            opacity: 0
          }} whileHover={{
            opacity: 1
          }} transition={{
            duration: 0.3
          }} className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <span className="text-neutral-900 font-medium">
                    View Project
                  </span>
                  <ArrowUpRight size={18} className="text-neutral-900" />
                </div>
              </motion.div>
            </div>

            <div className="flex justify-between items-baseline border-b border-neutral-200 pb-4 group-hover:border-neutral-400 transition-colors duration-300">
              <h3 className="text-2xl font-serif text-neutral-900 group-hover:text-accent transition-colors duration-300">
                {project.title}
              </h3>
              <span className="text-neutral-500 text-sm tracking-wide uppercase">
                {project.category}
              </span>
            </div>
          </motion.div>)}
      </div>
    </section>;
}