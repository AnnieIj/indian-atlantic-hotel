import React, { useState } from 'react';
import { Map, Share2, Bookmark, Star, MapPin, Phone } from 'lucide-react';
import './BusinessProfileWidget.css';

const BusinessProfileWidget = () => {
  const [activeTab, setActiveTab] = useState('Overview');

  const tabs = ['Overview', 'About', 'Photos', 'Reviews'];

  return (
    <div className="google-profile-widget">
      <div className="gp-header">
        <h2 className="gp-title">Indian Atlantic Hotel And Suites</h2>
        <div className="gp-rating-container">
          <span className="gp-rating-score">3.8</span>
          <Star className="gp-star-icon" size={14} fill="#fbbc04" color="#fbbc04" />
          <a href="#reviews" className="gp-review-count">(10)</a>
          <span className="gp-category">· Hotel</span>
        </div>
      </div>

      <div className="gp-tabs">
        {tabs.map(tab => (
          <button 
            key={tab} 
            className={`gp-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="gp-content">
        {activeTab === 'Overview' && (
          <div className="gp-overview">
            <div className="gp-photos-grid">
              <div className="gp-photo-main">
                <img src="/indian atlantic pics/hero 1.jpeg" alt="Lobby" />
              </div>
              <div className="gp-photo-side">
                <img src="/indian atlantic pics/PS 2.jpeg" alt="Room" />
              </div>
            </div>

            <div className="gp-action-buttons">
              <a href="https://maps.google.com/?q=Indian+Atlantic+Hotel+And+Suites+Agbor" target="_blank" rel="noreferrer" className="gp-action-btn">
                <div className="gp-action-icon-circle">
                  <Map size={24} color="#1a73e8" />
                </div>
                <span>DIRECTIONS</span>
              </a>
              <button className="gp-action-btn" onClick={() => navigator.clipboard.writeText(window.location.href).then(() => alert("Link copied!"))}>
                <div className="gp-action-icon-circle">
                  <Share2 size={24} color="#1a73e8" />
                </div>
                <span>SHARE</span>
              </button>
              <button className="gp-action-btn">
                <div className="gp-action-icon-circle">
                  <Bookmark size={24} color="#1a73e8" />
                </div>
                <span>SAVE</span>
              </button>
            </div>

            <div className="gp-info-list">
              <div className="gp-info-item">
                <MapPin size={20} color="#1a73e8" />
                <span>7623+9JC, Odeh St, Boji Boji, Agbor 321103, Delta</span>
              </div>
              <div className="gp-info-item">
                <Phone size={20} color="#1a73e8" />
                <span>Contact us for bookings</span>
              </div>
            </div>
            
            <div className="gp-description-snippet">
              Indian Atlantic Hotel and Suites - Experience luxury like never before in the heart of Agbor. 24/7 power, maximum security, and world-class hospitality.
            </div>
          </div>
        )}

        {activeTab === 'About' && (
          <div className="gp-about">
            <h3>About Indian Atlantic Hotel and Suites</h3>
            <p>Experience luxury like never before in the heart of Agbor. 24/7 power, maximum security, and world-class hospitality. Located securely in Agbor, the Indian Atlantic Hotel and Suites offers an unrivaled blend of modern luxury and serene comfort.</p>
          </div>
        )}

        {activeTab === 'Photos' && (
          <div className="gp-photos-tab">
            <div className="gp-photo-gallery">
              <img src="/indian atlantic pics/hero 1.jpeg" alt="Hotel View" />
              <img src="/indian atlantic pics/PS 2.jpeg" alt="Hotel Room" />
              <img src="/indian atlantic pics/PS 3.jpeg" alt="Hotel Interior" />
              <img src="/indian atlantic pics/PS 4.jpeg" alt="Hotel Facility" />
            </div>
          </div>
        )}

        {activeTab === 'Reviews' && (
          <div className="gp-reviews">
            <div className="gp-rating-summary">
              <div className="gp-rating-large">3.8</div>
              <div className="gp-rating-stars">
                {[1,2,3].map(i => <Star key={i} size={16} fill="#fbbc04" color="#fbbc04"/>)}
                <Star size={16} fill="url(#halfGradient)" color="#fbbc04"/>
                <Star size={16} color="#dadce0"/>
              </div>
              <div className="gp-rating-total">10 reviews</div>
            </div>
            <p className="gp-review-note">Detailed reviews can be found on our Google Business Profile or our testimonials section below.</p>
            
            {/* SVG gradient for half star */}
            <svg width="0" height="0">
              <defs>
                <linearGradient id="halfGradient">
                  <stop offset="50%" stopColor="#fbbc04" />
                  <stop offset="50%" stopColor="transparent" stopOpacity="1" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessProfileWidget;
