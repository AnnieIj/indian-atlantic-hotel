import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import './Footer.css';

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.23-.9 4.46-2.37 6.11-1.48 1.67-3.6 2.82-5.84 3.03-2.25.21-4.57-.1-6.52-1.28-1.93-1.17-3.41-2.9-4.14-5.02C-1.07 17.56-.7 15.19.42 13.08c1.1-2.08 2.94-3.76 5.1-4.63 2.15-.87 4.54-1.01 6.78-.45v4.26c-1.14-.38-2.39-.37-3.47.1-.98.44-1.78 1.18-2.26 2.12-.49.94-.58 2.07-.31 3.09.28 1.01.91 1.9 1.77 2.47.85.57 1.91.81 2.93.71 1.02-.1 1.99-.54 2.74-1.25.75-.72 1.25-1.72 1.35-2.76.09-1.06-.06-2.14-.45-3.13-.01-4.55.01-9.1-.02-13.65z"/></svg>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
);

const Footer = () => {
  return (
    <footer className="footer" id="contact">
      <div className="container footer-content">
        <div className="footer-col">
          <Link to="/" className="logo footer-logo">
            <span className="logo-icon">Indian Atlantic Hotel</span>
            Indian Atlantic Hotel
          </Link>
          <p className="footer-desc">
            Luxury & Comfort in the Heart of Agbor. Experience exceptional hospitality tailored to your needs.
          </p>
          <div className="social-links">
            <a href="https://www.facebook.com/share/1B1DdrmZ9W/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer">
              <div className="social-icon-wrapper" style={{background: '#1877F2', color: '#fff'}}>
                <FacebookIcon />
              </div>
              <span>Facebook</span>
            </a>
            <a href="https://www.tiktok.com/@indian.atlantic.h" target="_blank" rel="noopener noreferrer">
              <div className="social-icon-wrapper" style={{background: '#000000', color: '#fff'}}>
                <TikTokIcon />
              </div>
              <span>TikTok</span>
            </a>
            <a href="https://www.instagram.com/indianatlantichotel?igsh=ZmdveHQybXkzMWM4&utm_source=qr" target="_blank" rel="noopener noreferrer">
              <div className="social-icon-wrapper" style={{background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', color: '#fff'}}>
                <InstagramIcon />
              </div>
              <span>Instagram</span>
            </a>
            <a href="https://wa.me/2347072662150" target="_blank" rel="noopener noreferrer">
              <div className="social-icon-wrapper" style={{background: '#25D366', color: '#fff'}}>
                <WhatsAppIcon />
              </div>
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
        
        <div className="footer-col">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/rooms">Our Rooms</Link></li>
            <li><Link to="/#about">About Us</Link></li>
            <li><Link to="/#contact">Contact</Link></li>
          </ul>
        </div>
        
        <div className="footer-col">
          <h3>Contact Info</h3>
          <ul className="contact-info">
            <li style={{alignItems: 'flex-start'}}><MapPin size={18} style={{flexShrink: 0, marginTop: '4px'}} /> <span>8 Cemetery Street, off Old Lagos Asaba Road, Agbor, Delta State</span></li>
            <li><Phone size={18} style={{flexShrink: 0}} /> <span>07072662150</span></li>
            <li><Mail size={18} style={{flexShrink: 0}} /> <span>indiaathletichotelandsuites@gmail.com</span></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Indian Atlantic Hotel. All rights reserved.</p>
        <Link to="/admin" className="admin-link">Admin Login</Link>
      </div>
    </footer>
  );
};

export default Footer;
