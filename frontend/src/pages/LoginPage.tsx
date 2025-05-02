import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDarkMode } from '../contexts/DarkModeContext';
import "./LoginPage.css";
import SooruAILogo from "../SooruAI.svg";

const backendURL = "https://backend-3sh6.onrender.com/api/auth";

const RequiredIndicator = {
  color: "#ff0000",
  marginLeft: "3px",
  fontSize: "0.8em"
};

interface LoginFormProps {
  onRegisterClick: () => void;
  successMessage: string;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onRegisterClick,
  successMessage,
}) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${backendURL}/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);
        window.location.href = "/";
      } else {
        setError(
          data.message || "Login failed, incorrect username or password"
        );
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="form-wrapper"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.5 }}
    >
      <div className="form-header">
        <h2>Sign In</h2>
        <p className="form-subtitle">Welcome back! Please enter your details</p>
      </div>

      {successMessage && <p className="success-message">{successMessage}</p>}
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label className="form-label">
            Email / Phone Number
            <span style={RequiredIndicator}>*</span>
          </label>
          <div className="input-wrapper">
            <input
              type="text"
              className="form-input"
              placeholder="Enter your email or phone"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            Password
            <span style={RequiredIndicator}>*</span>
          </label>
          <div className="input-wrapper">
            <input
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="forgot-password-container">
            <a href="#" className="forgot-password">Forgot password?</a>
          </div>
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? <span className="spinner"></span> : "Sign In"}
        </button>
      </form>

      <div className="register-section">
        <span>Don't have an account?</span>
        <button onClick={onRegisterClick} className="register-link">
          Create account
        </button>
      </div>
    </motion.div>
  );
};

interface RegisterFormProps {
  onBackToLogin: (successMessage: string) => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onBackToLogin }) => {
  const [companyName, setCompanyName] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${backendURL}/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name: companyName,
          first_name: firstName,
          last_name: lastName,
          email,
          phone_number: phone,
          password,
        }),
      });

      const data = await response.json();
     

      if (response.ok) {
        onBackToLogin("Registration successful! Please log in.");
      } else {
        if (data.email) {
          setError(Array.isArray(data.email) ? data.email[0] : data.email);
        } else if (data.phone_number) {
          setError(
            Array.isArray(data.phone_number)
              ? data.phone_number[0]
              : data.phone_number
          );
        } else if (data.password) {
          const passwordErrors = Array.isArray(data.password)
            ? data.password
            : [data.password];
          const messages: string[] = [];

          if (passwordErrors.some((err: string) => err.includes("too short"))) {
            messages.push("be at least 8 characters long");
          }
          if (
            passwordErrors.some((err: string) => err.includes("too common"))
          ) {
            messages.push("not be too common");
          }
          if (
            passwordErrors.some((err: string) =>
              err.includes("entirely numeric")
            )
          ) {
            messages.push("not be entirely numeric");
          }

          if (messages.length > 0) {
            setError(`Your password must ${messages.join(", ")}.`);
          } else {
            setError(passwordErrors[0]);
          }
        } else if (data.error) {
          setError(data.error);
        } else if (data.detail) {
          setError(data.detail);
        } else if (data.message) {
          setError(data.message);
        } else if (data.non_field_errors) {
          setError(
            Array.isArray(data.non_field_errors)
              ? data.non_field_errors[0]
              : data.non_field_errors
          );
        } else {
          setError("Registration failed. Please try again.");
        }
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="form-wrapper register-form"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.5 }}
    >
      <div className="form-header">
        <h2>Create Account</h2>
      </div>

      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleRegister}>
        <div className="form-group">
          <label className="form-label">Company Name</label>
          <div className="input-wrapper">
            <input
              type="text"
              className="form-input"
              placeholder="Your company name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group half-width">
            <label className="form-label">
              First Name
              <span style={RequiredIndicator}>*</span>
            </label>
            <div className="input-wrapper">
              <input
                type="text"
                className="form-input"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group half-width">
            <label className="form-label">Last Name</label>
            <div className="input-wrapper">
              <input
                type="text"
                className="form-input"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group half-width">
            <label className="form-label">
              Email
              <span style={RequiredIndicator}>*</span>
            </label>
            <div className="input-wrapper">
              <input
                type="email"
                className="form-input"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group half-width">
            <label className="form-label">
              Phone Number
              <span style={RequiredIndicator}>*</span>
            </label>
            <div className="input-wrapper">
              <input
                type="tel"
                className="form-input"
                placeholder="Your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">
            Password
            <span style={RequiredIndicator}>*</span>
          </label>
          <div className="input-wrapper">
            <input
              type="password"
              className="form-input"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? <span className="spinner"></span> : "Create Account"}
        </button>
      </form>

      <div className="register-section">
        <span>Already have an account?</span>
        <button onClick={() => onBackToLogin("")} className="register-link">
          Sign in here
        </button>
      </div>
    </motion.div>
  );
};

const LoginPage: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>("");
  const { isDarkMode } = useDarkMode(); 

  const handleSuccessMessage = (message: string) => {
    setSuccessMessage(message);

    setTimeout(() => {
      setSuccessMessage("");
    }, 10000);
  };

  return (
    <div className={`auth-container ${isDarkMode ? 'dark-theme' : ''}`}>
      <div className="left-section">
        <motion.div className="logo-wrapper">
          <motion.img
            src={SooruAILogo}
            alt="SOORU.AI Logo"
            className="logo-image"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          />
          <motion.h1
            className="brand-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            SOORU.AI
          </motion.h1>
          <motion.h2
            className="tagline"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Where Vision Meets Precision!
          </motion.h2>
          <motion.div className="slogans">
            <motion.p
              className="slogan"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Build Your Dreams with Our AI!
            </motion.p>
            <motion.p
              className="slogan"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              Effortless. Precise. Limitless.
            </motion.p>
          </motion.div>
        </motion.div>
      </div>
      <div className="right-section">
        <AnimatePresence mode="wait">
          {!isRegistering ? (
            <LoginForm
              key="login"
              onRegisterClick={() => setIsRegistering(true)}
              successMessage={successMessage}
            />
          ) : (
            <RegisterForm
              key="register"
              onBackToLogin={(msg) => {
                setIsRegistering(false);
                if (msg) {
                  handleSuccessMessage(msg);
                }
              }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LoginPage;