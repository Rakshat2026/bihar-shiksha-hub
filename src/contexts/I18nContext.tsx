import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Lang = "hi" | "en";

type Dict = Record<string, { hi: string; en: string }>;

export const dict: Dict = {
  // Brand
  schoolName: { hi: "ज्ञान गंगा एकेडमी", en: "Gyan Ganga Academy" },
  schoolLocation: { hi: "तेकटार, सिंघवारा, दरभंगा, बिहार", en: "Tektar, Singhwara, Darbhanga, Bihar" },
  tagline: { hi: "शिक्षा ही सफलता की कुंजी है", en: "Education is the key to success" },

  // Nav
  navHome: { hi: "मुख्य पृष्ठ", en: "Home" },
  navAbout: { hi: "हमारे बारे में", en: "About" },
  navAcademics: { hi: "शिक्षा", en: "Academics" },
  navAdmissions: { hi: "प्रवेश", en: "Admissions" },
  navFacilities: { hi: "सुविधाएं", en: "Facilities" },
  navGallery: { hi: "गैलरी", en: "Gallery" },
  navNotices: { hi: "सूचना पट", en: "Notice Board" },
  navContact: { hi: "संपर्क", en: "Contact" },
  login: { hi: "लॉगिन", en: "Login" },
  logout: { hi: "लॉगआउट", en: "Logout" },

  // Home
  heroSubtitle: {
    hi: "1983 से दरभंगा के ग्रामीण समुदाय को गुणवत्तापूर्ण शिक्षा प्रदान करते हुए",
    en: "Providing quality education to rural Darbhanga since 1983",
  },
  ctaAdmission: { hi: "प्रवेश के लिए आवेदन करें", en: "Apply for Admission" },
  ctaLearn: { hi: "और जानें", en: "Learn More" },
  whyUs: { hi: "हमें क्यों चुनें?", en: "Why Choose Us?" },
  feat1Title: { hi: "अनुभवी शिक्षक", en: "Experienced Teachers" },
  feat1Desc: { hi: "योग्य और समर्पित शिक्षक", en: "Qualified and dedicated teaching staff" },
  feat2Title: { hi: "द्विभाषी शिक्षा", en: "Bilingual Education" },
  feat2Desc: { hi: "हिंदी और अंग्रेजी दोनों माध्यमों में", en: "Instruction in both Hindi and English" },
  feat3Title: { hi: "मूल्य आधारित", en: "Value-Based Learning" },
  feat3Desc: { hi: "नैतिक मूल्यों और संस्कारों पर बल", en: "Strong focus on morals and culture" },
  feat4Title: { hi: "किफायती शुल्क", en: "Affordable Fees" },
  feat4Desc: { hi: "ग्रामीण परिवारों के लिए सुलभ", en: "Accessible for rural families" },

  // About
  aboutHeading: { hi: "हमारे बारे में", en: "About Us" },
  history: { hi: "इतिहास", en: "Our History" },
  historyText: {
    hi: "ज्ञान गंगा एकेडमी की स्थापना 1983 में दरभंगा जिले के तेकटार गाँव में हुई थी। यह एक प्राथमिक एवं माध्यमिक विद्यालय है जो कक्षा 1 से 8 तक के विद्यार्थियों को शिक्षा प्रदान करता है। चार दशकों से अधिक समय से यह संस्था ग्रामीण बच्चों को गुणवत्तापूर्ण शिक्षा देने के लिए समर्पित है।",
    en: "Gyan Ganga Academy was established in 1983 in Tektar village of Darbhanga district. It is a primary and middle school catering to students from class 1 to class 8. For over four decades, the institution has been dedicated to providing quality education to rural children.",
  },
  founder: { hi: "संस्थापक", en: "Founder" },
  founderText: {
    hi: "श्री हेमन्त कुमार झा जी द्वारा स्थापित, जिनका दृष्टिकोण ग्रामीण भारत के बच्चों तक शिक्षा पहुँचाना था।",
    en: "Founded by Shri Hemant Kumar Jha, an educationist whose vision is to bring education to every child in rural India.",
  },
  principalMsg: { hi: "प्रधानाचार्य का संदेश", en: "Principal's Message" },
  principalText: {
    hi: "हमारा विद्यालय केवल शिक्षा का मंदिर नहीं, बल्कि चरित्र निर्माण की कार्यशाला है। हम प्रत्येक बच्चे में छिपी प्रतिभा को पहचानने और निखारने का प्रयास करते हैं।",
    en: "Our school is not just a temple of education but a workshop of character building. We strive to recognize and nurture the talent hidden in every child.",
  },
  mission: { hi: "हमारा मिशन", en: "Our Mission" },
  missionText: {
    hi: "ग्रामीण बच्चों को आधुनिक, मूल्य-आधारित और किफायती शिक्षा प्रदान करना।",
    en: "To provide modern, value-based and affordable education to rural children.",
  },
  vision: { hi: "हमारा दृष्टिकोण", en: "Our Vision" },
  visionText: {
    hi: "एक ऐसा शिक्षित समाज बनाना जहाँ हर बच्चा अपने सपनों को साकार कर सके।",
    en: "To build an educated society where every child can realize their dreams.",
  },
  affiliation: { hi: "संबद्धता", en: "Affiliation" },
  affiliationText: {
    hi: "बिहार विद्यालय परीक्षा समिति (BSEB) से मान्यता प्राप्त।",
    en: "Recognized by the Bihar School Examination Board (BSEB).",
  },

  // Academics
  academicsHeading: { hi: "हमारी शिक्षा", en: "Our Academics" },
  classesOffered: { hi: "उपलब्ध कक्षाएं", en: "Classes Offered" },
  subjects: { hi: "विषय", en: "Subjects" },
  subjHindi: { hi: "हिंदी", en: "Hindi" },
  subjEnglish: { hi: "अंग्रेजी", en: "English" },
  subjMath: { hi: "गणित", en: "Mathematics" },
  subjScience: { hi: "विज्ञान", en: "Science" },
  subjSocial: { hi: "सामाजिक विज्ञान", en: "Social Studies" },
  subjSanskrit: { hi: "संस्कृत", en: "Sanskrit" },
  subjArt: { hi: "कला एवं शिल्प", en: "Art & Craft" },
  subjPE: { hi: "शारीरिक शिक्षा", en: "Physical Education" },

  // Admissions
  admissionsHeading: { hi: "प्रवेश सूचना", en: "Admissions" },
  admissionIntro: {
    hi: "सत्र 2025-26 के लिए कक्षा 1 से 8 तक प्रवेश प्रारंभ हैं। नीचे फॉर्म भरकर प्रवेश पूछताछ करें।",
    en: "Admissions are open for classes 1-8 for the 2025-26 session. Submit the enquiry form below.",
  },
  enquiryForm: { hi: "प्रवेश पूछताछ फॉर्म", en: "Admission Enquiry Form" },
  fieldName: { hi: "पूरा नाम", en: "Full Name" },
  fieldMobile: { hi: "मोबाइल नंबर", en: "Mobile Number" },
  fieldRole: { hi: "आप कौन हैं?", en: "You are a" },
  roleStudent: { hi: "छात्र / छात्रा", en: "Student" },
  roleParent: { hi: "अभिभावक", en: "Parent" },
  fieldClass: { hi: "किस कक्षा के लिए आवेदन?", en: "Class applying for" },
  fieldMessage: { hi: "संदेश (वैकल्पिक)", en: "Message (optional)" },
  submitEnquiry: { hi: "पूछताछ भेजें", en: "Submit Enquiry" },
  loginRequired: { hi: "पूछताछ भेजने के लिए कृपया लॉगिन करें।", en: "Please log in to submit an enquiry." },
  enquirySuccess: { hi: "धन्यवाद! आपकी पूछताछ प्राप्त हो गई।", en: "Thank you! Your enquiry has been received." },

  // Facilities
  facilitiesHeading: { hi: "विद्यालय की सुविधाएं", en: "School Facilities" },
  fac1: { hi: "विशाल कक्षाएं", en: "Spacious Classrooms" },
  fac1d: { hi: "हवादार और रोशनी से भरपूर कक्षाएं", en: "Airy, well-lit classrooms" },
  fac2: { hi: "पुस्तकालय", en: "Library" },
  fac2d: { hi: "हिंदी एवं अंग्रेजी पुस्तकों का संग्रह", en: "Collection of Hindi and English books" },
  fac3: { hi: "खेल का मैदान", en: "Playground" },
  fac3d: { hi: "क्रिकेट, कबड्डी, फुटबॉल हेतु", en: "For cricket, kabaddi and football" },
  fac4: { hi: "स्वच्छ पेयजल", en: "Clean Drinking Water" },
  fac4d: { hi: "RO से शुद्ध जल", en: "RO-purified water" },
  fac5: { hi: "स्वच्छ शौचालय", en: "Clean Washrooms" },
  fac5d: { hi: "बालक एवं बालिकाओं हेतु अलग", en: "Separate for boys and girls" },
  fac6: { hi: "कंप्यूटर कक्ष", en: "Computer Lab" },
  fac6d: { hi: "बुनियादी डिजिटल साक्षरता", en: "Basic digital literacy" },

  // Gallery
  galleryHeading: { hi: "विद्यालय की झलकियाँ", en: "School Gallery" },

  // Notices
  noticesHeading: { hi: "सूचना पट", en: "Notice Board" },
  noNotices: { hi: "अभी कोई सूचना नहीं है।", en: "No notices at the moment." },

  // Contact
  contactHeading: { hi: "संपर्क करें", en: "Contact Us" },
  address: { hi: "पता", en: "Address" },
  addressFull: {
    hi: "ज्ञान गंगा एकेडमी, तेकटार, सिंघवारा, दरभंगा, बिहार — 847105",
    en: "Gyan Ganga Academy, Tektar, Singhwara, Darbhanga, Bihar — 847105",
  },
  phone: { hi: "फोन", en: "Phone" },
  email: { hi: "ईमेल", en: "Email" },
  hours: { hi: "विद्यालय समय", en: "School Hours" },
  hoursVal: { hi: "सोम-शनि: सुबह 8:00 - दोपहर 2:00", en: "Mon-Sat: 8:00 AM - 2:00 PM" },

  // Auth
  loginHeading: { hi: "मोबाइल नंबर से लॉगिन करें", en: "Login with Mobile Number" },
  loginIntro: {
    hi: "अपना मोबाइल नंबर डालें और OTP प्राप्त करें।",
    en: "Enter your mobile number to receive an OTP.",
  },
  sendOtp: { hi: "OTP भेजें", en: "Send OTP" },
  enterOtp: { hi: "OTP दर्ज करें", en: "Enter OTP" },
  verifyOtp: { hi: "OTP सत्यापित करें", en: "Verify OTP" },
  mockOtpHint: {
    hi: "डेमो के लिए OTP है: 123456",
    en: "Demo OTP is: 123456",
  },
  completeProfile: { hi: "अपनी जानकारी पूरी करें", en: "Complete Your Profile" },
  saveProfile: { hi: "सहेजें और जारी रखें", en: "Save & Continue" },
  invalidMobile: { hi: "कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।", en: "Please enter a valid 10-digit mobile number." },
  invalidOtp: { hi: "गलत OTP। पुनः प्रयास करें।", en: "Incorrect OTP. Please try again." },
  welcomeBack: { hi: "वापसी पर स्वागत है!", en: "Welcome back!" },
  accountCreated: { hi: "खाता सफलतापूर्वक बनाया गया!", en: "Account created successfully!" },

  // Footer
  quickLinks: { hi: "त्वरित लिंक", en: "Quick Links" },
  followUs: { hi: "हमसे जुड़ें", en: "Follow Us" },
  rightsReserved: { hi: "सर्वाधिकार सुरक्षित", en: "All rights reserved" },
};

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof dict) => string;
}

const I18nContext = createContext<I18nCtx | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "hi";
    return (localStorage.getItem("gga_lang") as Lang) || "hi";
  });

  useEffect(() => {
    document.documentElement.lang = lang;
    document.body.classList.toggle("lang-hi", lang === "hi");
    localStorage.setItem("gga_lang", lang);
  }, [lang]);

  const setLang = (l: Lang) => setLangState(l);
  const t = (key: keyof typeof dict) => dict[key]?.[lang] ?? String(key);

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
