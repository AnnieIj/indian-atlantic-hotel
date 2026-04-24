import React, { useContext, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { Users, CheckCircle, XCircle } from 'lucide-react';
import './RoomDetails.css';

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { rooms, checkAvailability } = useContext(AppContext);
  const [room, setRoom] = useState(null);
  
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [availabilityMsg, setAvailabilityMsg] = useState('');

  useEffect(() => {
    const foundRoom = rooms.find(r => r.id === id);
    if (foundRoom) setRoom(foundRoom);
  }, [id, rooms]);

  if (!room) return <div className="pt-32 text-center">Loading...</div>;

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
      setAvailabilityMsg('Room is not available for selected dates. Anti-double booking prevented this.');
    }
  };

  return (
    <main className="room-details bg-light">
      <div className="hero-small" style={{backgroundImage: `url(${room.image})`}}>
        <div className="hero-overlay"></div>
        <div className="container hero-content-small">
          <h1>{room.name}</h1>
        </div>
      </div>
      
      <div className="container py-12 details-container">
        <div className="details-main">
          <h2>About this room</h2>
          <p className="desc text-muted mb-8">{room.description}</p>
          
          <h3>Amenities</h3>
          <div className="amenities-grid mb-8">
            {room.amenities.map((amenity, i) => (
              <div key={i} className="amenity-item">
                <CheckCircle size={18} className="text-gold" /> {amenity}
              </div>
            ))}
            <div className="amenity-item"><Users size={18} className="text-gold" /> Up to {room.capacity} Guests</div>
          </div>
        </div>
        
        <div className="details-sidebar">
          <div className="booking-widget glass-panel-dark">
            <h3>Book Your Stay</h3>
            <p className="price-tag mb-4">₦{room.price.toLocaleString()} <span>/ Night</span></p>
            
            <form onSubmit={handleCheck}>
              <div className="form-group">
                <label>Check-in Date</label>
                <input type="date" value={checkIn} onChange={e => {setCheckIn(e.target.value); setAvailabilityMsg('');}} required />
              </div>
              <div className="form-group">
                <label>Check-out Date</label>
                <input type="date" value={checkOut} onChange={e => {setCheckOut(e.target.value); setAvailabilityMsg('');}} required />
              </div>
              
              {availabilityMsg && (
                <div className="availability-msg mb-4" style={{color: '#fca5a5', display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                  <XCircle size={16} /> {availabilityMsg}
                </div>
              )}
              
              <button type="submit" className="btn btn-primary w-full mt-4">Check Availability & Book</button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
};

export default RoomDetails;
