import React from "react";
import {
  Container,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Tabs,
  Tab,
  useTheme,
  styled,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Divider,
  Badge,
} from "@mui/material";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  AdminPanelSettings,
  HowToVote,
  People,
  ExitToApp,
  Person,
  Notifications,
  BarChart,
} from "@mui/icons-material";

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
  borderRadius: theme.spacing(2),
  marginBottom: theme.spacing(4),
  boxShadow: theme.shadows[6],
  padding: theme.spacing(1),
}));

const NavTab = styled(Tab)(({ theme }) => ({
  fontSize: "1.1rem",
  fontWeight: 600,
  minHeight: 48,
  padding: theme.spacing(1, 3),
  "&.Mui-selected": {
    color: theme.palette.primary.main,
    background: "rgba(255, 255, 255, 0.1)",
    borderRadius: theme.spacing(1),
  },
  "&:hover": {
    background: "rgba(255, 255, 255, 0.05)",
  },
}));

const ProfileButton = styled(Button)(({ theme }) => ({
  borderRadius: "50%",
  minWidth: 0,
  padding: theme.spacing(0.5),
  "&:hover": {
    background: "rgba(255, 255, 255, 0.2)",
  },
}));

function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const tabs = [
    { path: "elections", label: "انتخابات‌ها", icon: <HowToVote /> },
    { path: "candidates", label: "کاندیداها", icon: <People /> },
    { path: "reports", label: "گزارش‌های بلاک‌چین", icon: <BarChart /> },
  ];

  const currentTab = tabs.findIndex((tab) =>
    location.pathname.includes(tab.path)
  );

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleProfileClose();
  };

  return (
    <Container maxWidth="xl" sx={{ py: 6 }}>
      <StyledAppBar position="static">
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box display="flex" alignItems="center">
            <AdminPanelSettings sx={{ mr: 2, fontSize: 36, color: "white" }} />
            <Typography
              variant="h4"
              component="div"
              sx={{ fontWeight: 700, color: "white" }}
            >
              پنل مدیریت
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={2}>
            <ProfileButton onClick={handleProfileClick}>
              <Avatar
                sx={{ bgcolor: "white", color: theme.palette.primary.main }}
              >
                {user.email[0].toUpperCase()}
              </Avatar>
            </ProfileButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleProfileClose}
              PaperProps={{
                elevation: 4,
                sx: {
                  borderRadius: 2,
                  mt: 1,
                },
              }}
            >
              <MenuItem disabled sx={{ opacity: 1 }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Person fontSize="small" />
                  <Typography variant="body1">{user.email}</Typography>
                </Box>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ExitToApp fontSize="small" sx={{ mr: 1 }} />
                خروج از سیستم
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </StyledAppBar>

      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          mb: 6,
          background: "white",
          borderRadius: 2,
          boxShadow: theme.shadows[2],
          overflow: "hidden",
        }}
      >
        <Tabs
          value={currentTab === -1 ? 0 : currentTab}
          textColor="inherit"
          indicatorColor="primary"
          variant="scrollable"
          sx={{
            "& .MuiTabs-indicator": {
              height: 3,
              background: theme.palette.primary.main,
            },
          }}
        >
          {tabs.map((tab, index) => (
            <NavTab
              key={index}
              label={tab.label}
              icon={tab.icon}
              iconPosition="start"
              component={Link}
              to={`/admin/${tab.path}`}
              sx={{ minWidth: 200 }}
            />
          ))}
        </Tabs>
      </Box>

      <Outlet />
    </Container>
  );
}

export default AdminLayout;
