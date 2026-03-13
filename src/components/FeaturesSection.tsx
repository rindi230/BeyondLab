import { Cpu, Gauge, Shield, Smartphone } from "lucide-react";
import { SplineScene } from "@/components/ui/splite";
import { Spotlight } from "@/components/ui/spotlight";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, Variants } from "framer-motion";

const FeaturesSection = () => {
  const { t } = useLanguage();
  const features = [
    {
      icon: Cpu,
      title: t('features.ai.title'),
      description: t('features.ai.desc'),
    },
    {
      icon: Gauge,
      title: t('features.rendering.title'),
      description: t('features.rendering.desc'),
    },
    {
      icon: Shield,
      title: t('features.safe.title'),
      description: t('features.safe.desc'),
    },
    {
      icon: Smartphone,
      title: t('features.cross.title'),
      description: t('features.cross.desc'),
    },
  ];

  const sectionVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
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
    <section id="features" className="relative py-24 px-4 overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.span
              className="inline-block px-4 py-1.5 rounded-full bg-muted border border-border text-sm text-muted-foreground mb-4"
              variants={itemVariants}
            >
              {t('features.badge')}
            </motion.span>
            <motion.h2
              className="font-display text-3xl md:text-5xl font-bold mb-6"
              variants={itemVariants}
            >
              {t('features.title1')}
              <br />
              <span className="text-glow">{t('features.titleGlow')}</span>
            </motion.h2>
            <motion.p
              className="text-muted-foreground text-lg mb-8"
              variants={itemVariants}
            >
              {t('features.description')}
            </motion.p>

            <motion.div className="space-y-4" variants={staggerContainer}>
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="flex gap-4 p-4 rounded-lg hover:bg-muted/50 transition-all duration-300 hover-lift"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Spline 3D Scene */}
          <motion.div
            className="relative aspect-square rounded-2xl border border-border/30 overflow-hidden bg-transparent"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Spotlight
              className="-top-40 left-0 md:left-60 md:-top-20 opacity-40"
              size={120}
            />
            <SplineScene
              scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
              className="w-full h-full"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
