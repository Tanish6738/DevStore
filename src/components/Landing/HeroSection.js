
"use client";

import { motion } from "framer-motion";
import { Rocket, Eye, ArrowRight, Code, Star, Bookmark } from "lucide-react";

const HeroSection = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center bg-theme-background overflow-hidden">
      {/* Subtle background gradient */}
      <div 
        className="absolute inset-0" 
        style={{
          background: `radial-gradient(ellipse at center, rgba(0, 169, 157, 0.05) 0%, transparent 50%, rgba(21, 27, 36, 0.1) 100%)`
        }}
      ></div>
      
      {/* Additional gradient layers for depth */}
      <div 
        className="absolute inset-0" 
        style={{
          background: `linear-gradient(135deg, rgba(0, 169, 157, 0.03) 0%, transparent 40%, rgba(0, 169, 157, 0.08) 100%)`
        }}
      ></div>
      
      {/* Mesh gradient overlay */}
      <div 
        className="absolute inset-0" 
        style={{
          background: `conic-gradient(from 45deg at 20% 80%, rgba(0, 169, 157, 0.02), transparent, rgba(21, 27, 36, 0.05))`
        }}
      ></div>
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 bg-theme-primary/5 rounded-full blur-xl"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-48 h-48 bg-theme-accent/5 rounded-full blur-xl"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-theme-secondary/80 backdrop-blur-sm border border-theme-primary/20 rounded-full text-sm text-theme-text-secondary">
              <Code className="w-4 h-4 text-theme-primary" />
              Developer Products Hub
            </div>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-6xl lg:text-7xl font-bold text-theme-text mb-6 leading-tight"
          >
            Your Developer Toolkit,{" "}
            <span className="bg-gradient-to-r from-theme-primary to-theme-accent bg-clip-text text-transparent">
              Organized.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-theme-text-secondary mb-12 max-w-3xl mx-auto leading-relaxed"
          >
            Discover, save, and star your favorite dev products, APIs, and platforms — all in one elegant space. 
            No more digging through bookmarks or messy docs.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            {/* Primary CTA */}
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0, 169, 157, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              className="group relative bg-theme-primary hover:bg-theme-primary/90 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl border border-theme-primary/20 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-theme-primary to-theme-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center gap-2">
                <Rocket className="w-5 h-5" />
                Start Building Your Stack
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </motion.button>

            {/* Secondary CTA */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group bg-theme-secondary/80 backdrop-blur-sm hover:bg-theme-secondary text-theme-text px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 border border-theme-border/20 hover:border-theme-primary/40"
            >
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-theme-primary" />
                Explore Collections
              </div>
            </motion.button>
          </motion.div>

          {/* Feature highlights */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto"
          >
            <motion.div
              whileHover={{ y: -5 }}
              className="flex items-center gap-3 p-4 bg-theme-secondary/40 backdrop-blur-sm rounded-lg border border-theme-border/10"
            >
              <div className="w-10 h-10 bg-theme-primary/20 rounded-lg flex items-center justify-center">
                <Bookmark className="w-5 h-5 text-theme-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-theme-text text-sm">Save & Organize</h3>
                <p className="text-xs text-theme-text-secondary">Keep products organized</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="flex items-center gap-3 p-4 bg-theme-secondary/40 backdrop-blur-sm rounded-lg border border-theme-border/10"
            >
              <div className="w-10 h-10 bg-theme-primary/20 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-theme-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-theme-text text-sm">Star Favorites</h3>
                <p className="text-xs text-theme-text-secondary">Quick access to top products</p>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -5 }}
              className="flex items-center gap-3 p-4 bg-theme-secondary/40 backdrop-blur-sm rounded-lg border border-theme-border/10"
            >
              <div className="w-10 h-10 bg-theme-primary/20 rounded-lg flex items-center justify-center">
                <Code className="w-5 h-5 text-theme-primary" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-theme-text text-sm">Discover New</h3>
                <p className="text-xs text-theme-text-secondary">Find amazing products</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-6 h-10 border-2 border-theme-border/30 rounded-full flex justify-center"
        >
          <div className="w-1 h-3 bg-theme-primary rounded-full mt-2"></div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;