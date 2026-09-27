import React, { useState } from 'react';
import { Service, Category, User } from '../types';
import { MockDatabase } from '../lib/mockStore';
import ReviewStars from './ReviewStars';
import ShareButton from './ShareButton';
import { 
  Search, SlidersHorizontal, MapPin, DollarSign, Star, Briefcase, Eye, Bookmark, 
  MapPinOff, ArrowRight, Grid, Compass, Wifi, Map, Globe, Sparkles
} from 'lucide-react';

interface BrowseViewProps {
  onServiceSelect: (serviceId: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedSubCategory: string;
  setSelectedSubCategory: (subCat: string) => void;
}

const PREDEFINED_SUBCATEGORIES: Record<string, string[]> = {
  'cat-1': ['Web Development', 'Consulting', 'Mobile Apps', 'DevOps & Cloud'],
  'cat-2': ['Cleaning', 'Handyman', 'Gardening', 'Interior Design'],
  'cat-3': ['Yoga', 'Personal Training', 'Meditation', 'Nutrition coaching'],
  'cat-4': ['Math & Science', 'Languages', 'Test Prep', 'Coding for Kids'],
  'cat-5': ['Graphic Design', 'Photography', 'Video Editing', 'UX/UI Design']
};

export default function BrowseView({ 
  onServiceSelect,
  selectedCategory,
  setSelectedCategory,
  selectedSubCategory,
  setSelectedSubCategory
}: BrowseViewProps) {
  // Database reads
  const services = MockDatabase.getServices().filter(s => s.status === 'ACTIVE');
  const categories = MockDatabase.getCategories().filter(c => c.is_active);
  const users = MockDatabase.getUsers();

  const currentUser = MockDatabase.getCurrentUser();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(300);
  const [minRating, setMinRating] = useState<number>(0);
  const [isRemoteOnly, setIsRemoteOnly] = useState(false);
  const [isOnSiteOnly, setIsOnSiteOnly] = useState(false);
  const [proximityKm, setProximityKm] = useState<number>(100);

  // Favorites state list
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (currentUser) {
      return MockDatabase.getFavorites()
        .filter(f => f.user_id === currentUser.id)
        .map(f => f.service_id);
    }
    return [];
  });

  // Get active subcategories for the currently selected category
  const activeCategory = categories.find(c => c.id === selectedCategory);

  // Find all unique subcategories from services within this category
  const subCategories = React.useMemo(() => {
    if (selectedCategory === 'all') return [];
    const defaults = PREDEFINED_SUBCATEGORIES[selectedCategory] || [];
    const uniqueFromServices = services
      .filter(s => s.category === selectedCategory && s.sub_category)
      .map(s => s.sub_category);
    
    // Merge defaults and active ones
    const merged = new Set([...defaults, ...uniqueFromServices]);
    return Array.from(merged);
  }, [services, selectedCategory]);

  const handleToggleFavorite = (e: React.MouseEvent, serviceId: string) => {
    e.stopPropagation();
    if (!currentUser) {
      alert('Please log in to add favorites!');
      return;
    }

    const currentFavorites = MockDatabase.getFavorites();
    const isFav = favorites.includes(serviceId);

    if (isFav) {
      const updated = currentFavorites.filter(f => !(f.user_id === currentUser.id && f.service_id === serviceId));
      MockDatabase.saveFavorites(updated);
      setFavorites(favorites.filter(id => id !== serviceId));
    } else {
      const newFav = {
        id: Math.random().toString(36).substr(2, 9),
        user_id: currentUser.id,
        service_id: serviceId,
        created_at: new Date().toISOString()
      };
      MockDatabase.saveFavorites([...currentFavorites, newFav]);
      setFavorites([...favorites, serviceId]);
    }
  };

  // Filter Services logic
  const filteredServices = services.filter(service => {
    // Search text match
    const matchesSearch = 
      service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.location.toLowerCase().includes(searchQuery.toLowerCase());

    // Category match
    const matchesCategory = selectedCategory === 'all' || service.category === selectedCategory;

    // Sub-category match
    const matchesSubCategory = selectedSubCategory === 'all' || service.sub_category === selectedSubCategory;

    // Price match
    const matchesPrice = service.price <= maxPrice;

    // Rating match
    const matchesRating = service.rating >= minRating;

    // Location type match
    const matchesRemote = !isRemoteOnly || service.is_remote;
    const matchesOnSite = !isOnSiteOnly || service.is_on_site;

    return matchesSearch && matchesCategory && matchesSubCategory && matchesPrice && matchesRating && matchesRemote && matchesOnSite;
  });

  return (
    <div className="space-y-6">
      {/* Banner Search Box */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 sm:p-10 text-white shadow-xl overflow-hidden">
        {/* Background ambient accents */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -translate-y-12 translate-x-12 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-2xl translate-y-12 -translate-x-12 pointer-events-none" />

        <div className="relative max-w-2xl space-y-4">
          <span className="inline-block bg-white/20 border border-white/10 text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
            🚀 Direct Connection Platform
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            Find Trusted Services. <br className="hidden sm:inline" /> Book Instantly.
          </h1>
          <p className="text-sm text-blue-100 max-w-lg leading-relaxed">
            Connect directly with verified local handymen, full-stack architects, fitness experts, and home organizers without middleman surcharges.
          </p>

          {/* Core Search Bar Input */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search code reviews, deep house cleaning, yoga lessons..."
                className="w-full text-xs text-slate-800 bg-white placeholder:text-slate-400 rounded-xl pl-9 pr-4 py-3 border-none focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-lg"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-3 bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 border border-white/10 cursor-pointer shadow-lg"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Advanced Filters Box */}
      {showFilters && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-lg animate-fade-in grid grid-cols-1 sm:grid-cols-4 gap-4 text-left">
          {/* Max Price filter */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex justify-between">
              <span>Maximum Rate</span>
              <span className="text-blue-600 dark:text-blue-400 font-mono">${maxPrice}/{maxPrice === 300 ? 'hr+' : 'hr'}</span>
            </label>
            <input
              type="range"
              min={10}
              max={300}
              step={10}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          {/* Min Rating filter */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Minimum Rating</label>
            <select
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
              className="w-full text-xs border border-slate-200 dark:border-slate-800 rounded-xl p-2 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value={0}>Any Rating</option>
              <option value={4.0}>⭐ 4.0 & above</option>
              <option value={4.5}>⭐ 4.5 & above</option>
              <option value={4.8}>⭐ 4.8 & above</option>
            </select>
          </div>

          {/* Service radius filter */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Service Radius</label>
            <select
              value={proximityKm}
              onChange={(e) => setProximityKm(Number(e.target.value))}
              className="w-full text-xs border border-slate-200 dark:border-slate-800 rounded-xl p-2 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none"
            >
              <option value={10}>Within 10 km</option>
              <option value={25}>Within 25 km</option>
              <option value={50}>Within 50 km</option>
              <option value={100}>Any distance</option>
            </select>
          </div>

          {/* Service type checkbox */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Service Offering Mode</label>
            <div className="flex flex-col gap-1.5 pt-1">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRemoteOnly}
                  onChange={(e) => setIsRemoteOnly(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                />
                <span className="flex items-center gap-1">
                  <Wifi className="w-3 h-3 text-slate-400" /> Remote Services
                </span>
              </label>
              <label className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isOnSiteOnly}
                  onChange={(e) => setIsOnSiteOnly(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                />
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" /> On-site Services
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Grid of Service Results cards */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-xs font-bold text-slate-500">
            Showing {filteredServices.length} {filteredServices.length === 1 ? 'service' : 'services'} found
          </p>
          <div className="flex gap-1">
            <span className="p-1 text-slate-400 rounded-lg bg-slate-100 dark:bg-slate-900">
              <Grid className="w-4 h-4" />
            </span>
          </div>
        </div>

        {filteredServices.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 space-y-3">
            <MapPinOff className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 opacity-60 animate-bounce" />
            <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">No Matching Services</h4>
            <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto">
              We couldn't find any services fitting your query. Try broadening your price range, toggling filtering check boxes, or searching another category.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredServices.map((service) => {
              const provider = users.find(u => u.id === service.provider_id);
              const isFav = favorites.includes(service.id);

              return (
                <div
                  key={service.id}
                  onClick={() => onServiceSelect(service.id)}
                  className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col text-left cursor-pointer relative"
                >
                  {/* Service Card Image Banner */}
                  <div className="relative aspect-video w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <img
                      src={service.images[0] || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop'}
                      alt={service.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Bookmark Favorite Icon */}
                    <button
                      onClick={(e) => handleToggleFavorite(e, service.id)}
                      className="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 border border-slate-200/50 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors shadow-md backdrop-blur-sm z-10"
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isFav ? 'text-rose-500 fill-rose-500' : ''}`} />
                    </button>

                    {/* Categories tag overlay */}
                    <span className="absolute bottom-3 left-3 px-2 py-0.5 bg-slate-900/85 dark:bg-slate-950/85 backdrop-blur-sm border border-slate-800 dark:border-slate-800 text-white font-semibold text-[9px] rounded-lg">
                      {categories.find(c => c.id === service.category)?.name || 'Service'}
                    </span>
                  </div>

                  {/* Provider Info Row */}
                  <div className="px-4 pt-3 flex items-center gap-2">
                    <img
                      src={provider?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'}
                      alt={provider?.full_name}
                      referrerPolicy="no-referrer"
                      className="w-5 h-5 rounded-full object-cover border border-slate-200 dark:border-slate-800"
                    />
                    <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                      <span className="truncate max-w-[100px]">{provider?.full_name}</span>
                      {provider?.verified && (
                        <span className="text-blue-500 font-extrabold text-[8px] bg-blue-50 dark:bg-blue-950/40 px-1 rounded-sm">VERIFIED</span>
                      )}
                    </div>
                  </div>

                  {/* Title & Description Body */}
                  <div className="px-4 py-2.5 flex-1 space-y-1">
                    <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-xs tracking-tight line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                      {service.description}
                    </p>
                  </div>

                  {/* Card Footer pricing indicator */}
                  <div className="px-4 py-3 border-t border-slate-50 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/25 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <ReviewStars rating={service.rating} size={11} />
                      <span className="text-[10px] font-bold text-slate-500">({service.total_reviews})</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-semibold block">Starts at</span>
                      <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 font-mono">
                        ${service.price}
                        <span className="text-[9px] font-normal text-slate-500">/{service.price_unit}</span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
