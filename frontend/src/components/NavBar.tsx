import React, { useState, useEffect, useRef } from "react";
import {
  Menu,
  Close,
  Person,
  Home,
  Settings,
  Logout,
  Support,
  Upgrade,
  LightMode,
  DarkMode,
  Brightness4,
  Info,
  Star,
  ContactSupport,
  Work,
  ArrowUpward,
  AccountTree,
  Help,
  Feedback,
  Notifications,
  DashboardOutlined,
  WorkOutline,
  BusinessCenter,
} from "@mui/icons-material";
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
  NavbarContainer,
} from "./NavbarElements";
import { useNavbar } from "./NavbarContext";
import { useDarkMode } from "../contexts/DarkModeContext";

import SooruAILogo from "../SooruAI.svg";

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
  background: linear-gradient(to right, #0a499c, #1868d9);
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
  width: 250px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1050;
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
  gap: 10px;

  &:hover {
    background-color: #f5f5f5;
  }
`;

const LogoutItem = styled(DropdownItem)`
  color: #ff0000;
  border-top: 1px solid #eee;
  margin-top: 5px;
`;

const ThemeToggleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-top: 1px solid #eee;
  margin-top: 5px;
  color: #333;
`;

const ToggleWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-left: auto;
`;

const ThemeToggleLabel = styled.span`
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: bold;
`;

interface ToggleSwitchProps {
  disabled?: boolean;
}

const ToggleSwitch = styled.label<ToggleSwitchProps>`
  position: relative;
  display: inline-block;
  width: 36px;
  height: 18px;
  margin: 0 8px;
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
`;

interface ToggleInputProps {
  disabled?: boolean;
}

const ToggleInput = styled.input<ToggleInputProps>`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background-color: #2196f3;
  }

  &:checked + span:before {
    transform: translateX(18px);
  }
`;

const ToggleSlider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 24px;

  &:before {
    position: absolute;
    content: "";
    height: 12px;
    width: 12px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }
`;

const ThemeIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 14px;
  width: 16px;
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
  background-color: var(--background); // uses global theme value
  color: var(--text); // uses global text color
  padding: 25px;
  border-radius: 10px;
  width: 400px;
  max-width: 90%;
  text-align: center;
  box-shadow: 0 5px 15px var(--shadow);
  border: 1px solid white;
`;

const ModalTitle = styled.h3`
  color: var(--text);
  margin-bottom: 15px;
`;

const ModalText = styled.p`
  color: var(--text);
  margin-bottom: 25px;
`;

const ModalButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
`;

const CancelButton = styled.button`
  padding: 8px 20px;
  background-color: #444;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  color: white;

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
  isLoggingOut,
}) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalTitle>Confirm Sign Out</ModalTitle>
        <ModalText>
          Are you sure you want to Sign Out of your account?
        </ModalText>
        <ModalButtons>
          <CancelButton onClick={onClose} disabled={isLoggingOut}>
            Cancel
          </CancelButton>
          <ConfirmButton onClick={onConfirm} disabled={isLoggingOut}>
            {isLoggingOut ? "Signing out..." : "Yes, Sign Out"}
            {isLoggingOut && <Spinner />}
          </ConfirmButton>
        </ModalButtons>
      </ModalContent>
    </ModalOverlay>
  );
};

const SooruLogo: React.FC = () => {
  const { isDarkMode } = useDarkMode();
  const navigate = useNavigate();
  const location = useLocation();

  const [systemPrefersDark, setSystemPrefersDark] = useState(
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
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
      theme={isDarkMode || systemPrefersDark ? "dark" : "light"}
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
  const [showProfileDropdown, setShowProfileDropdown] =
    useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { isDarkMode, setIsDarkMode } = useDarkMode(); 
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage: boolean = location.pathname === "/";
  const backendURL = "https://backend-3sh6.onrender.com/api/auth";
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  const { setProfileDropdownOpen } = useNavbar();

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
      if (e.matches) {
        setIsDarkMode(true);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [setIsDarkMode]);

  useEffect(() => {
    if (systemPrefersDark && !isDarkMode) {
      setIsDarkMode(true);
    }
  }, [systemPrefersDark, isDarkMode, setIsDarkMode]);

  const fetchUserProfile = async (): Promise<void> => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const response = await fetch(`${backendURL}/profile/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
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
    if (isDarkMode) {
      applyDarkTheme();
    } else {
      applyLightTheme();
    }
  }, [isDarkMode, location.pathname]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowProfileDropdown(false);
        setProfileDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setProfileDropdownOpen]);

  useEffect(() => {
    setProfileDropdownOpen(showProfileDropdown);
  }, [showProfileDropdown, setProfileDropdownOpen]);

  const applyDarkTheme = (): void => {
    document.documentElement.style.setProperty("--background", "black");
    document.documentElement.style.setProperty("--text", "#D1D5DB");
    document.documentElement.style.setProperty("--text-hover", "#FFFFFF");
    document.documentElement.style.setProperty("--border", "#374151");
    document.documentElement.style.setProperty("--button-bg", "#3366EE");
    document.documentElement.style.setProperty("--button-text", "#FFFFFF");
    document.documentElement.style.setProperty("--button-hover", "black");
    document.documentElement.style.setProperty(
      "--shadow",
      "rgba(0, 0, 0, 0.3)"
    );
    document.documentElement.style.setProperty(
      "--backdrop",
      "rgba(17, 24, 39, 0.95)"
    );

    document.documentElement.style.setProperty("--bg-primary", "#000000");
    document.documentElement.style.setProperty("--bg-secondary", "#1d1d1f");
    document.documentElement.style.setProperty("--text-primary", "#ffffff");
    document.documentElement.style.setProperty("--text-secondary", "#ffffff");
    document.documentElement.style.setProperty(
      "--card-bg",
      "rgba(29, 29, 31, 0.8)"
    );
    document.documentElement.style.setProperty(
      "--bg-card",
      "rgba(29, 29, 31, 0.8)"
    );
    document.documentElement.style.setProperty(
      "--shadow-sm",
      "0 2px 8px rgba(0, 0, 0, 0.2)"
    );
    document.documentElement.style.setProperty(
      "--shadow-lg",
      "0 8px 24px rgba(0, 0, 0, 0.2)"
    );
    document.documentElement.style.setProperty("--color-accent", "#3b82f6");

    document.body.style.backgroundColor = "#000000";
    document.body.style.color = "#ffffff";

    const aboutContainers = document.querySelectorAll(".about-container");
    aboutContainers.forEach((container) => {
      (container as HTMLElement).style.backgroundColor = "#000000";
    });

    const aboutCards = document.querySelectorAll(".about-card, .value-card");
    aboutCards.forEach((card) => {
      (card as HTMLElement).style.background = "rgba(29, 29, 31, 0.8)";
      (card as HTMLElement).style.backdropFilter = "blur(20px)";

      (card as HTMLElement).setAttribute(
        "style",
        `${(card as HTMLElement).getAttribute("style") || ""}
        -webkit-backdrop-filter: blur(20px);`
      );
      (card as HTMLElement).style.border = "1px solid rgba(255, 255, 255, 0.1)";
      (card as HTMLElement).style.color = "#ffffff";
    });

    const featureCards = document.querySelectorAll(".feature-card");
    featureCards.forEach((card) => {
      (card as HTMLElement).style.backgroundColor = "#084798";
      (card as HTMLElement).style.color = "white";
      (card as HTMLElement).style.border = "1px solid rgba(255, 255, 255, 0.1)";
    });

    const items = document.querySelectorAll(".feature-item, .value-item");
    items.forEach((item) => {
      (item as HTMLElement).style.background = "rgba(29, 29, 31, 0.8)";
      (item as HTMLElement).style.border = "none";
      (item as HTMLElement).style.color = "#ffffff";
    });

    const texts = document.querySelectorAll(
      ".card-description, .feature-description, .value-description, p"
    );
    texts.forEach((text) => {
      (text as HTMLElement).style.color = "#ffffff";
    });

    const ftrsContainers = document.querySelectorAll(".ftrs-container");
    ftrsContainers.forEach((container) => {
      (container as HTMLElement).style.backgroundColor = "#000000";
    });

    const ftrsCards = document.querySelectorAll(".ftrs-card");
    ftrsCards.forEach((card) => {
      (card as HTMLElement).style.background = "rgba(29, 29, 31, 0.8)";
      (card as HTMLElement).style.border = "1px solid rgba(255, 255, 255, 0.1)";
    });

    const ftrsListItems = document.querySelectorAll(".ftrs-list-item");
    ftrsListItems.forEach((item) => {
      (item as HTMLElement).style.border = "1px solid rgba(255, 255, 255, 0.1)";
      (item as HTMLElement).style.color = "#ffffff";
    });

    const ftrsTitles = document.querySelectorAll(
      ".ftrs-card-title, .ftrs-title"
    );
    ftrsTitles.forEach((title) => {
      (title as HTMLElement).style.color = "#ffffff";
    });

    const contactContainers = document.querySelectorAll(".contact-container");
    contactContainers.forEach((container) => {
      (container as HTMLElement).classList.add("contact-dark");
    });

    document.body.classList.add("dark-mode");
    document.documentElement.classList.add("dark-theme");
    document.documentElement.classList.remove("light-theme");

    localStorage.setItem("theme", "dark");
  };

  const applyLightTheme = (): void => {
    document.documentElement.style.setProperty(
      "--background",
      "rgba(255, 255, 255, 0.95)"
    );
    document.documentElement.style.setProperty("--text", "#4A5568");
    document.documentElement.style.setProperty("--text-hover", "#000000");
    document.documentElement.style.setProperty("--border", "#E2E8F0");
    document.documentElement.style.setProperty("--button-bg", "#000000");
    document.documentElement.style.setProperty("--button-text", "#FFFFFF");
    document.documentElement.style.setProperty("--button-hover", "black");
    document.documentElement.style.setProperty(
      "--shadow",
      "rgba(0, 0, 0, 0.1)"
    );
    document.documentElement.style.setProperty(
      "--backdrop",
      "rgba(255, 255, 255, 0.95)"
    );

    document.documentElement.style.setProperty("--bg-primary", "#ffffff");
    document.documentElement.style.setProperty("--bg-secondary", "#fbfbfd");
    document.documentElement.style.setProperty("--text-primary", "#000000");
    document.documentElement.style.setProperty("--text-secondary", "#86868b");
    document.documentElement.style.setProperty(
      "--card-bg",
      "rgba(255, 255, 255, 0.8)"
    );
    document.documentElement.style.setProperty(
      "--bg-card",
      "rgba(255, 255, 255, 0.8)"
    );
    document.documentElement.style.setProperty(
      "--shadow-sm",
      "0 2px 8px rgba(0, 0, 0, 0.1)"
    );
    document.documentElement.style.setProperty(
      "--shadow-lg",
      "0 8px 24px rgba(0, 0, 0, 0.1)"
    );
    document.documentElement.style.setProperty("--color-accent", "#0066ff");

    document.body.style.backgroundColor = "";
    document.body.style.color = "";
    const aboutContainers = document.querySelectorAll(".about-container");
    aboutContainers.forEach((container) => {
      (container as HTMLElement).style.backgroundColor = "";
    });

    const aboutCards = document.querySelectorAll(".about-card, .value-card");
    aboutCards.forEach((card) => {

      (card as HTMLElement).style.background = "";
      (card as HTMLElement).style.backdropFilter = "";
      const currentStyle = (card as HTMLElement).getAttribute("style") || "";
      const newStyle = currentStyle.replace(
        "-webkit-backdrop-filter: blur(20px);",
        ""
      );
      (card as HTMLElement).setAttribute("style", newStyle);

      (card as HTMLElement).style.border = "";
      (card as HTMLElement).style.color = "";
    });

    const featureCards = document.querySelectorAll(".feature-card");
    featureCards.forEach((card) => {
      (card as HTMLElement).style.backgroundColor = "";
      (card as HTMLElement).style.color = "";
      (card as HTMLElement).style.border = "";
    });

    const items = document.querySelectorAll(".feature-item, .value-item");
    items.forEach((item) => {
      (item as HTMLElement).style.background = "";
      (item as HTMLElement).style.border = "";
      (item as HTMLElement).style.color = "";
    });

    const texts = document.querySelectorAll(
      ".card-description, .feature-description, .value-description, p"
    );
    texts.forEach((text) => {
      (text as HTMLElement).style.color = "";
    });

    const ftrsContainers = document.querySelectorAll(".ftrs-container");
    ftrsContainers.forEach((container) => {
      (container as HTMLElement).style.backgroundColor = "";
    });

    const ftrsCards = document.querySelectorAll(".ftrs-card");
    ftrsCards.forEach((card) => {
      (card as HTMLElement).style.background = "";
      (card as HTMLElement).style.border = "";
    });

    const ftrsListItems = document.querySelectorAll(".ftrs-list-item");
    ftrsListItems.forEach((item) => {
      (item as HTMLElement).style.border = "";
      (item as HTMLElement).style.color = "";
    });

    const ftrsTitles = document.querySelectorAll(
      ".ftrs-card-title, .ftrs-title"
    );
    ftrsTitles.forEach((title) => {
      (title as HTMLElement).style.color = "";
    });

    const contactContainers = document.querySelectorAll(".contact-container");
    contactContainers.forEach((container) => {
      (container as HTMLElement).classList.remove("contact-dark");
    });

    document.body.classList.remove("dark-mode");
    document.documentElement.classList.add("light-theme");
    document.documentElement.classList.remove("dark-theme");

    localStorage.setItem("theme", "light");
  };

  const toggleTheme = (): void => {
    if (systemPrefersDark && isDarkMode) {
      return; 
    }

    const newIsDarkMode = !isDarkMode;
    setIsDarkMode(newIsDarkMode);

    if (newIsDarkMode) {
      applyDarkTheme();
    } else {
      applyLightTheme();
    }
    localStorage.setItem("theme", newIsDarkMode ? "dark" : "light");
  };

  const activeLinkStyle: React.CSSProperties = {
    color: "#0F77FF",
    fontWeight: "bold",
    textDecoration: "underline",
  };

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
    } else if (sectionId === "about") {
      navigate("/about");
    } else if (sectionId === "features") {
      navigate("/features");
    } else if (sectionId === "contact") {
      navigate("/contact");
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
    setProfileDropdownOpen(false);
  };

  const handleHomeNavigation = (): void => {
    navigate("/");
    setShowProfileDropdown(false);
    setProfileDropdownOpen(false);
  };

  const handleSettingsNavigation = (): void => {
    navigate("/profile");
    setShowProfileDropdown(false);
    setProfileDropdownOpen(false);
  };

  const toggleProfileDropdown = (): void => {
    setShowProfileDropdown(!showProfileDropdown);
    setProfileDropdownOpen(!showProfileDropdown);
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

  const getProfileInitial = (): React.ReactNode => {
    if (userProfile && userProfile.first_name) {
      return userProfile.first_name.charAt(0).toUpperCase();
    }
    return <Person fontSize="small" />;
  };

  const navItems = getNavItems();

  return (
    <>
      <GlobalStyle />
      <NavbarContainer>
        <Nav>
          <div className="logo-link">
            <SooruLogo />
          </div>

          <NavMenu>
            {navItems.map((item) => (
              <ScrollLink
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                style={
                  location.pathname.includes(item.id) ||
                  (item.id === "projects" &&
                    location.pathname === "/projects") ||
                  (item.id === "about" && location.pathname === "/about") ||
                  (item.id === "features" &&
                    location.pathname === "/features") ||
                  (item.id === "contact" && location.pathname === "/contact")
                    ? activeLinkStyle
                    : undefined
                }
              >
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
                      <DropdownItem onClick={handleHomeNavigation}>
                        <Home fontSize="small" />
                        <b>Home</b>
                      </DropdownItem>
                      <DropdownItem>
                        <DashboardOutlined fontSize="small" />
                        <b>Plan Type:</b>
                        <span
                          style={{
                            marginLeft: "8px",
                            color: "#FFD700",
                            fontWeight: "bold",
                          }}
                        >
                          Gold
                        </span>
                      </DropdownItem>
                      <DropdownItem onClick={handleHomeNavigation}>
                        <ArrowUpward fontSize="small" />
                        <b>Upgrade Plan</b>
                      </DropdownItem>
                      <DropdownItem onClick={handleProfileNavigation}>
                        <Person fontSize="small" />
                        <b>View / Edit Profile</b>
                      </DropdownItem>
                      <DropdownItem onClick={handleHomeNavigation}>
                        <Notifications fontSize="small" />
                        <b>Notification Settings</b>
                      </DropdownItem>
                      <DropdownItem onClick={handleHomeNavigation}>
                        <Feedback fontSize="small" />
                        <b>Support & Feedback</b>
                      </DropdownItem>
                      {!systemPrefersDark && (
  <ThemeToggleContainer>
    <ThemeToggleLabel>
      <Brightness4 fontSize="small" />
      <b>Theme</b>
    </ThemeToggleLabel>
    <ToggleWrapper>
      <ThemeIcon>
        <LightMode style={{ fontSize: "14px" }} />
      </ThemeIcon>
      <ToggleSwitch>
        <ToggleInput
          type="checkbox"
          checked={isDarkMode}
          onChange={toggleTheme}
        />
        <ToggleSlider />
      </ToggleSwitch>
      <ThemeIcon>
        <DarkMode style={{ fontSize: "14px" }} />
      </ThemeIcon>
    </ToggleWrapper>
  </ThemeToggleContainer>
)}
                      <LogoutItem onClick={() => setShowLogoutModal(true)}>
                        <Logout fontSize="small" style={{ color: "#ff0000" }} />
                        <b>Sign Out</b>
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
          <ScrollLink
            onClick={(e) => {
              setIsOpen(false);
              handleNavigation("about");
              e.preventDefault();
            }}
            style={{ fontWeight: "bolder" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Info fontSize="small" />
              About
            </div>
          </ScrollLink>
          <ScrollLink
            onClick={(e) => {
              setIsOpen(false);
              handleNavigation("features");
              e.preventDefault();
            }}
            style={{ fontWeight: "bolder" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Star fontSize="small" />
              Features
            </div>
          </ScrollLink>

          <ScrollLink
            onClick={(e) => {
              setIsOpen(false);
              handleNavigation("contact");
              e.preventDefault();
            }}
            style={{ fontWeight: "bolder" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <ContactSupport fontSize="small" />
              Contact Us
            </div>
          </ScrollLink>

          {isLoggedIn ? (
            <>
              <ScrollLink style={{ fontWeight: "bolder" }}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <DashboardOutlined fontSize="small" />
                  Plan Type:
                  <span
                    style={{
                      marginLeft: "8px",
                      color: "#FFD700",
                      fontWeight: "bold",
                    }}
                  >
                    Gold
                  </span>
                </div>
              </ScrollLink>
              <ScrollLink
                onClick={(e) => {
                  setIsOpen(false);
                  handleProfileNavigation();
                  e.preventDefault();
                }}
                style={{ fontWeight: "bolder" }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <ArrowUpward fontSize="small" />
                  Upgrade Plan
                </div>
              </ScrollLink>

              <ScrollLink
                onClick={(e) => {
                  setIsOpen(false);
                  handleNavigation("projects");
                  e.preventDefault();
                }}
                style={{ fontWeight: "bolder" }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <Work fontSize="small" />
                  Projects
                </div>
              </ScrollLink>
              <ScrollLink
                onClick={(e) => {
                  setIsOpen(false);
                  handleProfileNavigation();
                  e.preventDefault();
                }}
                style={{ fontWeight: "bolder" }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <Person fontSize="small" />
                  View / Edit Profile
                </div>
              </ScrollLink>

              <ScrollLink
                onClick={(e) => {
                  setIsOpen(false);
                  handleSettingsNavigation();
                  e.preventDefault();
                }}
                style={{ fontWeight: "bolder" }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <Notifications fontSize="small" />
                  Notification Settings
                </div>
              </ScrollLink>
              <ScrollLink
                onClick={(e) => {
                  setIsOpen(false);
                  handleSettingsNavigation();
                  e.preventDefault();
                }}
                style={{ fontWeight: "bolder" }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <Feedback fontSize="small" />
                  Support & Feedback
                </div>
              </ScrollLink>

              {!systemPrefersDark && (
              <ThemeToggleContainer>
                <ThemeToggleLabel>
                  <Brightness4 style={{ color: "grey" }} fontSize="small" />
                  <b style={{ color: "grey" }}>Theme</b>
                </ThemeToggleLabel>
                <ToggleWrapper>
                  <ThemeIcon>
                    <LightMode style={{ fontSize: "14px" }} />
                  </ThemeIcon>
                  <ToggleSwitch disabled={systemPrefersDark && isDarkMode}>
                    <ToggleInput
                      type="checkbox"
                      checked={isDarkMode}
                      onChange={toggleTheme}
                      disabled={systemPrefersDark && isDarkMode}
                    />
                    <ToggleSlider />
                  </ToggleSwitch>
                  <ThemeIcon>
                    <DarkMode style={{ fontSize: "14px" }} />
                  </ThemeIcon>
                </ToggleWrapper>
                <hr />
              </ThemeToggleContainer>
)}

              <ThemeToggleContainer>
                <MobileLogoutLink
                  onClick={(e) => {
                    if (!isLoggingOut) {
                      setIsOpen(false);
                      handleAuth();
                    }
                    e.preventDefault();
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      position:"relative",
                      right:"14px"
                    }}
                  >
                    <Logout fontSize="small" />
                    Sign out {isLoggingOut && <Spinner />}
                  </div>
                </MobileLogoutLink>
              </ThemeToggleContainer>
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
      </NavbarContainer>
    </>
  );
};

export default Navbar;