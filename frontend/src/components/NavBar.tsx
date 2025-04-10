import React, { useState, useEffect, useRef } from "react";
import { Menu, Close, Person } from "@mui/icons-material";
import { useLocation, useNavigate, Link } from "react-router-dom";
import styled from "styled-components";
import {
  GlobalStyle,
  Nav,
  NavMenu,
  LogoContainer,
  AuthButton,
  MenuButton,
  NavControls,
  ScrollLink,
  MobileNav,
} from "./NavbarElements";

import SooruAILogo from "../SooruAI.png";

interface MobileNavProps {
  isOpen: boolean;
}

const ResponsiveAuthContainer = styled.div`
  display: flex;
  align-items: center;

  @media screen and (max-width: 768px) {
    display: none;
  }
`;

const MobileLogoutLink = styled(ScrollLink)`
  color: #ff0000 !important;
  font-weight: 500;

  &:hover {
    transform: scale(1.05);
  }
`;

const MobileLoginLink = styled(ScrollLink)`
  color: #27ae60 !important;
  font-weight: 500;

  &:hover {
    transform: scale(1.05);
  }
`;

const ProfileIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
 background-color: #1976D2;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: scale(1.1);
  }
`;

const ProfileDropdown = styled.div`
  position: absolute;
  top: 60px;
  right: -20px;
  width: 200px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 100;
`;

const DropdownContainer = styled.div`
  position: relative;
`;

const DropdownItem = styled.div`
  padding: 12px 16px;
  color: #333;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;

  &:hover {
    background-color: #f5f5f5;
  }
`;

const LogoutItem = styled(DropdownItem)`
  color: #ff0000;
  border-top: 1px solid #eee;
  margin-top: 5px;
`;

const Spinner = styled.div`
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 3px solid #666;
  width: 16px;
  height: 16px;
  margin-left: 10px;
  animation: spin 1s linear infinite;
  display: inline-block;
  vertical-align: middle;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  max-width: 400px;
  width: 90%;
  text-align: center;
`;

const ModalTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
`;

const ModalText = styled.p`
  margin-bottom: 25px;
  color: #555;
`;

const ModalButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
`;

const CancelButton = styled.button`
  padding: 8px 20px;
  background-color: #ccc;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  
  &:hover {
    background-color: #bbb;
  }
`;

const ConfirmButton = styled.button`
  padding: 8px 20px;
  background-color: #ff0000;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  
  &:hover {
    background-color: #e60000;
  }
  
  &:disabled {
    background-color: #ff9999;
    cursor: not-allowed;
  }
`;

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoggingOut: boolean;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  isLoggingOut 
}) => {
  if (!isOpen) return null;
  
  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalTitle>Confirm Logout</ModalTitle>
        <ModalText>Are you sure you want to logout of your account?</ModalText>
        <ModalButtons>
          <CancelButton onClick={onClose} disabled={isLoggingOut}>
            Cancel
          </CancelButton>
          <ConfirmButton onClick={onConfirm} disabled={isLoggingOut}>
            {isLoggingOut ? 'Logging out...' : 'Yes, Logout'}
            {isLoggingOut && <Spinner />}
          </ConfirmButton>
        </ModalButtons>
      </ModalContent>
    </ModalOverlay>
  );
};

const SooruLogo: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkMode(darkModeQuery.matches);

    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    darkModeQuery.addEventListener("change", handler);
    return () => darkModeQuery.removeEventListener("change", handler);
  }, []);

  const handleLogoClick = (): void => {
    if (location.pathname !== "/") {
      navigate("/");
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <LogoContainer
      theme={isDarkMode ? "dark" : "light"}
      onClick={handleLogoClick}
    >
      <img src={SooruAILogo} alt="Sooru.AI Logo" />
    </LogoContainer>
  );
};

interface UserProfile {
  id: number;
  username: string;
  company_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
}

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage: boolean = location.pathname === "/";
  const backendURL = "https://backend-3sh6.onrender.com/api/auth";
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchUserProfile = async (): Promise<void> => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const response = await fetch(`${backendURL}/profile/`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserProfile(data);
      } else {
        console.error("Failed to fetch user profile");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, [location.pathname]);

  useEffect(() => {
    // Close dropdown when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const checkAuthStatus = (): void => {
    const token = localStorage.getItem("access_token");
    setIsLoggedIn(!!token);
    
    if (token) {
      fetchUserProfile();
    } else {
      setUserProfile(null);
    }
  };

  useEffect(() => {
    if (isHomePage) {
      const currentSection = window.location.hash.replace("#", "");
    }
  }, [location, isHomePage]);

  const handleNavigation = (sectionId: string): void => {
    setIsOpen(false);
    if (sectionId === "projects") {
      if (isLoggedIn) {
        navigate("/projects");
      } else {
        navigate("/LoginPage");
      }
    } else {
      if (isHomePage) {
        const element = document.getElementById(sectionId);
        if (element) {
          const navHeight = 70;
          const elementPosition = element.offsetTop - navHeight;
          window.scrollTo({
            top: elementPosition,
            behavior: "smooth",
          });
        }
      } else {
        navigate("/", { state: { scrollTo: sectionId } });
        setTimeout(() => {
          document
            .getElementById(sectionId)
            ?.scrollIntoView({ behavior: "smooth" });
        }, 300);
      }
    }
  };

  const handleAuth = (): void => {
    if (isLoggedIn) {
      setShowLogoutModal(true);
    } else {
      if (location.pathname === "/LoginPage") {
        navigate("/");
      } else {
        navigate("/LoginPage");
      }
    }
  };

  const handleProfileNavigation = (): void => {
    navigate("/profile");
    setShowProfileDropdown(false);
  };
  
  const handleHomeNavigation = (): void => {
    navigate("/");
    setShowProfileDropdown(false);
  };

  const handleSettingsNavigation = (): void => {
    navigate("/profile"); // For now, also navigate to profile as requested
    setShowProfileDropdown(false);
  };

  const toggleProfileDropdown = (): void => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const handleLogout = async (): Promise<void> => {
    setIsLoggingOut(true);

    try {
      const refreshToken = localStorage.getItem("refresh_token");

      if (!refreshToken) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setIsLoggedIn(false);
        setShowLogoutModal(false);
        navigate("/LoginPage");
        return;
      }

      const response = await fetch(`${backendURL}/logout/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setIsLoggedIn(false);
      setShowLogoutModal(false);
      setUserProfile(null);
      navigate("/LoginPage");
    } catch (error) {
      console.error("Logout error:", error);

      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setIsLoggedIn(false);
      setShowLogoutModal(false);
      setUserProfile(null);
      navigate("/LoginPage");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const closeLogoutModal = (): void => {
    if (!isLoggingOut) {
      setShowLogoutModal(false);
    }
  };

  const getNavItems = (): { id: string; label: string }[] => {
    const allNavItems = [
      { id: "projects", label: "Projects", requiresAuth: true },
      { id: "about", label: "About", requiresAuth: false },
      { id: "features", label: "Features", requiresAuth: false },
      { id: "contact", label: "Contact Us", requiresAuth: false },
    ];

    return allNavItems.filter(
      (item) => !item.requiresAuth || (item.requiresAuth && isLoggedIn)
    );
  };

  const navItems = getNavItems();

  const getProfileInitial = (): React.ReactNode => {
    if (userProfile && userProfile.first_name) {
      return userProfile.first_name.charAt(0).toUpperCase();
    }
    return <Person fontSize="small" />;
  };

  return (
    <>
      <GlobalStyle />
      <Nav>
        <div className="logo-link" >
          <SooruLogo />
        </div>

        <NavMenu>
          {navItems.map((item) => (
            <ScrollLink key={item.id} onClick={() => handleNavigation(item.id)}>
              {item.label}
            </ScrollLink>
          ))}
        </NavMenu>

        <NavControls>
          <ResponsiveAuthContainer>
            {isLoggedIn ? (
              <DropdownContainer ref={dropdownRef}>
                <ProfileIcon onClick={toggleProfileDropdown}>
                  {getProfileInitial()}
                </ProfileIcon>
                {showProfileDropdown && (
                  <ProfileDropdown>
                    <DropdownItem onClick={handleHomeNavigation}>Home</DropdownItem>
                    <DropdownItem onClick={handleProfileNavigation}>Profile</DropdownItem>
                    <DropdownItem onClick={handleSettingsNavigation}>Settings</DropdownItem>
                    <LogoutItem onClick={() => setShowLogoutModal(true)}>
                      Logout
                      {isLoggingOut && <Spinner />}
                    </LogoutItem>
                  </ProfileDropdown>
                )}
              </DropdownContainer>
            ) : (
              <AuthButton as="button" onClick={handleAuth}>
                {location.pathname === "/LoginPage"
                  ? "Back to Home"
                  : "Login / Register"}
              </AuthButton>
            )}
          </ResponsiveAuthContainer>
          <MenuButton onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <Close fontSize="large" /> : <Menu fontSize="large" />}
          </MenuButton>
        </NavControls>
      </Nav>

      <MobileNav isOpen={isOpen}>
        {navItems.map((item) => (
          <ScrollLink
            key={item.id}
            onClick={(e) => {
              handleNavigation(item.id);
              e.preventDefault();
            }}
          >
            {item.label}
          </ScrollLink>
        ))}

        {isLoggedIn ? (
          <>
             <ScrollLink
              onClick={(e) => {
                setIsOpen(false);
                handleProfileNavigation();
                e.preventDefault();
              }}
              style={{fontWeight:"bolder"}}
            >
              My Profile
            </ScrollLink>
            <MobileLogoutLink
              onClick={(e) => {
                if (!isLoggingOut) {
                  setIsOpen(false);
                  handleAuth();
                }
                e.preventDefault();
              }}
            >
              Logout {isLoggingOut && <Spinner />}
            </MobileLogoutLink>

          </>
        ) : (
          <MobileLoginLink
            onClick={(e) => {
              setIsOpen(false);
              handleAuth();
              e.preventDefault();
            }}
          >
            {location.pathname === "/LoginPage"
              ? "Back to Home"
              : "Login / Register"}
          </MobileLoginLink>
        )}
      </MobileNav>

      <LogoutModal
        isOpen={showLogoutModal}
        onClose={closeLogoutModal}
        onConfirm={handleLogout}
        isLoggingOut={isLoggingOut}
      />
    </>
  );
};

export default Navbar;