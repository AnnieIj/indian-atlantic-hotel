import React, { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Users, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import './RoomDetails.css';

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { rooms, checkAvailability } = useContext(AppContext);
  const [room, setRoom] = useState(null);
  
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [availabilityMsg, setAvailabilityMsg] = useState('');
  const [selectedImg, setSelectedImg] = useState('');
  
  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200';

  useEffect(() => {
    const foundRoom = rooms.find(r => r.id === id);
    if (foundRoom) {
      setRoom(foundRoom);
      setSelectedImg(foundRoom.image || FALLBACK_IMAGE);
    }
  }, [id, rooms]);

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
          <div className="main-image-container glass-panel">
            <button 
              onClick={() => navigate('/rooms')} 
              className="floating-back-btn"
              aria-label="Back to rooms"
            >
              <ArrowLeft size={20} /> Back
            </button>
            <img 
              src={selectedImg} 
              alt={room.name} 
              className="main-gallery-img"
              onLoad={(e) => e.target.classList.add('loaded')}
              onError={(e) => { e.target.src = FALLBACK_IMAGE; }}
            />
          </div>
          
          {room.images && room.images.length > 0 && (
            <div className="thumbnails-grid mt-4">
              {room.images.map((img, i) => (
                <div 
                  key={i} 
                  className={`thumbnail-item ${selectedImg === img ? 'active' : ''}`}
                  onClick={() => setSelectedImg(img)}
                >
                  <img 
                    src={img} 
                    alt={`${room.name} view ${i + 1}`} 
                    loading="lazy"
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
