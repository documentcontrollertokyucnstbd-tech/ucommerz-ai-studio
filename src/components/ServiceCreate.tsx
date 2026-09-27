import React, { useState } from 'react';
import { Service, Category, ServiceStatus } from '../types';
import { MockDatabase } from '../lib/mockStore';
import { PlusCircle, Image as ImageIcon, MapPin, DollarSign, Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface ServiceCreateProps {
  onSuccess: () => void;
}

export default function ServiceCreate({ onSuccess }: ServiceCreateProps) {
  const currentUser = MockDatabase.getCurrentUser();
  const categories = MockDatabase.getCategories().filter(c => c.is_active);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(categories[0]?.id || '');
  const [price, setPrice] = useState<number>(50);
  const [priceUnit, setPriceUnit] = useState<'hr' | 'flat'>('hr');
  const [location, setLocation] = useState('New York, NY');
  const [isRemote, setIsRemote] = useState(false);
  const [isOnSite, setIsOnSite] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [serviceAddress, setServiceAddress] = useState('');
  const [serviceRadius, setServiceRadius] = useState<number>(20);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentUser) {
      setError('You must be signed in to list services.');
      return;
    }

    if (!title.trim() || !description.trim() || !category) {
      setError('Please complete all required fields.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const allServices = MockDatabase.getServices();
      const newService: Service = {
        id: Math.random().toString(36).substr(2, 9),
        provider_id: currentUser.id,
        category,
        title,
        description,
        price,
        price_unit: priceUnit,
        min_duration: 30,
        max_duration: 480,
        images: [imageUrl || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop'],
        location,
        latitude: 40.7128,
        longitude: -74.0060,
        is_remote: isRemote,
        is_on_site: isOnSite,
        service_address: serviceAddress || location,
        service_radius: serviceRadius,
        service_latitude: 40.7128 + (Math.random() - 0.5) * 0.1, // Near NY
        service_longitude: -74.0060 + (Math.random() - 0.5) * 0.1,
        status: ServiceStatus.ACTIVE,
        views: 0,
        featured: false,
        rating: 5.0,
        total_reviews: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      MockDatabase.saveServices([newService, ...allServices]);

      // Activity history logging
      MockDatabase.logActivity(
        currentUser.id,
        'SERVICE_CREATE',
        'SERVICE',
        newService.id,
        `Listed new professional marketplace offering: "${title}"`
      );

      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    }, 800);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm max-w-2xl mx-auto text-left">
      <div className="border-b border-slate-100 pb-3 mb-5">
        <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <PlusCircle className="w-5 h-5 text-indigo-600 animate-pulse" />
          <span>List Professional Service Offering</span>
        </h2>
        <p className="text-xs text-slate-500 font-medium">Create a high-converting listing to advertise your specialized services directly to clients.</p>
      </div>

      {success ? (
        <div className="p-8 text-center space-y-3">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto border border-emerald-200">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-slate-800 text-sm">Service Published Live!</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Your new service is published. Users can now search, browse proximity, and submit instant reservation queries.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg text-rose-600 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Service title */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Listing Title <span className="text-rose-500">*</span></label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Clean Architecture React Code Audit & Performance Tuning"
              className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category selection */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Service Category <span className="text-rose-500">*</span></label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs border border-slate-200 rounded-lg p-2 bg-slate-50 text-slate-800 focus:outline-none"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Pricing Rate */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Client Rate ($ USD) <span className="text-rose-500">*</span></label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="number"
                    min={10}
                    max={1000}
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full text-xs pl-8 pr-3 py-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={priceUnit}
                  onChange={(e) => setPriceUnit(e.target.value as any)}
                  className="text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-none"
                >
                  <option value="hr">per hour</option>
                  <option value="flat">flat rate</option>
                </select>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Detailed Description <span className="text-rose-500">*</span></label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline your process scope, direct deliverable outputs, and specialized tooling guarantees. Be thorough to address standard client hesitation points..."
              rows={4}
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-slate-50 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Location */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Service Coverage Location <span className="text-rose-500">*</span></label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. San Francisco, CA"
                  className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none"
                />
              </div>
            </div>

            {/* Gallery Image input */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Feature Illustration URL</label>
              <div className="relative">
                <ImageIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full text-xs pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Radius mapping details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 border border-slate-100 rounded-xl">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Service Coverage Radius</label>
              <select
                value={serviceRadius}
                onChange={(e) => setServiceRadius(Number(e.target.value))}
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-white text-slate-800 focus:outline-none"
              >
                <option value={5}>Within 5 km</option>
                <option value={10}>Within 10 km</option>
                <option value={20}>Within 20 km (Standard)</option>
                <option value={50}>Within 50 km</option>
                <option value={100}>Within 100 km</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">Offering Delivery Modes</label>
              <div className="flex gap-4 pt-2.5">
                <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRemote}
                    onChange={(e) => setIsRemote(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                  />
                  <span>Remote Available</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isOnSite}
                    onChange={(e) => setIsOnSite(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                  />
                  <span>On-site Available</span>
                </label>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{loading ? 'Publishing Service Listing...' : 'Publish Listing'}</span>
          </button>
        </form>
      )}
    </div>
  );
}
