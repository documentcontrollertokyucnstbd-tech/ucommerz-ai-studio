import {
  User, UserRole, Service, ServiceStatus, Booking, BookingStatus, Review,
  Message, MessageType, Notification, Category, ServicePackage, Report,
  ReportStatus, ReportTargetType, ProviderSkill, SkillLevel, ProviderCertification,
  ProviderPortfolio, BusinessHours, Holiday, BookingRule, CustomerNote,
  MessageTemplate, Reminder, ReminderSettings, ActivityLog, Favorite,
  ProviderApplication, ApplicationStatus
} from '../types';

// Helper to generate IDs
export const generateId = () => Math.random().toString(36).substr(2, 9);

// Initial Categories
const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Tech & Development',
    slug: 'tech-dev',
    icon: 'Terminal',
    description: 'Software development, website design, and IT consultation.',
    order_position: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'cat-2',
    name: 'Home Improvement & Cleaning',
    slug: 'home-services',
    icon: 'Home',
    description: 'Cleaning, repairs, gardening, and organization.',
    order_position: 2,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'cat-3',
    name: 'Wellness & Fitness',
    slug: 'wellness-fitness',
    icon: 'Heart',
    description: 'Personal training, yoga, mental wellness, and massage therapy.',
    order_position: 3,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'cat-4',
    name: 'Academic Tutoring',
    slug: 'education',
    icon: 'GraduationCap',
    description: 'Private classes, language teaching, and subject tutoring.',
    order_position: 4,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'cat-5',
    name: 'Creative & Design',
    slug: 'creative-design',
    icon: 'Palette',
    description: 'Photography, graphic design, video editing, and branding.',
    order_position: 5,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Initial Users
const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin',
    email: 'admin@ucommerz.com',
    full_name: 'Platform Administrator',
    role: UserRole.ADMIN,
    verified: true,
    is_active: true,
    slug: 'admin',
    rating: 5,
    total_reviews: 0,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'usr-prov-1',
    email: 'alex@devcraft.io',
    full_name: 'Alex Johnson',
    phone: '+1 (555) 019-2834',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop',
    role: UserRole.PROVIDER,
    bio: 'Senior Full-Stack Architect with over 10 years of experience building scalable SaaS web applications and cloud deployments. Specialized in React, Next.js, Node.js, and Google Cloud Platform.',
    location: 'San Francisco, CA',
    latitude: 37.7749,
    longitude: -122.4194,
    rating: 4.9,
    total_reviews: 12,
    verified: true,
    is_active: true,
    slug: 'alex-johnson-dev',
    website: 'https://devcraft.io',
    social_links: {
      twitter: 'alex_codes',
      linkedin: 'alex-johnson-devcraft',
      instagram: 'alex.develops'
    },
    created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'usr-prov-2',
    email: 'maria@cleanpro.com',
    full_name: 'Maria Gomez',
    phone: '+1 (555) 023-4567',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop',
    role: UserRole.PROVIDER,
    bio: 'Professional Home Organizer and Deep-Cleaning expert. Dedicated to creating calm, functional, and immaculate living environments. Certified green-cleaning specialist.',
    location: 'Austin, TX',
    latitude: 30.2672,
    longitude: -97.7431,
    rating: 4.8,
    total_reviews: 8,
    verified: true,
    is_active: true,
    slug: 'maria-clean-pro',
    created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'usr-prov-3',
    email: 'sarah@mindbody.com',
    full_name: 'Sarah Chen',
    phone: '+1 (555) 034-5678',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
    role: UserRole.BOTH,
    bio: 'Certified Hatha Yoga instructor and Mindfulness Coach. Passionate about helping clients cultivate mind-body harmony, manage stress, and build structural strength. Offering personal and group coaching.',
    location: 'Denver, CO',
    latitude: 39.7392,
    longitude: -104.9903,
    rating: 5.0,
    total_reviews: 15,
    verified: true,
    is_active: true,
    slug: 'sarah-chen-wellness',
    website: 'https://mindbodywellness.com',
    social_links: {
      instagram: 'sarah_zen_yoga',
      facebook: 'sarahchenwellness'
    },
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'usr-seek-1',
    email: 'john@seeker.com',
    full_name: 'John Doe',
    phone: '+1 (555) 123-9876',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
    role: UserRole.SEEKER,
    location: 'Austin, TX',
    rating: 5.0,
    total_reviews: 2,
    verified: false,
    is_active: true,
    slug: 'john-doe',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'usr-seek-2',
    email: 'emily@seeker.com',
    full_name: 'Emily Smith',
    phone: '+1 (555) 987-6543',
    avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop',
    role: UserRole.SEEKER,
    location: 'San Francisco, CA',
    rating: 4.7,
    total_reviews: 3,
    verified: false,
    is_active: true,
    slug: 'emily-smith',
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Initial Services
const INITIAL_SERVICES: Service[] = [
  {
    id: 'srv-1',
    provider_id: 'usr-prov-1',
    title: 'Custom Next.js & React Web Application Development',
    description: 'Get a professional, blazing-fast, and SEO-optimized website or web app designed with Next.js, TypeScript, and Tailwind CSS. Perfect for startups, SaaS portals, and business websites. Includes custom APIs, animations, and database setup.',
    category: 'cat-1',
    sub_category: 'Web Development',
    price: 85,
    price_unit: 'hr',
    min_duration: 120,
    max_duration: 14400,
    images: [
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop'
    ],
    location: 'San Francisco, CA',
    latitude: 37.7749,
    longitude: -122.4194,
    is_remote: true,
    is_on_site: false,
    service_radius: 50,
    status: ServiceStatus.ACTIVE,
    views: 342,
    featured: true,
    rating: 4.9,
    total_reviews: 8,
    created_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'srv-2',
    provider_id: 'usr-prov-1',
    title: 'Code Review & Architecture Consultation',
    description: 'Struggling with slow performance, messy files, or spaghetti code? Let an expert review your GitHub repository, identify bottlenecks, fix safety/memory leaks, and establish a bulletproof codebase architecture standard.',
    category: 'cat-1',
    sub_category: 'Consulting',
    price: 150,
    price_unit: 'flat',
    min_duration: 60,
    max_duration: 180,
    images: [
      'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&h=400&fit=crop'
    ],
    location: 'San Francisco, CA',
    latitude: 37.7749,
    longitude: -122.4194,
    is_remote: true,
    is_on_site: false,
    status: ServiceStatus.ACTIVE,
    views: 128,
    featured: false,
    rating: 4.8,
    total_reviews: 4,
    created_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'srv-3',
    provider_id: 'usr-prov-2',
    title: 'Eco-Friendly Premium Home Deep Cleaning',
    description: 'Immaculate multi-room cleaning using 100% natural, non-toxic, pet-safe organic cleaning supplies. Perfect for post-renovations, move-in/move-outs, or seasonal deep cleaning. Kitchen, bathrooms, windows, and floors will sparkle.',
    category: 'cat-2',
    sub_category: 'Cleaning',
    price: 45,
    price_unit: 'hr',
    min_duration: 180,
    max_duration: 480,
    images: [
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=600&h=400&fit=crop'
    ],
    location: 'Austin, TX',
    latitude: 30.2672,
    longitude: -97.7431,
    is_remote: false,
    is_on_site: true,
    service_address: 'Central Austin area',
    service_latitude: 30.2672,
    service_longitude: -97.7431,
    service_radius: 20,
    status: ServiceStatus.ACTIVE,
    views: 289,
    featured: true,
    rating: 4.8,
    total_reviews: 8,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'srv-4',
    provider_id: 'usr-prov-3',
    title: '1-on-1 Mindfulness Meditation & Vinyasa Yoga Session',
    description: 'A deeply restorative personalized session tailoring Vinyasa flows, breathwork (Pranayama), and guided meditation to your specific energetic and physical goals. Great for beginners seeking solid forms, or advanced practitioners.',
    category: 'cat-3',
    sub_category: 'Yoga',
    price: 65,
    price_unit: 'hr',
    min_duration: 60,
    max_duration: 120,
    images: [
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=400&fit=crop',
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop'
    ],
    location: 'Denver, CO',
    latitude: 39.7392,
    longitude: -104.9903,
    is_remote: true,
    is_on_site: true,
    service_address: '100 Broadway, Denver, CO 80203',
    service_latitude: 39.7292,
    service_longitude: -104.9893,
    service_radius: 15,
    status: ServiceStatus.ACTIVE,
    views: 450,
    featured: true,
    rating: 5.0,
    total_reviews: 15,
    created_at: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Initial Bookings
const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'bkg-1',
    service_id: 'srv-1',
    seeker_id: 'usr-seek-2',
    provider_id: 'usr-prov-1',
    booking_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    duration: 120,
    total_price: 170,
    status: BookingStatus.COMPLETED,
    notes: 'Need a fast React landing page setup for our fitness startup.',
    reminder_sent: true,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    service_title: 'Custom Next.js & React Web Application Development',
    provider_name: 'Alex Johnson',
    seeker_name: 'Emily Smith'
  },
  {
    id: 'bkg-2',
    service_id: 'srv-3',
    seeker_id: 'usr-seek-1',
    provider_id: 'usr-prov-2',
    booking_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    duration: 240,
    total_price: 180,
    status: BookingStatus.COMPLETED,
    notes: 'Please pay extra attention to kitchen countertops and dog hair on carpets.',
    reminder_sent: true,
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    service_title: 'Eco-Friendly Premium Home Deep Cleaning',
    provider_name: 'Maria Gomez',
    seeker_name: 'John Doe'
  },
  {
    id: 'bkg-3',
    service_id: 'srv-4',
    seeker_id: 'usr-seek-2',
    provider_id: 'usr-prov-3',
    booking_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // in 2 days
    duration: 60,
    total_price: 65,
    status: BookingStatus.CONFIRMED,
    notes: 'Session via Zoom. Focused heavily on lower back stretches.',
    reminder_sent: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    service_title: '1-on-1 Mindfulness Meditation & Vinyasa Yoga Session',
    provider_name: 'Sarah Chen',
    seeker_name: 'Emily Smith'
  },
  {
    id: 'bkg-4',
    service_id: 'srv-1',
    seeker_id: 'usr-seek-1',
    provider_id: 'usr-prov-1',
    booking_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // tomorrow
    duration: 180,
    total_price: 255,
    status: BookingStatus.PENDING,
    notes: 'Need discussion on database migration details.',
    reminder_sent: false,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    service_title: 'Custom Next.js & React Web Application Development',
    provider_name: 'Alex Johnson',
    seeker_name: 'John Doe'
  }
];

// Initial Reviews
const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    booking_id: 'bkg-1',
    reviewer_id: 'usr-seek-2',
    reviewee_id: 'usr-prov-1',
    service_id: 'srv-1',
    rating: 5,
    comment: 'Alex did an absolutely fantastic job setting up our landing page! Extremely fast, wrote clean and scalable code, and understood our vision immediately. Highly recommended!',
    professionalism: 5,
    quality: 5,
    punctuality: 5,
    response: 'Thank you Emily! It was a pleasure building with you. Good luck with your launch!',
    response_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    reviewer_name: 'Emily Smith',
    reviewer_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop'
  },
  {
    id: 'rev-2',
    booking_id: 'bkg-2',
    reviewer_id: 'usr-seek-1',
    reviewee_id: 'usr-prov-2',
    service_id: 'srv-3',
    rating: 5,
    comment: 'The house is absolutely spotless! Maria was so nice and did a flawless job. It feels amazing coming home to this level of cleanliness. Professional and eco-safe.',
    professionalism: 5,
    quality: 5,
    punctuality: 5,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date().toISOString(),
    reviewer_name: 'John Doe',
    reviewer_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop'
  }
];

// Initial Messages
const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-1',
    sender_id: 'usr-seek-2',
    receiver_id: 'usr-prov-1',
    booking_id: 'bkg-1',
    content: 'Hi Alex! I saw your web development service and wanted to know if you have availability for a fast project this week?',
    is_read: true,
    message_type: MessageType.TEXT,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'msg-2',
    sender_id: 'usr-prov-1',
    receiver_id: 'usr-seek-2',
    booking_id: 'bkg-1',
    content: 'Hello Emily! Yes, absolutely. I can take on a 2-day sprint starting tomorrow. Feel free to book the time or let me know the requirements first!',
    is_read: true,
    message_type: MessageType.TEXT,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString()
  },
  {
    id: 'msg-3',
    sender_id: 'usr-seek-2',
    receiver_id: 'usr-prov-1',
    booking_id: 'bkg-1',
    content: 'Great, booked! I uploaded the landing page design layouts here. Let me know if you need Figma assets.',
    is_read: true,
    message_type: MessageType.TEXT,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString()
  }
];

// Initial Skills
const INITIAL_SKILLS: ProviderSkill[] = [
  {
    id: 'sk-1',
    provider_id: 'usr-prov-1',
    skill_name: 'React & Next.js',
    skill_level: SkillLevel.EXPERT,
    years_experience: 8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'sk-2',
    provider_id: 'usr-prov-1',
    skill_name: 'Tailwind CSS',
    skill_level: SkillLevel.EXPERT,
    years_experience: 6,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'sk-3',
    provider_id: 'usr-prov-2',
    skill_name: 'Home Organization',
    skill_level: SkillLevel.EXPERT,
    years_experience: 10,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Initial Certifications
const INITIAL_CERTIFICATIONS: ProviderCertification[] = [
  {
    id: 'cert-1',
    provider_id: 'usr-prov-1',
    name: 'Google Cloud Professional Cloud Architect',
    issuing_organization: 'Google Cloud',
    issue_date: '2023-04-12',
    expiry_date: '2025-04-12',
    verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'cert-2',
    provider_id: 'usr-prov-3',
    name: 'RYT 200 Certified Yoga Teacher',
    issuing_organization: 'Yoga Alliance',
    issue_date: '2021-08-15',
    verified: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Initial Portfolios
const INITIAL_PORTFOLIO: ProviderPortfolio[] = [
  {
    id: 'port-1',
    provider_id: 'usr-prov-1',
    title: 'E-Commerce SaaS Dashboard',
    description: 'Designed and built a complete financial and product management admin dashboard tracking $5M+ sales, built with Next.js App Router and TanStack Table.',
    image_urls: ['https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop'],
    project_url: 'https://saas-dashboard-demo.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Initial Business Hours
const INITIAL_BUSINESS_HOURS: BusinessHours[] = [];
['usr-prov-1', 'usr-prov-2', 'usr-prov-3'].forEach(provId => {
  for (let d = 1; d <= 5; d++) { // Mon to Fri
    INITIAL_BUSINESS_HOURS.push({
      id: `bh-${provId}-${d}`,
      provider_id: provId,
      day_of_week: d,
      is_open: true,
      open_time: '09:00',
      close_time: '18:00',
      break_start: '12:00',
      break_end: '13:00',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }
});

// Initial Booking Rules
const INITIAL_BOOKING_RULES: BookingRule[] = [
  {
    id: 'rule-prov-1',
    provider_id: 'usr-prov-1',
    min_notice_hours: 24,
    max_bookings_per_day: 3,
    buffer_time_minutes: 30,
    auto_confirm: false,
    cancellation_policy: 'flexible',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'rule-prov-2',
    provider_id: 'usr-prov-2',
    min_notice_hours: 12,
    max_bookings_per_day: 2,
    buffer_time_minutes: 60,
    auto_confirm: true,
    cancellation_policy: 'moderate',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Initial Message Templates
const INITIAL_MESSAGE_TEMPLATES: MessageTemplate[] = [
  {
    id: 'tpl-1',
    provider_id: 'usr-prov-1',
    name: 'Booking Confirmation Template',
    subject: 'Thank you for booking with me!',
    content: 'Hello {{seeker_name}},\n\nYour booking for "{{service_title}}" on {{booking_date}} has been confirmed! I look forward to working with you.\n\nWarm regards,\n{{provider_name}}',
    category: 'BOOKING_CONFIRMATION',
    variables: ['seeker_name', 'service_title', 'booking_date', 'provider_name'],
    is_active: true,
    usage_count: 14,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'tpl-2',
    provider_id: 'usr-prov-1',
    name: 'Booking Completion Reminder',
    subject: 'Session Completed',
    content: 'Hi {{seeker_name}},\n\nI have marked our booking for "{{service_title}}" as completed. If you were happy with my service, I would appreciate a short review!\n\nReview link: {{review_link}}\n\nWarm regards,\n{{provider_name}}',
    category: 'BOOKING_COMPLETION',
    variables: ['seeker_name', 'service_title', 'review_link', 'provider_name'],
    is_active: true,
    usage_count: 8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Initial Notifications
const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    user_id: 'usr-prov-1',
    type: 'BOOKING',
    title: 'New Booking Request',
    message: 'John Doe has requested a booking for "Custom Next.js & React Web Application Development" tomorrow.',
    is_read: false,
    created_at: new Date().toISOString()
  }
];

// Initialize database
export class MockDatabase {
  private static get<T>(key: string, initial: T[]): T[] {
    const data = localStorage.getItem(`ucommerz_${key}`);
    if (!data) {
      localStorage.setItem(`ucommerz_${key}`, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  }

  private static set<T>(key: string, data: T[]) {
    localStorage.setItem(`ucommerz_${key}`, JSON.stringify(data));
    // Trigger window storage event for reactive syncing
    window.dispatchEvent(new Event('ucommerz_store_update'));
  }

  // Collections
  static getCategories(): Category[] { return this.get('categories', INITIAL_CATEGORIES); }
  static saveCategories(data: Category[]) { this.set('categories', data); }

  static getUsers(): User[] { return this.get('users', INITIAL_USERS); }
  static saveUsers(data: User[]) { this.set('users', data); }

  static getServices(): Service[] { return this.get('services', INITIAL_SERVICES); }
  static saveServices(data: Service[]) { this.set('services', data); }

  static getBookings(): Booking[] { return this.get('bookings', INITIAL_BOOKINGS); }
  static saveBookings(data: Booking[]) { this.set('bookings', data); }

  static getReviews(): Review[] { return this.get('reviews', INITIAL_REVIEWS); }
  static saveReviews(data: Review[]) { this.set('reviews', data); }

  static getMessages(): Message[] { return this.get('messages', INITIAL_MESSAGES); }
  static saveMessages(data: Message[]) { this.set('messages', data); }

  static getSkills(): ProviderSkill[] { return this.get('skills', INITIAL_SKILLS); }
  static saveSkills(data: ProviderSkill[]) { this.set('skills', data); }

  static getCertifications(): ProviderCertification[] { return this.get('certifications', INITIAL_CERTIFICATIONS); }
  static saveCertifications(data: ProviderCertification[]) { this.set('certifications', data); }

  static getPortfolio(): ProviderPortfolio[] { return this.get('portfolio', INITIAL_PORTFOLIO); }
  static savePortfolio(data: ProviderPortfolio[]) { this.set('portfolio', data); }

  static getBusinessHours(): BusinessHours[] { return this.get('business_hours', INITIAL_BUSINESS_HOURS); }
  static saveBusinessHours(data: BusinessHours[]) { this.set('business_hours', data); }

  static getBookingRules(): BookingRule[] { return this.get('booking_rules', INITIAL_BOOKING_RULES); }
  static saveBookingRules(data: BookingRule[]) { this.set('booking_rules', data); }

  static getMessageTemplates(): MessageTemplate[] { return this.get('message_templates', INITIAL_MESSAGE_TEMPLATES); }
  static saveMessageTemplates(data: MessageTemplate[]) { this.set('message_templates', data); }

  static getNotifications(): Notification[] { return this.get('notifications', INITIAL_NOTIFICATIONS); }
  static saveNotifications(data: Notification[]) { this.set('notifications', data); }

  static getFavorites(): Favorite[] { return this.get('favorites', []); }
  static saveFavorites(data: Favorite[]) { this.set('favorites', data); }

  static getReports(): Report[] { return this.get('reports', []); }
  static saveReports(data: Report[]) { this.set('reports', data); }

  static getPackages(): ServicePackage[] { return this.get('packages', []); }
  static savePackages(data: ServicePackage[]) { this.set('packages', data); }

  static getCustomerNotes(): CustomerNote[] { return this.get('customer_notes', []); }
  static saveCustomerNotes(data: CustomerNote[]) { this.set('customer_notes', data); }

  static getActivityLogs(): ActivityLog[] { return this.get('activity_logs', []); }
  static saveActivityLogs(data: ActivityLog[]) { this.set('activity_logs', data); }

  static getHolidays(): Holiday[] { return this.get('holidays', []); }
  static saveHolidays(data: Holiday[]) { this.set('holidays', data); }

  static getReminderSettings(): ReminderSettings[] { return this.get('reminder_settings', []); }
  static saveReminderSettings(data: ReminderSettings[]) { this.set('reminder_settings', data); }

  static getReminders(): Reminder[] { return this.get('reminders', []); }
  static saveReminders(data: Reminder[]) { this.set('reminders', data); }

  static getProviderApplications(): ProviderApplication[] { return this.get('provider_applications', []); }
  static saveProviderApplications(data: ProviderApplication[]) { this.set('provider_applications', data); }

  // Active Session Mock (Auth simulation)
  static getCurrentUser(): User | null {
    const userStr = localStorage.getItem('ucommerz_current_user');
    if (!userStr) {
      return null;
    }
    return JSON.parse(userStr);
  }

  static setCurrentUser(user: User | null) {
    if (user) {
      localStorage.setItem('ucommerz_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('ucommerz_current_user');
    }
    window.dispatchEvent(new Event('ucommerz_store_update'));
  }

  // Log user activity Helper
  static logActivity(userId: string, actionType: string, targetType: string, targetId: string, description: string, metadata?: any) {
    const logs = this.getActivityLogs();
    const newLog: ActivityLog = {
      id: generateId(),
      user_id: userId,
      action_type: actionType,
      target_type: targetType,
      target_id: targetId,
      description,
      metadata,
      created_at: new Date().toISOString()
    };
    this.saveActivityLogs([newLog, ...logs]);
  }

  // Send Notification Helper
  static sendNotification(userId: string, type: string, title: string, message: string, link?: string, metadata?: any) {
    const notifications = this.getNotifications();
    const newNotif: Notification = {
      id: generateId(),
      user_id: userId,
      type,
      title,
      message,
      link,
      metadata,
      is_read: false,
      created_at: new Date().toISOString()
    };
    this.saveNotifications([newNotif, ...notifications]);
  }
}
