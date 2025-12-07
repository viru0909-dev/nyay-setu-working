import { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
};

export const translations = {
    en: {
        // Header & Navigation
        home: 'Home',
        features: 'Features',
        constitution: 'Constitution',
        aiAssistant: 'AI Assistant',
        about: 'About',
        login: 'Login',
        getStarted: 'Get Started',
        signup: 'Sign Up',

        // Landing Page - Hero
        heroTitle: 'AI-Powered Digital Justice',
        heroTitleHighlight: 'for Every Citizen',
        heroSubtitle: 'Access justice from anywhere, anytime. File cases, track progress, attend virtual hearings, and get AI-powered legal assistance—all on a single transparent platform.',
        getStartedFree: 'Get Started Free',
        watchDemo: 'Watch Demo',

        // Landing Page - Stats
        casesFiled: 'Cases Filed',
        activeUsers: 'Active Users',
        successRate: 'Success Rate',
        aiSupport: 'AI Support',

        // Landing Page - Features
        featuresTitle: 'Powerful Features for',
        featuresTitleHighlight: 'Modern Justice',
        featuresSubtitle: 'Everything you need to navigate the legal system efficiently',

        aiLegalAssistant: 'AI Legal Assistant',
        aiLegalAssistantDesc: '24/7 AI-powered chatbot for instant legal guidance and answers',

        constitutionReader: 'Constitution Reader',
        constitutionReaderDesc: 'Browse Indian Constitution with intelligent search and Q&A',

        fileCases: 'File Cases Online',
        fileCasesDesc: 'Submit legal cases digitally with secure document management',

        virtualHearings: 'Virtual Hearings',
        virtualHearingsDesc: 'Attend court proceedings remotely with video conferencing',

        securePrivate: 'Secure & Private',
        securePrivateDesc: 'Bank-grade encryption ensures your data stays protected',

        realTimeUpdates: 'Real-time Updates',
        realTimeUpdatesDesc: 'Get instant notifications on case progress and hearings',

        // Landing Page - CTA
        ctaTitle: 'Ready to Start Your Journey to Justice?',
        ctaSubtitle: 'Join thousands of citizens already using NyaySetu for their legal needs',
        createAccount: 'Create Free Account',

        // Footer
        footerTagline: "India's first AI-powered virtual judiciary platform, making justice accessible to every citizen.",
        quickLinks: 'Quick Links',
        legal: 'Legal',
        getInTouch: 'Get In Touch',
        viewRepository: 'View Repository',
        allRightsReserved: 'All rights reserved.',
        madeWith: 'Made with',
        by: 'by',
        privacyPolicy: 'Privacy Policy',
        termsOfService: 'Terms of Service',
        disclaimer: 'Disclaimer',

        // Constitution Page
        constitutionOfIndia: 'Constitution of India',
        searchArticles: 'Search articles, parts...',
        downloadPDF: 'Download PDF',
        bookmarks: 'Bookmarks',
        askAI: 'Ask AI',
        articles: 'Articles',
        part: 'Part',
        article: 'Article',
        readMore: 'Read More',
        share: 'Share',
        addBookmark: 'Add Bookmark',

        // About Page
        aboutHeroTag: "India's First AI-Powered Judiciary Platform",
        aboutHeroTitle: 'Revolutionizing',
        aboutHeroTitleHighlight: 'Justice',
        aboutHeroSubtitle: "NyaySetu is transforming India's judicial system by making legal processes accessible, transparent, and efficient through cutting-edge AI technology.",
        problemSolution: 'The Problem & Our Solution',
        problemSolutionDesc: 'Understanding the challenges and how we solve them',
        traditionalSystem: 'Traditional System',
        nyaysetuSolution: 'NyaySetu Solution',

        // Problems
        longDelays: 'Long Delays',
        longDelaysDesc: 'Cases take years to resolve',
        complexPaperwork: 'Complex Paperwork',
        complexPaperworkDesc: 'Difficult documentation process',
        lackAwareness: 'Lack of Awareness',
        lackAwarenessDesc: 'Citizens unaware of rights',
        highCosts: 'High Costs',
        highCostsDesc: 'Expensive legal procedures',

        // Solutions
        instantFiling: 'Instant Filing',
        instantFilingDesc: 'File cases online in minutes',
        aiAssistance: 'AI Assistance',
        aiAssistanceDesc: 'Smart legal guidance 24/7',
        transparency: 'Transparency',
        transparencyDesc: 'Track case status in real-time',
        securePlatform: 'Secure Platform',
        securePlatformDesc: 'Bank-grade data protection',

        // How It Works
        howItWorks: 'How NyaySetu Works',
        howItWorksDesc: 'A simple, streamlined process from start to finish',
        register: 'Register',
        registerDesc: 'Create your account in 2 minutes',
        fileCase: 'File Case',
        fileCaseDesc: 'Upload documents and submit online',
        aiProcessing: 'AI Processing',
        aiProcessingDesc: 'Our AI verifies and processes',
        trackProgress: 'Track Progress',
        trackProgressDesc: 'Get real-time case updates',
        virtualHearing: 'Virtual Hearing',
        virtualHearingDesc: 'Attend hearings remotely',
        resolution: 'Resolution',
        resolutionDesc: 'Receive judgment digitally',

        // Mission & Vision
        ourMission: 'Our Mission',
        missionText: 'To democratize access to justice by leveraging AI and technology, making legal processes transparent, efficient, and accessible to every Indian citizen, regardless of their location or economic background.',
        ourVision: 'Our Vision',
        visionText: 'To create a future where justice is not delayed, where legal rights are universally understood, and where technology empowers citizens to navigate the judicial system with confidence and ease.',

        // CTA
        readyExperience: 'Ready to Experience Justice Reimagined?',
        joinThousands: 'Join thousands of citizens who have already simplified their legal journey with NyaySetu',
        learnMore: 'Learn More',

        // AI Chatbot
        aiChatbotTitle: 'AI Legal Assistant',
        aiChatbotSubtitle: 'Powered by Anthropic Claude',
        askQuestion: 'Ask me about law, cases, or the Constitution',
        typeMessage: 'Type your message...',
        send: 'Send',

        // Common
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        close: 'Close',
        save: 'Save',
        cancel: 'Cancel',
        confirm: 'Confirm',
        delete: 'Delete',
        edit: 'Edit',
        search: 'Search'
    },
    hi: {
        // Header & Navigation
        home: 'होम',
        features: 'विशेषताएँ',
        constitution: 'संविधान',
        aiAssistant: 'AI सहायक',
        about: 'हमारे बारे में',
        login: 'लॉगिन',
        getStarted: 'शुरू करें',
        signup: 'साइन अप करें',

        // Landing Page - Hero
        heroTitle: 'AI-संचालित डिजिटल न्याय',
        heroTitleHighlight: 'हर नागरिक के लिए',
        heroSubtitle: 'कहीं से भी, कभी भी न्याय तक पहुंचें। मामले दर्ज करें, प्रगति ट्रैक करें, वर्चुअल सुनवाई में भाग लें, और AI-संचालित कानूनी सहायता प्राप्त करें—सब एक ही पारदर्शी मंच पर।',
        getStartedFree: 'मुफ्त में शुरू करें',
        watchDemo: 'डेमो देखें',

        // Landing Page - Stats
        casesFiled: 'मामले दर्ज',
        activeUsers: 'सक्रिय उपयोगकर्ता',
        successRate: 'सफलता दर',
        aiSupport: 'AI सहायता',

        // Landing Page - Features
        featuresTitle: 'शक्तिशाली सुविधाएँ',
        featuresTitleHighlight: 'आधुनिक न्याय के लिए',
        featuresSubtitle: 'कानूनी प्रणाली को कुशलतापूर्वक नेविगेट करने के लिए आवश्यक सब कुछ',

        aiLegalAssistant: 'AI कानूनी सहायक',
        aiLegalAssistantDesc: 'तत्काल कानूनी मार्गदर्शन के लिए 24/7 AI-संचालित चैटबॉट',

        constitutionReader: 'संविधान पाठक',
        constitutionReaderDesc: 'बुद्धिमान खोज और Q&A के साथ भारतीय संविधान ब्राउज़ करें',

        fileCases: 'ऑनलाइन मामले दर्ज करें',
        fileCasesDesc: 'सुरक्षित दस्तावेज़ प्रबंधन के साथ कानूनी मामले डिजिटल रूप से जमा करें',

        virtualHearings: 'वर्चुअल सुनवाई',
        virtualHearingsDesc: 'वीडियो कॉन्फ्रेंसिंग के साथ दूर से अदालती कार्यवाही में भाग लें',

        securePrivate: 'सुरक्षित और निजी',
        securePrivateDesc: 'बैंक-ग्रेड एन्क्रिप्शन आपके डेटा को सुरक्षित रखता है',

        realTimeUpdates: 'रीयल-टाइम अपडेट',
        realTimeUpdatesDesc: 'मामले की प्रगति और सुनवाई पर तुरंत सूचनाएं प्राप्त करें',

        // Landing Page - CTA
        ctaTitle: 'न्याय की अपनी यात्रा शुरू करने के लिए तैयार हैं?',
        ctaSubtitle: 'हजारों नागरिक पहले से ही अपनी कानूनी जरूरतों के लिए NyaySetu का उपयोग कर रहे हैं',
        createAccount: 'मुफ्त खाता बनाएं',

        // Footer
        footerTagline: 'भारत का पहला AI-संचालित वर्चुअल न्यायपालिका मंच, जो हर नागरिक के लिए न्याय सुलभ बना रहा है।',
        quickLinks: 'त्वरित लिंक',
        legal: 'कानूनी',
        getInTouch: 'संपर्क में रहें',
        viewRepository: 'रिपॉजिटरी देखें',
        allRightsReserved: 'सर्वाधिकार सुरक्षित।',
        madeWith: 'के साथ बनाया गया',
        by: 'द्वारा',
        privacyPolicy: 'गोपनीयता नीति',
        termsOfService: 'सेवा की शर्तें',
        disclaimer: 'अस्वीकरण',

        // Constitution Page
        constitutionOfIndia: 'भारत का संविधान',
        searchArticles: 'लेख, भाग खोजें...',
        downloadPDF: 'PDF डाउनलोड करें',
        bookmarks: 'बुकमार्क',
        askAI: 'AI से पूछें',
        articles: 'लेख',
        part: 'भाग',
        article: 'अनुच्छेद',
        readMore: 'और पढ़ें',
        share: 'साझा करें',
        addBookmark: 'बुकमार्क जोड़ें',

        // About Page
        aboutHeroTag: 'भारत का पहला AI-संचालित न्यायपालिका मंच',
        aboutHeroTitle: 'क्रांतिकारी',
        aboutHeroTitleHighlight: 'न्याय',
        aboutHeroSubtitle: 'NyaySetu अत्याधुनिक AI तकनीक के माध्यम से कानूनी प्रक्रियाओं को सुलभ, पारदर्शी और कुशल बनाकर भारत की न्यायिक प्रणाली को बदल रहा है।',
        problemSolution: 'समस्या और हमारा समाधान',
        problemSolutionDesc: 'चुनौतियों को समझना और हम उन्हें कैसे हल करते हैं',
        traditionalSystem: 'पारंपरिक प्रणाली',
        nyaysetuSolution: 'NyaySetu समाधान',

        // Problems
        longDelays: 'लंबी देरी',
        longDelaysDesc: 'मामलों को हल होने में वर्षों लग जाते हैं',
        complexPaperwork: 'जटिल कागजी कार्रवाई',
        complexPaperworkDesc: 'कठिन दस्तावेज़ीकरण प्रक्रिया',
        lackAwareness: 'जागरूकता की कमी',
        lackAwarenessDesc: 'नागरिक अधिकारों से अनजान',
        highCosts: 'उच्च लागत',
        highCostsDesc: 'महंगी कानूनी प्रक्रियाएं',

        // Solutions
        instantFiling: 'तत्काल फाइलिंग',
        instantFilingDesc: 'मिनटों में ऑनलाइन मामले दर्ज करें',
        aiAssistance: 'AI सहायता',
        aiAssistanceDesc: '24/7 स्मार्ट कानूनी मार्गदर्शन',
        transparency: 'पारदर्शिता',
        transparencyDesc: 'रीयल-टाइम में केस स्टेटस ट्रैक करें',
        securePlatform: 'सुरक्षित मंच',
        securePlatformDesc: 'बैंक-ग्रेड डेटा सुरक्षा',

        // How It Works
        howItWorks: 'NyaySetu कैसे काम करता है',
        howItWorksDesc: 'शुरुआत से अंत तक एक सरल, सुव्यवस्थित प्रक्रिया',
        register: 'रजिस्टर करें',
        registerDesc: '2 मिनट में अपना खाता बनाएं',
        fileCase: 'मामला दर्ज करें',
        fileCaseDesc: 'दस्तावेज़ अपलोड करें और ऑनलाइन जमा करें',
        aiProcessing: 'AI प्रोसेसिंग',
        aiProcessingDesc: 'हमारा AI सत्यापन और प्रसंस्करण करता है',
        trackProgress: 'प्रगति ट्रैक करें',
        trackProgressDesc: 'रीयल-टाइम केस अपडेट प्राप्त करें',
        virtualHearing: 'वर्चुअल सुनवाई',
        virtualHearingDesc: 'दूर से सुनवाई में भाग लें',
        resolution: 'समाधान',
        resolutionDesc: 'डिजिटल रूप से निर्णय प्राप्त करें',

        // Mission & Vision
        ourMission: 'हमारा मिशन',
        missionText: 'AI और प्रौद्योगिकी का लाभ उठाकर न्याय तक पहुंच को लोकतांत्रिक बनाना, कानूनी प्रक्रियाओं को पारदर्शी, कुशल और हर भारतीय नागरिक के लिए सुलभ बनाना, चाहे उनका स्थान या आर्थिक पृष्ठभूमि कुछ भी हो।',
        ourVision: 'हमारी दृष्टि',
        visionText: 'एक ऐसा भविष्य बनाना जहां न्याय में देरी न हो, जहां कानूनी अधिकारों को सार्वभौमिक रूप से समझा जाए, और जहां प्रौद्योगिकी नागरिकों को आत्मविश्वास और आसानी से न्यायिक प्रणाली को नेविगेट करने में सक्षम बनाए।',

        // CTA
        readyExperience: 'न्याय को फिर से कल्पित अनुभव करने के लिए तैयार हैं?',
        joinThousands: 'हजारों नागरिक जो पहले से ही NyaySetu के साथ अपनी कानूनी यात्रा को सरल बना चुके हैं',
        learnMore: 'और जानें',

        // AI Chatbot
        aiChatbotTitle: 'AI कानूनी सहायक',
        aiChatbotSubtitle: 'Anthropic Claude द्वारा संचालित',
        askQuestion: 'मुझसे कानून, मामलों या संविधान के बारे में पूछें',
        typeMessage: 'अपना संदेश टाइप करें...',
        send: 'भेजें',

        // Common
        loading: 'लोड हो रहा है...',
        error: 'त्रुटि',
        success: 'सफलता',
        close: 'बंद करें',
        save: 'सहेजें',
        cancel: 'रद्द करें',
        confirm: 'पुष्टि करें',
        delete: 'हटाएं',
        edit: 'संपादित करें',
        search: 'खोजें'
    }
};

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState('en');

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'en' ? 'hi' : 'en');
    };

    const t = (key) => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}
