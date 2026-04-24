import React, { useContext, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import { X, Save, Edit3 } from 'lucide-react';

const AdminRooms = () => {
  const { rooms, updateRoom } = useContext(AppContext);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({ price: 0, status: '' });

  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData({ price: room.price, status: room.status });
  };

  const handleSave = () => {
    updateRoom(editingRoom.id, formData);
    setEditingRoom(null);
  };

  return (
    <div className="admin-table-container">
      <div style={{padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h3 style={{margin: 0, color: 'var(--color-primary-navy)'}}>Room Inventory</h3>
        <span className="badge badge-info">Total: {rooms.length}/28</span>
      </div>
      <div style={{overflowX: 'auto'}}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Type</th>
              <th>Capacity</th>
              <th>Price / Night</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map(room => (
              <tr key={room.id}>
                <td><img src={room.image} alt={room.name} style={{width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px'}} /></td>
                <td>{room.name}</td>
                <td>{room.type}</td>
                <td>{room.capacity}</td>
                <td>₦{room.price.toLocaleString()}</td>
                <td>
                  <span className={`badge ${room.status === 'available' ? 'badge-success' : room.status === 'booked' ? 'badge-danger' : 'badge-warning'}`}>
                    {room.status}
                  </span>
                </td>
                <td>
                  <button className="btn btn-outline" style={{padding: '0.25rem 0.75rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem'}} onClick={() => handleEdit(room)}>
                    <Edit3 size={14} /> Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingRoom && (
        <div style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000}}>
          <div className="glass-panel" style={{width: '400px', padding: '2rem', background: '#fff'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
              <h3 style={{margin: 0}}>Edit Room: {editingRoom.name}</h3>
              <button onClick={() => setEditingRoom(null)} style={{background: 'none', border: 'none', cursor: 'pointer'}}><X /></button>
            </div>
            
            <div style={{marginBottom: '1rem'}}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>Price per Night (₦)</label>
              <input 
                type="number" 
                value={formData.price} 
                onChange={(e) => setFormData({...formData, price: parseInt(e.target.value)})}
                style={{width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '4px'}}
              />
            </div>

            <div style={{marginBottom: '2rem'}}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>Status</label>
              <select 
                value={formData.status} 
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                style={{width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '4px'}}
              >
                <option value="available">Available</option>
                <option value="booked">Booked</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            <button className="btn btn-primary" style={{width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'}} onClick={handleSave}>
              <Save size={18} /> Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRooms;
