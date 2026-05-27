import { BrowserRouter, Routes, Route } from "react-router-dom";
import React from "react";

import HearingReminder from "./components/HearingReminder";

// Existing Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import About from "./pages/About";
import Constitution from "./pages/Constitution";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Existing Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/about" element={<About />} />
        <Route path="/constitution" element={<Constitution />} />

        {/* New Reminder Feature Route */}
        <Route
          path="/hearing-reminder"
          element={<HearingReminder />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;