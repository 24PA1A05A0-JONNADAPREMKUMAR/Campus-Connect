import { useEffect, useState } from "react";
import api from "../api";

function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    const [year, month, day] = dateString.split("-");

    return `${day}-${month}-${year}`;
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";

    const [hours, minutes] = timeString.split(":");

    const hour = Number(hours);

    const period = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;

    return `${hour12}:${minutes} ${period}`;
  };
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] =
    useState("");

  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setErrors({});

    try {
      const response = await api.get("/api/auth/me");
      setUser(response.data.user);
    } catch (err) {
      console.error("User loading error:", err);

      setErrors((current) => ({
        ...current,
        user: "Unable to load admin profile.",
      }));
    }

    try {
      const response = await api.get("/api/categories");

      setCategories(response.data.categories || []);
    } catch (err) {
      console.error("Categories loading error:", err);

      setErrors((current) => ({
        ...current,
        categories: "Unable to load categories.",
      }));
    }

    try {
      const response = await api.get("/api/users");

      setUsers(response.data.users || []);
    } catch (err) {
      console.error("Users loading error:", err);

      setErrors((current) => ({
        ...current,
        users:
          err.response?.data?.message ||
          "Unable to load users.",
      }));
    }

    try {
      const response = await api.get(
        "/api/events/admin/all"
      );

      setEvents(response.data.events || []);
    } catch (err) {
      console.error("Events loading error:", err);

      setErrors((current) => ({
        ...current,
        events:
          err.response?.data?.message ||
          "Unable to load events.",
      }));
    }
  };

  const createCategory = async (event) => {
    event.preventDefault();

    setMessage("");
    setErrors((current) => ({
      ...current,
      categoryCreate: "",
    }));

    try {
      const response = await api.post(
        "/api/categories",
        {
          name: categoryName.trim(),
          description: categoryDescription.trim(),
        }
      );

      setMessage(response.data.message);

      setCategoryName("");
      setCategoryDescription("");

      try {
        const categoryResponse = await api.get(
          "/api/categories"
        );

        setCategories(
          categoryResponse.data.categories || []
        );
      } catch (err) {
        console.error(
          "Category refresh error:",
          err
        );
      }
    } catch (err) {
      console.error("Create category error:", err);

      setErrors((current) => ({
        ...current,
        categoryCreate:
          err.response?.data?.message ||
          "Unable to create category.",
      }));
    }
  };
  const changeUserRole = async (userId, newRole) => {
    setMessage("");

    setErrors((current) => ({
      ...current,
      users: "",
    }));

    try {
      const response = await api.put(
        `/api/users/${userId}/role`,
        {
          role: newRole,
        }
      );

      setMessage(response.data.message);

      setUsers((currentUsers) =>
        currentUsers.map((item) =>
          item.id === userId
            ? {
              ...item,
              role: newRole,
            }
            : item
        )
      );
    } catch (err) {
      console.error("Role update error:", err);

      setErrors((current) => ({
        ...current,
        users:
          err.response?.data?.message ||
          "Unable to update user role.",
      }));
    }
  };
  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <div className="page">
      <header className="topbar">
        <div className="topbar-brand">
          <div className="small-brand-icon">C</div>
          <span>CampusConnect</span>
        </div>

        <button
          className="outline-button"
          onClick={logout}
        >
          Logout
        </button>
      </header>

      <main className="dashboard-container">
        <section className="welcome-card admin-welcome">
          <div>
            <p className="eyebrow">Administration</p>

            <h1>
              Welcome, {user?.name || "Administrator"} 👋
            </h1>

            <p className="welcome-text">
              Manage categories, users and campus events.
            </p>
          </div>

          <div className="profile-info">
            <span>{user?.email}</span>
            <span className="admin-role-badge">
              ADMIN
            </span>
          </div>
        </section>

        {errors.user && (
          <div className="alert error-alert">
            {errors.user}
          </div>
        )}

        <section className="admin-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Management</p>
              <h2>Create Category</h2>
            </div>
          </div>

          <div className="admin-form-card">
            <form
              onSubmit={createCategory}
              className="category-form"
            >
              <div className="form-group">
                <label htmlFor="categoryName">
                  Category Name
                </label>

                <input
                  id="categoryName"
                  type="text"
                  placeholder="Example: Technical"
                  value={categoryName}
                  onChange={(e) =>
                    setCategoryName(e.target.value)
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="categoryDescription">
                  Description
                </label>

                <textarea
                  id="categoryDescription"
                  placeholder="Describe this category"
                  value={categoryDescription}
                  onChange={(e) =>
                    setCategoryDescription(
                      e.target.value
                    )
                  }
                />
              </div>

              <button
                type="submit"
                className="primary-button"
              >
                Create Category
              </button>
            </form>

            {message && (
              <div className="alert success-alert">
                {message}
              </div>
            )}

            {errors.categoryCreate && (
              <div className="alert error-alert">
                {errors.categoryCreate}
              </div>
            )}
          </div>
        </section>

        <section className="admin-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Categories</p>
              <h2>Existing Categories</h2>
            </div>

            <span className="count-badge">
              {categories.length}
            </span>
          </div>

          {errors.categories && (
            <div className="alert error-alert">
              {errors.categories}
            </div>
          )}

          {categories.length === 0 ? (
            <div className="empty-card">
              <div className="empty-icon">📂</div>
              <h3>No categories available</h3>
              <p>
                Create a category to organize campus
                events.
              </p>
            </div>
          ) : (
            <div className="category-grid">
              {categories.map((category) => (
                <div
                  className="category-card"
                  key={category.id}
                >
                  <div className="category-icon">
                    #
                  </div>

                  <div>
                    <h3>{category.name}</h3>

                    <p>
                      {category.description ||
                        "No description provided."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="admin-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Accounts</p>
              <h2>Registered Users</h2>
            </div>

            <span className="count-badge">
              {users.length}
            </span>
          </div>

          {errors.users && (
            <div className="alert error-alert">
              {errors.users}
            </div>
          )}

          {users.length === 0 ? (
            <div className="empty-card">
              <div className="empty-icon">👥</div>
              <h3>No users available</h3>
              <p>
                Registered users will appear here.
              </p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((item) => {
                    const isCurrentAdmin =
                      item.id === user?.id;

                    return (
                      <tr key={item.id}>
                        <td>
                          <strong>{item.name}</strong>

                          {isCurrentAdmin && (
                            <span className="current-user-label">
                              You
                            </span>
                          )}
                        </td>

                        <td>{item.email}</td>

                        <td>
                          <span
                            className={`role-badge role-${item.role}`}
                          >
                            {item.role}
                          </span>
                        </td>

                        <td>
                          {isCurrentAdmin ? (
                            <span className="disabled-action">
                              Your account
                            </span>
                          ) : (
                            <select
                              value={item.role}
                              onChange={(e) =>
                                changeUserRole(
                                  item.id,
                                  e.target.value
                                )
                              }
                              className="role-select"
                            >
                              <option value="student">
                                Student
                              </option>

                              <option value="organizer">
                                Organizer
                              </option>

                              <option value="admin">
                                Admin
                              </option>
                            </select>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="admin-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Campus Activity</p>
              <h2>All Events</h2>
            </div>

            <span className="count-badge">
              {events.length}
            </span>
          </div>

          {errors.events && (
            <div className="alert error-alert">
              {errors.events}
            </div>
          )}

          {events.length === 0 ? (
            <div className="empty-card">
              <div className="empty-icon">📅</div>
              <h3>No events available</h3>
              <p>
                Events created by organizers will appear
                here.
              </p>
            </div>
          ) : (
            <div className="event-grid">
              {events.map((event) => (
                <article
                  className="event-card"
                  key={event.id}
                >
                  <div className="event-card-top">
                    <span className="category-badge">
                      {event.category?.name ||
                        "General"}
                    </span>

                    <span
                      className={`status-badge status-${event.status}`}
                    >
                      {event.status}
                    </span>
                  </div>

                  <h3>{event.title}</h3>

                  <p className="event-description">
                    {event.description}
                  </p>

                  <div className="event-details">
                    <div>
                      <span>📅</span>
                      <strong>{formatDate(event.eventDate)}</strong>
                    </div>

                    <div>
                      <span>🕐</span>
                      <strong>{formatTime(event.startTime)}</strong>
                    </div>

                    <div>
                      <span>📍</span>
                      <strong>{event.venue}</strong>
                    </div>

                    <div>
                      <span>👥</span>
                      <strong>
                        {event.capacity} seats
                      </strong>
                    </div>
                  </div>

                  <div className="event-organizer">
                    Organizer:{" "}
                    <strong>
                      {event.organizer?.name ||
                        "Unknown"}
                    </strong>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;