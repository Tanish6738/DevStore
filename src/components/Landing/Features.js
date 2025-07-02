
"use client";

import { motion } from "framer-motion";
import { Link, Folder, Globe, Star, Search, Users } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Link,
      title: "One-Click URL Save",
      description: "Save a product or API link with smart metadata preview — title, icon, and description fetched instantly.",
      delay: 0.1
    },
    {
      icon: Folder,
      title: "Custom Collections",
      description: "Create themed folders for tools like Frontend Stack, APIs, CLI tools, etc.",
      delay: 0.2
    },
    {
      icon: Globe,
      title: "Curated Dev Products",
      description: "Access our built-in library of top dev platforms like GitHub, Vercel, Postman, etc.",
      delay: 0.3
    },
    {
      icon: Star,
      title: "Star & Tag",
      description: "Keep track of frequently used products, add notes, and use tags for fast filtering.",
      delay: 0.4
    },
    {
      icon: Search,
      title: "Smart Search",
      description: "Find anything instantly with full-text search and autocomplete.",
      delay: 0.5
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Share collections with teammates, set roles, and onboard devs faster.",
      delay: 0.6
    }
  ];

  return (
    <section id="features" className="relative py-20 bg-theme-background overflow-hidden">
      {/* Subtle background gradient */}
      <div 
        className="absolute inset-0" 
        style={{
          background: `radial-gradient(ellipse at center, rgba(0, 169, 157, 0.02) 0%, transparent 50%, rgba(21, 27, 36, 0.03) 100%)`
        }}
      ></div>
      
      <div className="container mx-auto px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-theme-text mb-6 leading-tight">
              Everything You Need to{' '}
              <span className="bg-gradient-to-r from-theme-primary to-theme-accent bg-clip-text text-theme-text ">
                Build & Bookmark Smarter
              </span>
            </h2>
            <p className="text-xl text-theme-text-secondary max-w-3xl mx-auto leading-relaxed">
              Powerful features designed to streamline your development workflow and keep your products organized.
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: feature.delay,
                    hover: { duration: 0.3 }
                  }}
                  viewport={{ once: true }}
                  className="group p-8 bg-theme-secondary/40 backdrop-blur-sm rounded-2xl border border-theme-border/10 hover:border-theme-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-theme-primary/5"
                >
                  {/* Icon Container */}
                  <div className="mb-6 flex items-center gap-4">
                    <div className="w-14 h-14 bg-theme-primary/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-7 h-7 text-theme-primary" />
                    </div>

                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-theme-text mb-4 group-hover:text-theme-primary transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-theme-text-secondary leading-relaxed group-hover:text-theme-text transition-colors duration-300">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Bottom CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-theme-secondary/60 backdrop-blur-sm border border-theme-primary/20 rounded-full text-sm text-theme-text-secondary">
              <Star className="w-4 h-4 text-theme-primary" />
              Start organizing your developer toolkit today
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Features