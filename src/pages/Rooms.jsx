import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SlidersHorizontal } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import Seo from '../components/Seo';
import './Rooms.css';

const Rooms = () => {
  const navigate = useNavigate();
  const { rooms, loading, fetchRooms, roomsError } = useContext(AppContext);

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

  const filteredRooms = rooms
    .filter(r => {
      const categoryMatch = filter === 'All' || r.type === filter;
      const priceMatch = r.price <= maxPrice;
      return categoryMatch && priceMatch;
    })
    .sort((a, b) => {
      const roomA = a.roomNumber ? String(a.roomNumber) : (a.name ? String(a.name) : '');
      const roomB = b.roomNumber ? String(b.roomNumber) : (b.name ? String(b.name) : '');
      
      const numA = parseInt(roomA.replace(/\D/g, ''), 10);
      const numB = parseInt(roomB.replace(/\D/g, ''), 10);
      
      if (!isNaN(numA) && !isNaN(numB)) {
        if (numA !== numB) {
          return numA - numB;
        }
      }
      return roomA.localeCompare(roomB, undefined, { numeric: true, sensitivity: 'base' });
    });


  const types = ['All', 'Suite', 'Double Executive', 'Executive', 'Super Deluxe', 'Deluxe', 'Standard'];

  return (
    <main className="rooms-page bg-light" style={{ minHeight: '80vh' }}>
      <Seo
        title="Rooms & Suites in Agbor, Delta State"
        description="Browse deluxe rooms, executive rooms, and suites at Indian Atlantic Hotel and Suites in Agbor, Delta State. Compare prices, check availability, and book the perfect room for your stay in Agbor."
        path="/rooms"
      />
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
        ) : roomsError ? (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem', margin: '2rem auto', maxWidth: '600px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <h3 style={{ color: '#ef4444', marginBottom: '1rem' }}>Unable to Load Rooms</h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              The website could not fetch the rooms from the backend database:<br />
              <code style={{ background: '#fff1f2', padding: '4px 8px', borderRadius: '4px', color: '#e11d48', fontSize: '0.85rem', display: 'inline-block', marginTop: '0.5rem', border: '1px solid #ffe4e6' }}>{roomsError}</code>
            </p>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '2rem', lineHeight: '1.5' }}>
              <strong>Troubleshooting Tip:</strong> If the hotel website is live on a custom domain, the backend server must be configured to allow CORS requests from your custom domain origin.
            </p>
            <button className="btn btn-primary" onClick={fetchRooms}>Retry Connection</button>
          </div>
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
                      loading="lazy"
                      decoding="async"
                      width="800"
                      height="250"
                      style={{ objectFit: 'cover', height: '250px', width: '100%' }}
                      onLoad={(e) => e.target.classList.add('loaded')}
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