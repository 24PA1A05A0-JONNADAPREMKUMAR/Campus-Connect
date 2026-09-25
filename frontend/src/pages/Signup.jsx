import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

function Signup() {
const navigate = useNavigate();

const [formData, setFormData] = useState({
name: "",
email: "",
password: "",
});

const [showPassword, setShowPassword] = useState(false);
const [message, setMessage] = useState("");
const [error, setError] = useState("");
const [loading, setLoading] = useState(false);

const handleChange = (event) => {
setFormData((current) => ({
...current,
[event.target.name]: event.target.value,
}));

setError("");
setMessage("");

};

const handleSubmit = async (event) => {
event.preventDefault();

setMessage("");
setError("");

const name = formData.name.trim();
const email = formData.email.trim().toLowerCase();
const password = formData.password;

if (!name || !email || !password) {
  setError(
    "Name, email and password are required."
  );
  return;
}

if (password.length < 6) {
  setError(
    "Password must be at least 6 characters."
  );
  return;
}

setLoading(true);

try {
  const response = await api.post(
    "/api/auth/signup",
    {
      name,
      email,
      password,
    }
  );

  setMessage(response.data.message);

  setFormData({
    name: "",
    email: "",
    password: "",
  });

  setTimeout(() => {
    navigate("/login");
  }, 1200);
} catch (err) {
  setError(
    err.response?.data?.message ||
      "Unable to create account. Please try again."
  );
} finally {
  setLoading(false);
}

};

return (
<div className="auth-page">
<div className="auth-card">
<div className="auth-logo">
CampusConnect
</div>

    <h1 className="auth-title">
      Create Account
    </h1>

    <p className="auth-subtitle">
      Join CampusConnect today
    </p>

    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="signup-name">
          Full Name
        </label>

        <input
          id="signup-name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter your name"
          autoComplete="name"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="signup-email">
          Email
        </label>

        <input
          id="signup-email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
          autoComplete="email"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="signup-password">
          Password
        </label>

        <div className="password-wrapper">
          <input
            id="signup-password"
            type={
              showPassword ? "text" : "password"
            }
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Minimum 6 characters"
            autoComplete="new-password"
            minLength={6}
            required
          />

          <button
            type="button"
            className="password-toggle"
            onClick={() =>
              setShowPassword((current) => !current)
            }
            aria-label={
              showPassword
                ? "Hide password"
                : "Show password"
            }
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>
      </div>

      <button
        type="submit"
        className="primary-button full-width"
        disabled={loading}
      >
        {loading
          ? "Creating Account..."
          : "Create Account"}
      </button>
    </form>

    {message && (
      <div className="success-message">
        {message}
        <br />
        Redirecting to login...
      </div>
    )}

    {error && (
      <div className="error-message">
        {error}
      </div>
    )}

    <div className="auth-footer">
      Already have an account?{" "}
      <Link to="/login">
        Login
      </Link>
    </div>
  </div>
</div>

);
}

export default Signup;