import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Users, ChevronRight, Star, Wifi, Zap, Coffee, Utensils, ShieldCheck, MapPin } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { mockRooms, mockTestimonials } from '../data/mockData';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [guests, setGuests] = useState('1');

  const handleSearch = (e) => {
    e.preventDefault();
    navigate('/rooms');
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-overlay"></div>
        <div className="container hero-content">
          <motion.div 
            className="hero-text"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1>Experience Luxury<br/>Like Never Before</h1>
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
            <div className="divider" style={{margin: '1rem 0 2rem 0'}}></div>
            <p>
              Located securely in Agbor, the Indian Atlantic Hotel offers an unrivaled blend of modern luxury and serene comfort. From our 24/7 power supply to our meticulously designed rooms, every detail is crafted to ensure an unforgettable stay.
            </p>
            <p>
              Whether you are visiting for business or leisure, our dedicated staff is committed to providing you with world-class hospitality and personalized service.
            </p>
            <Link to="/rooms" className="btn btn-outline" style={{marginTop: '1rem'}}>Discover Our Rooms</Link>
          </motion.div>
            <motion.div className="about-image" {...fadeInUp}>
              <img src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800" alt="Indian Atlantic Hotel Luxury Interior" />
            </motion.div>
        </div>
      </section>

      {/* Amenities Section */}
      <section className="section amenities-section">
        <div className="container">
          <motion.div className="section-header text-center" {...fadeInUp}>
            <h2>Premium Amenities</h2>
            <div className="divider"></div>
            <p style={{color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto 3rem'}}>Enjoy world-class facilities designed for your ultimate comfort and security.</p>
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
              <motion.div key={idx} className="feature-item" initial={{opacity: 0, y: 20}} whileInView={{opacity: 1, y: 0}} viewport={{once: true}} transition={{delay: idx * 0.1}}>
                <feature.icon size={40} className="feature-icon" />
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
          
          <div className="rooms-grid" style={{marginTop: '3rem'}}>
            {mockRooms.map((room, idx) => (
              <motion.div key={room.id} className="room-card" initial={{opacity: 0, y: 30}} whileInView={{opacity: 1, y: 0}} viewport={{once: true}} transition={{delay: idx * 0.2}}>
                <img src={room.image} alt={room.name} className="room-img" />
                <div className="room-info">
                  <h3>{room.name}</h3>
                  <div className="price">₦{room.price.toLocaleString()} <span>/ night</span></div>
                  <p className="desc">{room.description}</p>
                  <Link to={`/room/${room.id}`} className="btn btn-outline" style={{width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem'}}>
                    View Details <ChevronRight size={18} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="section testimonials-section">
        <div className="container">
          <motion.div className="section-header text-center" {...fadeInUp}>
            <h2 style={{color: 'var(--color-text-light)'}}>Guest Experiences</h2>
            <div className="divider"></div>
          </motion.div>
          <div className="testimonials-grid" style={{marginTop: '3rem'}}>
            {mockTestimonials.map((testimonial, idx) => (
              <motion.div key={testimonial.id} className="testimonial-card glass-panel" initial={{opacity: 0, y: 20}} whileInView={{opacity: 1, y: 0}} viewport={{once: true}} transition={{delay: idx * 0.2}}>
                <div className="stars">
                  {[...Array(testimonial.rating)].map((_, i) => <Star key={i} size={18} fill="var(--color-primary-gold)" color="var(--color-primary-gold)" />)}
                </div>
                <p className="testimonial-text">"{testimonial.text}"</p>
                <div className="testimonial-author">
                  <h4>{testimonial.name}</h4>
                  <span>{testimonial.location}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Location Map Section */}
      <section className="section bg-light" style={{paddingBottom: 0}}>
        <div className="container" style={{marginBottom: '3rem'}}>
          <motion.div className="section-header text-center" {...fadeInUp}>
            <h2>Find Us</h2>
            <div className="divider"></div>
            <p style={{color: 'var(--color-text-muted)'}}>8 Cemetery Street, off Old Lagos Asaba Road, Agbor, Delta State</p>
          </motion.div>
        </div>
        <div className="map-container">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3963.0298066518175!2d6.1856!3d6.2571!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x104161b9b1e5a593%3A0x6e3c3b0f5b9d3e8a!2sAgbor%2C%20Delta%2C%20Nigeria!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus" 
            width="100%" 
            height="450" 
            style={{border: 0, display: 'block'}} 
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
