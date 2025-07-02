"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronDown, 
  ChevronRight, 
  Search, 
  HelpCircle, 
  MessageCircle, 
  Mail, 
  Star,
  Shield,
  CreditCard,
  Settings,
  Users,
  ArrowUp
} from "lucide-react";

const FAQs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [openItems, setOpenItems] = useState({});
  const [activeCategory, setActiveCategory] = useState("all");
  const [showBackToTop, setShowBackToTop] = useState(false);

  // FAQ Categories with icons and colors
  const categories = [
    { id: "all", label: "All Questions", icon: HelpCircle, color: "text-theme-accent" },
    { id: "general", label: "General", icon: Star, color: "text-blue-400" },
    { id: "features", label: "Features", icon: Settings, color: "text-green-400" },
    { id: "collaboration", label: "Collaboration", icon: Users, color: "text-purple-400" },
    { id: "pricing", label: "Pricing & Billing", icon: CreditCard, color: "text-yellow-400" },
    { id: "security", label: "Security & Privacy", icon: Shield, color: "text-red-400" }
  ];

  // FAQ Data organized by category
  const faqData = [
    {
      category: "general",
      question: "What is CodeHunt and how does it work?",
      answer: "CodeHunt is a developer-focused platform that helps you organize, discover, and manage development tools, APIs, and resources. Simply save URLs with one-click, create custom collections, and collaborate with your team to build a comprehensive toolkit for your projects."
    },
    {
      category: "general",
      question: "Do I need to create an account to use CodeHunt?",
      answer: "While you can browse our curated collection of dev tools without an account, creating one unlocks the full potential: personal collections, saved favorites, collaboration features, and sync across all your devices."
    },
    {
      category: "features",
      question: "How does the smart metadata preview work?",
      answer: "When you save a URL, our system automatically fetches the page title, description, favicon, and other metadata. This creates rich previews that make it easy to identify tools at a glance, even in large collections."
    },
    {
      category: "features",
      question: "Can I organize my saved tools into different categories?",
      answer: "Absolutely! Create custom collections for different purposes like 'Frontend Stack', 'APIs', 'CLI Tools', or project-specific folders. You can also use tags for cross-collection organization and filtering."
    },
    {
      category: "features",
      question: "How powerful is the search functionality?",
      answer: "Our search is designed for developers by developers. It includes full-text search across titles, descriptions, and tags, with autocomplete suggestions and smart filtering. You can quickly find that specific API or tool you saved months ago."
    },
    {
      category: "collaboration",
      question: "How does team collaboration work?",
      answer: "Share collections with teammates, set different permission levels (view, edit, admin), and collaborate on building your team's toolbox. Perfect for onboarding new developers or maintaining team standards across projects."
    },
    {
      category: "collaboration",
      question: "Can I make my collections public for others to discover?",
      answer: "Yes! You can choose to make collections public, allowing other developers to discover and benefit from your curated tool lists. Public collections help build a community-driven resource library."
    },
    {
      category: "pricing",
      question: "Is CodeHunt free to use?",
      answer: "We offer a generous free tier that includes personal collections, basic collaboration, and access to our curated tool library. Premium plans provide advanced features like unlimited collections, advanced analytics, and priority support."
    },
    {
      category: "pricing",
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, and offer annual billing discounts. Enterprise customers can also arrange for invoice-based billing and purchase orders."
    },
    {
      category: "security",
      question: "How do you protect my data and privacy?",
      answer: "Your data security is our top priority. We use industry-standard encryption, secure servers, and never share your personal information. Your collections and saved tools remain private unless you explicitly choose to make them public."
    },
    {
      category: "security",
      question: "Can I export my data if I decide to leave?",
      answer: "Absolutely. We believe in data portability. You can export all your collections, saved tools, and metadata in standard formats (JSON, CSV) at any time. No vendor lock-in, ever."
    }
  ];

  // Filter FAQs based on search term and active category
  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  // Toggle accordion item
  const toggleItem = (index) => {
    setOpenItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  // Scroll to top function
  const scrollToTop = () => {
    document.getElementById('faqs')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle scroll for back to top button
  const handleScroll = () => {
    const faqSection = document.getElementById('faqs');
    if (faqSection) {
      const rect = faqSection.getBoundingClientRect();
      setShowBackToTop(rect.top < -200);
    }
  };

  // Add scroll listener with useEffect
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section id="faqs" className="relative py-20 bg-theme-background overflow-hidden">
      {/* Background gradients */}
      <div 
        className="absolute inset-0" 
        style={{
          background: `radial-gradient(ellipse at center, rgba(0, 169, 157, 0.03) 0%, transparent 50%, rgba(21, 27, 36, 0.1) 100%)`
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
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-theme-text">
            Frequently Asked{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-theme-accent to-blue-400">
              Questions
            </span>
          </h2>
          <p className="text-lg text-theme-textSecondary max-w-2xl mx-auto">
            Everything you need to know about CodeHunt. Can&apos;t find what you&apos;re looking for? 
            <span className="text-theme-accent"> We&apos;re here to help!</span>
          </p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          className="max-w-2xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: true }}
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-theme-textSecondary w-5 h-5" />
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-theme-secondary/50 border border-theme-border/30 rounded-xl 
                         text-theme-text placeholder-theme-textSecondary focus:outline-none focus:ring-2 
                         focus:ring-theme-accent/50 focus:border-theme-accent transition-all duration-300"
            />
          </div>
        </motion.div>

        {/* Category Filters */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          {categories.map((category) => {
            const IconComponent = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  activeCategory === category.id
                    ? 'bg-theme-accent text-white shadow-lg transform scale-105'
                    : 'bg-theme-secondary/50 text-theme-textSecondary hover:bg-theme-secondary hover:text-theme-text'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span className="text-sm font-medium">{category.label}</span>
              </button>
            );
          })}
        </motion.div>

        {/* FAQ Items */}
        <div className="max-w-4xl mx-auto">
          {filteredFAQs.length === 0 ? (
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <HelpCircle className="w-16 h-16 text-theme-textSecondary mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-theme-text mb-2">No answers found</h3>
              <p className="text-theme-textSecondary">
                Try adjusting your search terms or browse different categories.
              </p>
            </motion.div>
          ) : (
            <motion.div 
              className="space-y-4"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              {filteredFAQs.map((faq, index) => {
                const isOpen = openItems[index];
                return (
                  <motion.div
                    key={index}
                    className="bg-theme-secondary/30 border border-theme-border/20 rounded-xl overflow-hidden
                               hover:border-theme-accent/30 transition-all duration-300"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    viewport={{ once: true }}
                  >
                    <button
                      onClick={() => toggleItem(index)}
                      className="w-full p-6 text-left flex items-center justify-between group hover:bg-theme-secondary/20 transition-colors duration-300"
                    >
                      <h3 className="text-lg font-semibold text-theme-text group-hover:text-theme-accent transition-colors duration-300 pr-4">
                        {faq.question}
                      </h3>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex-shrink-0"
                      >
                        <ChevronDown className="w-5 h-5 text-theme-textSecondary group-hover:text-theme-accent transition-colors duration-300" />
                      </motion.div>
                    </button>
                    
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-6 pt-0">
                            <div className="w-full h-px bg-theme-border/20 mb-4" />
                            <p className="text-theme-textSecondary leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>

        {/* Still Have Questions CTA */}
        <motion.div
          className="text-center mt-16 p-8 bg-gradient-to-r from-theme-accent/10 to-blue-400/10 
                     border border-theme-accent/20 rounded-2xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <MessageCircle className="w-12 h-12 text-theme-accent mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-theme-text mb-3">
            Still have questions?
          </h3>
          <p className="text-theme-textSecondary mb-6 max-w-md mx-auto">
            Our friendly team is here to help. Get in touch and we&apos;ll get back to you as soon as possible.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              className="inline-flex items-center gap-2 px-6 py-3 bg-theme-accent text-white rounded-lg 
                         font-medium hover:bg-theme-accent/90 transition-all duration-300 shadow-lg 
                         hover:shadow-xl transform hover:scale-105"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <MessageCircle className="w-4 h-4" />
              Start Live Chat
            </motion.button>
            <motion.button
              className="inline-flex items-center gap-2 px-6 py-3 bg-theme-secondary border border-theme-border/30 
                         text-theme-text rounded-lg font-medium hover:bg-theme-secondary/80 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Mail className="w-4 h-4" />
              Send Email
            </motion.button>
          </div>
        </motion.div>

        {/* Back to Top Button */}
        <AnimatePresence>
          {showBackToTop && (
            <motion.button
              onClick={scrollToTop}
              className="fixed bottom-8 right-8 p-3 bg-theme-accent text-white rounded-full shadow-lg 
                         hover:bg-theme-accent/90 transition-all duration-300 z-50"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ArrowUp className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default FAQs;