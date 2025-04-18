import React, { createContext, useContext, useEffect, useState } from 'react';

interface DarkModeContextType {
  isDarkMode: boolean;
  setIsDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined);

export const DarkModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with a function to avoid running the check during every render
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    // First check localStorage
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") return true;
    if (savedTheme === "light") return false;
    
    // If no saved preference, check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Apply theme immediately on mount
  useEffect(() => {
    if (isDarkMode) {
      applyDarkTheme();
    } else {
      applyLightTheme();
    }
  }, []);

  // Apply theme when isDarkMode changes
  useEffect(() => {
    if (isDarkMode) {
      applyDarkTheme();
      localStorage.setItem("theme", "dark");
    } else {
      applyLightTheme();
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  // Listen for system theme changes if no user preference is set
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handler = (e: MediaQueryListEvent) => {
      // Only update if user hasn't explicitly chosen a theme
      const savedTheme = localStorage.getItem("theme");
      if (!savedTheme) {
        setIsDarkMode(e.matches);
      }
    };
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Define theme application functions
  const applyDarkTheme = (): void => {
    // Set CSS variables for navbar
    document.documentElement.style.setProperty('--background', 'black');
    document.documentElement.style.setProperty('--text', '#D1D5DB');
    document.documentElement.style.setProperty('--text-hover', '#FFFFFF');
    document.documentElement.style.setProperty('--border', '#374151');
    document.documentElement.style.setProperty('--button-bg', '#3366EE');
    document.documentElement.style.setProperty('--button-text', '#FFFFFF');
    document.documentElement.style.setProperty('--button-hover', 'black');
    document.documentElement.style.setProperty('--shadow', 'rgba(0, 0, 0, 0.3)');
    document.documentElement.style.setProperty('--backdrop', 'rgba(17, 24, 39, 0.95)');
    document.documentElement.setAttribute('data-theme', 'dark');
    
    // Set CSS variables for other components
    document.documentElement.style.setProperty('--bg-primary', '#000000');
    document.documentElement.style.setProperty('--bg-secondary', '#1d1d1f');
    document.documentElement.style.setProperty('--text-primary', '#ffffff');
    document.documentElement.style.setProperty('--text-secondary', '#ffffff');
    document.documentElement.style.setProperty('--card-bg', 'rgba(29, 29, 31, 0.8)');
    document.documentElement.style.setProperty('--bg-card', 'rgba(29, 29, 31, 0.8)');
    document.documentElement.style.setProperty('--shadow-sm', '0 2px 8px rgba(0, 0, 0, 0.2)');
    document.documentElement.style.setProperty('--shadow-lg', '0 8px 24px rgba(0, 0, 0, 0.2)');
    document.documentElement.style.setProperty('--color-accent', '#3b82f6');
    
    // Apply dark theme on element backgrounds
    document.body.style.backgroundColor = '#000000';
    document.body.style.color = '#ffffff';
    
    // Apply to classes from About page
    const aboutContainers = document.querySelectorAll('.about-container');
    aboutContainers.forEach(container => {
      (container as HTMLElement).style.backgroundColor = '#000000';
    });
    
    const aboutCards = document.querySelectorAll('.about-card, .value-card');
    aboutCards.forEach(card => {
      (card as HTMLElement).style.background = 'rgba(29, 29, 31, 0.8)';
      (card as HTMLElement).style.backdropFilter = 'blur(20px)';
      // Apply webkit prefix using setAttribute for cross-browser compatibility
      (card as HTMLElement).setAttribute('style', 
        `${(card as HTMLElement).getAttribute('style') || ''}
        -webkit-backdrop-filter: blur(20px);`
      );
      (card as HTMLElement).style.border = '1px solid rgba(255, 255, 255, 0.1)';
      (card as HTMLElement).style.color = '#ffffff';
    });
    
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
      (card as HTMLElement).style.backgroundColor = '#084798';
      (card as HTMLElement).style.color = 'white';
      (card as HTMLElement).style.border = '1px solid rgba(255, 255, 255, 0.1)';
    });
    
    const items = document.querySelectorAll('.feature-item, .value-item');
    items.forEach(item => {
      (item as HTMLElement).style.background = 'rgba(29, 29, 31, 0.8)';
      (item as HTMLElement).style.border = '1px solid rgba(255, 255, 255, 0.1)';
      (item as HTMLElement).style.color = '#ffffff';
    });
    
    const texts = document.querySelectorAll('.card-description, .feature-description, .value-description, p');
    texts.forEach(text => {
      (text as HTMLElement).style.color = '#ffffff';
    });
    
    // Apply to classes from Features page
    const ftrsContainers = document.querySelectorAll('.ftrs-container');
    ftrsContainers.forEach(container => {
      (container as HTMLElement).style.backgroundColor = '#000000';
    });
    
    const ftrsCards = document.querySelectorAll('.ftrs-card');
    ftrsCards.forEach(card => {
      (card as HTMLElement).style.background = 'rgba(29, 29, 31, 0.8)';
      (card as HTMLElement).style.border = '1px solid rgba(255, 255, 255, 0.1)';
    });
    
    const ftrsListItems = document.querySelectorAll('.ftrs-list-item');
    ftrsListItems.forEach(item => {
      (item as HTMLElement).style.border = '1px solid rgba(255, 255, 255, 0.1)';
      (item as HTMLElement).style.color = '#ffffff';
    });
    
    const ftrsTitles = document.querySelectorAll('.ftrs-card-title, .ftrs-title');
    ftrsTitles.forEach(title => {
      (title as HTMLElement).style.color = '#ffffff';
    });
    
    // Apply to Our Values section in About page
    const valuesContainers = document.querySelectorAll('.values-new-container');
    valuesContainers.forEach(container => {
      (container as HTMLElement).style.background = 'rgba(0, 10, 33, 0.95)';
    });
    
    const darkValueBg = document.querySelectorAll('.dark-value-bg');
    darkValueBg.forEach(bg => {
      (bg as HTMLElement).style.background = 'rgba(0, 10, 33, 0.95)';
    });
    
    const valueCards = document.querySelectorAll('.values-new-card');
    valueCards.forEach(card => {
      (card as HTMLElement).style.background = 'rgba(29, 29, 31, 0.8)';
      (card as HTMLElement).style.border = '1px solid rgba(41, 98, 255, 0.2)';
    });
    
    const valueTitles = document.querySelectorAll('.values-new-title');
    valueTitles.forEach(title => {
      (title as HTMLElement).style.color = '#1078FF';
    });
    
    const valueTexts = document.querySelectorAll('.values-new-text');
    valueTexts.forEach(text => {
      (text as HTMLElement).style.color = '#ffffff';
    });
    
    // Apply to classes from Contact page
    const contactContainers = document.querySelectorAll('.contact-container');
    contactContainers.forEach(container => {
      (container as HTMLElement).classList.add('contact-dark');
    });
    
    // Apply directly to navbar-related elements
    const navbars = document.querySelectorAll('nav');
    navbars.forEach(nav => {
      (nav as HTMLElement).style.backgroundColor = 'black';
      (nav as HTMLElement).style.color = '#D1D5DB';
      (nav as HTMLElement).style.borderBottomColor = '#374151';
    });
    
    const mobileNavs = document.querySelectorAll('.mobile-nav, [class*="MobileNav"]');
    mobileNavs.forEach(nav => {
      (nav as HTMLElement).style.backgroundColor = 'black';
      (nav as HTMLElement).style.color = '#D1D5DB';
      (nav as HTMLElement).style.borderBottomColor = '#374151';
    });
    
    const profileDropdowns = document.querySelectorAll('[class*="ProfileDropdown"]');
    profileDropdowns.forEach(dropdown => {
      (dropdown as HTMLElement).style.backgroundColor = '#1a1a1a';
      (dropdown as HTMLElement).style.color = '#D1D5DB';
      (dropdown as HTMLElement).style.borderColor = '#374151';
    });
    
    // Add dark mode class to body for global styling
    document.body.classList.add('dark-mode');
    document.documentElement.classList.add('dark-theme');
    document.documentElement.classList.remove('light-theme');
  };
  
  const applyLightTheme = (): void => {
    // Reset CSS variables for navbar
    document.documentElement.style.setProperty('--background', 'rgba(255, 255, 255, 0.95)');
    document.documentElement.style.setProperty('--text', '#4A5568');
    document.documentElement.style.setProperty('--text-hover', '#000000');
    document.documentElement.style.setProperty('--border', '#E2E8F0');
    document.documentElement.style.setProperty('--button-bg', '#000000');
    document.documentElement.style.setProperty('--button-text', '#FFFFFF');
    document.documentElement.style.setProperty('--button-hover', 'black');
    document.documentElement.style.setProperty('--shadow', 'rgba(0, 0, 0, 0.1)');
    document.documentElement.style.setProperty('--backdrop', 'rgba(255, 255, 255, 0.95)');
    document.documentElement.setAttribute('data-theme', 'light');
    
    // Reset CSS variables for other components
    document.documentElement.style.setProperty('--bg-primary', '#ffffff');
    document.documentElement.style.setProperty('--bg-secondary', '#fbfbfd');
    document.documentElement.style.setProperty('--text-primary', '#000000');
    document.documentElement.style.setProperty('--text-secondary', '#86868b');
    document.documentElement.style.setProperty('--card-bg', 'rgba(255, 255, 255, 0.8)');
    document.documentElement.style.setProperty('--bg-card', 'rgba(255, 255, 255, 0.8)');
    document.documentElement.style.setProperty('--shadow-sm', '0 2px 8px rgba(0, 0, 0, 0.1)');
    document.documentElement.style.setProperty('--shadow-lg', '0 8px 24px rgba(0, 0, 0, 0.1)');
    document.documentElement.style.setProperty('--color-accent', '#0066ff');
    
    // Reset body background and text color
    document.body.style.backgroundColor = '';
    document.body.style.color = '';
    
    // Reset classes from About page
    const aboutContainers = document.querySelectorAll('.about-container');
    aboutContainers.forEach(container => {
      (container as HTMLElement).style.backgroundColor = '';
    });
    
    const aboutCards = document.querySelectorAll('.about-card, .value-card');
    aboutCards.forEach(card => {
      // Reset all styles
      (card as HTMLElement).style.background = '';
      (card as HTMLElement).style.backdropFilter = '';
      // Reset webkit prefix using setAttribute
      const currentStyle = (card as HTMLElement).getAttribute('style') || '';
      const newStyle = currentStyle.replace('-webkit-backdrop-filter: blur(20px);', '');
      (card as HTMLElement).setAttribute('style', newStyle);
      
      (card as HTMLElement).style.border = '';
      (card as HTMLElement).style.color = '';
    });
    
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
      (card as HTMLElement).style.backgroundColor = '';
      (card as HTMLElement).style.color = '';
      (card as HTMLElement).style.border = '';
    });
    
    const items = document.querySelectorAll('.feature-item, .value-item');
    items.forEach(item => {
      (item as HTMLElement).style.background = '';
      (item as HTMLElement).style.border = '';
      (item as HTMLElement).style.color = '';
    });
    
    const texts = document.querySelectorAll('.card-description, .feature-description, .value-description, p');
    texts.forEach(text => {
      (text as HTMLElement).style.color = '';
    });
    
    // Reset Our Values section in About page
    const valuesContainers = document.querySelectorAll('.values-new-container');
    valuesContainers.forEach(container => {
      (container as HTMLElement).style.background = 'rgba(207, 226, 243, 0.75)';
    });
    
    const darkValueBg = document.querySelectorAll('.dark-value-bg');
    darkValueBg.forEach(bg => {
      (bg as HTMLElement).style.background = 'rgba(207, 226, 243, 0.75)';
    });
    
    const valueCards = document.querySelectorAll('.values-new-card');
    valueCards.forEach(card => {
      (card as HTMLElement).style.background = 'rgba(255, 255, 255, 0.9)';
      (card as HTMLElement).style.border = '';
    });
    
    const valueTitles = document.querySelectorAll('.values-new-title');
    valueTitles.forEach(title => {
      (title as HTMLElement).style.color = '#05479E';
    });
    
    const valueTexts = document.querySelectorAll('.values-new-text');
    valueTexts.forEach(text => {
      (text as HTMLElement).style.color = '#333';
    });
    
    // Reset classes from Features page
    const ftrsContainers = document.querySelectorAll('.ftrs-container');
    ftrsContainers.forEach(container => {
      (container as HTMLElement).style.backgroundColor = '';
    });
    
    const ftrsCards = document.querySelectorAll('.ftrs-card');
    ftrsCards.forEach(card => {
      (card as HTMLElement).style.background = '';
      (card as HTMLElement).style.border = '';
    });
    
    const ftrsListItems = document.querySelectorAll('.ftrs-list-item');
    ftrsListItems.forEach(item => {
      (item as HTMLElement).style.border = '';
      (item as HTMLElement).style.color = '';
    });
    
    const ftrsTitles = document.querySelectorAll('.ftrs-card-title, .ftrs-title');
    ftrsTitles.forEach(title => {
      (title as HTMLElement).style.color = '';
    });
    
    // Reset classes from Contact page
    const contactContainers = document.querySelectorAll('.contact-container');
    contactContainers.forEach(container => {
      (container as HTMLElement).classList.remove('contact-dark');
    });
    
    // Reset navbar-related elements
    const navbars = document.querySelectorAll('nav');
    navbars.forEach(nav => {
      (nav as HTMLElement).style.backgroundColor = '';
      (nav as HTMLElement).style.color = '';
      (nav as HTMLElement).style.borderBottomColor = '';
    });
    
    const mobileNavs = document.querySelectorAll('.mobile-nav, [class*="MobileNav"]');
    mobileNavs.forEach(nav => {
      (nav as HTMLElement).style.backgroundColor = '';
      (nav as HTMLElement).style.color = '';
      (nav as HTMLElement).style.borderBottomColor = '';
    });
    
    const profileDropdowns = document.querySelectorAll('[class*="ProfileDropdown"]');
    profileDropdowns.forEach(dropdown => {
      (dropdown as HTMLElement).style.backgroundColor = '';
      (dropdown as HTMLElement).style.color = '';
      (dropdown as HTMLElement).style.borderColor = '';
    });
    
    // Remove dark mode class from body
    document.body.classList.remove('dark-mode');
    document.documentElement.classList.add('light-theme');
    document.documentElement.classList.remove('dark-theme');
  };

  return (
    <DarkModeContext.Provider value={{ isDarkMode, setIsDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};

export const useDarkMode = (): DarkModeContextType => {
  const context = useContext(DarkModeContext);
  if (!context) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  return context;
};