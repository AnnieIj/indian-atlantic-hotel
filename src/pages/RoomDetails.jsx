import React, { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Users, CheckCircle, XCircle, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import './RoomDetails.css';

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { rooms, checkAvailability } = useContext(AppContext);
  const [room, setRoom] = useState(null);
  
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [availabilityMsg, setAvailabilityMsg] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  
  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200';

  useEffect(() => {
    const foundRoom = rooms.find(r => r.id === id);
    if (foundRoom) {
      setRoom(foundRoom);
      setCurrentIndex(0);
    }
  }, [id, rooms]);

  const displayImages = room ? (room.images && room.images.length > 0 ? room.images : [room.image || FALLBACK_IMAGE]) : [];

  const handlePrev = () => setCurrentIndex(prev => prev === 0 ? displayImages.length - 1 : prev - 1);
  const handleNext = () => setCurrentIndex(prev => prev === displayImages.length - 1 ? 0 : prev + 1);

  const minSwipeDistance = 50;
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) handleNext();
    if (distance < -minSwipeDistance) handlePrev();
  };

  if (!room) return (
    <div className="pt-32 text-center py-20">
      <div className="loading-spinner"></div>
      <p className="mt-4 text-muted">Loading room details...</p>
    </div>
  );

  const handleCheck = (e) => {
    e.preventDefault();
    if (!checkIn || !checkOut) return;
    
    if (new Date(checkIn) >= new Date(checkOut)) {
      setAvailabilityMsg('Check-out must be after check-in.');
      return;
    }
    
    const isAvailable = checkAvailability(room.id, checkIn, checkOut);
    if (isAvailable) {
      navigate(`/checkout?roomId=${room.id}&checkIn=${checkIn}&checkOut=${checkOut}`);
    } else {
      setAvailabilityMsg('Room is not available for selected dates.');
    }
  };

  return (
    <main className="room-details bg-light">
      <div className="container breadcrumb-container pt-32">
        <div className="breadcrumb">
          <Link to="/">Home</Link> <span>/</span> 
          <Link to="/rooms">Rooms</Link> <span>/</span> 
          <span className="current">{room.name}</span>
        </div>
      </div>

      <div className="container mt-6">
        <div className="room-header-flex">
          <h1>{room.name}</h1>
          <div className="type-badge">{room.type}</div>
        </div>
        
        <div className="room-gallery-wrapper mt-6">
          <div className="main-image-container glass-panel" style={{ position: 'relative', overflow: 'hidden' }}
               onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
            <button 
              onClick={() => navigate('/rooms')} 
              className="floating-back-btn"
              aria-label="Back to rooms"
              style={{ zIndex: 10 }}
            >
              <ArrowLeft size={20} /> Back
            </button>
            
            {displayImages.length > 1 && (
              <>
                <button onClick={handlePrev} className="carousel-btn prev" aria-label="Previous image" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', zIndex: 5, background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <ChevronLeft size={24} />
                </button>
                <button onClick={handleNext} className="carousel-btn next" aria-label="Next image" style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', zIndex: 5, background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <ChevronRight size={24} />
                </button>
                <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 600, zIndex: 5 }}>
                  {currentIndex + 1} of {displayImages.length}
                </div>
              </>
            )}

            <img 
              key={currentIndex}
              src={displayImages[currentIndex]} 
              alt={`${room.name} view ${currentIndex + 1}`} 
              className="main-gallery-img"
              style={{ transition: 'opacity 0.3s ease-in-out' }}
              onLoad={(e) => { e.target.classList.add('loaded'); e.target.style.opacity = 1; }}
              onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
            />
          </div>
          
          {displayImages.length > 1 && (
            <div className="thumbnails-grid mt-4" style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem', scrollBehavior: 'smooth' }}>
              {displayImages.map((img, i) => (
                <div 
                  key={i} 
                  className={`thumbnail-item ${currentIndex === i ? 'active' : ''}`}
                  onClick={() => setCurrentIndex(i)}
                  style={{ flex: '0 0 auto', width: '80px', height: '60px', borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', border: currentIndex === i ? '2px solid var(--color-primary-gold)' : '2px solid transparent', transition: 'all 0.2s' }}
                >
                  <img 
                    src={img} 
                    alt={`${room.name} thumbnail ${i + 1}`} 
                    loading="lazy"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onLoad={(e) => e.target.classList.add('loaded')}
                    onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="container py-12 details-container">
        <div className="details-main glass-panel">
          <h2 className="section-title">About this room</h2>
          <p className="desc text-muted mb-8 leading-relaxed">{room.description}</p>
          
          <h3 className="section-subtitle">Premium Amenities</h3>
          <div className="amenities-grid mb-8">
            {room.amenities.map((amenity, i) => (
              <div key={i} className="amenity-item">
                <div className="amenity-icon-wrapper">
                  <CheckCircle size={16} />
                </div>
                <span>{amenity}</span>
              </div>
            ))}
            <div className="amenity-item">
              <div className="amenity-icon-wrapper gold">
                <Users size={16} />
              </div>
              <span>Up to {room.capacity} Guests</span>
            </div>
          </div>
        </div>
        
        <div className="details-sidebar">
          <div className="booking-widget glass-panel-dark">
            <h3>Book Your Stay</h3>
            <div className="price-tag-wrapper mb-6">
              <span className="amount">₦{room.price.toLocaleString()}</span>
              <span className="period">/ Night</span>
            </div>
            
            <form onSubmit={handleCheck}>
              <div className="form-group-dark">
                <label>Check-in Date</label>
                <input type="date" value={checkIn} onChange={e => {setCheckIn(e.target.value); setAvailabilityMsg('');}} required />
              </div>
              <div className="form-group-dark">
                <label>Check-out Date</label>
                <input type="date" value={checkOut} onChange={e => {setCheckOut(e.target.value); setAvailabilityMsg('');}} required />
              </div>
              
              {availabilityMsg && (
                <div className="availability-msg mb-4">
                  <XCircle size={16} /> {availabilityMsg}
                </div>
              )}
              
              <button type="submit" className="btn btn-primary w-full mt-4 py-4">Check Availability & Book</button>
            </form>
            
            <div className="booking-features mt-6">
              <div className="feat"><CheckCircle size={14} /> Instant Confirmation</div>
              <div className="feat"><CheckCircle size={14} /> 24/7 Support</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default RoomDetails;
