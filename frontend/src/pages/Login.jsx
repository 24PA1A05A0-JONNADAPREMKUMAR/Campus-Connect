import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

function Login() {
const navigate = useNavigate();

const [formData, setFormData] = useState({
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

const email = formData.email.trim().toLowerCase();
const password = formData.password;

if (!email || !password) {
  setError("Email and password are required.");
  return;
}

setLoading(true);

try {
  const response = await api.post("/api/auth/login", {
    email,
    password,
  });

  setMessage(response.data.message);

  const user = response.data.user;

  if (user.role === "student") {
    navigate("/student");
  } else if (user.role === "organizer") {
    navigate("/organizer");
  } else if (user.role === "admin") {
    navigate("/admin");
  } else {
    setError("Invalid user role.");
  }
} catch (err) {
  setError(
    err.response?.data?.message ||
      "Unable to login. Please try again."
  );
} finally {
  setLoading(false);
}


};

return ( <div className="auth-page"> <div className="auth-card"> <div className="auth-logo">
CampusConnect </div>


    <h1 className="auth-title">
      Welcome Back!
    </h1>

    <p className="auth-subtitle">
      Login to continue to CampusConnect
    </p>

    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="login-email">
          Email
        </label>

        <input
          id="login-email"
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
        <label htmlFor="login-password">
          Password
        </label>

        <div className="password-wrapper">
          <input
            id="login-password"
            type={
              showPassword ? "text" : "password"
            }
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            autoComplete="current-password"
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
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>

    {message && (
      <div className="success-message">
        {message}
      </div>
    )}

    {error && (
      <div className="error-message">
        {error}
      </div>
    )}

    <div className="auth-footer">
      Don't have an account?{" "}
      <Link to="/signup">
        Create Account
      </Link>
    </div>
  </div>
</div>


);
}

export default Login;
