import React, { useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { differenceInDays } from 'date-fns';
import { CheckCircle } from 'lucide-react';
import './Checkout.css';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const roomId = params.get('roomId');
  const checkIn = params.get('checkIn');
  const checkOut = params.get('checkOut');

  const { rooms, createBooking } = useContext(AppContext);
  const [room, setRoom] = useState(null);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const foundRoom = rooms.find(r => r.id === roomId);
    if (foundRoom) setRoom(foundRoom);
  }, [roomId, rooms]);

  const [paymentMethod, setPaymentMethod] = useState('Bank Transfer');
  const [receipt, setReceipt] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadMessage, setUploadMessage] = useState('');

  const handleReceiptUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      setUploadMessage('Invalid format. Please upload JPG, PNG, WEBP, or PDF.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadMessage('File size exceeds 5MB limit.');
      return;
    }
    
    setUploadMessage('');
    setUploadProgress(10);
    setReceipt(null);
    
    let currentProgress = 10;
    const interval = setInterval(() => {
      currentProgress += 30;
      if (currentProgress >= 100) {
        clearInterval(interval);
        setUploadProgress(100);
        setTimeout(() => {
          setReceipt(file);
          setUploadProgress(0);
        }, 500);
      } else {
        setUploadProgress(currentProgress);
      }
    }, 200);
  };

  if (!room || !checkIn || !checkOut) return <div className="pt-32 text-center">Invalid booking details.</div>;

  const days = differenceInDays(new Date(checkOut), new Date(checkIn));
  const total = days * room.price;

  const handlePayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    const bookingData = {
      roomId: room.id,
      roomName: room.name,
      checkIn,
      checkOut,
      guestName: `${formData.firstName} ${formData.lastName}`,
      guestEmail: formData.email,
      guestPhone: formData.phone,
      paymentMethod,
      receipt: receipt ? receipt.name : null,
      status: paymentMethod === 'Bank Transfer' ? 'pending' : 'confirmed',
      paymentStatus: paymentMethod === 'Bank Transfer' ? 'pending' : 'success',
      totalPrice: total,
      totalAmount: total,
    };
    
    const res = await createBooking(bookingData);
    setIsProcessing(false);
    
    if (res.success) {
      navigate(`/booking-status/${res.booking.id}`);
    } else {
      alert(res.message);
    }
  };

  if (isSuccess) {
    return (
      <main className="checkout-page bg-light pt-32 pb-12">
        <div className="container text-center py-12">
          <CheckCircle size={64} className="text-gold mx-auto mb-4" />
          <h2>Booking Submitted!</h2>
          <p className="mt-4">Thank you for choosing Indian Atlantic Hotel.</p>
          {paymentMethod === 'Bank Transfer' ? (
            <p>Your booking is pending verification of your transfer. We will contact you shortly.</p>
          ) : (
            <p>Your payment of ₦{total.toLocaleString()} was successful.</p>
          )}
          <button className="btn btn-primary mt-8" onClick={() => navigate('/')}>Return Home</button>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page bg-light pt-32 pb-12">
      <div className="container checkout-container">
        <div className="checkout-form glass-panel">
          <h2 style={{color: 'var(--color-primary-navy)'}}>Guest Details</h2>
          <form onSubmit={handlePayment} className="mt-6">
            <div className="form-grid">
              <div className="form-group-light">
                <label>First Name</label>
                <input type="text" required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
              </div>
              <div className="form-group-light">
                <label>Last Name</label>
                <input type="text" required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
              </div>
            </div>
            <div className="form-group-light">
              <label>Email Address</label>
              <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="form-group-light">
              <label>Phone Number</label>
              <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
            
            <div className="payment-section mt-8">
              <h3 className="mb-4" style={{color: 'var(--color-primary-navy)'}}>Select Payment Method</h3>
              
              <div className="payment-methods-grid">
                <div 
                  className={`payment-method-card ${paymentMethod === 'Bank Transfer' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('Bank Transfer')}
                >
                  <div className="method-icon"><CheckCircle size={20} /></div>
                  <div className="method-info">
                    <h4>Bank Transfer</h4>
                    <p>Pay via Mobile App or Bank</p>
                  </div>
                  <div className="status-badge active">Active</div>
                </div>

                <div className="payment-method-card disabled">
                  <div className="method-icon"><CheckCircle size={20} /></div>
                  <div className="method-info">
                    <h4>Paystack</h4>
                    <p>Pay with Card/Transfer</p>
                  </div>
                  <div className="status-badge upcoming">Coming Soon</div>
                </div>
              </div>

              {paymentMethod === 'Bank Transfer' && (
                <div className="bank-details-panel mt-6">
                  <div className="bank-details-header">
                    <h4>Transfer Details</h4>
                    <p className="text-muted text-sm">Please transfer the exact total amount to the account below.</p>
                  </div>
                  <div className="bank-info-grid mt-4">
                    <div className="bank-info-item">
                      <span className="label">Bank Name</span>
                      <span className="value">Moniepoint</span>
                    </div>
                    <div className="bank-info-item">
                      <span className="label">Account Name</span>
                      <span className="value">Indian Atlantic Kitchen 2</span>
                    </div>
                    <div className="bank-info-item">
                      <span className="label">Account Number</span>
                      <span className="value accent">5070119651</span>
                    </div>
                  </div>
                  
                  <div className="receipt-upload mt-6">
                    <label>Upload Payment Receipt (Optional)</label>
                    <div className="upload-box mt-2">
                      <input 
                        type="file" 
                        id="receipt" 
                        className="hidden" 
                        onChange={handleReceiptUpload}
                        accept="image/jpeg,image/png,image/webp,.pdf"
                      />
                      <label htmlFor="receipt" className="upload-label" style={{ display: 'block', padding: '1rem', border: '1px dashed #ccc', textAlign: 'center', cursor: 'pointer', borderRadius: '8px' }}>
                        {receipt ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#10b981' }}>
                            <CheckCircle size={16} />
                            <span>{receipt.name}</span>
                          </div>
                        ) : 'Choose file or drag & drop'}
                      </label>
                    </div>
                    {uploadProgress > 0 && (
                      <div style={{ marginTop: '0.5rem', width: '100%', height: '4px', background: '#e2e8f0', borderRadius: '2px' }}>
                        <div style={{ width: `${uploadProgress}%`, height: '100%', background: '#10b981', transition: 'width 0.2s' }}></div>
                      </div>
                    )}
                    {uploadMessage && (
                      <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem' }}>{uploadMessage}</p>
                    )}
                  </div>
                  
                  <p className="payment-note mt-4">
                    <strong>Note:</strong> Please send proof of payment after transfer.
                  </p>
                </div>
              )}

              <button type="submit" className="btn btn-primary w-full mt-8" disabled={isProcessing}>
                {isProcessing ? 'Processing...' : paymentMethod === 'Bank Transfer' ? 'I Have Paid' : `Pay ₦${total.toLocaleString()} Now`}
              </button>
            </div>
          </form>
        </div>
        
        <div className="checkout-summary glass-panel-dark">
          <h3>Booking Summary</h3>
          <div className="summary-room mt-4">
            <img src={room.image} alt={room.name} />
            <div>
              <h4>{room.name}</h4>
              <p>₦{room.price.toLocaleString()} / night</p>
            </div>
          </div>
          
          <div className="summary-dates mt-6">
            <div className="date-box">
              <p className="label">Check-in</p>
              <p className="value">{checkIn}</p>
            </div>
            <div className="date-box">
              <p className="label">Check-out</p>
              <p className="value">{checkOut}</p>
            </div>
          </div>
          
          <div className="summary-totals mt-6">
            <div className="flex justify-between mb-2 text-light">
              <span style={{color: '#fff'}}>{room.price.toLocaleString()} x {days} nights</span>
              <span style={{color: '#fff'}}>₦{total.toLocaleString()}</span>
            </div>
            <div className="divider-sm"></div>
            <div className="flex justify-between mt-2 total" style={{color: 'var(--color-primary-gold)', fontWeight: 'bold', fontSize: '1.25rem'}}>
              <span>Total</span>
              <span>₦{total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Checkout;
