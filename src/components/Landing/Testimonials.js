"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react";

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      name: "Alex M.",
      role: "Frontend Engineer",
      company: "",
      quote:
        "Finally replaced my chaotic bookmarks bar. ToolSpace is like my command center.",
      rating: 5,
      avatar: "🧑‍💻",
      tech: ["React", "Node.js", "MongoDB"],
    },
    {
      name: "Priya K.",
      role: "DevOps Lead",
      company: "",
      quote:
        "I shared my team's microservices products with one link. Onboarding went from 2 hours to 10 minutes.",
      rating: 5,
      avatar: "�‍�",
      tech: ["Docker", "Kubernetes", "AWS"],
    },
    {
      name: "David T.",
      role: "Indie Hacker",
      company: "",
      quote:
        "The built-in product suggestions introduced me to new APIs I now can't live without.",
      rating: 5,
      avatar: "�‍💼",
      tech: ["Next.js", "Supabase", "Vercel"],
    },
  ];

  // Auto-scroll through testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  return (
    <section id="testimonials" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-theme-background via-theme-primary/5 to-theme-background"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-theme-text mb-6">
              What Developers Are{" "}
              <span className="bg-gradient-to-r from-theme-primary to-theme-accent bg-clip-text text-theme-text">
                Saying
              </span>
            </h2>
            <p className="text-xl text-theme-text-secondary max-w-3xl mx-auto">
              Join thousands of developers who&apos;ve transformed their
              workflow
            </p>
          </motion.div>

          {/* Main Testimonial Carousel */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="bg-theme-secondary/50 backdrop-blur-lg rounded-3xl p-8 md:p-12 border border-theme-border/30 relative"
              >
                {/* Quote icon */}
                <Quote className="w-12 h-12 text-theme-primary/30 mb-6" />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                  {/* Testimonial Content */}
                  <div>
                    <motion.p
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-xl md:text-2xl text-theme-text leading-relaxed mb-6 italic"
                    >
                      &quot;{testimonials[currentIndex].quote}&quot;
                    </motion.p>

                    {/* Rating */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                      className="flex items-center space-x-1 mb-6"
                    >
                      {[...Array(testimonials[currentIndex].rating)].map(
                        (_, i) => (
                          <Star
                            key={i}
                            className="w-5 h-5 fill-theme-warning text-theme-warning"
                          />
                        )
                      )}
                    </motion.div>

                    {/* Author info */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex items-center space-x-4"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-theme-primary to-theme-accent rounded-full flex items-center justify-center text-2xl">
                        {testimonials[currentIndex].avatar}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-theme-text">
                          {testimonials[currentIndex].name}
                        </h4>
                        <p className="text-theme-text-secondary">
                          {testimonials[currentIndex].role}
                        </p>
                      </div>
                    </motion.div>
                  </div>

                  {/* Tech Stack */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    className="lg:justify-self-end"
                  >
                    <div className="bg-theme-background/50 rounded-2xl p-6 border border-theme-border/20">
                      <h5 className="text-lg font-semibold text-theme-text mb-4">
                        Tech Stack
                      </h5>
                      <div className="flex flex-wrap gap-3">
                        {testimonials[currentIndex].tech.map((tech, i) => (
                          <motion.span
                            key={tech}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.6 + i * 0.1 }}
                            className="px-3 py-2 bg-theme-primary/10 text-theme-primary rounded-lg text-sm font-medium border border-theme-primary/20"
                          >
                            {tech}
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation buttons */}
            <button
              onClick={prevTestimonial}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-theme-secondary/80 backdrop-blur-sm border border-theme-border/30 rounded-full flex items-center justify-center text-theme-text hover:text-theme-primary hover:bg-theme-primary/10 transition-all duration-300"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={nextTestimonial}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-theme-secondary/80 backdrop-blur-sm border border-theme-border/30 rounded-full flex items-center justify-center text-theme-text hover:text-theme-primary hover:bg-theme-primary/10 transition-all duration-300"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Dots indicator */}
          <div className="flex justify-center space-x-3 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "bg-theme-primary scale-125"
                    : "bg-theme-text-secondary/30 hover:bg-theme-text-secondary/60"
                }`}
              />
            ))}
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16"
          >
            {[
              { number: "10K+", label: "Active Developers" },
              { number: "50K+", label: "Products Organized" },
              { number: "99%", label: "Satisfaction Rate" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="text-center p-6 bg-theme-secondary/30 backdrop-blur-sm rounded-xl border border-theme-border/20"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{
                    delay: 0.7 + index * 0.1,
                    type: "spring",
                    stiffness: 200,
                  }}
                  className="text-3xl md:text-4xl font-bold text-theme-primary mb-2"
                >
                  {stat.number}
                </motion.div>
                <div className="text-theme-text-secondary font-medium">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
