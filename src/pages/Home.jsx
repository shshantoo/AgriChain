import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?q=80&w=2000&auto=format&fit=crop',
      title: 'Smart Agricultural Management',
      subtitle: 'Connecting farmers, warehouses, and suppliers seamlessly.'
    },
    {
      image: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?q=80&w=2000&auto=format&fit=crop',
      title: 'Real-time Tracking',
      subtitle: 'Monitor stock, QA checks, and logistics instantly.'
    },
    {
      image: 'https://images.unsplash.com/photo-1595166419572-c0eab9baf5dc?q=80&w=2000&auto=format&fit=crop',
      title: 'Data-Driven Yields',
      subtitle: 'Harness predictive AI for dynamic crop forecasting.'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Slide every 5 seconds
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar */}
      <nav style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '20px 50px', 
        background: 'var(--surface)', 
        borderBottom: '1px solid var(--border)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000
      }}>
        <div className="logo" style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)' }}>
          Agri<span style={{ color: 'var(--primary)' }}>Chain</span>
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link to="/login" className="btn btn-outline" style={{ textDecoration: 'none' }}>Login</Link>
          <Link to="/register" className="btn btn-primary" style={{ textDecoration: 'none' }}>Sign Up</Link>
        </div>
      </nav>

      {/* Hero Slider */}
      <div style={{ 
        flex: 1, 
        marginTop: '70px', 
        position: 'relative', 
        overflow: 'hidden',
        background: '#000'
      }}>
        {slides.map((slide, index) => (
          <div 
            key={index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: index === currentSlide ? 1 : 0,
              transition: 'opacity 1s ease-in-out',
              backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url(${slide.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center',
              color: 'white',
              padding: '0 20px'
            }}
          >
            <h1 style={{ 
              fontSize: '4rem', 
              marginBottom: '20px', 
              fontWeight: 800,
              transform: index === currentSlide ? 'translateY(0)' : 'translateY(30px)',
              transition: 'transform 1s ease-in-out, opacity 1s ease-in-out',
              opacity: index === currentSlide ? 1 : 0,
              transitionDelay: '0.3s'
            }}>
              {slide.title}
            </h1>
            <p style={{ 
              fontSize: '1.5rem', 
              marginBottom: '40px', 
              maxWidth: '600px',
              transform: index === currentSlide ? 'translateY(0)' : 'translateY(30px)',
              transition: 'transform 1s ease-in-out, opacity 1s ease-in-out',
              opacity: index === currentSlide ? 1 : 0,
              transitionDelay: '0.5s'
            }}>
              {slide.subtitle}
            </p>
            <div style={{
              transform: index === currentSlide ? 'translateY(0)' : 'translateY(30px)',
              transition: 'transform 1s ease-in-out, opacity 1s ease-in-out',
              opacity: index === currentSlide ? 1 : 0,
              transitionDelay: '0.7s'
            }}>
               <Link to="/register" className="btn btn-primary" style={{ padding: '15px 30px', fontSize: '1.1rem' }}>
                Join AgriChain Today
               </Link>
            </div>
          </div>
        ))}
        
        {/* Slider Controls */}
        <div style={{
          position: 'absolute',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '10px'
        }}>
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                border: 'none',
                background: index === currentSlide ? 'var(--primary)' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                transition: 'background 0.3s ease'
              }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
