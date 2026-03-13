import { Users, Target, Award, Lightbulb } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, Variants } from "framer-motion";

const AboutSection = () => {
  const { t } = useLanguage();
  const stats = [
    { value: "10K+", label: t('about.stats.experiments') },
    { value: "500+", label: t('about.stats.models') },
    { value: "99.9%", label: t('about.stats.accuracy') },
    { value: "24/7", label: t('about.stats.available') },
  ];

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
    <section id="about" className="relative py-24 px-4 overflow-hidden">
      <motion.div
        className="max-w-6xl mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <motion.div className="text-center mb-16" variants={sectionVariants}>
          <span className="inline-block px-4 py-1.5 rounded-full bg-muted border border-border text-sm text-muted-foreground mb-4">
            {t('about.badge')}
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            {t('about.title1')}
            <br />
            <span className="text-glow">{t('about.titleGlow')}</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('about.description')}
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
          variants={staggerContainer}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={sectionVariants}
              className="text-center p-6 rounded-xl border border-border/50 hover:border-primary/30 transition-all duration-300 bg-transparent hover-lift hover:bg-muted/30"
            >
              <div className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Values */}
        <motion.div className="grid md:grid-cols-2 gap-8" variants={sectionVariants}>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                <Target className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg mb-2">{t('about.mission.title')}</h3>
                <p className="text-muted-foreground">
                  {t('about.mission.desc')}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg mb-2">{t('about.innovation.title')}</h3>
                <p className="text-muted-foreground">
                  {t('about.innovation.desc')}
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                <Users className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg mb-2">{t('about.community.title')}</h3>
                <p className="text-muted-foreground">
                  {t('about.community.desc')}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                <Award className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg mb-2">{t('about.excellence.title')}</h3>
                <p className="text-muted-foreground">
                  {t('about.excellence.desc')}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default AboutSection;
