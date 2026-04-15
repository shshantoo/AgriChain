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
      image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2000&auto=format&fit=crop',
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
        background: 'var(--white)',
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
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <a href="#about-us" className="btn btn-outline" style={{ textDecoration: 'none' }}>About Us</a>
          <Link to="/login" className="btn btn-outline" style={{ textDecoration: 'none' }}>Login</Link>
          <Link to="/register" className="btn btn-primary" style={{ textDecoration: 'none' }}>Sign Up</Link>
        </div>
      </nav>

      {/* Hero Slider */}
      <div style={{
        height: 'calc(100vh - 70px)',
        minHeight: '600px',
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

      {/* Features Section */}
      <section style={{ padding: '80px 20px', background: 'var(--white)', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.5rem', color: 'var(--text-dark)', marginBottom: 20 }}>Empowering the Agricultural Supply Chain</h2>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', maxWidth: 800, margin: '0 auto 50px' }}>
          AgriChain provides an end-to-end traceablity platform connecting farmers, inspectors, warehouses, transports, and markets into a single, cohesive, data-driven ecosystem.
        </p>

        <div style={{ display: 'flex', gap: 30, justifyContent: 'center', flexWrap: 'wrap', maxWidth: 1200, margin: '0 auto' }}>
          {[
            { img: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=600&q=80', title: 'Farm to Facility', desc: 'Securely log sowing, harvests, and agricultural inputs with absolute precision.' },
            { img: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?w=600&q=80', title: 'Transparent Logistics', desc: 'Real-time inventory tracking, warehouse management, and seamless fleet routing.' },
            { img: '/predictive.png', title: 'Predictive Analytics', desc: 'Utilize ML-driven forecasts for crop rot rates, logistics costs, and market demand.' }
          ].map((item, i) => (
            <div key={i} style={{ flex: '1 1 300px', maxWidth: 380, background: 'var(--cream)', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow)', transition: 'transform 0.3s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-5px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
              <img src={item.img} alt={item.title} style={{ width: '100%', height: 200, objectFit: 'cover' }} />
              <div style={{ padding: 24 }}>
                <h3 style={{ fontSize: '1.25rem', marginBottom: 12, color: 'var(--text-dark)' }}>{item.title}</h3>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About Us Section */}
      <section id="about-us" style={{ padding: '40px 20px', background: '#f9fafb', textAlign: 'center', borderTop: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: '2rem', color: 'var(--text-dark)', marginBottom: 10 }}>About Us</h2>
        <p style={{ fontSize: '1rem', color: 'var(--text-muted)', maxWidth: 800, margin: '0 auto 20px', lineHeight: 1.5 }}>
          We are a passionate bunch of tech enthusiasts from university who came together to build this project. Our mission is to explore how modern technology can streamline and revolutionize agricultural supply chains. Meet our team:
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
          <div className="logo" style={{ margin: 0, fontSize: '1.8rem', paddingBottom: '5px' }}>
            <span style={{ background: 'var(--green-dark)', padding: '6px 16px', borderRadius: '8px', display: 'inline-block' }}>
              <span style={{ color: '#ffffff' }}>Agri</span><span style={{ color: '#f59e0b' }}>Chain</span>
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 15, justifyContent: 'center', flexWrap: 'wrap', maxWidth: 1000, margin: '0 auto' }}>
          {[
            { name: "Mohammed Rabbi Shanto", role: "Lead Systems Architect", email: "2222818@iub.edu.bd", image: "https://lh3.googleusercontent.com/a-/ALV-UjW-APoiyL3IjC2I5_A6PVJIiiUSU7Zri13LetX9NX0lbR-Bd_4=s544-p-k-rw-no" },
            { name: "Member 2", role: "Frontend UI/UX Eng", email: "[EMAIL_ADDRESS]" },
            { name: "Member 3", role: "Backend Database Dev", email: "[EMAIL_ADDRESS]" },
            { name: "Member 4", role: "AI & Predictve Models", email: "[EMAIL_ADDRESS]" },
            { name: "Member 5", role: "AgOps & Logistics", email: "[EMAIL_ADDRESS]" }
          ].map((team, i) => (
            <div key={i} style={{ flex: '1 1 180px', background: 'var(--white)', padding: 16, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid var(--border)' }}>
              {team.image ? (
                <img src={team.image} alt={team.name} style={{ width: 60, height: 60, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 12px', display: 'block', border: '2px solid var(--border)' }} />
              ) : (
                <div style={{ width: 60, height: 60, borderRadius: '50%', background: 'var(--green-pale)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--green-dark)' }}>
                  {team.name.charAt(0)}
                </div>
              )}
              <h4 style={{ fontSize: '1rem', color: 'var(--text-dark)', marginBottom: 2 }}>{team.name}</h4>
              <div style={{ fontSize: '0.75rem', color: 'var(--green-mid)', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase' }}>{team.role}</div>
              <a href={`mailto:${team.email}`} style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'none' }}>{team.email}</a>
            </div>
          ))}
        </div>
      </section>

      {/* Footer minimal */}
      <footer style={{ padding: 24, background: 'var(--green-dark)', color: 'rgba(255,255,255,0.7)', textAlign: 'center', fontSize: '0.9rem' }}>
        © {new Date().getFullYear()} AgriChain Platforms. All rights reserved.
      </footer>
    </div>
  );
};

export default Home;
