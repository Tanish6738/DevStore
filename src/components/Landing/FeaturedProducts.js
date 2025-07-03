"use client";

import { motion } from "framer-motion";
import {
  ExternalLink,
  Star,
  Users,
  Code,
  Database,
  Shield,
  Zap,
  BarChart3,
  GitBranch,
  Terminal,
  Cloud,
  Settings,
} from "lucide-react";

const FeaturedProducts = () => {
  const products = [
    {
      id: 1,
      name: "CodeArc",
      tagline: "Advanced AI-powered snippet management system",
      description:
        "CodeArc helps developers organize, reuse, and share code snippets effortlessly. Powered by AI, it streamlines development by providing smart suggestions, automated tests, and real-time collaboration tools.",
      icon: Code,
      color: "from-blue-500 to-cyan-500",
      features: [
        "Smart Snippet Suggestions",
        "AI-Powered Code Search",
        "Real-time Collaboration",
      ],
      cta: "Start Free Trial",
      link: "https://snippets-frontend-pearl.vercel.app/",
      badge: "Most Popular",
      users: "50K+ developers",
    },
    {
      id: 2,
      name: "Securo",
      tagline: "Advanced breach tracking platform with powerful security tools",
      description:
        "Securo lets users scan for data breaches involving their email or passwords, monitor threat exposure, and gain AI-driven security recommendations. Ideal for proactive digital safety.",
      icon: Database,
      color: "from-green-500 to-emerald-500",
      features: [
        "Breach Email Lookup",
        "Exposed Password Analysis",
        "AI-Based Security Insights",
      ],
      cta: "Explore Features",
      link: "https://securo-app-v0.vercel.app/",
      badge: "Enterprise Ready",
      users: "10K+ APIs managed",
    },
    {
      id: 3,
      name: "PDF Pro",
      tagline: "Advanced PDF creation tool with built-in security features",
      description:
        "PDF Pro offers a powerful suite to create, merge, protect, and manage PDFs. Designed with security-first tools like encryption, watermarking, and file tracking for secure document workflows.",
      icon: Cloud,
      color: "from-purple-500 to-pink-500",
      features: [
        "PDF Merging & Creation",
        "Document Encryption",
        "Watermark & Access Control",
      ],
      cta: "View Pricing",
      link: "https://pdf-merger-green.vercel.app/",
      badge: "New",
      users: "5K+ deployments",
    },
    {
      id: 4,
      name: "Kai-API",
      tagline: "Detect compromised APIs in public repositories",
      description:
        "Kai-API scans public repositories to detect leaked or vulnerable APIs. It provides continuous monitoring, instant alerts, and detailed security insights to prevent breaches before they happen.",
      icon: Shield,
      color: "from-red-500 to-orange-500",
      features: [
        "API Key Exposure Detection",
        "Real-Time Repo Monitoring",
        "Security Audit Reports",
      ],
      cta: "Learn More",
      link: "https://kai-api-v0.onrender.com/",
      badge: "SOC 2 Certified",
      users: "25K+ repos secured",
    },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0 },
  };

  const handleProductClick = (link) => {
    window.open(link, "_blank", "noopener,noreferrer");
  };

  return (
    <section
      id="featured-products"
      className="relative py-20 bg-theme-background overflow-hidden"
    >
      {/* Background gradients */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at center, rgba(0, 169, 157, 0.05) 0%, transparent 50%, rgba(21, 27, 36, 0.1) 100%)`,
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, rgba(0, 169, 157, 0.03) 0%, transparent 40%, rgba(0, 169, 157, 0.08) 100%)`,
        }}
      />

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-theme-accent/10 rounded-full mb-6">
            <Star className="w-4 h-4 text-theme-accent" />
            <span className="text-sm font-medium text-theme-accent">
              From the Makers of DevStore
            </span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-theme-text">
            Our Developer{" "}
            <span className="text-transparent bg-clip-text bg-white">
              Ecosystem
            </span>
          </h2>

          <p className="text-lg text-theme-textSecondary max-w-3xl mx-auto leading-relaxed">
            Discover our complete suite of developer tools designed to
            streamline your entire workflow. From code management to deployment,
            we&apos;ve got every aspect of your development journey covered.
          </p>
        </motion.div>

        {/* Products Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {products.map((product) => {
            const IconComponent = product.icon;
            return (
              <motion.div
                key={product.id}
                variants={item}
                className="group relative bg-theme-secondary/30 border border-theme-border/20 rounded-2xl p-6 
                           hover:border-theme-accent/30 hover:bg-theme-secondary/50 transition-all duration-500
                           cursor-pointer transform hover:scale-105"
                onClick={() => handleProductClick(product.link)}
                whileHover={{ y: -5 }}
              >
                {/* Badge */}
                {product.badge && (
                  <div
                    className="absolute -top-3 -right-3 px-3 py-1 bg-theme-accent text-white text-xs 
                                  font-semibold rounded-full shadow-lg"
                  >
                    {product.badge}
                  </div>
                )}

                {/* Icon with gradient background */}
                <div
                  className={`w-16 h-16 rounded-xl bg-gradient-to-br ${product.color} p-3 mb-6 
                                group-hover:scale-110 transition-transform duration-300`}
                >
                  <IconComponent className="w-full h-full text-white" />
                </div>

                {/* Product Info */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-theme-text mb-2 group-hover:text-theme-accent transition-colors duration-300">
                    {product.name}
                  </h3>
                  <p className="text-theme-accent font-medium text-sm mb-3">
                    {product.tagline}
                  </p>
                  <p className="text-theme-textSecondary text-sm leading-relaxed mb-4">
                    {product.description}
                  </p>

                  {/* User count */}
                  <div className="flex items-center gap-2 text-xs text-theme-textSecondary mb-4">
                    <Users className="w-3 h-3" />
                    <span>{product.users}</span>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-6">
                  <ul className="space-y-2">
                    {product.features.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-sm text-theme-textSecondary"
                      >
                        <div className="w-1.5 h-1.5 bg-theme-accent rounded-full flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <div className="mt-auto">
                  <div
                    className={`flex items-center justify-between p-3 rounded-lg bg-gradient-to-r ${product.color} 
                                   group-hover:shadow-lg transition-all duration-300`}
                  >
                    <span className="text-white font-semibold text-sm">
                      {product.cta}
                    </span>
                    <ExternalLink className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </div>

                {/* Hover overlay */}
                <div
                  className="absolute inset-0 bg-gradient-to-br from-theme-accent/5 to-transparent 
                                opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                />
              </motion.div>
            );
          })}
        </motion.div>

        {/* Integration CTA */}
        <motion.div
          className="text-center p-8 bg-gradient-to-r from-theme-secondary/50 to-theme-secondary/30 
                     border border-theme-border/20 rounded-2xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <div className="flex justify-center mb-6">
            <div className="flex items-center gap-4">
              <GitBranch className="w-8 h-8 text-theme-accent" />
              <Settings className="w-8 h-8 text-blue-400" />
              <Terminal className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <h3 className="text-2xl font-bold text-theme-text mb-3">
            Seamless Integration Across All Products
          </h3>
          <p className="text-theme-textSecondary mb-6 max-w-2xl mx-auto">
            All our tools are designed to work together seamlessly. Single
            sign-on, shared data, and unified workflows across your entire
            development ecosystem.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              className="inline-flex items-center gap-2 px-6 py-3 bg-theme-accent text-white rounded-lg 
                         font-medium hover:bg-theme-accent/90 transition-all duration-300 shadow-lg 
                         hover:shadow-xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() =>
                window.open("https://docs.example.com/integrations", "_blank")
              }
            >
              <Zap className="w-4 h-4" />
              View Integrations
            </motion.button>

            <motion.button
              className="inline-flex items-center gap-2 px-6 py-3 bg-theme-secondary border border-theme-border/30 
                         text-theme-text rounded-lg font-medium hover:bg-theme-secondary/80 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() =>
                window.open("https://api.example.com/docs", "_blank")
              }
            >
              <Code className="w-4 h-4" />
              API Documentation
            </motion.button>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          {[
            { label: "Active Developers", value: "200K+", icon: Users },
            { label: "Projects Managed", value: "1M+", icon: GitBranch },
            { label: "API Calls Daily", value: "50M+", icon: Database },
            { label: "Uptime SLA", value: "99.9%", icon: Shield },
          ].map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="text-center">
                <div
                  className="inline-flex items-center justify-center w-12 h-12 bg-theme-accent/10 
                                rounded-lg mb-4"
                >
                  <IconComponent className="w-6 h-6 text-theme-accent" />
                </div>
                <div className="text-2xl font-bold text-theme-text mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-theme-textSecondary">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
