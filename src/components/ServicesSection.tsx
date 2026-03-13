import { Atom, Flame, Wind, Zap, Globe, FlaskConical } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, Variants } from "framer-motion";

const ServicesSection = () => {
  const { t } = useLanguage();
  const services = [
    {
      icon: Atom,
      title: t('services.physics.title'),
      description: t('services.physics.desc'),
    },
    {
      icon: Flame,
      title: t('services.chemistry.title'),
      description: t('services.chemistry.desc'),
    },
    {
      icon: Wind,
      title: t('services.fluids.title'),
      description: t('services.fluids.desc'),
    },
    {
      icon: Zap,
      title: t('services.electro.title'),
      description: t('services.electro.desc'),
    },
    {
      icon: Globe,
      title: t('services.planetary.title'),
      description: t('services.planetary.desc'),
    },
    {
      icon: FlaskConical,
      title: t('services.custom.title'),
      description: t('services.custom.desc'),
    },
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
    <section id="services" className="relative py-24 px-4 bg-card/30">
      <motion.div
        className="max-w-6xl mx-auto"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <motion.div className="text-center mb-16" variants={sectionVariants}>
          <span className="inline-block px-4 py-1.5 rounded-full bg-muted border border-border text-sm text-muted-foreground mb-4">
            {t('services.badge')}
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">
            {t('services.title1')} <span className="text-glow">{t('services.titleGlow')}</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('services.description')}
          </p>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer}
        >
          {services.map((service, index) => (
            <motion.div
              key={index}
              variants={sectionVariants}
              className="group p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:translate-y-[-4px] hover-lift"
            >
              <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center mb-4 group-hover:box-glow transition-all duration-300">
                <service.icon className="w-7 h-7 text-foreground" />
              </div>
              <h3 className="font-display font-semibold text-xl mb-3">{service.title}</h3>
              <p className="text-muted-foreground">{service.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default ServicesSection;
