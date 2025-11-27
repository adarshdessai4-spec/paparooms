import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

const LS_AUTH_KEY = "oyoplus:isAuthed";
const LS_USER_KEY = "oyoplus:user";
const TOKEN_KEYS = ["authToken", "token", "accessToken", "auth_token"]; // mirror storage.js

const LoginForm = ({ isActive }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
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

    console.log("Login form submitted, making API call...");

    setError("");
    setLoading(true);

    try {
      const response = await api.post("auth/login", {
        email: formData.email,
        password: formData.password,
      });

      console.log("Login successful:", response.data);

      const token =
        response.data?.token ||
        response.data?.accessToken ||
        response.data?.data?.token ||
        response.data?.data?.accessToken ||
        null;

      const user =
        response.data?.user ||
        response.data?.data?.user ||
        null;

      persistAuthData({ token, user });

      navigate("/");
    } catch (err) {
      console.error("Login error:", err);

      let errorMessage = "Login failed. Please check your credentials.";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
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
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          name="email"
          type="email"
          placeholder="you@email.com"
          className="input_style"
          value={formData.email}
          onChange={handleChange}
          disabled={loading}
          required
        />
      </div>

      <div className="field password-field field_style">
        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          name="password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          className="input_style"
          onChange={handleChange}
          disabled={loading}
          required
        />
      </div>

      <div className="auth-options">
        <label className="checkbox">
          <input
            type="checkbox"
            name="remember"
            checked={formData.remember}
            onChange={handleChange}
            disabled={loading}
          />
          Keep me signed in
        </label>
        <a className="auth-link" href="#">
          Forgot password?
        </a>
      </div>

      <button className="btn primary full" type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Login to PAPA Rooms"}
      </button>

      <div
        className="btn social full"
        style={{ display: "flex", justifyContent: "center", width: "100%" }}
      >
        <GoogleLogin
          onSuccess={async (credentialResponse) => {
            try {
              setLoading(true);
              const tokenFromGoogle = credentialResponse.credential;
              // Send Google token to backend so backend can verify + issue HS256 token
              const res = await api.post("auth/google", {
                token: tokenFromGoogle,
              });

              // Prefer token from backend response body, fallback to header
              const backendToken =
                res.data?.token || res.headers["x-auth-token"] || null;

              // Determine user payload
              const user = res.data?.user || res.data?.data?.user || null;

              // If backendToken exists, only then persist it (DO NOT store Google ID token)
              if (backendToken) {
                // optional: quick header check for HS256 - decode header safely
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
                  // if any decode/parsing error, still persist because backend should be trusted
                  persistAuthData({ token: backendToken, user });
                }
              } else {
                // If backend didn't give a token, still persist user (cookie auth is present)
                persistAuthData({ token: null, user });
              }

              navigate("/");
            } catch (err) {
              console.error("Google login failed:", err);
              setError(
                err.response?.data?.message ||
                  "Google login failed. Please try again."
              );
            } finally {
              setLoading(false);
            }
          }}
          onError={() => {
            setError("Google login failed");
          }}
        />
      </div>
    </form>
  );
};

export default LoginForm;
