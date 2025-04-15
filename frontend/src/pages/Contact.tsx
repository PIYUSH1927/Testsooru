import React, { useState, useRef, ChangeEvent, FormEvent } from "react";
import { DarkModeProvider, useDarkMode } from "../contexts/DarkModeContext";
import { useNavigate } from "react-router-dom";

import "./Contact.css";

interface FormData {
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  phone: string;
  message: string;
}

interface Errors {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

interface SubmitStatus {
  type: "info" | "success" | "error";
  message: string;
}

const ContactContent = () => {
  const { isDarkMode } = useDarkMode();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    companyName: "",
    email: "",
    phone: "",
    message: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>({
    type: "info",
    message: "",
  });

  const validateForm = (): boolean => {
    const newErrors: Errors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = "Valid email is required";
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!formData.phone || !phoneRegex.test(formData.phone)) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      companyName: "",
      email: "",
      phone: "",
      message: "",
    });
    setErrors({});
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        setSubmitStatus({ type: "info", message: "Sending..." });

        const templateParams = {
          to_email: "info@sooru.ai",
          from_name: `${formData.firstName} ${formData.lastName}`,
          from_email: formData.email,
          phone: formData.phone,
          company: formData.companyName,
          message: formData.message,
        };

        setTimeout(() => {
          setSubmitStatus({
            type: "success",
            message:
              "Thank you for your message. We will get back to you soon!",
          });
          clearForm();
        }, 1000);
      } catch (error) {
        setSubmitStatus({
          type: "error",
          message: "Failed to send message. Please try again later.",
        });
      }
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof Errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 10) {
      setFormData((prev) => ({
        ...prev,
        phone: value,
      }));
      if (errors.phone) {
        setErrors((prev) => ({
          ...prev,
          phone: "",
        }));
      }
    }
  };

  const StatusMessage = ({ status }: { status: SubmitStatus }) => {
    if (!status.message) return null;
    return (
      <div className={`contact-status-message ${status.type}`}>
        {status.message}
      </div>
    );
  };
  const navigate = useNavigate();

  return (
    <div className={`contact-container ${isDarkMode ? "contact-dark" : ""}`}>
      <div className="contact-wrapper">
        <div className="contact-hero-section">
          <div className="contact-hero-content">
            <h1 className="contact-hero-title">Ready to get started?</h1>
            <p className="contact-hero-subtitle">
              Making artwork for your home is now
              <br />
              as easy as thinking
            </p>
            <button
              className="contact-get-started-btn"
              onClick={() => navigate("/")}
            >
              Get Started
            </button>
          </div>
          <div className="contact-hero-image">
            <img src="/cube.webp" alt="Blue cube" />
          </div>
        </div>

        <div className="contact-content">
          <div className="contact-info">
            <div className="contact-info-card">
              <div className="contact-info-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </div>
              <div className="contact-info-text">
                <h3>Email</h3>
                <a href="mailto:info@sooru.ai">info@sooru.ai</a>
              </div>
            </div>

            <div className="contact-info-card">
              <div className="contact-info-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              </div>
              <div className="contact-info-text">
                <h3>Phone</h3>
                <a href="tel:+919743810910">+91 97438 10910</a>
              </div>
            </div>

            <div className="contact-info-card">
              <div className="contact-info-icon">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <div className="contact-info-text">
                <h3>Location</h3>
                <p>
                  No. 816, 27th Main Road,
                  <br />
                  Sector - 1, H S R Layout,
                  <br />
                  Bengaluru 560 102
                </p>
              </div>
            </div>

            <div className="contact-social-links">
              <a
                href="https://instagram.com/sooru.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-social-icon contact-instagram"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href="https://x.com/Sooru_AI"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-social-icon contact-twitter"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/company/sooruai/"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-social-icon contact-linkedin"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path
                    d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.761 
      0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11.75 
      20h-3v-11h3v11zm-1.5-12.268c-.966 
      0-1.75-.784-1.75-1.75s.784-1.75 
      1.75-1.75 1.75.784 
      1.75 1.75-.784 1.75-1.75 
      1.75zm13.25 12.268h-3v-5.604c0-1.337-.026-3.061-1.866-3.061-1.867 
      0-2.154 1.459-2.154 2.968v5.697h-3v-11h2.881v1.5h.041c.401-.761 
      1.381-1.562 2.844-1.562 3.042 0 3.604 2.002 
      3.604 4.604v6.458z"
                  />
                </svg>
              </a>
            </div>
          </div>

          <div className="contact-form-container">
            <h2>Contact Us</h2>
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="contact-form"
            >
              <div className="contact-form-row">
                <div className="contact-form-group">
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={errors.firstName ? "contact-error" : ""}
                    placeholder="First Name*"
                    required
                  />
                  {errors.firstName && (
                    <span className="contact-error-message">
                      {errors.firstName}
                    </span>
                  )}
                </div>
                <div className="contact-form-group">
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={errors.lastName ? "contact-error" : ""}
                    placeholder="Last Name"
                    required
                  />
                  {errors.lastName && (
                    <span className="contact-error-message">
                      {errors.lastName}
                    </span>
                  )}
                </div>
              </div>

              <div className="contact-form-group">
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Company Name"
                />
              </div>

              <div className="contact-form-group">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? "contact-error" : ""}
                  placeholder="Email*"
                  required
                />
                {errors.email && (
                  <span className="contact-error-message">{errors.email}</span>
                )}
              </div>

              <div className="contact-form-group">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  placeholder="Phone Number*"
                  maxLength={10}
                  className={errors.phone ? "contact-error" : ""}
                  required
                />
                {errors.phone && (
                  <span className="contact-error-message">{errors.phone}</span>
                )}
              </div>

              <div className="contact-form-group">
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Message"
                />
              </div>
              <StatusMessage status={submitStatus} />
              <button type="submit" className="contact-submit-button">
                Submit
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const Contact = () => (
  <DarkModeProvider>
    <ContactContent />
  </DarkModeProvider>
);

export default Contact;
