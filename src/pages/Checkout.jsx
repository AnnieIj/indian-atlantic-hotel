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
      status: 'confirmed', // Simulation: confirmed after payment success
      paymentStatus: 'success',
      totalPrice: total,
      totalAmount: total,
    };
    
    const res = await createBooking(bookingData);
    setIsProcessing(false);
    
    if (res.success) {
      setIsSuccess(true);
    } else {
      alert(res.message);
    }
  };

  if (isSuccess) {
    return (
      <main className="checkout-page bg-light pt-32 pb-12">
        <div className="container text-center py-12">
          <CheckCircle size={64} className="text-gold mx-auto mb-4" />
          <h2>Booking Confirmed!</h2>
          <p className="mt-4">Thank you for choosing Indian Atlantic Hotel.</p>
          <p>Your payment of ₦{total.toLocaleString()} was successful.</p>
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
              <h3 style={{color: 'var(--color-primary-navy)'}}>Payment Details</h3>
              <p className="text-muted text-sm mb-4">Secured by Paystack Mock</p>
              <button type="submit" className="btn btn-primary w-full" disabled={isProcessing}>
                {isProcessing ? 'Processing Payment...' : `Pay ₦${total.toLocaleString()} Now`}
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
