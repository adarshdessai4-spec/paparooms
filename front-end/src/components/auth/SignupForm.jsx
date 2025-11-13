import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

const LS_AUTH_KEY = "oyoplus:isAuthed";
const LS_USER_KEY = "oyoplus:user";
const TOKEN_KEYS = ["authToken", "token", "accessToken", "auth_token"];

const SignupForm = ({ isActive }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    terms: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const persistAuthData = ({ token, user }) => {
    try {
      localStorage.setItem(LS_AUTH_KEY, "true");

      if (user) {
        localStorage.setItem(LS_USER_KEY, JSON.stringify(user));
      }

      if (token) {
        localStorage.setItem("authToken", token);
        localStorage.setItem("token", token);
        TOKEN_KEYS.forEach((key) => {
          try {
            localStorage.setItem(key, token);
          } catch {}
        });
      }

      window.dispatchEvent(
        new StorageEvent("storage", { key: LS_AUTH_KEY, newValue: "true" })
      );
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: LS_USER_KEY,
          newValue: JSON.stringify(user || null),
        })
      );
    } catch (e) {
      console.warn("persistAuthData error", e);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    console.log("Signup form submitted, making API call...");

    setError("");
    setLoading(true);

    try {
      const response = await api.post("auth/signup", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      console.log("Signup successful:", response.data);

      const token = response.data?.token || response.data?.accessToken || null;
      const user = response.data?.user ||
        response.data?.data?.user || {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        };

      persistAuthData({ token, user });

      navigate("/");
    } catch (err) {
      console.error("=== FULL ERROR DETAILS ===");
      console.error("Error message:", err.message);
      console.error("Error response:", err.response);
      console.error("Error response data:", err.response?.data);
      console.error("Error response status:", err.response?.status);
      console.error("Sent data:", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      let errorMessage = "Signup failed. Please try again.";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      if (
        err.response?.data?.errors &&
        Array.isArray(err.response.data.errors)
      ) {
        const fieldErrors = err.response.data.errors.join(", ");
        errorMessage = `${errorMessage}: ${fieldErrors}`;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className={`auth-form ${isActive ? "is-active" : ""}`}
      onSubmit={handleSubmit}
      method="post"
      action="#"
    >
      {error && (
        <div
          style={{
            backgroundColor: "#fee",
            color: "#c00",
            padding: "12px 15px",
            marginBottom: "20px",
            border: "1px solid #fcc",
            borderRadius: "6px",
            fontSize: "14px",
            lineHeight: "1.5",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span style={{ fontSize: "18px" }}>⚠️</span>
          <div style={{ flex: 1 }}>{error}</div>
          <button
            type="button"
            onClick={() => setError("")}
            style={{
              background: "none",
              border: "none",
              color: "#c00",
              cursor: "pointer",
              fontSize: "18px",
              padding: "0",
              lineHeight: "1",
            }}
            aria-label="Close error"
          >
            ✕
          </button>
        </div>
      )}

      <div className="field field_style">
        <label htmlFor="signup-name">Full name</label>
        <input
          id="signup-name"
          name="name"
          type="text"
          placeholder="Aditi Sharma"
          value={formData.name}
          onChange={handleChange}
          disabled={loading}
          className="input_style"
          required
        />
      </div>

      <div className="field field_style">
        <label htmlFor="signup-email">Email</label>
        <input
          id="signup-email"
          name="email"
          type="email"
          placeholder="you@email.com"
          value={formData.email}
          onChange={handleChange}
          className="input_style"
          disabled={loading}
          required
        />
      </div>

      <div className="field field_style">
        <label htmlFor="signup-phone">Mobile number</label>
        <input
          id="signup-phone"
          name="phone"
          type="tel"
          placeholder="e.g. +91 9090-123-456"
          value={formData.phone}
          onChange={handleChange}
          disabled={loading}
          className="input_style"
          required
        />
      </div>

      <div className="field password-field field_style">
        <label htmlFor="signup-password">Password</label>
        <input
          id="signup-password"
          name="password"
          type="password"
          placeholder="Create a strong password"
          value={formData.password}
          onChange={handleChange}
          className="input_style"
          disabled={loading}
          required
        />
      </div>

      <label className="checkbox small">
        <input
          type="checkbox"
          name="terms"
          checked={formData.terms}
          onChange={handleChange}
          disabled={loading}
          required
        />
        I agree to the OYO.plus <a href="#">Terms</a> &{" "}
        <a href="#">Privacy Policy</a>
      </label>

      <button className="btn primary full" type="submit" disabled={loading}>
        {loading ? "Creating account..." : "Join OYO.plus"}
      </button>

      <div
        className="btn social full"
        style={{ display: "flex", justifyContent: "center" }}
      >
        <GoogleLogin
          className="w-full"
          onSuccess={async (credentialResponse) => {
            try {
              setLoading(true);
              const tokenFromGoogle = credentialResponse.credential;
              const res = await api.post("auth/google", {
                token: tokenFromGoogle,
              });

              const backendToken =
                res.data?.token || res.headers["x-auth-token"] || null;
              const user = res.data?.user || res.data?.data?.user || null;

              if (backendToken) {
                try {
                  const header = JSON.parse(atob(backendToken.split(".")[0]));
                  if (header?.alg && header.alg !== "HS256") {
                    console.warn(
                      "Received non-HS256 token from backend — not storing it"
                    );
                  } else {
                    persistAuthData({ token: backendToken, user });
                  }
                } catch (e) {
                  persistAuthData({ token: backendToken, user });
                }
              } else {
                persistAuthData({ token: null, user });
              }

              navigate("/");
            } catch (err) {
              console.error("Google signup failed:", err);
              setError(
                err.response?.data?.message ||
                  "Google signup failed. Please try again."
              );
            } finally {
              setLoading(false);
            }
          }}
          onError={() => setError("Google signup failed")}
        />
      </div>
    </form>
  );
};

export default SignupForm;
