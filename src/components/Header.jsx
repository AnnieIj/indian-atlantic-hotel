import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import './Header.css';

const Header = () => {
  const { theme, toggleTheme } = useContext(AppContext);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (e, sectionId) => {
    e.preventDefault();
    setIsMenuOpen(false);

    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const isNotHome = location.pathname !== '/';

  return (
    <header className={`header ${isScrolled || isNotHome ? 'scrolled glass-panel' : ''} ${isNotHome ? 'is-not-home' : ''}`}>
      <div className="container header-container">
        <Link 
          to="/" 
          className="logo"
          onClick={() => {
            if (location.pathname === '/') {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
        >
          <img src="/logo.png" alt="Indian Atlantic Hotel" className="logo-img" />
        </Link>
        
        <nav className={`nav ${isMenuOpen ? 'open' : ''}`}>
          <Link 
            to="/" 
            className={location.pathname === '/' ? 'active' : ''} 
            onClick={(e) => {
              setIsMenuOpen(false);
              if (location.pathname === '/') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
          >
            Home
          </Link>
          <Link to="/rooms" className={location.pathname === '/rooms' ? 'active' : ''} onClick={() => setIsMenuOpen(false)}>Rooms</Link>
          <a href="#about" onClick={(e) => scrollToSection(e, 'about')}>About</a>
          <a href="#contact" onClick={(e) => scrollToSection(e, 'contact')}>Contact</a>
          <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
            <button 
              onClick={toggleTheme} 
              className="theme-toggle"
              aria-label="Toggle Theme"
              style={{background: 'none', color: 'inherit', display: 'flex', alignItems: 'center'}}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <Link to="/rooms" className="btn btn-primary" onClick={() => setIsMenuOpen(false)}>Book Now</Link>
          </div>
        </nav>

        <button className="mobile-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
};

export default Header;
