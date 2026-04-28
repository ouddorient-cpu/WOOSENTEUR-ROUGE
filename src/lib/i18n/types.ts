export interface Translations {
  nav: {
    createShop: string;
    tools: string;
    pricing: string;
    blog: string;
    faq: string;
    login: string;
    freeTrial: string;
    dashboard: string;
    logout: string;
    openMenu: string;
    seoGenerator: string;
    seoGeneratorDesc: string;
    fbAds: string;
    fbAdsDesc: string;
    bulkSku: string;
    bulkSkuDesc: string;
    studio: string;
    studioDesc: string;
    soon: string;
  };
  hero: {
    badge: string;
    headline: string;
    sub: string;
    cta: string;
    cta2: string;
    subtext: string;
    trust: {
      structured: string;
      unique: string;
      native: string;
    };
  };
  howitworks: {
    label: string;
    title: string;
    titleHighlight: string;
    sub: string;
    step1: { title: string; desc: string };
    step2: { title: string; desc: string };
    step3: { title: string; desc: string };
  };
  finalcta: {
    titleGuest: string;
    subGuest: string;
    btnGuest: string;
    titleUser: string;
    subUser: string;
    btnUser: string;
    perks: string[];
  };
  faq: {
    title: string;
    titleHighlight: string;
    items: { q: string; a: string }[];
  };
  comparatif: {
    title: string;
    sub: string;
    criterion: string;
    rows: { label: string }[];
  };
  forwho: {
    label: string;
    title: string;
    titleHighlight: string;
    sub: string;
    personas: {
      title: string;
      subtitle: string;
      description: string;
      benefit: string;
    }[];
  };
  beforeafter: {
    badge: string;
    title: string;
    titleHighlight: string;
    sub: string;
    feat1Title: string;
    feat1Desc: string;
    feat2Title: string;
    feat2Desc: string;
    cta: string;
  };
  footer: {
    tagline: string;
    productSection: string;
    features: string;
    pricing: string;
    about: string;
    legalSection: string;
    terms: string;
    privacy: string;
    cookies: string;
    notice: string;
    rights: string;
    disclaimer: string;
  };
  pricing: {
    label: string;
    title: string;
    titleGradient: string;
    sub: string;
    monthly: string;
    annually: string;
    save2months: string;
    popular: string;
    perMonth: string;
    perYear: string;
    noCommitment: string;
  };
  adpower: {
    badge: string;
    title: string;
    titleGradient: string;
    sub: string;
    tools: { badge: string; title: string; description: string }[];
    cta: { title: string; items: string[]; btn: string; sub: string };
  };
  edito: {
    label: string;
    intro: string;
    p1: string;
    p2: string;
    p3: string;
    p4: string;
    footer: string;
  };
  ticker: { items: string[] };
  testimonials: {
    badge: string;
    title: string;
    sub: string;
    footer: string;
    items: { text: string; category: string }[];
  };
  ownproduct: {
    badge: string;
    title: string;
    titleSub: string;
    titleGradient: string;
    sub: string;
    subGradient: string;
    ctaSub: string;
    cta: string;
  };
}
