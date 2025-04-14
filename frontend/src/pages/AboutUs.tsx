import React, { useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { DarkModeProvider, useDarkMode } from '../contexts/DarkModeContext';
import ValueCard from '../components/ValueCard';
import FeatureCard from '../components/FeatureCard';
import { ReactNode } from 'react';
import './AboutUs.css';

// Define prop types for InfoCard component
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

// Define prop types for SectionTitle component
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

  return (
    <div className={`${isDarkMode ? 'dark' : ''} about-container`}>
      {/* Progress Bar */}
      <motion.div
        className="scroll-progress"
        style={{ scaleX }}
      />

      {/* Main Content */}
      <main className="about-content">
        {/* Who We Are Section */}
        <section className="about-section" >
          <SectionTitle><b>About Us</b></SectionTitle>
          <InfoCard
            title="Who Are We?"
            icon=""
            description={`At Sooru.AI, we are a pioneering construction technology company committed to transforming the way homes are designed and built. Our platform empowers architects, designers, and homeowners with AI-driven tools that simplify the design process, foster creativity, and ensure precision at every stage.
                With cutting-edge technology and a passion for innovation, we bridge the gap between imagination and reality. Whether you're designing a cozy home or an architectural marvel, Sooru.AI provides the tools and insights to turn your vision into a beautifully crafted, functional space.
                Our approach is grounded in creating intuitive, customizable, and sustainable solutions that cater to both professionals and first-time designers. We aim to redefine the future of architectural design—one home at a time.`}
            delay={0.2}
          />
        </section>

        {/* Vision & Mission Section */}
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

        {/* Why Sooru.AI Section */}
        <section className="about-section" >
          <div >
            <SectionTitle>Why Sooru.AI?</SectionTitle>
            <img 
              src="/v1.png" 
              alt="Sooru.AI Vector" 
              style={{ 
                width: '350px', 
                height: 'auto', 
                position: 'absolute',
                top: '-1100px',
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
                top: '-1100px',
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

        {/* Values Section */}
{/* Values Section */}
<div className="dark-value-bg" style={{background:"rgba(207, 226, 243, 0.75)"}}>
  {/* Values Section */}
<div className="values-new-container">
  <div className="values-new-grid">
    {/* Innovation Card - stays in top left */}
    <motion.div
      className="values-new-card innovation-card"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.1 }}
    >
      <img src="/i6.png" alt="Innovation Icon" className="values-new-icon" />
      <h3 className="values-new-title">Innovation</h3>
      <p className="values-new-text">
        Sooru.AI innovates home design with AI, AR/VR, and advanced tech, redefining architectural creativity.
      </p>
    </motion.div>

    {/* Curiosity Card - moved down */}
    <motion.div
      className="values-new-card curiosity-card"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <img src="/i7.png" alt="Curiosity Icon" className="values-new-icon" />
      <h3 className="values-new-title">Curiosity</h3>
      <p className="values-new-text">
        Driven by curiosity, we explore, learn, and innovate, challenging traditions to create exceptional user experiences.
      </p>
    </motion.div>

    {/* Collaboration Card - bottom left */}
    <motion.div
      className="values-new-card collaboration-card"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <img src="/i8.png" alt="Collaboration Icon" className="values-new-icon" />
      <h3 className="values-new-title">Collaboration</h3>
      <p className="values-new-text">
        Collaboration fuels great ideas. We unite architects, designers, and homeowners to co-create extraordinary spaces.
      </p>
    </motion.div>

    {/* Accountability Card - moved further down */}
    <motion.div
      className="values-new-card accountability-card"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <img src="/i9.png" alt="Accountability Icon" className="values-new-icon" />
      <h3 className="values-new-title">Accountability</h3>
      <p className="values-new-text">
        We prioritize integrity and reliability, delivering quality solutions that build trust and lasting relationships.
      </p>
    </motion.div>

    {/* Our Values Heading Section - moved more to the right */}
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
      </main>
    </div>
  );
};

const About: React.FC = () => (
  <DarkModeProvider>
    <AboutContent />
  </DarkModeProvider>
);

export default About;