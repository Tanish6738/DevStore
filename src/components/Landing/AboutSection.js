
"use client";

import { motion } from "framer-motion";
import { Code, Layers, Zap } from "lucide-react";

const AboutSection = () => {
  return (
    <section id="about" className="relative py-20 bg-theme-background overflow-hidden">
      {/* Subtle background gradient */}
      <div 
        className="absolute inset-0" 
        style={{
          background: `radial-gradient(ellipse at center, rgba(0, 169, 157, 0.03) 0%, transparent 50%, rgba(21, 27, 36, 0.05) 100%)`
        }}
      ></div>
      
      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-theme-text mb-8 leading-tight"
          >
            Built for Developers Who{' '}
            <span className="bg-gradient-to-r from-theme-primary to-theme-accent bg-clip-text text-theme-text ">
              Love Efficiency
            </span>
          </motion.h2>
          
          {/* Content */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-xl text-theme-text-secondary leading-relaxed mb-16 max-w-3xl mx-auto"
          >
            Whether you're a solo dev, part of a startup, or leading a team, having quick access to your most-used tools should be effortless.
            ToolSpace brings together your URLs, notes, and favorites into one clean dashboard — searchable, categorized, and ready to go.
          </motion.p>
          
          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Dev Focus Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="group p-8 bg-theme-secondary/40 backdrop-blur-sm rounded-2xl border border-theme-border/10 hover:border-theme-primary/40 transition-all duration-300"
            >
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 bg-theme-primary/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Code className="w-8 h-8 text-theme-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-theme-text mb-3">
                Developer Focused
              </h3>
              <p className="text-theme-text-secondary leading-relaxed">
                Designed specifically for developers who need instant access to their coding resources and tools.
              </p>
            </motion.div>
            
            {/* Organized Structure Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="group p-8 bg-theme-secondary/40 backdrop-blur-sm rounded-2xl border border-theme-border/10 hover:border-theme-primary/40 transition-all duration-300"
            >
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 bg-theme-primary/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Layers className="w-8 h-8 text-theme-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-theme-text mb-3">
                Organized Structure
              </h3>
              <p className="text-theme-text-secondary leading-relaxed">
                Keep your tools categorized and organized with an intuitive structure that makes sense.
              </p>
            </motion.div>
            
            {/* Lightning Fast Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="group p-8 bg-theme-secondary/40 backdrop-blur-sm rounded-2xl border border-theme-border/10 hover:border-theme-primary/40 transition-all duration-300"
            >
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 bg-theme-primary/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-8 h-8 text-theme-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-theme-text mb-3">
                Lightning Fast
              </h3>
              <p className="text-theme-text-secondary leading-relaxed">
                Search and access your tools instantly with our blazing-fast interface and smart categorization.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AboutSection