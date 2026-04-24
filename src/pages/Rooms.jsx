import React, { useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AppContext } from '../context/AppContext';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar, SlidersHorizontal, ChevronDown } from 'lucide-react';
import './Rooms.css';

const Rooms = () => {
  const { rooms, checkAvailability } = useContext(AppContext);
  const location = useLocation();
  const navigate = useNavigate();
  
  const [filter, setFilter] = useState('All');
  const [maxPrice, setMaxPrice] = useState(150000);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const filteredRooms = rooms.filter(r => {
    // Category Filter
    const categoryMatch = filter === 'All' || r.type === filter;
    
    // Price Filter
    const priceMatch = r.price <= maxPrice;
    
    // Date Filter
    let dateMatch = true;
    if (startDate && endDate) {
      dateMatch = checkAvailability(r.id, startDate, endDate);
    }
    
    return categoryMatch && priceMatch && dateMatch;
  });

  const types = ['All', 'Suite', 'Double Executive', 'Executive', 'Super Deluxe', 'Deluxe', 'Standard'];

  return (
    <main className="rooms-page bg-light" style={{ minHeight: '80vh' }}>
      <div className="container pt-32 pb-12">
        <div className="rooms-header mb-8">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
            <h2 style={{margin: 0}}>Find Your Perfect Room</h2>
            <button 
              className="btn btn-outline" 
              style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <SlidersHorizontal size={18} /> Filters
            </button>
          </div>

          {/* Advanced Filters Panel */}
          {isFilterOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="glass-panel" 
              style={{ padding: '1.5rem', marginBottom: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', alignItems: 'end' }}
            >
              <div className="filter-group">
                <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem'}}>Price Range (Up to ₦{maxPrice.toLocaleString()})</label>
                <input 
                  type="range" 
                  min="20000" 
                  max="150000" 
                  step="5000" 
                  value={maxPrice} 
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                  style={{width: '100%', accentColor: 'var(--color-primary-navy)'}}
                />
              </div>

              <div className="filter-group">
                <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem'}}>Check-In Date</label>
                <div className="input-wrapper" style={{background: '#fff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  <Calendar size={16} color="var(--color-primary-gold)" />
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    placeholderText="Select Date"
                    minDate={new Date()}
                    className="custom-datepicker"
                    style={{border: 'none', width: '100%'}}
                  />
                </div>
              </div>

              <div className="filter-group">
                <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500, fontSize: '0.9rem'}}>Check-Out Date</label>
                <div className="input-wrapper" style={{background: '#fff', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  <Calendar size={16} color="var(--color-primary-gold)" />
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    placeholderText="Select Date"
                    minDate={startDate || new Date()}
                    className="custom-datepicker"
                  />
                </div>
              </div>

              <button className="btn btn-primary" onClick={() => {setStartDate(null); setEndDate(null); setMaxPrice(150000); setFilter('All');}}>
                Reset All
              </button>
            </motion.div>
          )}

          <div className="tabs mt-4">
            {types.map(t => (
              <button 
                key={t} 
                className={`tab ${filter === t ? 'active' : ''}`}
                onClick={() => setFilter(t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        
        <div className="rooms-grid">
          {filteredRooms.length > 0 ? (
            filteredRooms.map((room, index) => (
              <motion.div 
                key={room.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="room-card"
              >
                <img src={room.image} alt={room.name} className="room-img" />
                <div className="room-info">
                  <div className="flex justify-between items-center mb-2">
                    <h3>{room.name}</h3>
                    <span className={`badge ${room.status === 'available' ? 'badge-success' : room.status === 'booked' ? 'badge-danger' : 'badge-warning'}`}>
                      {room.status}
                    </span>
                  </div>
                  <p className="price">₦{room.price.toLocaleString()} <span>/ Night</span></p>
                  <p className="desc text-muted">{room.description}</p>
                  <button 
                    className="btn btn-secondary w-full mt-4" 
                    onClick={() => navigate(`/room/${room.id}`)}
                  >
                    View Details
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '4rem', background: '#fff', borderRadius: '12px'}}>
              <h3>No rooms found matching your criteria.</h3>
              <p>Try adjusting your filters or dates.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Rooms;
