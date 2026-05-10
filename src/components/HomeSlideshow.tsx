import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import g1 from "@/assets/gallery-1.jpg";
import g2 from "@/assets/gallery-2.jpg";
import g3 from "@/assets/gallery-3.jpg";
import g4 from "@/assets/gallery-4.jpg";
import hero from "@/assets/hero-school.jpg";
import { useI18n } from "@/contexts/I18nContext";

const SLIDES = [
  { src: hero, captionHi: "हमारा विद्यालय परिसर", captionEn: "Our school campus" },
  { src: g1, captionHi: "विद्यालय भवन", captionEn: "School building" },
  { src: g2, captionHi: "प्रार्थना सभा", captionEn: "Morning assembly" },
  { src: g3, captionHi: "पुस्तकालय में बच्चे", captionEn: "Children in library" },
  { src: g4, captionHi: "खेल का मैदान व कार्यक्रम", captionEn: "Playground & events" },
];

export const HomeSlideshow = () => {
  const { lang } = useI18n();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 4000);
    return () => clearInterval(id);
  }, [paused]);

  const go = (delta: number) =>
    setIndex((i) => (i + delta + SLIDES.length) % SLIDES.length);

  const slide = SLIDES[index];
  const caption = lang === "hi" ? slide.captionHi : slide.captionEn;

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl shadow-glow aspect-[16/9] bg-muted"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role="region"
      aria-label={lang === "hi" ? "विद्यालय की झलकियाँ" : "School highlights"}
    >
      <AnimatePresence mode="wait">
        <motion.img
          key={index}
          src={slide.src}
          alt={caption}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 md:p-6">
        <p className="text-white font-semibold text-base md:text-lg drop-shadow">{caption}</p>
      </div>

      <button
        onClick={() => go(-1)}
        className="absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 hover:bg-white text-primary flex items-center justify-center shadow-soft transition-colors"
        aria-label="Previous"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => go(1)}
        className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white/80 hover:bg-white text-primary flex items-center justify-center shadow-soft transition-colors"
        aria-label="Next"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-6 bg-secondary" : "w-1.5 bg-white/60 hover:bg-white"
            }`}
          />
        ))}
      </div>
    </div>
  );
};
