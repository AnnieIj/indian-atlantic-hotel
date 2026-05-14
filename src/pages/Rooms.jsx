import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SlidersHorizontal } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import './Rooms.css';

const Rooms = () => {
  const navigate = useNavigate();
  const { rooms, loading, fetchRooms } = useContext(AppContext);

  const [filter, setFilter] = useState('All');
  const [maxPrice, setMaxPrice] = useState(150000);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    // Only fetch if rooms haven't loaded yet (AppContext fetches on mount,
    // but this is a fallback for direct navigation to /rooms)
    if (rooms.length === 0) {
      fetchRooms();
    }
  }, []);

  const filteredRooms = rooms.filter(r => {
    const categoryMatch = filter === 'All' || r.type === filter;
    const priceMatch = r.price <= maxPrice;
    return categoryMatch && priceMatch;
  });

  const types = ['All', 'Suite', 'Double Executive', 'Executive', 'Super Deluxe', 'Deluxe', 'Standard'];

  return (
    <main className="rooms-page bg-light" style={{ minHeight: '80vh' }}>
      <div className="container pt-32 pb-12">
        <div className="rooms-header mb-8">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2>Find Your Perfect Room</h2>
            <button className="btn btn-outline" onClick={() => setIsFilterOpen(!isFilterOpen)}>
              <SlidersHorizontal size={18} /> Filters
            </button>
          </div>

          {isFilterOpen && (
            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
              <label>Price Range: ₦{maxPrice.toLocaleString()}</label>
              <input
                type="range"
                min="20000"
                max="150000"
                step="5000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                style={{ width: '100%', marginTop: '1rem' }}
              />
              <button
                className="btn btn-primary mt-3"
                onClick={() => { setFilter('All'); setMaxPrice(150000); }}
              >
                Reset Filters
              </button>
            </div>
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

        {loading ? (
          <p style={{ textAlign: "center", padding: '3rem' }}>Loading rooms from server...</p>
        ) : (
          <div className="rooms-grid">
            {filteredRooms.length === 0 ? (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem' }}>
                <h3>No rooms match your search</h3>
              </div>
            ) : (
              filteredRooms.map((room, index) => (
                <motion.div
                  key={room.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="room-card"
                >
                  <div style={{ position: 'relative' }}>
                    <img
                      src={room.image || 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=80'}
                      alt={room.name}
                      className="room-img"
                      style={{ objectFit: 'cover', height: '250px', width: '100%' }}
                    />
                    <span 
                      style={{
                        position: 'absolute', top: '10px', right: '10px', 
                        padding: '0.3rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold',
                        backgroundColor: room.status === 'available' ? '#10b981' : room.status === 'booked' ? '#ef4444' : '#f59e0b',
                        color: 'white'
                      }}
                    >
                      {room.status ? room.status.toUpperCase() : 'UNKNOWN'}
                    </span>
                  </div>

                  <div className="room-info" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{room.name}</h3>
                      <span style={{ fontSize: '0.85rem', color: '#64748b', backgroundColor: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                        {room.type || 'Standard'}
                      </span>
                    </div>

                    <p style={{ fontWeight: "bold", color: 'var(--color-primary-navy)', fontSize: '1.1rem', margin: '0.5rem 0' }}>
                      ₦{room.price?.toLocaleString()} <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'normal' }}>/ Night</span>
                    </p>

                    <p className="desc" style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {room.description || "No description available"}
                    </p>

                    <button
                      className="btn btn-secondary w-full"
                      onClick={() => navigate(`/room/${room.id}`)}
                    >
                      View Details
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
};

export default Rooms;