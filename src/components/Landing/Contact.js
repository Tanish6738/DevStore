
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, MessageCircle, Github, Twitter, Linkedin, Send, CheckCircle, User } from 'lucide-react'
import Button from '../ui/Button'
import Input from '../ui/Input'

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.message) return

    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setIsSubmitted(true)
      setFormData({ name: '', email: '', message: '' })
      
      // Reset after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false)
      }, 3000)
    }, 1000)
  }

  const socialLinks = [
    { 
      icon: <Github className="w-6 h-6" />, 
      href: "https://github.com", 
      label: "GitHub",
      color: "hover:text-gray-400"
    },
    { 
      icon: <Twitter className="w-6 h-6" />, 
      href: "https://twitter.com", 
      label: "Twitter",
      color: "hover:text-blue-400"
    },
    { 
      icon: <MessageCircle className="w-6 h-6" />, 
      href: "https://discord.com", 
      label: "Discord",
      color: "hover:text-indigo-400"
    },
    { 
      icon: <Linkedin className="w-6 h-6" />, 
      href: "https://linkedin.com", 
      label: "LinkedIn",
      color: "hover:text-blue-600"
    }
  ]

  return (
    <section id="contact" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-theme-secondary/30 via-theme-background to-theme-background"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-gradient-to-br from-theme-primary to-theme-accent rounded-2xl flex items-center justify-center mx-auto mb-6"
            >
              <Mail className="w-8 h-8 text-white" />
            </motion.div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-theme-text mb-6">
              Let&apos;s{' '}
              <span className="bg-gradient-to-r from-theme-primary to-theme-accent bg-clip-text text-theme-text">
                Connect
              </span>
            </h2>
            <p className="text-xl text-theme-text-secondary max-w-3xl mx-auto leading-relaxed">
              Have feedback, ideas, or want to partner? We&apos;d love to hear from you.
            </p>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-theme-secondary/50 backdrop-blur-lg rounded-3xl p-8 md:p-12 border border-theme-border/30 mb-16"
          >
            <div className="max-w-2xl mx-auto">
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name Field */}
                    <motion.div
                      initial={{ opacity: 0, x: -30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      viewport={{ once: true }}
                    >
                      <label className="block text-theme-text font-medium mb-2">
                        Name
                      </label>
                      <Input
                        type="text"
                        name="name"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="h-12"
                        required
                      />
                    </motion.div>

                    {/* Email Field */}
                    <motion.div
                      initial={{ opacity: 0, x: 30 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                      viewport={{ once: true }}
                    >
                      <label className="block text-theme-text font-medium mb-2">
                        Email
                      </label>
                      <Input
                        type="email"
                        name="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="h-12"
                        required
                      />
                    </motion.div>
                  </div>

                  {/* Message Field */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    viewport={{ once: true }}
                  >
                    <label className="block text-theme-text font-medium mb-2">
                      Message
                    </label>
                    <textarea
                      name="message"
                      placeholder="Tell us about your feedback, ideas, or partnership proposal..."
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={6}
                      className="w-full px-4 py-3 bg-theme-background/50 border border-theme-border/30 rounded-xl text-theme-text placeholder-theme-text-secondary focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-transparent transition-all duration-300 resize-none"
                      required
                    />
                  </motion.div>

                  {/* Submit Button */}
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    viewport={{ once: true }}
                    className="text-center"
                  >
                    <Button
                      type="submit"
                      disabled={isLoading || !formData.name || !formData.email || !formData.message}
                      className="px-8 py-4 text-lg"
                      variant="primary"
                    >
                      {isLoading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </motion.div>
                </form>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="w-16 h-16 bg-theme-success rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckCircle className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-theme-text mb-2">
                    Message sent! 🎉
                  </h3>
                  <p className="text-theme-text-secondary">
                    Thanks for reaching out. We&apos;ll get back to you soon!
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Contact info and Social links */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {/* Contact info */}
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold text-theme-text mb-4">
                Get In Touch
              </h3>
              <p className="text-theme-text-secondary mb-6">
                We&apos;re here to help and answer any questions you might have
              </p>
              
              <div className="space-y-3">
                <motion.a
                  href="mailto:hello@toolspace.dev"
                  whileHover={{ scale: 1.05 }}
                  className="inline-flex items-center space-x-2 text-theme-primary hover:text-theme-accent transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  <span>hello@toolspace.dev</span>
                </motion.a>
                
                <br />
                
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.05 }}
                  className="inline-flex items-center space-x-2 text-theme-primary hover:text-theme-accent transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Join our Discord</span>
                </motion.a>
              </div>
            </div>

            {/* Social Links */}
            <div className="text-center md:text-right">
              <h3 className="text-2xl font-bold text-theme-text mb-4">
                Follow Our Journey
              </h3>
              <p className="text-theme-text-secondary mb-6">
                Connect with us on social media for updates and community discussions
              </p>
              
              <div className="flex justify-center md:justify-end space-x-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + (index * 0.1) }}
                    whileHover={{ y: -5, scale: 1.1 }}
                    className={`w-12 h-12 bg-theme-secondary/50 backdrop-blur-sm border border-theme-border/30 rounded-xl flex items-center justify-center text-theme-text-secondary transition-all duration-300 ${social.color}`}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Response time info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              { icon: <Send className="w-6 h-6" />, title: "Quick Response", desc: "We reply within 24 hours" },
              { icon: <MessageCircle className="w-6 h-6" />, title: "Open Communication", desc: "Transparent and honest feedback" },
              { icon: <User className="w-6 h-6" />, title: "Personal Touch", desc: "Real humans, not bots" }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + (index * 0.1) }}
                whileHover={{ y: -5 }}
                className="bg-theme-secondary/30 backdrop-blur-sm rounded-xl p-6 border border-theme-border/20 text-center"
              >
                <div className="w-12 h-12 bg-theme-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 text-theme-primary">
                  {feature.icon}
                </div>
                <h4 className="font-semibold text-theme-text mb-2">{feature.title}</h4>
                <p className="text-sm text-theme-text-secondary">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Contact