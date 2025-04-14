import React from 'react';
import { motion } from 'framer-motion';
import { DarkModeProvider, useDarkMode } from '../contexts/DarkModeContext';
import './Features.css';

interface FeatureCardProps {
  title: string;
  description: string;
  items: string[];
  icon: React.ReactNode;
  delay?: number;
}

// FeatureCard Component
const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, items, icon, delay = 0 }) => {
  const { isDarkMode } = useDarkMode();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay }}
      className="ftrs-card"
    >
      <div className="ftrs-icon">{icon}</div>
      <h3 className="ftrs-card-title">{title}</h3>
      <p className="ftrs-card-description">{description}</p>
      <ul className="ftrs-item-list">
        {items.map((item, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: delay + index * 0.1 }}
            className="ftrs-list-item"
          >
            <span className="ftrs-check-icon">✓</span>
            <span className="ftrs-item-text">{item}</span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
};

// Timeline Feature Card Component for Upcoming Features
const TimelineFeatureCard: React.FC<FeatureCardProps & { position: 'left' | 'right' }> = ({ 
  title, 
  description, 
  items, 
  icon, 
  delay = 0,
  position
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: position === 'left' ? -50 : 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay }}
      className={`ftrs-timeline-card ftrs-timeline-card-${position}`}
    >
      <div className="ftrs-timeline-card-content">
        <div className="ftrs-icon">{icon}</div>
        <h3 className="ftrs-card-title">{title}</h3>
        <p className="ftrs-card-description">{description}</p>
      </div>
    </motion.div>
  );
};

// FeatureSection Component
const FeatureSection: React.FC<{ title: string; description?: string; children: React.ReactNode; dark?: boolean }> = ({
  title,
  description,
  children,
  dark = false,
}) => (
  <section className={`ftrs-section ${dark ? 'ftrs-section-dark' : ''}`}>
    <div className="ftrs-section-content">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="ftrs-section-header"
      >
        <h2 className="ftrs-section-title ftrs-upcoming-title">{title}</h2>
        {description && <p className="ftrs-section-description">{description}</p>}
      </motion.div>
      {children}
    </div>
  </section>
);

// Define types for the feature data
interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
  items: string[];
}

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
    className="ftrs-title"
  >
    {children}
  </motion.h2>
);


// FeaturesContent Component
const FeaturesContent: React.FC = () => {
  const features: Feature[] = [
    {
      title: 'Prompt-Based Design Input',
      description: 'A user-friendly prompt box for architects and customers to input house preferences.',
      icon: (
        <img
          src="/i10.png"
          alt="Prompt-Based Design Input"
          style={{ width: '50px', height: '50px' }}
        />
      ),
      items: [
        'Natural language input for design specifications',
        'Real-time suggestions and guidance',
        'Intuitive interface for design requirements',
        'Smart interpretation of user preferences',
      ],
    },
    {
      title: 'Customizable Components',
      description: 'Mix and match different design elements to create your perfect space.',
      icon: (
        <img
          src="/i11.png"
          alt="Prompt-Based Design Input"
          style={{ width: '50px', height: '50px' }}
        />
      ),
      items: [
        'Select individual components from different sets',
        'Real-time modifications to components',
        'Mix and match to create personalized layouts',
        'Component-level customization options',
      ],
    },
    {
      title: '2D and 3D Diagram Generation',
      description: 'Seamlessly generate and switch between 2D and 3D visualizations.',
      icon: (
        <img
          src="/i12.png"

          alt="Prompt-Based Design Input"
          style={{ width: '50px', height: '50px'}}
        />
      ),
      items: ['Automatic 2D and 3D diagram generation', 'Synchronized updates across views', 'Interactive viewing perspectives', 'Real-time visualization updates'],
    },
    {
      title: 'AI Integration',
      description: 'Intelligent design suggestions powered by advanced AI technology.',
      icon: (
        <img
          src="/i13.png"
          alt="Prompt-Based Design Input"
          style={{ width: '50px', height: '50px' }}
        />
      ),
      items: ['AI-powered design optimization', 'Smart space utilization suggestions', 'Adaptive customization', 'Aesthetic enhancement recommendations'],
    },
    {
      title: 'Export and Sharing Options',
      description: 'Multiple export formats and seamless sharing capabilities.',
      icon: (
        <img
          src="/i14.png"
          alt="Prompt-Based Design Input"
          style={{ width: '50px', height: '50px' }}
        />
      ),
      items: ['Export to PDF, CAD, and STL formats', 'Shareable project links', 'Collaborative review system', 'Multi-format support'],
    },
    {
      title: 'Cloud Storage',
      description: 'Secure cloud storage with comprehensive version control.',
      icon: (
        <img
          src="/i15.png"
          alt="Prompt-Based Design Input"
          style={{ width: '50px', height: '50px' }}
        />
      ),
      items: ['Secure project cloud storage', 'Automatic version control', 'Cross-device accessibility', 'Backup and recovery options'],
    },
  ];

  const upcomingFeatures: Feature[] = [
    {
      title: 'AR/VR Integration',
      description: 'Experience architectural designs with immersive 3D walkthroughs, real-time AR overlays, interactive VR support, and enhanced spatial understanding.',
      icon: (
        <img
          src="/i16.png"
          alt="AR/VR Integration"
          style={{ width: '50px', height: '50px' }}
        />
      ),
      items: ['Immersive 3D walkthroughs', 'Real-time AR overlay of designs', 'VR support for an interactive experience', 'Enhanced spatial understanding'],
    },
    {
      title: 'Automated Cost Estimation',
      description: 'Experience architectural designs with AR/VR for immersive walkthroughs, real-time overlays, and enhanced spatial understanding.',
      icon: (
        <img
          src="/i17.png"
          alt="Automated Cost Estimation"
          style={{ width: '50px', height: '50px' }}
        />
      ),
      items: ['Dynamic cost calculation', 'Material and labor cost breakdowns', 'Real-time updates as designs change', 'Budget optimization suggestions'],
    },
    {
      title: 'Smart Energy Efficiency Analysis',
      description: 'AI-driven analysis, sustainability insights, and renewable energy integration for cost-saving strategies.',
      icon: (
        <img
          src="/i18.png"
          alt="Smart Energy Efficiency Analysis"
          style={{ width: '50px', height: '50px' }}
        />
      ),
      items: ['AI-powered energy consumption analysis', 'Sustainability recommendations', 'Renewable energy integration insights', 'Cost-saving efficiency strategies'],
    },
    {
      title: 'Collaborative Multi-User Editing',
      description: 'Real-Time Collaboration: Work simultaneously with live editing, change tracking, user roles, and team communication.',
      icon: (
        <img
          src="/i19.png"
          alt="Collaborative Multi-User Editing"
          style={{ width: '50px', height: '50px' }}
        />
      ),
      items: ['Live multi-user editing', 'Real-time change tracking', 'User-specific permissions and roles', 'Integrated team communication'],
    },
  ];

  return (
    <div className="ftrs-container">
      {/* Header */}
      <div className="ftrs-header">
      <SectionTitle><b>Features</b></SectionTitle>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="ftrs-subtitle">
          Transforming architectural design through AI innovation
        </motion.p>
      </div>

      {/* Features Grid */}
      <div className="ftrs-grid">
        {features.map((feature, index) => (
          <FeatureCard key={index} {...feature} delay={0.2 + index * 0.1} />
        ))}
      </div>

      {/* Upcoming Features Section */}
      <FeatureSection title="">
        <SectionTitle>
          <p style={{fontSize: "clamp(2rem, 5vw, 3rem)"}}>Upcoming Features</p>
        </SectionTitle>
        <div className="ftrs-header">
          <motion.p transition={{ duration: 0.8, delay: 0.2 }} className="ftrs-subtitle">
            Exciting new functionalities coming soon!
          </motion.p>
        </div>

        <div className="ftrs-timeline-container">
          <div className="ftrs-timeline-line"></div>
          
          {/* Timeline nodes */}
          <div className="ftrs-timeline-nodes">
            <div className="ftrs-timeline-node"></div>
            <div className="ftrs-timeline-node"></div>
            <div className="ftrs-timeline-node"></div>
            <div className="ftrs-timeline-node"></div>
          </div>
          
          {/* Timeline feature cards - REORDERED to match design */}
          
          <TimelineFeatureCard 
            position="left" 
            title={upcomingFeatures[3].title} /* AR/VR Integration */
            description={upcomingFeatures[3].description}
            icon={upcomingFeatures[3].icon}
            items={upcomingFeatures[3].items}
            delay={0.2}
          />
          
          
          <div className='pos1'>
          <TimelineFeatureCard
            position="right" 
            title={upcomingFeatures[1].title} /* Automated Cost Estimation */
            description={upcomingFeatures[1].description}
            icon={upcomingFeatures[1].icon}
            items={upcomingFeatures[1].items}
            delay={0.3}
          />
          </div>
          
          
          
          <TimelineFeatureCard 
            position="left" 
            title={upcomingFeatures[2].title} /* Smart Energy Efficiency */
            description={upcomingFeatures[2].description}
            icon={upcomingFeatures[2].icon}
            items={upcomingFeatures[2].items}
            delay={0.4}
          />
          
          
          <div className="pos">
          <TimelineFeatureCard 
            position="right" 
            title={upcomingFeatures[0].title} /* Collaborative Multi-User */
            description={upcomingFeatures[0].description}
            icon={upcomingFeatures[0].icon}
            items={upcomingFeatures[0].items}
            delay={0.5}
          />
        </div>
        </div>
        <div className="ftrs-bottom-space"></div>
      </FeatureSection>
    </div>
  );
};

// Main Features Component
const Features: React.FC = () => (
  <DarkModeProvider>
    <FeaturesContent />
  </DarkModeProvider>
);

export default Features;