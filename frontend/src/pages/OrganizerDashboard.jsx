import { useEffect, useState } from "react";
import api from "../api";

function OrganizerDashboard() {
const [user, setUser] = useState(null);
const [events, setEvents] = useState([]);
const [categories, setCategories] = useState([]);
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
const [form, setForm] = useState({
title: "",
description: "",
eventDate: "",
startTime: "",
venue: "",
capacity: "",
categoryId: "",
});

const [editingId, setEditingId] = useState(null);
const [message, setMessage] = useState("");
const [error, setError] = useState("");

useEffect(() => {
loadDashboard();
}, []);

const loadDashboard = async () => {
try {
setError("");

  const [
    userResponse,
    eventsResponse,
    categoriesResponse,
  ] = await Promise.all([
    api.get("/api/auth/me"),
    api.get("/api/events"),
    api.get("/api/categories"),
  ]);

  setUser(userResponse.data.user);
  setEvents(eventsResponse.data.events);
  setCategories(
    categoriesResponse.data.categories
  );
} catch (err) {
  console.error("Dashboard error:", err);

  setError(
    err.response?.data?.message ||
      "Unable to load dashboard"
  );
}

};

const handleChange = (e) => {
setForm({
...form,
[e.target.name]: e.target.value,
});
};

const resetForm = () => {
setForm({
title: "",
description: "",
eventDate: "",
startTime: "",
venue: "",
capacity: "",
categoryId: "",
});

setEditingId(null);

};

const handleSubmit = async (e) => {
e.preventDefault();

try {
  setMessage("");
  setError("");

  if (editingId) {
    const response = await api.put(
      `/api/events/${editingId}`,
      form
    );

    setMessage(response.data.message);
  } else {
    const response = await api.post(
      "/api/events",
      form
    );

    setMessage(response.data.message);
  }

  resetForm();

  await loadDashboard();
} catch (err) {
  console.error("Event save error:", err);

  setError(
    err.response?.data?.message ||
      "Unable to save event"
  );
}

};

const editEvent = (event) => {
setEditingId(event.id);

setForm({
  title: event.title,
  description: event.description,
  eventDate: formatDate(event.eventDate),
  startTime: formatTime(event.startTime.slice(0, 5)),
  venue: event.venue,
  capacity: event.capacity,
  categoryId: event.categoryId,
});

setMessage("");
setError("");

window.scrollTo({
  top: 0,
  behavior: "smooth",
});

};

const deleteEvent = async (eventId) => {
const confirmed = window.confirm(
"Are you sure you want to delete this event?"
);

if (!confirmed) {
  return;
}

try {
  setMessage("");
  setError("");

  const response = await api.delete(
    `/api/events/${eventId}`
  );

  setMessage(response.data.message);

  await loadDashboard();
} catch (err) {
  console.error("Delete event error:", err);

  setError(
    err.response?.data?.message ||
      "Unable to delete event"
  );
}

};

const logout = async () => {
try {
await api.post("/api/auth/logout", {});

  window.location.href = "/login";
} catch (err) {
  console.error("Logout error:", err);
}

};

return (
<div className="page">
{/* =========================
TOP BAR
========================= */}
<header className="topbar">
<div className="topbar-brand">
<div className="small-brand-icon">
C
</div>

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
    {/* =========================
        WELCOME
    ========================= */}
    <section className="welcome-card">
      <div>
        <p className="eyebrow">
          Organizer Dashboard
        </p>

        <h1>
          Welcome, {user?.name || "Organizer"} 👋
        </h1>

        <p className="welcome-text">
          Create and manage campus events for
          students.
        </p>
      </div>

      <div className="profile-info">
        <span>{user?.email}</span>

        <span className="role-badge role-organizer">
          ORGANIZER
        </span>
      </div>
    </section>

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

    {/* =========================
        CREATE / EDIT EVENT
    ========================= */}
    <section className="dashboard-section">
      <div className="section-header">
        <div>
          <p className="eyebrow">
            Event Management
          </p>

          <h2>
            {editingId
              ? "Edit Event"
              : "Create Event"}
          </h2>

          <p>
            {editingId
              ? "Update the details of your event."
              : "Create a new campus event for students."}
          </p>
        </div>
      </div>

      <form
        className="event-form"
        onSubmit={handleSubmit}
      >
        <div className="form-group">
          <label htmlFor="event-title">
            Event Title
          </label>

          <input
            id="event-title"
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Enter event title"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="event-description">
            Description
          </label>

          <textarea
            id="event-description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Describe your event"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="event-date">
              Date
            </label>

            <input
              id="event-date"
              type="date"
              name="eventDate"
              value={form.eventDate}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="event-time">
              Start Time
            </label>

            <input
              id="event-time"
              type="time"
              name="startTime"
              value={form.startTime}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="event-venue">
              Venue
            </label>

            <input
              id="event-venue"
              type="text"
              name="venue"
              value={form.venue}
              onChange={handleChange}
              placeholder="Example: Seminar Hall"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="event-capacity">
              Capacity
            </label>

            <input
              id="event-capacity"
              type="number"
              name="capacity"
              min="1"
              value={form.capacity}
              onChange={handleChange}
              placeholder="Number of seats"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="event-category">
            Category
          </label>

          <select
            id="event-category"
            name="categoryId"
            value={form.categoryId}
            onChange={handleChange}
            required
          >
            <option value="">
              Select Category
            </option>

            {categories.map((category) => (
              <option
                key={category.id}
                value={category.id}
              >
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-actions">
          <button
            className="primary-button"
            type="submit"
          >
            {editingId
              ? "Update Event"
              : "Create Event"}
          </button>

          {editingId && (
            <button
              className="secondary-button"
              type="button"
              onClick={resetForm}
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>
    </section>

    {/* =========================
        MY EVENTS
    ========================= */}
    <section className="dashboard-section">
      <div className="section-header">
        <div>
          <p className="eyebrow">
            Event Management
          </p>

          <h2>My Events</h2>
        </div>

        <span className="count-badge">
          {events.length}
        </span>
      </div>

      {events.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            📅
          </div>

          <h3>No events available</h3>

          <p>
            Create your first event using the
            form above.
          </p>
        </div>
      ) : (
        <div className="event-grid">
          {events.map((event) => {
            const registrationCount =
              event.registrationCount || 0;

            const remainingSeats =
              event.remainingSeats ??
              Math.max(
                event.capacity -
                  registrationCount,
                0
              );

            return (
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
                    <strong>
                      {formatDate(event.eventDate)}
                    </strong>
                  </div>

                  <div>
                    <span>🕐</span>
                    <strong>
                      {formatTime(event.startTime)}
                    </strong>
                  </div>

                  <div>
                    <span>📍</span>
                    <strong>
                      {event.venue}
                    </strong>
                  </div>
                </div>

                <div className="event-stat">
                  <strong>
                    Capacity:
                  </strong>{" "}
                  {event.capacity}
                </div>

                <div className="event-stat">
                  <strong>
                    Registrations:
                  </strong>{" "}
                  {registrationCount}
                </div>

                <div className="event-stat">
                  <strong>
                    Seats remaining:
                  </strong>{" "}
                  {remainingSeats}
                </div>

                <div className="event-actions">
                  <button
                    className="edit-button"
                    onClick={() =>
                      editEvent(event)
                    }
                  >
                    Edit
                  </button>

                  <button
                    className="delete-button"
                    onClick={() =>
                      deleteEvent(event.id)
                    }
                  >
                    Delete
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  </main>
</div>

);
}

export default OrganizerDashboard;