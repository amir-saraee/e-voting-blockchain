import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginRegistration from "./components/LoginRegistration";
import AdminDashboard from "./components/AdminDashboard";
import VoterDashboard from "./components/VoterDashboard";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import { prefixer } from "stylis";
import rtlPlugin from "stylis-plugin-rtl";

import "./App.css";
import VotingPage from "./components/VotingPage";
import VoterLayout from "./components/VoterLayout";
import DanaFont from "./assets/fonts/DANA-REGULAR.ttf";
import ElectionResults from "./components/ElectionResults";

const theme = createTheme({
  typography: {
    fontFamily: "Raleway, Segoe UI, Tahoma, Arial, sans-serif",
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @font-face {
          font-family: 'Raleway';
          font-style: normal;
          font-display: swap;
          font-weight: 400;
          src: local('Raleway'), local('Raleway-Regular'), url(${DanaFont}) format('woff2');
          unicodeRange: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF;
        }
      `,
    },
  },
});

const rtlCache = createCache({
  key: "muirtl",
  stylisPlugins: [prefixer, rtlPlugin],
});

function AppRoutes() {
  const { user } = useAuth();

  // If not logged in, show login/registration page
  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<LoginRegistration />} />
      </Routes>
    );
  }

  // If logged in and role is admin
  if (user.role === "admin") {
    return (
      <Routes>
        <Route path="/admin/*" element={<AdminDashboard />} />
        <Route path="*" element={<AdminDashboard />} />
      </Routes>
    );
  }

  // Otherwise, assume voter
  return (
    <Routes>
      <Route path="/voter" element={<VoterLayout />}>
        <Route index element={<VoterDashboard />} />
        <Route path="vote/:electionId" element={<VotingPage />} />
        <Route path="results/:electionId" element={<ElectionResults />} />
      </Route>
      <Route path="*" element={<VoterLayout />}>
        <Route index element={<VoterDashboard />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <CacheProvider value={rtlCache}>
        <Router>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </Router>
      </CacheProvider>
    </ThemeProvider>
  );
}

export default App;
