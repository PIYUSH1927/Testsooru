import React, { useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useDarkMode } from '../contexts/DarkModeContext';
import ValueCard from '../components/ValueCard';
import FeatureCard from '../components/FeatureCard';
import { ReactNode } from 'react';
import './AboutUs.css';

interface InfoCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color?: string;
  delay?: number;
  className?: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, description, icon, color = "text-blue-600", delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8, delay }}
    className="about-card"
    
  >
    <div className="card-header">
      <span className={`text-3xl mb-4 block ${color}`}>{icon}</span>
      <h3 className="card-title">{title}</h3>
    </div>
    <p className="card-description">{description}</p>
  </motion.div>
);

interface SectionTitleProps {
  children: React.ReactNode;
  delay?: number;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ children, delay = 0 }) => (
  <motion.h2
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8, delay }}
    className="section-title"
  >
    {children}
  </motion.h2>
);

const AboutContent: React.FC = () => {
  const { isDarkMode } = useDarkMode();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });
  useEffect(() => {
    const applyDarkModeStyles = () => {
      if (isDarkMode) {
        document.querySelectorAll('.about-container').forEach(container => {
          (container as HTMLElement).style.backgroundColor = '#000000';
        });

        document.querySelectorAll('.about-card, .value-card').forEach(card => {
          (card as HTMLElement).style.background = 'rgba(29, 29, 31, 0.8)';
          (card as HTMLElement).style.backdropFilter = 'blur(20px)';
          (card as HTMLElement).setAttribute('style', 
            `${(card as HTMLElement).getAttribute('style') || ''}
            -webkit-backdrop-filter: blur(20px);`
          );
          (card as HTMLElement).style.border = '1px solid rgba(255, 255, 255, 0.1)';
          (card as HTMLElement).style.color = '#ffffff';
        });

        document.querySelectorAll('.feature-card').forEach(card => {
          (card as HTMLElement).style.backgroundColor = '#084798';
          (card as HTMLElement).style.color = 'white';
          (card as HTMLElement).style.border = '1px solid rgba(255, 255, 255, 0.1)';
        });

        document.querySelectorAll('.feature-item, .value-item').forEach(item => {
          (item as HTMLElement).style.background = 'rgba(29, 29, 31, 0.8)';
          (item as HTMLElement).style.border = '1px solid rgba(255, 255, 255, 0.1)';
          (item as HTMLElement).style.color = '#ffffff';
        });

        document.querySelectorAll('.card-description, .feature-description, .value-description, p').forEach(text => {
          (text as HTMLElement).style.color = '#ffffff';
        });

        document.querySelectorAll('.dark-value-bg, .values-new-container').forEach(bg => {
          (bg as HTMLElement).style.background = 'rgba(0, 10, 33, 0.95)';
        });

        document.querySelectorAll('.values-new-card').forEach(card => {
          (card as HTMLElement).style.background = 'rgba(29, 29, 31, 0.8)';
          (card as HTMLElement).style.border = '1px solid rgba(41, 98, 255, 0.2)';
        });
        
        document.querySelectorAll('.values-new-text').forEach(text => {
          (text as HTMLElement).style.color = '#ffffff';
        });
      } else {
        document.querySelectorAll('.about-container').forEach(container => {
          (container as HTMLElement).style.backgroundColor = '';
        });
        
        document.querySelectorAll('.about-card, .value-card').forEach(card => {
          (card as HTMLElement).style.background = '';
          (card as HTMLElement).style.backdropFilter = '';
          (card as HTMLElement).style['WebkitBackdropFilter' as any] = '';
          (card as HTMLElement).style.border = '';
          (card as HTMLElement).style.color = '';
        });
        
        document.querySelectorAll('.feature-card').forEach(card => {
          (card as HTMLElement).style.backgroundColor = '';
          (card as HTMLElement).style.color = '';
          (card as HTMLElement).style.border = '';
        });
        
        document.querySelectorAll('.feature-item, .value-item').forEach(item => {
          (item as HTMLElement).style.background = '';
          (item as HTMLElement).style.border = '';
          (item as HTMLElement).style.color = '';
        });
        
        document.querySelectorAll('.card-description, .feature-description, .value-description, p').forEach(text => {
          (text as HTMLElement).style.color = '';
        });
        
        document.querySelectorAll('.dark-value-bg, .values-new-container').forEach(bg => {
          (bg as HTMLElement).style.background = 'rgba(207, 226, 243, 0.75)';
        });
        
        document.querySelectorAll('.values-new-card').forEach(card => {
          (card as HTMLElement).style.background = 'rgba(255, 255, 255, 0.9)';
          (card as HTMLElement).style.border = '';
        });
        
        document.querySelectorAll('.values-new-text').forEach(text => {
          (text as HTMLElement).style.color = '#333';
        });
      }
    };

    applyDarkModeStyles();
    
  }, [isDarkMode]); 

  return (
    <div className={`${isDarkMode ? 'dark' : ''} about-container`}>
      <motion.div
        className="scroll-progress"
        style={{ scaleX }}
      />

      <main className="about-content">
        <section className="about-section" >
          <SectionTitle><b>About Us</b></SectionTitle>
          <br />
          <InfoCard
            title="Who Are We?"
            icon=""
            description={`At Sooru.AI, we are a pioneering construction technology company committed to transforming the way homes are designed and built. Our platform empowers architects, designers, and homeowners with AI-driven tools that simplify the design process, foster creativity, and ensure precision at every stage.
                With cutting-edge technology and a passion for innovation, we bridge the gap between imagination and reality. Whether you're designing a cozy home or an architectural marvel, Sooru.AI provides the tools and insights to turn your vision into a beautifully crafted, functional space.
                Our approach is grounded in creating intuitive, customizable, and sustainable solutions that cater to both professionals and first-time designers. We aim to redefine the future of architectural design—one home at a time.`}
            delay={0.2}
          />
        </section>
        <section className="about-section">
          <div className="about-grid">
          <InfoCard
  title="Vision"
  icon={
    <img
      src="/i1.png"
      alt="Vision Icon"
      style={{ width: '50px', height: '50px'}}
    />
  }
  description="We aim to revolutionize architecture and construction by making intelligent design tools accessible, enabling seamless creation, visualization, and modification of spaces worldwide."
  color="text-blue-600"
  delay={0.2}
/>
<InfoCard
  title="Mission"
  icon={
    <img
      src="/i2.png"
      alt="Mission Icon"
      style={{ width: '50px', height: '50px' }}
    />
  }
  description="Our mission is to equip architects, builders, and homeowners with AI-driven design solutions that streamline planning, boost creativity, and ensure compliance, enabling faster, more efficient, and cost-effective construction."
  color="text-blue-600"
  delay={0.4}
/>
          </div>
        </section>
<div 
  className={`dark-value-bg ${isDarkMode ? 'dark-mode-value-bg' : ''}`} 
  style={{background: isDarkMode ? "rgba(0, 10, 33, 0.95)" : "rgba(207, 226, 243, 0.75)"}}
>
  <div className={`values-new-container ${isDarkMode ? 'dark-theme' : ''}`} style={{background: isDarkMode ? "rgba(0, 10, 33, 0.95)" : "rgba(207, 226, 243, 0.75)"}}>
    <div className="values-new-grid">
      <motion.div
        className="values-new-card innovation-card"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        style={{
          background: isDarkMode ? "rgba(29, 29, 31, 0.8)" : "rgba(255, 255, 255, 0.9)",
          border: isDarkMode ? "1px solid rgba(41, 98, 255, 0.2)" : ""
        }}
      >
        <img src="/i6.png" alt="Innovation Icon" className="values-new-icon" />
        <h3 className="values-new-title">Innovation</h3>
        <p className="values-new-text" style={{ color: isDarkMode ? "#ffffff" : "#333" }}>
          Sooru.AI innovates home design with AI, AR/VR, and advanced tech, redefining architectural creativity.
        </p>
      </motion.div>

      <motion.div
        className="values-new-card curiosity-card"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{
          background: isDarkMode ? "rgba(29, 29, 31, 0.8)" : "rgba(255, 255, 255, 0.9)",
          border: isDarkMode ? "1px solid rgba(41, 98, 255, 0.2)" : ""
        }}
      >
        <img src="/i7.png" alt="Curiosity Icon" className="values-new-icon" />
        <h3 className="values-new-title">Curiosity</h3>
        <p className="values-new-text" style={{ color: isDarkMode ? "#ffffff" : "#333" }}>
          Driven by curiosity, we explore, learn, and innovate, challenging traditions to create exceptional user experiences.
        </p>
      </motion.div>
      
      <motion.div
        className="values-new-card collaboration-card"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
        style={{
          background: isDarkMode ? "rgba(29, 29, 31, 0.8)" : "rgba(255, 255, 255, 0.9)",
          border: isDarkMode ? "1px solid rgba(41, 98, 255, 0.2)" : ""
        }}
      >
        <img src="/i8.png" alt="Collaboration Icon" className="values-new-icon" />
        <h3 className="values-new-title">Collaboration</h3>
        <p className="values-new-text" style={{ color: isDarkMode ? "#ffffff" : "#333" }}>
          Collaboration fuels great ideas. We unite architects, designers, and homeowners to co-create extraordinary spaces.
        </p>
      </motion.div>
      
      <motion.div
        className="values-new-card accountability-card"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
        style={{
          background: isDarkMode ? "rgba(29, 29, 31, 0.8)" : "rgba(255, 255, 255, 0.9)",
          border: isDarkMode ? "1px solid rgba(41, 98, 255, 0.2)" : ""
        }}
      >
        <img src="/i9.png" alt="Accountability Icon" className="values-new-icon" />
        <h3 className="values-new-title">Accountability</h3>
        <p className="values-new-text" style={{ color: isDarkMode ? "#ffffff" : "#333" }}>
          We prioritize integrity and reliability, delivering quality solutions that build trust and lasting relationships.
        </p>
      </motion.div>
      
      <motion.div
        className="values-heading-container"
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <h2 className="values-heading">Our Values</h2>
        <p className="values-subtitle">
          Innovating, collaborating, and building a better future through intelligent design.
        </p>
        <button className="values-explore-button" onClick={() => window.location.href = '/'}>Explore</button>
      </motion.div>
    </div>
  </div>
</div>

<section className="about-section" >
          <div style={{marginTop:"19px"}}>
            <SectionTitle>Why Sooru.AI?</SectionTitle>
            <img 
              src="/v1.png" 
              alt="Sooru.AI Vector" 
              style={{ 
                width: '350px', 
                height: 'auto', 
                position: 'absolute',
                top: '-1820px',
                right: '-100px',
                zIndex: '1',
              }} 
              className='hide-on-mobile'
            />
            <img 
              src="/v1.png" 
              alt="Sooru.AI Vector" 
              style={{ 
                width: '350px', 
                height: 'auto', 
                position: 'absolute',
                top: '-1820px',
                left: '-100px',
                zIndex: '1',
                transform: 'scaleX(-1)'
              }} 
              className='hide-on-mobile'               
            />
          </div>
          <div className="about-grid fs ">
            <FeatureCard
              icon={<img src="/i3.png" alt="Innovative Technology Icon" style={{ width: '50px', height: '50px' }}/>}
              title="Innovative Technology"
              description="Leverage advanced AI to simplify complex design processes. Sooru.AI innovates home design with AI, AR/VR, and advanced tech, redefining architectural creativity."
              delay={0.1}
              className='feature-card'
              
            />
            <FeatureCard
              icon={<img src="/i4.png" alt="Personalized Solutions Icon" style={{ width: '50px', height: '50px' }}/>}
              title="Personalized Solutions"
              description="Every design is tailored to your needs and preferences. Sooru.AI tailors every design to your needs, using AI, AR/VR, and advanced tech to revolutionize home architecture with innovation."
              delay={0.2}
              className='feature-card'
            />
            <FeatureCard
              icon={<img src="/i5.png" alt="Comprehensive Features Icon" style={{ width: '50px', height: '50px',color:"white" }}/>}
              title="Comprehensive Features"
              description="From conceptualization to visualization, we cover every step. Sooru.AI drives innovation in home design, using AI, AR/VR, and advanced tech to revolutionize architecture from concept to visualization."
              delay={0.2}
              className='feature-card'
            />
          </div>
        </section>
      </main>
    </div>
  );
};

const About: React.FC = () => <AboutContent />;

export default About;