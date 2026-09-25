import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import "./styles.css";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import StudentDashboard from "./pages/StudentDashboard";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        <Route
          path="/student"
          element={<StudentDashboard />}
        />

        <Route
          path="/organizer"
          element={<OrganizerDashboard />}
        />

        <Route
          path="/admin"
          element={<AdminDashboard />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;