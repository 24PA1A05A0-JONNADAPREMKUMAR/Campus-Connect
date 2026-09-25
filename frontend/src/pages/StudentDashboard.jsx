import { useEffect, useState } from "react";
import api from "../api";

function StudentDashboard() {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [error, setError] = useState("");
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

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setError("");

      const [
        userResponse,
        eventsResponse,
        registrationsResponse,
      ] = await Promise.all([
        api.get("/api/auth/me"),
        api.get("/api/events"),
        api.get("/api/events/my-registrations"),
      ]);

      setUser(userResponse.data.user);
      setEvents(eventsResponse.data.events);
      setRegistrations(
        registrationsResponse.data.registrations
      );
    } catch (err) {
      console.error("Dashboard error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to load dashboard"
      );
    }

  };

  const registerForEvent = async (eventId) => {
    try {
      setError("");

      const response = await api.post(
        `/api/events/${eventId}/register`
      );

      const registeredEvent = events.find(
        (event) => event.id === eventId
      );

      const newRegistration = {
        id: response.data.registration.id,
        status: "registered",
        event: registeredEvent,
      };

      setRegistrations((current) => [
        ...current,
        newRegistration,
      ]);

      setEvents((currentEvents) =>
        currentEvents.map((event) =>
          event.id === eventId
            ? {
              ...event,
              registrationCount:
                response.data.registrationCount,
              remainingSeats:
                response.data.remainingSeats,
            }
            : event
        )
      );
    } catch (err) {
      console.error("Registration error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to register for event"
      );
    }

  };

  const isRegistered = (eventId) => {
    return registrations.some(
      (registration) =>
        registration.event?.id === eventId &&
        registration.status === "registered"
    );
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
              Student Dashboard
            </p>

            <h1>
              Welcome, {user?.name || "Student"} 👋
            </h1>

            <p className="welcome-text">
              Discover campus events and register for
              activities.
            </p>
          </div>

          <div className="profile-info">
            <span>{user?.email}</span>

            <span className="role-badge role-student">
              STUDENT
            </span>
          </div>
        </section>

        {/* =========================
        ERROR
    ========================= */}
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {/* =========================
        UPCOMING EVENTS
    ========================= */}
        <section className="dashboard-section">
          <div className="section-header">
            <div>
              <p className="eyebrow">
                Campus Activities
              </p>

              <h2>Upcoming Events</h2>
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
                New campus events will appear here.
              </p>
            </div>
          ) : (
            <div className="event-grid">
              {events.map((event) => {
                const registered = isRegistered(
                  event.id
                );

                const remainingSeats =
                  event.remainingSeats ??
                  Math.max(
                    event.capacity -
                    (event.registrationCount || 0),
                    0
                  );

                const registrationCount =
                  event.registrationCount || 0;

                const isFull =
                  remainingSeats === 0;

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

                      {isFull && (
                        <span className="status-badge status-cancelled">
                          Full
                        </span>
                      )}
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

                      <div>
                        <span>👤</span>
                        <strong>
                          {event.organizer?.name ||
                            "N/A"}
                        </strong>
                      </div>
                    </div>

                    <div className="seat-info">
                      <strong>Seats:</strong>

                      <span>
                        {remainingSeats} /{" "}
                        {event.capacity} available
                      </span>
                    </div>

                    <p className="registration-count">
                      {registrationCount} student
                      {registrationCount !== 1
                        ? "s"
                        : ""}{" "}
                      registered
                    </p>

                    {registered ? (
                      <button
                        className="registered-button"
                        disabled
                      >
                        Registered ✓
                      </button>
                    ) : isFull ? (
                      <button
                        className="full-button"
                        disabled
                      >
                        Event Full
                      </button>
                    ) : (
                      <button
                        className="register-button"
                        onClick={() =>
                          registerForEvent(
                            event.id
                          )
                        }
                      >
                        Register
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* =========================
        MY REGISTRATIONS
    ========================= */}
        <section className="dashboard-section">
          <div className="section-header">
            <div>
              <p className="eyebrow">
                My Activity
              </p>

              <h2>My Registrations</h2>
            </div>

            <span className="count-badge">
              {registrations.length}
            </span>
          </div>

          {registrations.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                🎟️
              </div>

              <h3>No registrations yet</h3>

              <p>
                Register for an event to see it here.
              </p>
            </div>
          ) : (
            <div className="registration-list">
              {registrations.map(
                (registration) => (
                  <div
                    className="registration-card"
                    key={registration.id}
                  >
                    <h3>
                      {registration.event?.title ||
                        "Event"}
                    </h3>

                    <div className="event-details">
                      <div>
                        <span>🏷️</span>
                        <strong>
                          {registration.event
                            ?.category?.name ||
                            "N/A"}
                        </strong>
                      </div>

                      <div>
                        <span>📅</span>
                        <strong>
                          {formatDate(
                            registration.event?.eventDate
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>🕐</span>
                        <strong>
                          {formatTime(
                            registration.event?.startTime
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>📍</span>
                        <strong>
                          {registration.event
                            ?.venue || "N/A"}
                        </strong>
                      </div>
                    </div>

                    <p>
                      <strong>Status:</strong>{" "}
                      {registration.status}
                    </p>
                  </div>
                )
              )}
            </div>
          )}
        </section>
      </main>
    </div>

  );
}

export default StudentDashboard;