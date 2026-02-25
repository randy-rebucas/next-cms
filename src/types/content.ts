export type SiteData = {
  name: string;
  nameHighlight: string;
  title: string;
  tagline: string;
  description: string;
  stats: { value: string; label: string }[];
  credentials: string;
  badges: string[];
  bio: string;
  bioExtended: string;
  highlightStats: { icon: string; value: string; label: string }[];
  phone: string;
  phoneHref: string;
  email: string;
  emailHref: string;
  address: string;
  mapAddress: string;
  mapAddress2: string;
  hours: string;
  contactDescription: string;
  footerDescription: string;
  metaTitle: string;
  metaDescription: string;
};

export type PracticeArea = {
  id: string;
  icon: string;
  title: string;
  description: string;
  bullets: string[];
  color: string;
  bg: string;
};

export type ExperienceEvent = {
  id: string;
  year: string;
  title: string;
  subtitle: string;
  description: string;
};

export type Testimonial = {
  id: string;
  name: string;
  case: string;
  rating: number;
  text: string;
  initials: string;
  color: string;
};

export type BlogPost = {
  id: string;
  slug?: string;
  category: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  tag: string;
};

export type FAQItem = {
  id: string;
  q: string;
  a: string;
};
