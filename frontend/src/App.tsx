import React, { useState, useEffect, ReactNode } from "react";
import Navbar from "./components/NavBar";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import Home from "./pages/Home";
import Project from "./pages/Project";
import Contact from "./pages/Contact";
import LoginPage from "./pages/LoginPage";
import Features from "./pages/Features";
import About from "./pages/AboutUs";
import Playground from "./pages/Playground";
import Profile from "./pages/Profile";
import View3D from "./pages/Playground/3D/View3D";
import { NavbarProvider } from "./components/NavbarContext";
import { DarkModeProvider } from "./contexts/DarkModeContext";
import "./App.css";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthenticated = localStorage.getItem("access_token") !== null;
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/LoginPage" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const PublicOnlyRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthenticated = localStorage.getItem("access_token") !== null;

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    localStorage.getItem("access_token") !== null
  );

  useEffect(() => {
    const checkAuthStatus = () => {
      setIsAuthenticated(localStorage.getItem("access_token") !== null);
    };

    checkAuthStatus();
    window.addEventListener("storage", checkAuthStatus);

    return () => {
      window.removeEventListener("storage", checkAuthStatus);
    };
  }, []);

  return (
    <NavbarProvider>
      <Router>
        <Routes>
          <Route
            path="/playground"
            element={
              <ProtectedRoute>
                <Playground />
              </ProtectedRoute>
            }
          />
          <Route
            path="/3D"
            element={
              <ProtectedRoute>
                <View3D />
              </ProtectedRoute>
            }
          />
          <Route
            path="*"
            element={
              <DarkModeProvider>
                <Navbar />
                <div style={{ paddingTop: "80px" }}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/about" element={<About />} />

                    <Route
                      path="/features"
                      element={<Features />}
                    />
                    <Route
                      path="/projects"
                      element={
                        <ProtectedRoute>
                          <Project />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/profile"
                      element={
                        <ProtectedRoute>
                          <Profile />
                        </ProtectedRoute>
                      }
                    />

                    <Route
                      path="/LoginPage"
                      element={
                        <PublicOnlyRoute>
                          <LoginPage />
                        </PublicOnlyRoute>
                      }
                    />

                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </div>
              </DarkModeProvider>
            }
          />
        </Routes>
      </Router>
    </NavbarProvider>
  );
};

export default App;