import { useState } from "react";
import { Mail, MessageSquare, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { djangoClient } from "@/integrations/django/client";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, Variants } from "framer-motion";

const ContactSection = () => {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error(t('contact.error'));
      return;
    }

    setIsSubmitting(true);
    try {
      await djangoClient.submitContact({
        name: formData.name,
        email: formData.email,
        subject: formData.subject || "General Inquiry",
        message: formData.message,
      });
      toast.success(t('contact.success'));
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to send message";
      toast.error(errorMessage);
      console.error("Contact submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const sectionVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  return (
    <section id="contact" className="relative py-24 px-4 bg-card/30 overflow-hidden">
      <motion.div
        className="max-w-4xl mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <motion.div className="text-center mb-12" variants={sectionVariants}>
          <span className="inline-block px-4 py-1.5 rounded-full bg-muted border border-border text-sm text-muted-foreground mb-4">
            {t('contact.badge')}
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            {t('contact.title1')} <span className="text-glow">{t('contact.titleGlow')}</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            {t('contact.description')}
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-3 gap-6 mb-12"
          variants={staggerContainer}
        >
          <motion.div variants={sectionVariants} className="text-center p-6 rounded-xl bg-card border border-border hover-lift transition-all">
            <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-muted flex items-center justify-center">
              <Mail className="w-6 h-6 text-foreground" />
            </div>
            <h3 className="font-semibold mb-2">{t('contact.email')}</h3>
            <p className="text-sm text-muted-foreground">hello@beyondlab.ai</p>
          </motion.div>
          <motion.div variants={sectionVariants} className="text-center p-6 rounded-xl bg-card border border-border hover-lift transition-all">
            <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-muted flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-foreground" />
            </div>
            <h3 className="font-semibold mb-2">{t('contact.chat')}</h3>
            <p className="text-sm text-muted-foreground">{language === 'al' ? 'Disponueshëm 24/7' : 'Available 24/7'}</p>
          </motion.div>
          <motion.div variants={sectionVariants} className="text-center p-6 rounded-xl bg-card border border-border hover-lift transition-all">
            <div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-muted flex items-center justify-center">
              <MapPin className="w-6 h-6 text-foreground" />
            </div>
            <h3 className="font-semibold mb-2">{t('contact.location')}</h3>
            <p className="text-sm text-muted-foreground">San Francisco, CA</p>
          </motion.div>
        </motion.div>

        <motion.div
          className="p-8 rounded-2xl bg-card border border-border"
          variants={sectionVariants}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">{t('contact.labels.name')}</label>
                <input
                  type="text"
                  name="name"
                  placeholder={t('contact.placeholders.name')}
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">{t('contact.labels.email')}</label>
                <input
                  type="email"
                  name="email"
                  placeholder={t('contact.placeholders.email')}
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t('contact.labels.subject')}</label>
              <input
                type="text"
                name="subject"
                placeholder={t('contact.placeholders.subject')}
                value={formData.subject}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t('contact.labels.message')}</label>
              <textarea
                name="message"
                rows={4}
                placeholder={t('contact.placeholders.message')}
                value={formData.message}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-4 py-3 rounded-lg bg-muted border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none disabled:opacity-50"
              />
            </div>
            <Button
              type="submit"
              size="lg"
              className="w-full md:w-auto"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('contact.sending')}
                </>
              ) : (
                t('contact.send')
              )}
            </Button>
          </form>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default ContactSection;
