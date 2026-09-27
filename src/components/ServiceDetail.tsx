import React, { useState } from 'react';
import { Service, Booking, BookingStatus, User, UserRole, ReportTargetType } from '../types';
import { MockDatabase } from '../lib/mockStore';
import ReviewStars from './ReviewStars';
import ReviewsList from './ReviewsList';
import ShareButton from './ShareButton';
import ReportButton from './ReportButton';
import Map from './Map';
import { 
  Calendar, Clock, DollarSign, MapPin, User as UserIcon, ShieldAlert, Check, 
  MessageSquare, ChevronLeft, Wifi, Heart, Star, Sparkles, Navigation, Map as MapIcon 
} from 'lucide-react';

interface ServiceDetailProps {
  serviceId: string;
  onBack: () => void;
  onNavigateToView: (view: string) => void;
}

export default function ServiceDetail({ serviceId, onBack, onNavigateToView }: ServiceDetailProps) {
  const service = MockDatabase.getServices().find(s => s.id === serviceId);
  const categories = MockDatabase.getCategories();
  const reviews = MockDatabase.getReviews().filter(r => r.service_id === serviceId);
  const users = MockDatabase.getUsers();

  const currentUser = MockDatabase.getCurrentUser();

  if (!service) {
    return (
      <div className="text-center py-12">
        <p className="text-xs text-rose-500 font-bold">Service record not found</p>
        <button onClick={onBack} className="mt-4 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-xs rounded-lg">
          Go Back
        </button>
      </div>
    );
  }

  const provider = users.find(u => u.id === service.provider_id);

  // Booking states
  const [bookingDate, setBookingDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().substring(0, 10);
  });
  const [bookingTime, setBookingTime] = useState('10:00');
  const [duration, setDuration] = useState(60); // minutes
  const [notes, setNotes] = useState('');
  const [isBooked, setIsBooked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Favorites states
  const [isFav, setIsFav] = useState(() => {
    if (currentUser) {
      return MockDatabase.getFavorites().some(f => f.user_id === currentUser.id && f.service_id === serviceId);
    }
    return false;
  });

  const handleToggleFavorite = () => {
    if (!currentUser) {
      alert('Please log in to add favorites!');
      return;
    }

    const currentFavs = MockDatabase.getFavorites();
    if (isFav) {
      const updated = currentFavs.filter(f => !(f.user_id === currentUser.id && f.service_id === serviceId));
      MockDatabase.saveFavorites(updated);
      setIsFav(false);
    } else {
      const newFav = {
        id: Math.random().toString(36).substr(2, 9),
        user_id: currentUser.id,
        service_id: serviceId,
        created_at: new Date().toISOString()
      };
      MockDatabase.saveFavorites([...currentFavs, newFav]);
      setIsFav(true);
    }
  };

  const handleContactProvider = () => {
    if (!currentUser) {
      alert('Please sign in to contact the service provider.');
      return;
    }

    // Direct chat channel setup
    const messages = MockDatabase.getMessages();
    const existingThread = messages.find(
      m => (m.sender_id === currentUser.id && m.receiver_id === service.provider_id) ||
           (m.sender_id === service.provider_id && m.receiver_id === currentUser.id)
    );

    if (!existingThread) {
      // Send a system trigger message to open conversation
      const newMsg = {
        id: Math.random().toString(36).substr(2, 9),
        sender_id: currentUser.id,
        receiver_id: service.provider_id,
        content: `Hello! I am interested in your service: "${service.title}".`,
        is_read: false,
        message_type: 'TEXT' as any,
        created_at: new Date().toISOString()
      };
      MockDatabase.saveMessages([...messages, newMsg]);
    }

    onNavigateToView('messages');
  };

  // Pricing formula
  const ratePerHour = service.price;
  const totalPrice = service.price_unit === 'hr' 
    ? parseFloat(((ratePerHour * duration) / 60).toFixed(2))
    : ratePerHour;

  const handleBookService = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!currentUser) {
      setError('You must log in to book this service.');
      return;
    }

    if (currentUser.id === service.provider_id) {
      setError("You cannot book your own service listings.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const bookings = MockDatabase.getBookings();
      const newBooking: Booking = {
        id: Math.random().toString(36).substr(2, 9),
        service_id: service.id,
        seeker_id: currentUser.id,
        provider_id: service.provider_id,
        booking_date: `${bookingDate}T${bookingTime}:00.000Z`,
        duration,
        total_price: totalPrice,
        status: BookingStatus.PENDING,
        notes,
        reminder_sent: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        service_title: service.title,
        provider_name: provider?.full_name || 'Provider',
        seeker_name: currentUser.full_name
      };

      MockDatabase.saveBookings([newBooking, ...bookings]);

      // Log Activity Tracker
      MockDatabase.logActivity(
        currentUser.id,
        'BOOKING_CREATE',
        'SERVICE',
        service.id,
        `Created pending booking request for "${service.title}" on ${bookingDate}`,
        { total_price: totalPrice }
      );

      // Send Real-time notification to Provider
      MockDatabase.sendNotification(
        service.provider_id,
        'BOOKING',
        'New Booking Request Received',
        `${currentUser.full_name} has requested a booking for "${service.title}" on ${bookingDate} for $${totalPrice}`,
        `/bookings/${newBooking.id}`
      );

      setLoading(false);
      setIsBooked(true);
    }, 600);
  };

  const getSubscoresAvg = (field: 'quality' | 'punctuality' | 'professionalism') => {
    if (reviews.length === 0) return 5.0;
    const sum = reviews.reduce((acc, curr) => acc + (curr[field] || 5), 0);
    return parseFloat((sum / reviews.length).toFixed(1));
  };

  return (
    <div className="space-y-6 text-left">
      {/* Back Button and action toolbar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors border border-slate-200/40 dark:border-slate-700 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Explore</span>
        </button>

        <div className="flex items-center gap-2">
          <ShareButton
            title={service.title}
            text={`Check out this professional service on UCOMMERZ: ${service.description}`}
            url={`/services/${service.id}`}
          />
          <button
            onClick={handleToggleFavorite}
            className={`p-1.5 rounded-lg border text-xs font-semibold transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer ${
              isFav 
                ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40' 
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950/40'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span className="hidden sm:inline">{isFav ? 'Favorited' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Main double column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Media Hero, Descriptions, reviews */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            {/* Gallery Image display */}
            <div className="relative aspect-video w-full bg-slate-50 dark:bg-slate-950">
              <img
                src={service.images[0] || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop'}
                alt={service.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 bg-slate-900/85 dark:bg-slate-950/85 backdrop-blur-sm border border-slate-800 dark:border-slate-800 text-white font-semibold text-xs px-3 py-1 rounded-xl">
                {categories.find(c => c.id === service.category)?.name}
              </div>
            </div>

            {/* Title / Badges block */}
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <h1 className="text-lg sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
                  {service.title}
                </h1>
                
                {/* Geolocation Tag and remote modes */}
                <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    {service.location}
                  </span>
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {service.is_remote ? (
                      <>
                        <Wifi className="w-3 h-3 text-slate-400 dark:text-slate-500" /> Remote
                      </>
                    ) : (
                      <>
                        <MapIcon className="w-3 h-3 text-slate-400 dark:text-slate-500" /> On-site Only
                      </>
                    )}
                  </span>
                </div>
              </div>

              {/* Service details description */}
              <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">Service Description</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {service.description}
                </p>
              </div>
            </div>
          </div>

          {/* Provider Business details */}
          {provider && (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">About Service Provider</h3>
              <div className="flex items-start gap-4">
                <img
                  src={provider.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'}
                  alt={provider.full_name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-800 shadow"
                />
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm leading-none">{provider.full_name}</h4>
                    {provider.verified && (
                      <span className="text-blue-500 font-extrabold text-[8px] bg-blue-50 dark:bg-blue-950/40 border border-blue-100/50 dark:border-blue-900/30 px-1 rounded-sm">VERIFIED PROVIDER</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <ReviewStars rating={provider.rating} size={11} />
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">({provider.total_reviews} reviews)</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic">{provider.bio || 'Professional service provider.'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-slate-50 dark:border-slate-800/60">
                <button
                  onClick={handleContactProvider}
                  className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/20 hover:bg-indigo-100/70 dark:hover:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Send Direct Message</span>
                </button>
              </div>
            </div>
          )}

          {/* Map display */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">Service Radius Cover</h3>
            <Map 
              locationName={service.service_address || service.location} 
              radiusKm={service.service_radius || 20} 
              latitude={service.service_latitude || service.latitude}
              longitude={service.service_longitude || service.longitude}
            />
          </div>

          {/* Customer Reviews listing */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="border-b border-slate-100 dark:border-slate-800/60 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">Client Testimonials</h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Ratings and qualitative feedback</p>
              </div>
              <ReportButton targetType={ReportTargetType.SERVICE} targetId={service.id} targetName={service.title} />
            </div>

            {reviews.length > 0 && (
              /* Breakdown score metrics */
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-800/60 rounded-xl p-4 text-center">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Work Quality</span>
                  <p className="text-base font-extrabold text-slate-800 dark:text-slate-200 font-mono">{getSubscoresAvg('quality')} / 5.0</p>
                </div>
                <div className="space-y-0.5 border-y sm:border-y-0 sm:border-x border-slate-200/50 dark:border-slate-800/50 py-1 sm:py-0">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Punctuality</span>
                  <p className="text-base font-extrabold text-slate-800 dark:text-slate-200 font-mono">{getSubscoresAvg('punctuality')} / 5.0</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Professionalism</span>
                  <p className="text-base font-extrabold text-slate-800 dark:text-slate-200 font-mono">{getSubscoresAvg('professionalism')} / 5.0</p>
                </div>
              </div>
            )}

            <ReviewsList reviews={reviews} allowReply={false} />
          </div>
        </div>

        {/* Right Side: Floating Instant Booking Form Panel */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-md space-y-4 sticky top-20">
            <div className="border-b border-slate-100 dark:border-slate-800/60 pb-3 flex items-end justify-between text-left">
              <div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block">Client Pricing</span>
                <span className="text-lg font-extrabold text-slate-800 dark:text-slate-100 font-mono">${service.price}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">/{service.price_unit}</span>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/30 px-2 py-0.5 rounded-full inline-block">
                  No Extra Fees
                </span>
              </div>
            </div>

            {isBooked ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-800/50 rounded-xl text-center space-y-3">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto border border-emerald-200 dark:border-emerald-800">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-800 dark:text-emerald-300 text-xs">Booking Request Created!</h4>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 leading-relaxed mt-1">
                    Your scheduling has been submitted to {provider?.full_name}. We have sent them an immediate notification alert. Track states inside your panel.
                  </p>
                </div>
                <button
                  onClick={() => onNavigateToView('bookings')}
                  className="w-full py-1.5 bg-emerald-600 dark:bg-emerald-700 hover:bg-emerald-700 dark:hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
                >
                  View My Bookings
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookService} className="space-y-4">
                {error && (
                  <div className="p-2.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 rounded-lg text-rose-600 dark:text-rose-400 text-[10px] font-semibold flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Date selection input */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Choose Appointment Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 dark:text-slate-500" />
                    <input
                      type="date"
                      required
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      min={new Date().toISOString().substring(0, 10)}
                      className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Time selection input */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Start Time</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400 dark:text-slate-500" />
                      <input
                        type="time"
                        required
                        value={bookingTime}
                        onChange={(e) => setBookingTime(e.target.value)}
                        className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Duration input selection */}
                  {service.price_unit === 'hr' && (
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Duration</label>
                      <select
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        className="w-full text-xs border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                      >
                        <option value={30}>30 mins</option>
                        <option value={60}>1 hour</option>
                        <option value={120}>2 hours</option>
                        <option value={180}>3 hours</option>
                        <option value={240}>4 hours</option>
                        <option value={480}>8 hours</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Notes box */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">Work Scope or Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Provide specific details about your layout, requirements, etc..."
                    rows={3}
                    className="w-full text-xs border border-slate-200 dark:border-slate-800 rounded-lg p-2 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none transition-colors"
                  />
                </div>

                {/* Invoice Breakdown */}
                <div className="bg-slate-50 dark:bg-slate-950/30 rounded-xl p-3 border border-slate-100 dark:border-slate-800 text-xs font-medium space-y-1.5 text-slate-600 dark:text-slate-400">
                  <div className="flex justify-between">
                    <span>Base rate:</span>
                    <span className="font-mono">${service.price} {service.price_unit === 'hr' ? 'x hr' : 'flat'}</span>
                  </div>
                  {service.price_unit === 'hr' && (
                    <div className="flex justify-between text-slate-500 dark:text-slate-500 text-[10px]">
                      <span>Selected duration:</span>
                      <span className="font-mono">{(duration / 60).toFixed(1)} hrs</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-slate-200/50 dark:border-slate-800/50 pt-1.5 text-slate-800 dark:text-slate-200 font-bold">
                    <span>Estimated Total:</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400">${totalPrice}</span>
                  </div>
                </div>

                {/* Book Action Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg text-xs font-bold transition-all shadow flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{loading ? 'Creating Request...' : 'Instant Booking'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
