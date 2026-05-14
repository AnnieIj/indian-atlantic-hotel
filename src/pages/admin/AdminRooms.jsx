import React, { useContext, useState, useRef, useEffect } from 'react';
import { AppContext } from '../../context/AppContext';
import { api } from '../../services/api';
import { X, Save, Edit3, ImagePlus, Trash2 } from 'lucide-react';

const MAX_IMAGES = 4;

const AdminRooms = () => {
  const { rooms, updateRoom, fetchRooms } = useContext(AppContext);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({ price: 0, status: '' });
  const [previewImages, setPreviewImages] = useState([]); // array of remote URLs
  const [newFiles, setNewFiles] = useState([]); // array of File objects
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMessage, setUploadMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef(null);

  const handleEdit = async (room) => {
    setEditingRoom(room);
    setFormData({ price: room.price, status: room.status });
    setUploadMessage({ type: '', text: '' });
    setUploadProgress(0);
    setNewFiles([]);
    
    // Fetch gallery for the room
    try {
      const gallery = await api.get(`/rooms/${room.id}/gallery`);
      // Assuming gallery returns an array of objects like { id, url } or just string URLs
      setPreviewImages(gallery || []);
    } catch (error) {
      setPreviewImages(room.images ? room.images : (room.image ? [{url: room.image}] : []));
    }
  };

  const processFiles = (files) => {
    setUploadMessage({ type: '', text: '' });
    
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const validFiles = [];
    const invalidFiles = [];
    
    files.forEach(file => {
      if (!validTypes.includes(file.type)) {
        invalidFiles.push(`${file.name} (Invalid format)`);
      } else if (file.size > 5 * 1024 * 1024) {
        invalidFiles.push(`${file.name} (Exceeds 5MB)`);
      } else {
        validFiles.push(file);
      }
    });

    if (invalidFiles.length > 0) {
      setUploadMessage({ type: 'error', text: `Failed: ${invalidFiles.join(', ')}` });
    }

    const currentTotal = previewImages.length + newFiles.length;
    const remaining = MAX_IMAGES - currentTotal;
    if (remaining <= 0) return;

    const toRead = validFiles.slice(0, remaining);
    if (toRead.length === 0) return;

    setNewFiles(prev => [...prev, ...toRead]);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    processFiles(files);
    e.target.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleRemoveExistingImage = async (imageUrl) => {
    try {
      await api.delete(`/rooms/${editingRoom.id}/images?imageUrl=${encodeURIComponent(imageUrl)}`);
      setPreviewImages(prev => prev.filter(img => (img.url || img) !== imageUrl));
      await fetchRooms(); // Refresh rooms to ensure main image is updated
    } catch (error) {
      setUploadMessage({ type: 'error', text: 'Failed to delete image' });
    }
  };

  const handleRemoveNewFile = (index) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    try {
      setUploadProgress(10);
      // 1. Update room details
      await updateRoom(editingRoom.id, formData);
      setUploadProgress(50);
      
      // 2. Upload new images if any
      if (newFiles.length > 0) {
        const uploadData = new FormData();
        newFiles.forEach(file => {
          uploadData.append('images', file);
        });
        
        await api.post(`/rooms/${editingRoom.id}/images`, uploadData, true);
      }
      
      setUploadProgress(100);
      setTimeout(() => {
        setEditingRoom(null);
        fetchRooms();
      }, 500);
    } catch (error) {
      setUploadProgress(0);
      setUploadMessage({ type: 'error', text: error.message || 'Failed to save changes' });
    }
  };

  const combinedImages = [
    ...previewImages.map(img => ({ type: 'existing', url: img.url || img })),
    ...newFiles.map(file => ({ type: 'new', url: URL.createObjectURL(file), file }))
  ];

  return (
    <div className="admin-table-container">
      <div style={{padding: '1.5rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h3 style={{margin: 0, color: 'var(--color-primary-navy)'}}>Room Inventory</h3>
        <span className="badge badge-info">Total: {rooms.length}</span>
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
                <td><img src={room.image || 'https://via.placeholder.com/60x40?text=No+Image'} alt={room.name} style={{width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px'}} /></td>
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
        <div style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '1rem'}}>
          <div className="glass-panel" style={{width: '100%', maxWidth: '560px', padding: '2rem', background: '#fff', maxHeight: '90vh', overflowY: 'auto', borderRadius: '16px'}}>

            {/* Modal Header */}
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
              <h3 style={{margin: 0, color: 'var(--color-primary-navy)', fontSize: '1.1rem'}}>Edit Room: {editingRoom.name}</h3>
              <button onClick={() => setEditingRoom(null)} style={{background: 'none', border: 'none', cursor: 'pointer', color: '#64748b'}}><X size={20} /></button>
            </div>

            {/* Price */}
            <div style={{marginBottom: '1rem'}}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem', color: '#374151'}}>Price per Night (₦)</label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: parseInt(e.target.value)})}
                style={{width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none', fontSize: '1rem'}}
              />
            </div>

            {/* Status */}
            <div style={{marginBottom: '1.5rem'}}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem', color: '#374151'}}>Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                style={{width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '8px', outline: 'none', fontSize: '1rem'}}
              >
                <option value="available">Available</option>
                <option value="booked">Booked</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            {/* Image Upload Section */}
            <div style={{marginBottom: '1.5rem'}}>
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem'}}>
                <label style={{fontWeight: 600, fontSize: '0.875rem', color: '#374151'}}>
                  Room Gallery Images
                </label>
                <span style={{fontSize: '0.75rem', color: '#94a3b8', background: '#f1f5f9', padding: '0.2rem 0.6rem', borderRadius: '99px'}}>
                  {combinedImages.length} / {MAX_IMAGES}
                </span>
              </div>

              {/* Image Preview Grid */}
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '0.75rem'}}>
                {Array.from({ length: MAX_IMAGES }).map((_, i) => {
                  const img = combinedImages[i];
                  return (
                    <div
                      key={i}
                      style={{
                        aspectRatio: '1',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: img ? '2px solid var(--color-primary-gold)' : '2px dashed #cbd5e1',
                        background: img ? 'transparent' : '#f8fafc',
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {img ? (
                        <>
                          <img
                            src={img.url}
                            alt={`Room image ${i + 1}`}
                            style={{width: '100%', height: '100%', objectFit: 'cover', opacity: img.type === 'new' ? 0.7 : 1}}
                          />
                          <button
                            onClick={() => {
                              if (img.type === 'existing') {
                                handleRemoveExistingImage(img.url);
                              } else {
                                // Find index in newFiles
                                const newFileIndex = newFiles.findIndex(f => f === img.file);
                                handleRemoveNewFile(newFileIndex);
                              }
                            }}
                            style={{
                              position: 'absolute', top: '4px', right: '4px',
                              background: 'rgba(239,68,68,0.9)', color: '#fff',
                              border: 'none', borderRadius: '50%',
                              width: '22px', height: '22px',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                            }}
                            title="Remove image"
                          >
                            <Trash2 size={11} />
                          </button>
                          {i === 0 && (
                            <span style={{
                              position: 'absolute', bottom: '4px', left: '4px',
                              background: 'var(--color-primary-gold)', color: '#fff',
                              fontSize: '0.6rem', fontWeight: 700, padding: '1px 5px',
                              borderRadius: '4px', textTransform: 'uppercase'
                            }}>Main</span>
                          )}
                          {img.type === 'new' && (
                            <span style={{
                              position: 'absolute', top: '4px', left: '4px',
                              background: '#3b82f6', color: '#fff',
                              fontSize: '0.5rem', fontWeight: 700, padding: '1px 4px',
                              borderRadius: '3px', textTransform: 'uppercase'
                            }}>New</span>
                          )}
                        </>
                      ) : (
                        <span style={{fontSize: '0.65rem', color: '#94a3b8', textAlign: 'center', padding: '0.25rem'}}>
                          Slot {i + 1}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Upload Button & Area */}
              {combinedImages.length < MAX_IMAGES && (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  style={{
                    border: isDragging ? '2px dashed var(--color-primary-gold)' : '2px dashed #cbd5e1',
                    borderRadius: '8px',
                    padding: '1.5rem',
                    textAlign: 'center',
                    background: isDragging ? 'rgba(197,160,102,0.1)' : '#f8fafc',
                    transition: 'all 0.2s ease',
                    marginBottom: '1rem'
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg, image/png, image/webp"
                    multiple
                    style={{display: 'none'}}
                    onChange={handleImageUpload}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <ImagePlus size={32} color={isDragging ? 'var(--color-primary-gold)' : '#94a3b8'} />
                    <p style={{ margin: 0, fontWeight: 600, color: '#374151', fontSize: '0.9rem' }}>
                      Drag & Drop images here
                    </p>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem' }}>or</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      style={{
                        padding: '0.5rem 1rem',
                        border: '1.5px solid var(--color-primary-gold)',
                        borderRadius: '6px', background: 'transparent',
                        color: 'var(--color-primary-gold)', fontWeight: 600,
                        fontSize: '0.8rem', cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Browse Files
                    </button>
                    <p style={{fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.5rem', textAlign: 'center'}}>
                      Supports JPG, PNG, WEBP (Max 5MB). {MAX_IMAGES - combinedImages.length} slot{MAX_IMAGES - combinedImages.length !== 1 ? 's' : ''} remaining.
                    </p>
                  </div>
                </div>
              )}

              {/* Progress and Messages */}
              {uploadProgress > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'var(--color-primary-gold)', transition: 'width 0.2s ease' }} />
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem', textAlign: 'right' }}>Saving... {uploadProgress}%</p>
                </div>
              )}
              
              {uploadMessage.text && (
                <div style={{ 
                  padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.8rem',
                  background: uploadMessage.type === 'success' ? '#dcfce7' : '#fee2e2',
                  color: uploadMessage.type === 'success' ? '#166534' : '#991b1b',
                  border: `1px solid ${uploadMessage.type === 'success' ? '#bbf7d0' : '#fecaca'}`
                }}>
                  {uploadMessage.text}
                </div>
              )}
            </div>

            {/* Save Button */}
            <button
              className="btn btn-primary"
              style={{width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.9rem'}}
              onClick={handleSave}
            >
              <Save size={18} /> Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRooms;
