import { useState } from "react";
import {
  Box,
  Tabs,
  Tab,
  TextField,
  Button,
  Typography,
  Paper,
  Snackbar,
  Alert,
  useTheme,
  styled,
  Grid2,
  alpha,
  InputAdornment,
  CircularProgress,
  MenuItem,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import {
  Lock as LockIcon,
  Email as EmailIcon,
  PersonAdd as RegisterIcon,
  Login as LoginIcon,
  HowToVote as VoteIcon,
  CheckCircleOutline,
  ErrorOutline,
} from "@mui/icons-material";

const StyledTabs = styled(Tabs)(({ theme }) => ({
  "& .MuiTabs-indicator": {
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.palette.primary.main,
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  fontSize: "1.1rem",
  fontWeight: 500,
  minWidth: 120,
  margin: theme.spacing(0, 2),
  "&.Mui-selected": {
    color: theme.palette.primary.main,
  },
}));

const AuthButton = styled(Button)(({ theme }) => ({
  height: 48,
  fontSize: "1rem",
  fontWeight: 600,
  borderRadius: 8,
  boxShadow: theme.shadows[2],
  transition: "all 0.3s ease",
  "&:hover": {
    boxShadow: theme.shadows[4],
    transform: "translateY(-2px)",
  },
}));

function LoginRegistration() {
  const theme = useTheme();
  const [tabIndex, setTabIndex] = useState(0);
  const { login, register } = useAuth();
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [loading, setLoading] = useState(false);

  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm();

  const {
    register: registerRegister,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
  } = useForm();

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  const onLoginSubmit = async (data) => {
    try {
      setLoading(true);
      await login(data.email, data.password);
      setSnackbarMessage("Login successful!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setSnackbarMessage(
        "خطا: " + (error.response?.data?.error || error.message)
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  // LoginRegistration.jsx
  const onRegisterSubmit = async (data) => {
    try {
      setLoading(true);
      await register(data.email, data.password, data.age, data.education);
      setSnackbarMessage("Registration successful!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setSnackbarMessage(
        "خطا: " + (error.response?.data?.error || error.message)
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex" }} bgcolor="blue">
      <Grid2 container sx={{ minHeight: "100vh" }} width={"100%"}>
        <Grid2
          item
          size={{ xs: 12, md: 6 }}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 4,
            background: `linear-gradient(135deg, ${alpha(
              theme.palette.primary.main,
              0.1
            )} 0%, ${theme.palette.background.default} 100%)`,
          }}
        >
          <Paper
            elevation={0}
            sx={{
              maxWidth: 480,
              width: "100%",
              p: 6,
              borderRadius: 4,
              boxShadow: theme.shadows[4],
            }}
          >
            <Box textAlign="center" mb={4}>
              <VoteIcon
                sx={{
                  fontSize: 64,
                  color: "primary.main",
                  mb: 2,
                }}
              />
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  mb: 1,
                }}
              >
                سامانه رأی‌گیری هوشمند
              </Typography>
              <Typography variant="body1" color="text.secondary">
                پلتفرم رأی‌گیری غیرمتمرکز مبتنی بر بلاک چین
              </Typography>
            </Box>

            <StyledTabs value={tabIndex} onChange={handleTabChange} centered>
              <StyledTab
                label="ورود"
                icon={<LoginIcon />}
                iconPosition="start"
              />
              <StyledTab
                label="ثبت نام"
                icon={<RegisterIcon />}
                iconPosition="start"
              />
            </StyledTabs>

            <Box sx={{ mt: 4 }}>
              {tabIndex === 0 ? (
                <form onSubmit={handleLoginSubmit(onLoginSubmit)}>
                  <TextField
                    fullWidth
                    label="ایمیل"
                    sx={{ mb: 3 }}
                    {...loginRegister("email")}
                    error={Boolean(loginErrors.email)}
                    helperText={loginErrors.email?.message}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailIcon color="action" />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />

                  <TextField
                    fullWidth
                    label="رمز عبور"
                    type="password"
                    sx={{ mb: 4 }}
                    {...loginRegister("password")}
                    error={Boolean(loginErrors.password)}
                    helperText={loginErrors.password?.message}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockIcon color="action" />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />

                  <AuthButton
                    type="submit"
                    fullWidth
                    variant="contained"
                    loading={loading}
                    startIcon={
                      loading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        <LoginIcon />
                      )
                    }
                  >
                    {loading ? "در حال ورود..." : "ورود به سیستم"}
                  </AuthButton>
                </form>
              ) : (
                <form onSubmit={handleRegisterSubmit(onRegisterSubmit)}>
                  <TextField
                    fullWidth
                    label="ایمیل"
                    sx={{ mb: 3 }}
                    {...registerRegister("email", {
                      required: "ایمیل الزامی است",
                    })}
                    error={Boolean(registerErrors.email)}
                    helperText={registerErrors.email?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    label="رمز عبور"
                    type="password"
                    sx={{ mb: 3 }}
                    {...registerRegister("password", {
                      required: "رمز عبور الزامی است",
                    })}
                    error={Boolean(registerErrors.password)}
                    helperText={registerErrors.password?.message}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    label="سن"
                    type="number"
                    sx={{ mb: 3 }}
                    {...registerRegister("age", { required: "سن الزامی است" })}
                    error={Boolean(registerErrors.age)}
                    helperText={registerErrors.age?.message}
                  />
                  <TextField
                    select
                    fullWidth
                    label="تحصیلات"
                    sx={{ mb: 4 }}
                    {...registerRegister("education", {
                      required: "تحصیلات الزامی است",
                    })}
                    error={Boolean(registerErrors.education)}
                    helperText={registerErrors.education?.message}
                  >
                    <MenuItem value="diploma">دیپلم</MenuItem>
                    <MenuItem value="bachelor's">کارشناسی</MenuItem>
                    <MenuItem value="master's">کارشناسی ارشد</MenuItem>
                    <MenuItem value="doctorate">دکترا</MenuItem>
                  </TextField>
                  <AuthButton
                    type="submit"
                    fullWidth
                    variant="contained"
                    loading={loading}
                    startIcon={
                      loading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        <RegisterIcon />
                      )
                    }
                  >
                    {loading ? "در حال ثبت نام..." : "ایجاد حساب کاربری"}
                  </AuthButton>
                </form>
              )}
            </Box>
          </Paper>
        </Grid2>

        <Grid2
          item
          size={{ xs: 12, md: 6 }}
          sx={{
            display: { xs: "none", md: "block" },
            position: "relative",
            backgroundImage:
              "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(/voting-bg.jpg)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></Grid2>
      </Grid2>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbarSeverity}
          sx={{
            width: "100%",
            boxShadow: theme.shadows[4],
            border: `1px solid ${theme.palette.divider}`,
          }}
          iconMapping={{
            success: <CheckCircleOutline fontSize="inherit" />,
            error: <ErrorOutline fontSize="inherit" />,
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default LoginRegistration;
