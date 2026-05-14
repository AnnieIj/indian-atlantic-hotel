import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Users, ChevronRight, ChevronLeft, Star, Wifi, Zap, Coffee, Utensils, ShieldCheck, MapPin, Plus, X, ChevronDown } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { AppContext } from '../context/AppContext';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const { testimonials, addTestimonial, rooms } = useContext(AppContext);
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [guests, setGuests] = useState('1');

  // Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newReview, setNewReview] = useState({ name: '', location: '', text: '', rating: 5 });
  const [activeFaq, setActiveFaq] = useState(null);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate('/rooms');
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    addTestimonial(newReview);
    setShowReviewModal(false);
    setNewReview({ name: '', location: '', text: '', rating: 5 });
  };

  // Gallery Carousel State
  const galleryImages = [
    "/indian atlantic pics/IMG-20260224-WA0036.jpg.jpeg",
    "/indian atlantic pics/IMG-20260224-WA0037(1).jpg.jpeg",
    "/indian atlantic pics/IMG-20260224-WA0041(1).jpg.jpeg",
    "/indian atlantic pics/IMG-20260224-WA0044.jpg.jpeg",
    "/indian atlantic pics/IMG-20260224-WA0045.jpg.jpeg",
    "/indian atlantic pics/IMG-20260224-WA0049.jpg.jpeg",
    "/indian atlantic pics/IMG-20260224-WA0051.jpg.jpeg",
    "/indian atlantic pics/IMG-20260224-WA0052.jpg.jpeg",
    "/indian atlantic pics/IMG-20260224-WA0053.jpg.jpeg",
    "/indian atlantic pics/RBA_5156.jpg.jpeg",
    "/indian atlantic pics/RBA_5183.jpg.jpeg"
  ];
  const [currentGallery, setCurrentGallery] = useState(0);

  const nextGallery = () => setCurrentGallery((prev) => (prev + 1) % galleryImages.length);
  const prevGallery = () => setCurrentGallery((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  const faqs = [
    { question: "What are the check-in and check-out times?", answer: "Check-in time is from 2:00 PM, and check-out is by 12:00 PM. Early check-in or late check-out can be arranged based on availability." },
    { question: "Is there a 24/7 power supply?", answer: "Yes, we guarantee uninterrupted power supply 24/7 with our industrial-grade backup generators." },
    { question: "Do you offer airport pickup services?", answer: "Yes, we can arrange airport shuttle services for our guests. Please contact us in advance to schedule your pickup." },
    { question: "Is breakfast included in the room rate?", answer: "Yes, a complimentary breakfast is included for all guests staying in our suites and super deluxe rooms." },
    { question: "How secure is the hotel?", answer: "Your safety is our priority. We have 24/7 armed security personnel, CCTV surveillance throughout the premises, and secure electronic key card access." }
  ];

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="container hero-content">
          <motion.div
            className="hero-text"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="hero-brand">Indian Atlantic Hotel</div>
            <h1>Experience Luxury<br />Like Never Before</h1>
            <p>Your perfect escape in the heart of Agbor.</p>
          </motion.div>

          <motion.form
            className="search-bar glass-panel-dark"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            onSubmit={handleSearch}
          >
            <div className="search-group">
              <label>Check In</label>
              <div className="input-wrapper">
                <Calendar size={18} className="text-gold" />
                <DatePicker
                  selected={checkIn}
                  onChange={(date) => setCheckIn(date)}
                  selectsStart
                  startDate={checkIn}
                  endDate={checkOut}
                  minDate={new Date()}
                  placeholderText="Select Date"
                  className="custom-datepicker"
                />
              </div>
            </div>
            <div className="search-group">
              <label>Check Out</label>
              <div className="input-wrapper">
                <Calendar size={18} className="text-gold" />
                <DatePicker
                  selected={checkOut}
                  onChange={(date) => setCheckOut(date)}
                  selectsEnd
                  startDate={checkIn}
                  endDate={checkOut}
                  minDate={checkIn || new Date()}
                  placeholderText="Select Date"
                  className="custom-datepicker"
                />
              </div>
            </div>
            <div className="search-group">
              <label>Guests</label>
              <div className="input-wrapper">
                <Users size={18} className="text-gold" />
                <select value={guests} onChange={(e) => setGuests(e.target.value)}>
                  <option value="1">1 Adult</option>
                  <option value="2">2 Adults</option>
                  <option value="3">3 Adults</option>
                  <option value="4">4 Adults</option>
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn-primary search-btn">Check Availability</button>
          </motion.form>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="section bg-light">
        <div className="container about-section">
          <motion.div className="about-text" {...fadeInUp}>
            <div className="subtitle">WELCOME TO INDIAN ATLANTIC HOTEL</div>
            <h2>A Heritage of Comfort and Elegance</h2>
            <div className="divider" style={{ margin: '1rem 0 2rem 0' }}></div>
            <p>
              Located securely in Agbor, the Indian Atlantic Hotel offers an unrivaled blend of modern luxury and serene comfort. From our 24/7 power supply to our meticulously designed rooms, every detail is crafted to ensure an unforgettable stay.
            </p>
            <p>
              Whether you are visiting for business or leisure, our dedicated staff is committed to providing you with world-class hospitality and personalized service.
            </p>
            <Link to="/rooms" className="btn btn-outline" style={{ marginTop: '1rem' }}>Discover Our Rooms</Link>
          </motion.div>
          <motion.div className="about-image" {...fadeInUp}>
            <img
              src="/indian atlantic pics/heritage.jpeg"
              alt="Indian Atlantic Hotel Heritage and Culture"
              loading="lazy"
              onLoad={(e) => e.target.classList.add('loaded')}
              style={{ width: '100%', borderRadius: '4px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)' }}
            />
          </motion.div>
        </div>
      </section>

      {/* Amenities Section */}
      <section className="section amenities-section">
        <div className="container">
          <motion.div className="section-header text-center" {...fadeInUp}>
            <h2>Premium Amenities</h2>
            <div className="divider"></div>
            <p style={{ color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto 3rem' }}>Enjoy world-class facilities designed for your ultimate comfort and security.</p>
          </motion.div>
          <div className="features-grid">
            {[
              { icon: Zap, title: "24/7 Power Supply", desc: "Uninterrupted power backed by heavy-duty generators." },
              { icon: ShieldCheck, title: "Maximum Security", desc: "Top-tier security personnel and CCTV surveillance." },
              { icon: Wifi, title: "High-Speed Wi-Fi", desc: "Stay connected with our complimentary fast internet." },
              { icon: Utensils, title: "World-Class Restaurant", desc: "Exquisite local and continental dishes." },
              { icon: Coffee, title: "VIP Lounge", desc: "Relax and unwind in our exclusive luxury lounge." },
              { icon: MapPin, title: "Prime Location", desc: "Easily accessible and situated in a serene environment." }
            ].map((feature, idx) => (
              <motion.div key={idx} className="feature-item" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }}>
                <feature.icon size={40} className="feature-icon" aria-hidden="true" />
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Rooms */}
      <section className="section bg-light">
        <div className="container">
          <motion.div className="section-header text-center" {...fadeInUp}>
            <h2>Featured Rooms</h2>
            <div className="divider"></div>
          </motion.div>

          <div className="rooms-grid" style={{ marginTop: '3rem' }}>
            {rooms.slice(0, 3).map((room, idx) => (
              <motion.div key={room.id} className="room-card" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.2 }}>
                <img
                  src={room.image}
                  alt={room.name}
                  className="room-img"
                  loading="lazy"
                  onLoad={(e) => e.target.classList.add('loaded')}
                />
                <div className="room-info">
                  <h3>{room.name}</h3>
                  <div className="price">₦{room.price.toLocaleString()} <span>/ night</span></div>
                  <p className="desc">{room.description}</p>
                  <Link to={`/room/${room.id}`} className="btn btn-outline" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                    View Details <ChevronRight size={18} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section testimonials-section overflow-hidden">
        <div className="container">
          <motion.div className="section-header text-center" {...fadeInUp}>
            <h2 style={{ color: 'var(--color-text-light)' }}>Guest Experiences</h2>
            <div className="divider"></div>
          </motion.div>

          <div className="testimonials-scroll-container">
            <motion.div
              className="testimonials-track"
              drag="x"
              dragConstraints={{ left: -1000, right: 0 }}
            >
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="testimonial-card glass-panel">
                  <div className="stars">
                    {[...Array(testimonial.rating)].map((_, i) => <Star key={i} size={16} fill="var(--color-primary-gold)" color="var(--color-primary-gold)" />)}
                  </div>
                  <p className="testimonial-text">"{testimonial.text}"</p>
                  <div className="testimonial-author">
                    <h4>{testimonial.name}</h4>
                    <span>{testimonial.location}</span>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          <div className="text-center mt-12">
            <button className="btn btn-primary" onClick={() => setShowReviewModal(true)}>
              <Plus size={18} style={{ marginRight: '0.5rem' }} /> Add Your Experience
            </button>
          </div>
        </div>
      </section>

      {/* Review Modal */}
      <AnimatePresence>
        {showReviewModal && (
          <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
            <motion.div
              className="modal-content glass-panel-dark"
              onClick={e => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <button className="modal-close" onClick={() => setShowReviewModal(false)} aria-label="Close modal"><X /></button>
              <h2 className="text-gold mb-6">Share Your Experience</h2>
              <form onSubmit={handleReviewSubmit}>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="rev-name">Your Name</label>
                    <input
                      id="rev-name"
                      type="text"
                      value={newReview.name}
                      onChange={e => setNewReview({ ...newReview, name: e.target.value })}
                      required
                      placeholder="e.g. John Doe"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="rev-loc">Location</label>
                    <input
                      id="rev-loc"
                      type="text"
                      value={newReview.location}
                      onChange={e => setNewReview({ ...newReview, location: e.target.value })}
                      required
                      placeholder="e.g. Lagos, Nigeria"
                    />
                  </div>
                </div>
                <div className="form-group mt-4">
                  <label>Rating</label>
                  <div className="star-rating">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        size={24}
                        fill={star <= newReview.rating ? "var(--color-primary-gold)" : "transparent"}
                        color="var(--color-primary-gold)"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                        aria-label={`Rate ${star} stars`}
                      />
                    ))}
                  </div>
                </div>
                <div className="form-group mt-4">
                  <label htmlFor="rev-text">Your Experience</label>
                  <textarea
                    id="rev-text"
                    value={newReview.text}
                    onChange={e => setNewReview({ ...newReview, text: e.target.value })}
                    required
                    placeholder="Tell us about your stay..."
                    rows={4}
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-primary w-full mt-6">Submit Review</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Property Gallery Section */}
      <section className="section bg-light overflow-hidden">
        <div className="container">
          <motion.div className="section-header text-center" {...fadeInUp}>
            <h2>Our Property Showcase</h2>
            <div className="divider"></div>
            <p style={{ color: 'var(--color-text-muted)' }}>A glimpse into the elegance and comfort of Indian Atlantic Hotel.</p>
          </motion.div>

          <div className="gallery-carousel-wrapper" style={{ marginTop: '3rem', position: 'relative' }}>
            <div className="gallery-carousel-container" style={{ overflow: 'hidden', borderRadius: '16px', position: 'relative', height: '500px', boxShadow: 'var(--shadow-lg)' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentGallery}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                  style={{ width: '100%', height: '100%', position: 'absolute' }}
                >
                  <img
                    src={galleryImages[currentGallery]}
                    alt={`Property showcase ${currentGallery + 1}`}
                    onLoad={(e) => e.target.classList.add('loaded')}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div className="gallery-caption" style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '2rem', background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', color: '#fff' }}>
                    <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>Property View {currentGallery + 1}</h3>
                    <p style={{ fontSize: '0.9rem', opacity: 0.9 }}>Experience the unique blend of luxury and comfort at Indian Atlantic Hotel.</p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation Arrows */}
              <button 
                onClick={prevGallery}
                className="gallery-nav-btn prev"
                style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', border: 'none', borderRadius: '50%', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer', zIndex: 10, transition: 'all 0.3s ease' }}
                aria-label="Previous image"
              >
                <ChevronLeft size={24} />
              </button>
              <button 
                onClick={nextGallery}
                className="gallery-nav-btn next"
                style={{ position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', border: 'none', borderRadius: '50%', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer', zIndex: 10, transition: 'all 0.3s ease' }}
                aria-label="Next image"
              >
                <ChevronRight size={24} />
              </button>

              {/* Counter Indicator */}
              <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', padding: '0.5rem 1rem', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)', borderRadius: '20px', color: '#fff', fontSize: '0.8rem', fontWeight: 600, zIndex: 10 }}>
                {currentGallery + 1} / {galleryImages.length}
              </div>
            </div>

            {/* Dots Navigation */}
            <div className="gallery-dots" style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '1.5rem' }}>
              {galleryImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentGallery(idx)}
                  style={{ width: idx === currentGallery ? '30px' : '10px', height: '10px', borderRadius: '5px', background: idx === currentGallery ? 'var(--color-primary-gold)' : 'rgba(0,0,0,0.1)', border: 'none', transition: 'all 0.3s ease', cursor: 'pointer' }}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section bg-light">
        <div className="container">
          <motion.div className="section-header text-center" {...fadeInUp}>
            <h2>Frequently Asked Questions</h2>
            <div className="divider"></div>
          </motion.div>

          <div className="faq-grid mt-12" style={{ maxWidth: '800px', margin: '3rem auto 0' }}>
            {faqs.map((faq, idx) => (
              <motion.div
                key={idx}
                className={`faq-item ${activeFaq === idx ? 'active' : ''}`}
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                {...fadeInUp}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="faq-question">
                  <h3>{faq.question}</h3>
                  <ChevronDown size={20} className="faq-arrow" />
                </div>
                <AnimatePresence>
                  {activeFaq === idx && (
                    <motion.div
                      className="faq-answer"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <p>{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Location Map Section */}
      <section className="section bg-light" style={{ paddingBottom: 0 }}>
        <div className="container" style={{ marginBottom: '3rem' }}>
          <motion.div className="section-header text-center" {...fadeInUp}>
            <h2>Find Us</h2>
            <div className="divider"></div>
            <p style={{ color: 'var(--color-text-muted)' }}>8 Cemetery Street, off Old Lagos Asaba Road, Agbor, Delta State</p>
          </motion.div>
        </div>
        <div className="map-container">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3963.0298066518175!2d6.1856!3d6.2571!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x104161b9b1e5a593%3A0x6e3c3b0f5b9d3e8a!2sAgbor%2C%20Delta%2C%20Nigeria!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus"
            width="100%"
            height="450"
            style={{ border: 0, display: 'block' }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Hotel Location Map"
          ></iframe>
        </div>
      </section>
    </div>
  );
};

export default Home;
