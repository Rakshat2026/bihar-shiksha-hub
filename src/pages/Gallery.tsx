import { useI18n } from "@/contexts/I18nContext";
import g1 from "@/assets/gallery-1.jpg";
import g2 from "@/assets/gallery-2.jpg";
import g3 from "@/assets/gallery-3.jpg";
import g4 from "@/assets/gallery-4.jpg";

const Gallery = () => {
  const { t, lang } = useI18n();
  const images = [
    { src: g1, alt: lang === "hi" ? "विद्यालय भवन" : "School building" },
    { src: g2, alt: lang === "hi" ? "प्रार्थना सभा" : "Morning assembly" },
    { src: g3, alt: lang === "hi" ? "पुस्तकालय में बच्चे" : "Children in library" },
    { src: g4, alt: lang === "hi" ? "खेल का मैदान" : "Playground" },
  ];

  return (
    <div className="animate-fade-in">
      <section className="gradient-royal text-primary-foreground py-12 md:py-16">
        <div className="container px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold">{t("galleryHeading")}</h1>
        </div>
      </section>

      <section className="container px-4 py-12 md:py-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
          {images.map((img, i) => (
            <figure key={i} className="group relative overflow-hidden rounded-xl shadow-soft aspect-[4/3]">
              <img
                src={img.src}
                alt={img.alt}
                width={1024}
                height={768}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent text-white p-4 font-medium">
                {img.alt}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Gallery;
