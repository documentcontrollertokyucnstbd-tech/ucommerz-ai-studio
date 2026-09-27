'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PublicNavigation } from '@/components/PublicNavigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search, ChevronRight, Code2, Palette, Briefcase, Users, Sparkles,
  Zap, Camera, Cpu, Building2, Megaphone, PenTool, Globe,
  SlidersHorizontal, X, Star, ArrowUpRight, TrendingUp, Layers,
  Compass, CheckCircle2, ShieldCheck, Tag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  icon: React.ElementType;
  color: string;
  bgGlow: string;
  count: number;
  featured?: boolean;
  trending?: boolean;
  avgRating: number;
  startingPrice: number;
  priceUnit: string;
  description: string;
  tags: string[];
}

// Enhanced Category data with rich metadata & popular tags
const categories: CategoryItem[] = [
  {
    id: 'tech',
    name: 'Tech & Development',
    slug: 'tech-development',
    icon: Code2,
    color: 'from-blue-500 to-indigo-600',
    bgGlow: 'bg-blue-500/10 border-blue-500/20 text-blue-500',
    count: 45,
    featured: true,
    trending: true,
    avgRating: 4.9,
    startingPrice: 65,
    priceUnit: 'hr',
    description: 'Custom Next.js & React apps, mobile development, DevOps & API integrations.',
    tags: ['Next.js', 'React', 'TypeScript', 'Node.js', 'DevOps']
  },
  {
    id: 'design',
    name: 'Creative & Design',
    slug: 'creative-design',
    icon: Palette,
    color: 'from-purple-500 to-pink-600',
    bgGlow: 'bg-purple-500/10 border-purple-500/20 text-purple-500',
    count: 32,
    featured: true,
    trending: false,
    avgRating: 4.8,
    startingPrice: 50,
    priceUnit: 'hr',
    description: 'UI/UX design systems, brand identities, motion graphics & 3D assets.',
    tags: ['UI/UX', 'Figma', 'Logo Design', '3D Motion', 'Branding']
  },
  {
    id: 'marketing',
    name: 'Marketing & Sales',
    slug: 'marketing-sales',
    icon: Megaphone,
    color: 'from-amber-500 to-orange-600',
    bgGlow: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
    count: 28,
    featured: false,
    trending: true,
    avgRating: 4.9,
    startingPrice: 40,
    priceUnit: 'hr',
    description: 'Growth hacking, SEO optimization, AI ad campaigns & high-converting sales funnels.',
    tags: ['SEO', 'Meta Ads', 'Copywriting', 'Email Funnels', 'TikTok']
  },
  {
    id: 'software',
    name: 'Software Engineering',
    slug: 'software-engineering',
    icon: Cpu,
    color: 'from-cyan-500 to-blue-600',
    bgGlow: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-500',
    count: 38,
    featured: true,
    trending: true,
    avgRating: 4.9,
    startingPrice: 80,
    priceUnit: 'hr',
    description: 'Full-stack SaaS solutions, cloud infrastructure, AI models & database systems.',
    tags: ['Cloud Arch', 'PostgreSQL', 'Python', 'AI / ML', 'Docker']
  },
  {
    id: 'writing',
    name: 'Writing & Content',
    slug: 'writing-content',
    icon: PenTool,
    color: 'from-emerald-500 to-teal-600',
    bgGlow: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
    count: 19,
    featured: false,
    trending: false,
    avgRating: 4.7,
    startingPrice: 30,
    priceUnit: 'hr',
    description: 'Technical documentation, pitch decks, SEO articles & expert translation.',
    tags: ['Tech Docs', 'SEO Blogs', 'Pitch Decks', 'Translation']
  },
  {
    id: 'consulting',
    name: 'Business Consulting',
    slug: 'business-consulting',
    icon: Briefcase,
    color: 'from-indigo-500 to-violet-600',
    bgGlow: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500',
    count: 23,
    featured: false,
    trending: true,
    avgRating: 4.9,
    startingPrice: 90,
    priceUnit: 'hr',
    description: 'Financial forecasting, startup pitch strategy, legal advice & operation audits.',
    tags: ['Financial Model', 'Strategy', 'Startup Advisory', 'Legal']
  },
  {
    id: 'media',
    name: 'Photography & Video',
    slug: 'photography-video',
    icon: Camera,
    color: 'from-rose-500 to-pink-600',
    bgGlow: 'bg-rose-500/10 border-rose-500/20 text-rose-500',
    count: 15,
    featured: false,
    trending: false,
    avgRating: 4.8,
    startingPrice: 55,
    priceUnit: 'hr',
    description: 'Commercial product photography, 4K video editing & color grading.',
    tags: ['Video Edit', 'Product Shots', 'Color Grade', 'Reels']
  },
  {
    id: 'operations',
    name: 'Business Operations',
    slug: 'business-operations',
    icon: Building2,
    color: 'from-amber-600 to-yellow-600',
    bgGlow: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500',
    count: 27,
    featured: false,
    trending: false,
    avgRating: 4.6,
    startingPrice: 25,
    priceUnit: 'hr',
    description: 'Executive virtual support, CRM management, customer care & lead enrichment.',
    tags: ['Virtual Asst', 'CRM Setup', 'Lead Gen', 'Data Analysis']
  },
  {
    id: 'home',
    name: 'Home Improvement',
    slug: 'home-improvement',
    icon: Sparkles,
    color: 'from-teal-500 to-emerald-600',
    bgGlow: 'bg-teal-500/10 border-teal-500/20 text-teal-500',
    count: 21,
    featured: false,
    trending: true,
    avgRating: 4.9,
    startingPrice: 35,
    priceUnit: 'hr',
    description: 'Eco-friendly deep house cleaning, electrical, plumbing & interior design.',
    tags: ['Deep Cleaning', 'Plumbing', 'Electrical', 'Painting']
  },
  {
    id: 'wellness',
    name: 'Wellness & Fitness',
    slug: 'wellness-fitness',
    icon: Users,
    color: 'from-fuchsia-500 to-rose-600',
    bgGlow: 'bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-500',
    count: 14,
    featured: false,
    trending: false,
    avgRating: 4.8,
    startingPrice: 40,
    priceUnit: 'hr',
    description: '1-on-1 personal training, custom meal planning, yoga & holistic wellness.',
    tags: ['Personal Trainer', 'Yoga', 'Meal Plans', 'Mindfulness']
  },
  {
    id: 'maintenance',
    name: 'Repair & Handyman',
    slug: 'repair-handyman',
    icon: Zap,
    color: 'from-violet-500 to-indigo-600',
    bgGlow: 'bg-violet-500/10 border-violet-500/20 text-violet-500',
    count: 18,
    featured: false,
    trending: false,
    avgRating: 4.7,
    startingPrice: 45,
    priceUnit: 'hr',
    description: 'Appliance repair, furniture assembly, HVAC servicing & handyman fixes.',
    tags: ['Handyman', 'Appliance Repair', 'HVAC', 'Carpentry']
  },
  {
    id: 'events',
    name: 'Events & Planning',
    slug: 'events-planning',
    icon: Globe,
    color: 'from-sky-500 to-blue-600',
    bgGlow: 'bg-sky-500/10 border-sky-500/20 text-sky-500',
    count: 12,
    featured: false,
    trending: false,
    avgRating: 4.9,
    startingPrice: 100,
    priceUnit: 'flat',
    description: 'Corporate event management, wedding coordination & audio/DJ setups.',
    tags: ['Event Manager', 'Catering', 'DJ Setup', 'Floral Design']
  },
];

// Popular quick filter tabs
const popularFilters = [
  { id: 'all', label: 'All Domains' },
  { id: 'featured', label: 'Featured', icon: Sparkles },
  { id: 'trending', label: 'Trending', icon: TrendingUp },
  { id: 'top-rated', label: 'Top Rated (4.8+)', icon: Star },
];

export default function CategoriesPage() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [maxPrice, setMaxPrice] = useState(120);
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === 'dark';

  // Filter categories dynamically
  const filteredCategories = categories.filter((cat) => {
    // Search query match
    const matchesSearch =
      searchQuery === '' ||
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    // Tag match
    const matchesTag = !selectedTag || cat.tags.includes(selectedTag);

    // Filter tab match
    let matchesTab = true;
    if (selectedFilter === 'featured') matchesTab = !!cat.featured;
    if (selectedFilter === 'trending') matchesTab = !!cat.trending;
    if (selectedFilter === 'top-rated') matchesTab = cat.avgRating >= 4.8;

    // Price & Rating sliders match
    const matchesPrice = cat.startingPrice <= maxPrice;
    const matchesRating = minRating === 0 || cat.avgRating >= minRating;

    return matchesSearch && matchesTag && matchesTab && matchesPrice && matchesRating;
  });

  // Calculate high-level stats
  const totalServices = categories.reduce((acc, curr) => acc + curr.count, 0);
  const featuredCount = categories.filter(c => c.featured).length;

  return (
    <>
      <PublicNavigation />
      <main className={cn(
        "min-h-screen transition-colors duration-300",
        isDark ? "bg-slate-950 text-slate-100" : "bg-slate-50/70 text-slate-900"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          
          {/* Merged Hero Banner Header with Spotlight Glow */}
          <div className={cn(
            "relative p-6 sm:p-10 border overflow-hidden shadow-2xl transition-all mb-10",
            isDark
              ? "bg-gradient-to-br from-slate-900 via-slate-900/95 to-indigo-950/70 border-slate-800"
              : "bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 text-white border-indigo-800"
          )}>
            {/* Ambient Blurred Accents */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/15 blur-3xl pointer-events-none -translate-y-20 translate-x-20" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/15 blur-3xl pointer-events-none translate-y-20 -translate-x-20" />

            <div className="relative z-10 max-w-3xl space-y-4 text-left">
              {/* Badges Strip */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 backdrop-blur-sm">
                  <Compass className="w-3.5 h-3.5 text-indigo-400" />
                  Service Directory
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-sm">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  100% Vetted Talent
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest bg-blue-500/20 text-blue-200 border border-blue-400/30 backdrop-blur-sm">
                  🚀 Commission-Free
                </span>
              </div>

              {/* Main Title */}
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight text-white">
                Find Trusted Peer Services. <br />
                <span className="bg-gradient-to-r from-blue-300 via-indigo-200 to-purple-300 bg-clip-text text-transparent">
                  Keep 100% of Your Earnings.
                </span>
              </h1>

              {/* Description */}
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
                Skip agency fees. Connect directly with verified independent professionals across tech, design, marketing, and local services without payment brokerage markups.
              </p>

              {/* Compact & Color-Matched CTA Buttons (Sharp Corners & Harmonized Palette) */}
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <Link href="/browse">
                  <Button
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs h-9 px-4 border border-indigo-400/30 shadow-md transition-all cursor-pointer flex items-center gap-1.5 rounded-none"
                  >
                    <Search className="h-3.5 w-3.5 text-indigo-200" />
                    <span>Explore Services</span>
                  </Button>
                </Link>
                <Link href="/categories">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-indigo-400/30 bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-200 font-extrabold text-xs h-9 px-4 backdrop-blur-sm transition-all cursor-pointer flex items-center gap-1.5 rounded-none"
                  >
                    <Grid3x3 className="h-3.5 w-3.5 text-indigo-300" />
                    <span>Browse Categories</span>
                  </Button>
                </Link>
              </div>

              {/* Stats Strip */}
              <div className="pt-3 grid grid-cols-3 gap-4 max-w-sm border-t border-white/10">
                <div>
                  <p className="text-base sm:text-lg font-black text-white">{categories.length}</p>
                  <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Domains</p>
                </div>
                <div>
                  <p className="text-base sm:text-lg font-black text-white">{totalServices}+</p>
                  <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Active Services</p>
                </div>
                <div>
                  <p className="text-base sm:text-lg font-black text-emerald-400">4.9 ★</p>
                  <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Satisfaction</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="space-y-4 mb-8">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search domains (e.g. Next.js, Deep Cleaning, UI Design, Marketing)..."
                  className={cn(
                    "w-full pl-10 pr-9 py-3 text-xs font-medium border focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all",
                    isDark
                      ? "bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500"
                      : "bg-white border-slate-200 text-slate-800 placeholder:text-slate-400"
                  )}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Toggle Filters Button */}
              <Button
                onClick={() => setShowFilters(!showFilters)}
                variant="outline"
                className={cn(
                  "gap-2 px-5 py-5 text-xs font-bold border transition-all cursor-pointer shadow-sm shrink-0",
                  showFilters || maxPrice < 120 || minRating > 0
                    ? "bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700"
                    : isDark
                      ? "border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                )}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Filters</span>
                {(maxPrice < 120 || minRating > 0) && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                )}
              </Button>
            </div>

            {/* Expandable Advanced Filters Drawer */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className={cn(
                    "p-5 border shadow-inner space-y-4",
                    isDark ? "bg-slate-900/80 border-slate-800" : "bg-white border-slate-200"
                  )}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Price Ceiling */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <label className="font-extrabold uppercase tracking-wider text-slate-400">
                            Max Starting Rate
                          </label>
                          <span className="font-bold text-indigo-500 font-mono">${maxPrice}/hr</span>
                        </div>
                        <input
                          type="range"
                          min="20"
                          max="120"
                          step="5"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                          className="w-full accent-indigo-600 cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] font-mono text-slate-400">
                          <span>$20/hr</span>
                          <span>$120/hr+</span>
                        </div>
                      </div>

                      {/* Minimum Rating */}
                      <div className="space-y-2">
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400">
                          Minimum Rating
                        </label>
                        <div className="flex items-center gap-1.5">
                          {[0, 4.5, 4.7, 4.8, 4.9].map((rating) => (
                            <button
                              key={rating}
                              onClick={() => setMinRating(rating)}
                              className={cn(
                                "flex-1 py-1.5 text-[11px] font-bold border transition-all cursor-pointer",
                                minRating === rating
                                  ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                                  : isDark
                                    ? "border-slate-800 bg-slate-950/50 text-slate-400 hover:bg-slate-800"
                                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                              )}
                            >
                              {rating === 0 ? 'Any' : `${rating}★`}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Reset Button */}
                      <div className="flex items-end sm:col-span-2 lg:col-span-1">
                        <Button
                          onClick={() => {
                            setMaxPrice(120);
                            setMinRating(0);
                            setSelectedTag(null);
                            setSearchQuery('');
                            setSelectedFilter('all');
                          }}
                          variant="ghost"
                          className="w-full text-xs font-extrabold uppercase tracking-wider text-slate-400 hover:text-slate-200"
                        >
                          Clear All Filters
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Filter Tabs & Tag Pills */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none max-w-full">
                {popularFilters.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = selectedFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setSelectedFilter(tab.id)}
                      className={cn(
                        "flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer border",
                        isActive
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-md"
                          : isDark
                            ? "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      {Icon && <Icon className="w-3.5 h-3.5" />}
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Result counter */}
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider shrink-0">
                {filteredCategories.length} {filteredCategories.length === 1 ? 'Category' : 'Categories'}
              </span>
            </div>
          </div>

          {/* Active Filter Tags Bar (if user clicked on a subcategory tag) */}
          {selectedTag && (
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xs text-slate-400 font-medium">Filtered by tag:</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                #{selectedTag}
                <button onClick={() => setSelectedTag(null)} className="hover:text-indigo-200">
                  <X className="w-3 h-3" />
                </button>
              </span>
            </div>
          )}

          {/* Featured Highlights Grid Section (Top 2 Featured if selectedFilter == 'all' or 'featured') */}
          {selectedFilter === 'all' && !searchQuery && !selectedTag && (
            <div className="mb-10 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-400">
                  Featured Specialized Domains
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.filter(c => c.featured).slice(0, 2).map((feat) => {
                  const Icon = feat.icon;
                  return (
                    <Link key={feat.id} href={`/category/${feat.slug}`}>
                      <div className={cn(
                        "group relative p-6 border transition-all duration-300 hover:-translate-y-0.5 cursor-pointer overflow-hidden",
                        isDark
                          ? "bg-gradient-to-br from-slate-900 via-indigo-950/30 to-slate-900 border-indigo-900/50 hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/10"
                          : "bg-gradient-to-br from-indigo-50/50 via-white to-slate-50 border-indigo-200 hover:border-indigo-600 hover:shadow-lg"
                      )}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-3 flex-1">
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "w-10 h-10 bg-gradient-to-br flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform",
                                feat.color
                              )}>
                                <Icon className="w-5 h-5" />
                              </span>
                              <div>
                                <span className="text-[9px] font-extrabold uppercase tracking-widest text-indigo-500 block">
                                  FEATURED DOMAIN
                                </span>
                                <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors">
                                  {feat.name}
                                </h3>
                              </div>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                              {feat.description}
                            </p>
                            <div className="flex flex-wrap gap-1 pt-1">
                              {feat.tags.map(tag => (
                                <span key={tag} className="text-[9px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-xs font-bold text-emerald-500 block">
                              {feat.avgRating} ★
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 block mt-1">
                              ${feat.startingPrice}/{feat.priceUnit}
                            </span>
                            <div className="mt-4 w-8 h-8 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:border-indigo-600 group-hover:text-white transition-all">
                              <ArrowUpRight className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Main Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCategories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: idx * 0.03 }}
                >
                  <Link href={`/category/${cat.slug}`}>
                    <div className={cn(
                      "group relative h-full p-5 border transition-all duration-300 flex flex-col justify-between cursor-pointer hover:-translate-y-1",
                      isDark
                        ? "bg-slate-900 border-slate-800 hover:border-indigo-600 hover:shadow-xl hover:shadow-indigo-500/10"
                        : "bg-white border-slate-200 hover:border-indigo-600 hover:shadow-lg"
                    )}>
                      {/* Top Badges & Icon */}
                      <div>
                        <div className="flex items-start justify-between mb-3">
                          <div className={cn(
                            "w-12 h-12 bg-gradient-to-br flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform duration-300",
                            cat.color
                          )}>
                            <Icon className="h-6 w-6" />
                          </div>

                          <div className="flex items-center gap-1">
                            {cat.trending && (
                              <span className="px-1.5 py-0.5 text-[8px] font-extrabold uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                HOT
                              </span>
                            )}
                            <span className="text-[10px] font-black font-mono px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {cat.count} SERVICES
                            </span>
                          </div>
                        </div>

                        {/* Title & Description */}
                        <h3 className={cn(
                          "font-black text-sm tracking-tight mb-1.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors",
                          isDark ? "text-white" : "text-slate-900"
                        )}>
                          {cat.name}
                        </h3>
                        <p className={cn(
                          "text-[11px] leading-relaxed line-clamp-2 mb-3",
                          isDark ? "text-slate-400" : "text-slate-500"
                        )}>
                          {cat.description}
                        </p>

                        {/* Subcategory Pills */}
                        <div className="flex flex-wrap gap-1 mb-4">
                          {cat.tags.slice(0, 3).map((tag) => (
                            <button
                              key={tag}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSelectedTag(selectedTag === tag ? null : tag);
                              }}
                              className={cn(
                                "text-[9px] font-bold px-2 py-0.5 transition-colors border",
                                selectedTag === tag
                                  ? "bg-indigo-600 border-indigo-600 text-white"
                                  : isDark
                                    ? "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                              )}
                            >
                              {tag}
                            </button>
                          ))}
                          {cat.tags.length > 3 && (
                            <span className="text-[9px] font-bold text-slate-400 px-1 py-0.5">
                              +{cat.tags.length - 3}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className={cn(
                        "pt-3 border-t flex items-center justify-between text-xs font-bold mt-auto",
                        isDark ? "border-slate-800/80" : "border-slate-100"
                      )}>
                        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[10px]">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          <span className="font-extrabold text-slate-700 dark:text-slate-200">{cat.avgRating}</span>
                        </div>

                        <div className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform text-[11px]">
                          <span>From ${cat.startingPrice}/{cat.priceUnit}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredCategories.length === 0 && (
            <div className={cn(
              "text-center py-16 px-4 border mt-6 space-y-3",
              isDark ? "bg-slate-900/50 border-slate-800" : "bg-white border-slate-200"
            )}>
              <div className="w-12 h-12 bg-indigo-500/10 text-indigo-500 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                No matching domains found
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try searching for broader keywords like "Development", "Design", or reset your current filters.
              </p>
              <Button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedTag(null);
                  setSelectedFilter('all');
                  setMaxPrice(120);
                  setMinRating(0);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-8 px-4"
              >
                Reset All Search Filters
              </Button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
