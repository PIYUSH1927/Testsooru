import { NavLink as Link } from "react-router-dom";
import styled, { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  :root {
    color-scheme: light dark;

    /* Light Theme Colors */
    --background: rgba(255, 255, 255, 0.95);
    --text: #4A5568;
    --text-hover: #000000;
    --border: #E2E8F0;
    --button-bg: #000000;
    --button-text: #FFFFFF;
    --button-hover: black;
    --shadow: rgba(0, 0, 0, 0.1);
    --backdrop: rgba(255, 255, 255, 0.95);
  }

  /* 
   * Force dark mode values via media query
   * This ensures system dark mode preference is respected
   */
  @media (prefers-color-scheme: dark) {
    :root {
      --background: black !important;
      --text: #D1D5DB !important;
      --text-hover: #FFFFFF !important;
      --border: #374151 !important;
      --button-bg: #3366EE !important;
      --button-text: #FFFFFF !important;
      --button-hover: black !important;
      --shadow: rgba(0, 0, 0, 0.3) !important;
      --backdrop: rgba(17, 24, 39, 0.95) !important;
    }
    
    /* Force dark mode styling on navbar elements */
    body {
      background-color: #000000 !important;
      color: #ffffff !important;
    }
    
    body.dark-mode,
    html.dark-theme {
      background-color: #000000 !important;
      color: #ffffff !important;
    }
  }
  
  /* Additional classes for forced dark mode */
  body.dark-mode,
  html.dark-theme {
    --background: black;
    --text: #D1D5DB;
    --text-hover: #FFFFFF;
    --border: #374151;
    --button-bg: #3366EE;
    --button-text: #FFFFFF;
    --button-hover: black;
    --shadow: rgba(0, 0, 0, 0.3);
    --backdrop: rgba(17, 24, 39, 0.95);
  }
`;

export const Nav = styled.nav`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: var(--background);
  backdrop-filter: blur(10px);
  height: 70px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2.4rem 2.5rem;
  border-bottom: 1px solid var(--border); 
  z-index: 1000;
  transition: background-color 0.3s ease, border-color 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: 
        radial-gradient(circle at 15% 20%, rgba(15, 119, 255, 0.08) 0%, rgba(15, 119, 255, 0) 30%),
        radial-gradient(circle at 85% 20%, rgba(15, 119, 255, 0.08) 0%, rgba(15, 119, 255, 0) 30%),
        radial-gradient(circle at 10% 40%, rgba(15, 119, 255, 0.06) 0%, rgba(15, 119, 255, 0) 20%),
        radial-gradient(circle at 90% 40%, rgba(15, 119, 255, 0.06) 0%, rgba(15, 119, 255, 0) 20%);
    pointer-events: none;
    z-index: -1;
  }

  @media screen and (max-width: 768px) {
    padding: 2.5rem 2rem;
  }
`;

export const NavMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  justify-content: center;

  @media screen and (max-width: 768px) {
    display: none;
  }
`;

interface MobileNavProps {
  isOpen: boolean;
}

export const MobileNav = styled.div<MobileNavProps>`
  display: none;
  position: fixed;
  top: 70px;
  left: 0;
  right: 0;
  background: var(--background);
  padding: 1rem;
  border-bottom: 1px solid var(--border);
  transform: translateY(${({ isOpen }) => (isOpen ? "0" : "-100%")});
  transition: transform 0.3s ease-in-out, background-color 0.3s ease;

  @media screen and (max-width: 768px) {
    display: flex;
    flex-direction: column;
    align-items: left; /* Center items horizontally */
    text-align: center; /* Center text within items */
    gap: 0.55rem;
    z-index:100;
  }
`;

export const NavLink = styled(Link)`
  color: var(--text);
  display: flex;
  align-items: center;
  text-decoration: none;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: var(--text-hover);
  }

  &.active {
    color: var(--text-hover);
    font-weight: 600;
  }
`;

export const AuthButton = styled.button`
  background-color: var(--button-bg);
  color: var(--button-text);
  padding: 0.5rem 1.5rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  white-space: nowrap;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;


  &:hover {
    transform: translateY(-1.5px);
    box-shadow: 0 2px 4px var(--shadow);
  }
`;

export const MenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: var(--text);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  transition: color 0.2s ease;

  &:hover {
    color: var(--text-hover);
  }

  @media screen and (max-width: 768px) {
    display: block;
  }
`;

export const NavControls = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

export const ScrollLink = styled.button`
  color: var(--text);
  background: none;
  border: none;
  font-size: 1.15rem;
  cursor: pointer;
  padding: 0.5rem 1rem;
  transition: color 0.2s ease;
  text-align: left;
  font-weight: bold;

  &:hover {
    color: var(--text-hover);
  }

  &.active {
    color: var(--text-hover);
    font-weight: 600;
  }
`;

export const NavbarContainer = styled.div`

`;

interface LogoContainerProps {
  theme: string;
}

export const LogoContainer = styled.div<LogoContainerProps>`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.8;
  }

  img {
    width: 3rem;
    height: 3rem;
    object-fit: contain;
    filter: ${({ theme }) => (theme === "dark" ? "invert(1)" : "none")};
  }

  span {
    font-weight: bold;
    font-size: 1rem;
    color: var(--text-hover);
  }
`;