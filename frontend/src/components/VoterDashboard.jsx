import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Box,
  Divider,
  CircularProgress,
  useTheme,
  Stack,
  Tooltip,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { Link } from "react-router-dom";
import axios from "axios";
import moment from "moment-jalaali";
import {
  HowToVote as VoteIcon,
  EventAvailable as EventIcon,
  Schedule as TimeIcon,
  BarChart as ResultsIcon,
  CheckCircle as SuccessIcon,
  School as SchoolIcon,
  Group as GroupIcon,
  People as PeopleIcon,
} from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import { styled, keyframes } from "@mui/system";

// Define fade-in animation for cards
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const AnimatedCard = styled(Card)`
  animation: ${fadeIn} 0.5s ease-in-out;
`;

function VoterDashboard() {
  const theme = useTheme();
  const { user } = useAuth();
  const [elections, setElections] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all"); // "all" or "ongoing"

  // Fetch elections and user profile on mount
  useEffect(() => {
    axios
      .get("http://localhost:3001/api/elections")
      .then((res) => setElections(res.data))
      .catch((err) => console.error("Error fetching elections:", err));

    axios
      .get("http://localhost:3001/api/auth/profile", {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      .then((res) => setUserProfile(res.data))
      .catch((err) => console.error("Error fetching user profile:", err))
      .finally(() => setLoading(false));
  }, [user]);

  const educationLevels = {
    diploma: 1,
    "bachelor's": 2,
    "master's": 3,
    doctorate: 4,
  };

  // Check user eligibility for an election
  const checkEligibility = (election) => {
    if (election.isPublic) return { eligible: true };
    if (!userProfile)
      return { eligible: false, reasons: ["عدم بارگذاری پروفایل"] };

    const userEduLevel = educationLevels[userProfile.education.toLowerCase()];
    const requiredEduLevel =
      educationLevels[election.requiredEducation.toLowerCase()];
    const ageEligible = userProfile.age >= election.minAge;
    const eduEligible = userEduLevel >= requiredEduLevel;

    if (ageEligible && eduEligible) {
      return { eligible: true };
    } else {
      const reasons = [];
      if (!ageEligible) reasons.push("سن کمتر از حد مجاز");
      if (!eduEligible) reasons.push("تحصیلات ناکافی");
      return { eligible: false, reasons };
    }
  };

  // Calculate time remaining until election start
  const getTimeRemaining = (startTime) => {
    const now = moment();
    const start = moment(startTime);
    const duration = moment.duration(start.diff(now));

    if (duration.asSeconds() <= 0) return "شروع شده";
    const days = Math.floor(duration.asDays());
    const hours = duration.hours();
    const minutes = duration.minutes();
    return `${days} روز، ${hours} ساعت، ${minutes} دقیقه`;
  };

  // Filter elections based on status
  const filteredElections = useMemo(() => {
    if (filterStatus === "all") return elections;
    return elections.filter((election) => election.status === "ongoing");
  }, [elections, filterStatus]);

  if (loading) {
    return (
      <Box textAlign="center" py={6}>
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary" mt={2}>
          در حال بارگذاری...
        </Typography>
      </Box>
    );
  }

  // ElectionCard component with memoization
  // eslint-disable-next-line react/display-name
  const ElectionCard = React.memo(({ election }) => {
    const status = election?.status;
    const start = moment(election.startTime).format("jYYYY/jMM/jDD - HH:mm");
    const end = moment(election.endTime).format("jYYYY/jMM/jDD - HH:mm");
    const candidateCount = election.candidates?.length || 0;
    const totalVotes =
      election.candidates?.reduce((sum, c) => sum + (c.voteCount || 0), 0) || 0;

    const statusConfig = {
      notStarted: {
        color: "warning",
        label: "آماده شروع",
        icon: <TimeIcon fontSize="small" />,
      },
      ongoing: {
        color: "success",
        label: "در حال برگزاری",
        icon: <SuccessIcon fontSize="small" />,
      },
      ended: {
        color: "error",
        label: "پایان یافته",
        icon: <EventIcon fontSize="small" />,
      },
    };

    const eligibility = checkEligibility(election);
    const isElectionEligible = eligibility.eligible;
    const ineligibilityReasons = eligibility.reasons || [];

    return (
      <AnimatedCard
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderRadius: 2,
          boxShadow: 3,
          transition: "transform 0.3s, box-shadow 0.3s",
          "&:hover": { transform: "translateY(-4px)", boxShadow: 6 },
        }}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h6" fontWeight={600}>
              {election.name}
            </Typography>
            <Chip
              label={statusConfig[status].label}
              color={statusConfig[status].color}
              icon={statusConfig[status].icon}
              size="small"
              sx={{ borderRadius: 1 }}
            />
          </Box>

          {election.isPublic ? (
            <Box mt={2}>
              <Chip
                icon={<GroupIcon />}
                label="انتخابات عمومی"
                size="small"
                variant="outlined"
                color="primary"
              />
            </Box>
          ) : (
            <Box mt={2}>
              <Typography variant="body2" color="text.secondary">
                <strong>شرایط شرکت:</strong>
              </Typography>
              <Box display="flex" gap={1} mt={1}>
                <Chip
                  icon={<EventIcon />}
                  label={`سن: ${election.minAge}+`}
                  size="small"
                  variant="outlined"
                  color="primary"
                />
                <Chip
                  icon={<SchoolIcon />}
                  label={`تحصیلات: ${election.requiredEducation}`}
                  size="small"
                  variant="outlined"
                  color="primary"
                />
              </Box>
            </Box>
          )}

          <Divider sx={{ my: 2 }} />

          <Stack spacing={1.5}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <EventIcon color="action" fontSize="small" />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  زمان شروع:
                </Typography>
                <Typography variant="body2">{start}</Typography>
              </Box>
            </Box>
            <Box display="flex" alignItems="center" gap={1.5}>
              <EventIcon color="action" fontSize="small" />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  زمان پایان:
                </Typography>
                <Typography variant="body2">{end}</Typography>
              </Box>
            </Box>
            <Box display="flex" alignItems="center" gap={1.5}>
              <PeopleIcon color="action" fontSize="small" />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  تعداد کاندیداها:
                </Typography>
                <Typography variant="body2">{candidateCount}</Typography>
              </Box>
            </Box>
            {status !== "notStarted" && (
              <Box display="flex" alignItems="center" gap={1.5}>
                <VoteIcon color="action" fontSize="small" />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    آرا ثبت شده:
                  </Typography>
                  <Typography variant="body2">{totalVotes}</Typography>
                </Box>
              </Box>
            )}
          </Stack>

          {status === "notStarted" && (
            <Box display="flex" mt={2} gap={1} alignItems="center">
              <Typography variant="body2" color="text.secondary">
                <strong>زمان باقی‌مانده تا شروع:</strong>
              </Typography>
              <Typography variant="h6" color="primary" fontSize={14}>
                {getTimeRemaining(election.startTime)}
              </Typography>
            </Box>
          )}
        </CardContent>

        <CardActions sx={{ p: 2, justifyContent: "flex-end" }}>
          {status === "notStarted" && (
            <Tooltip title="انتخابات هنوز شروع نشده است">
              <span>
                <Button
                  variant="outlined"
                  disabled
                  startIcon={<TimeIcon />}
                  sx={{ borderRadius: 2 }}
                >
                  شروع نشده
                </Button>
              </span>
            </Tooltip>
          )}

          {status === "ongoing" && (
            <Tooltip
              title={
                !isElectionEligible
                  ? `شما واجد شرایط نیستید: ${ineligibilityReasons.join(", ")}`
                  : ""
              }
            >
              <span>
                <Button
                  variant="contained"
                  component={Link}
                  to={`vote/${election.id}`}
                  startIcon={<VoteIcon />}
                  disabled={!isElectionEligible}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    background: !isElectionEligible
                      ? "grey"
                      : `linear-gradient(45deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                  }}
                >
                  رأی دهید
                </Button>
              </span>
            </Tooltip>
          )}

          {status === "ended" && (
            <Button
              variant="contained"
              color="secondary"
              component={Link}
              to={`results/${election.id}`}
              startIcon={<ResultsIcon />}
              sx={{
                borderRadius: 2,
                px: 3,
                background: `linear-gradient(45deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
              }}
            >
              مشاهده نتایج
            </Button>
          )}

          {status === "ongoing" && !isElectionEligible && (
            <Box mt={1}>
              {ineligibilityReasons.map((reason, index) => (
                <Typography key={index} variant="body2" color="error">
                  {reason}
                </Typography>
              ))}
            </Box>
          )}
        </CardActions>
      </AnimatedCard>
    );
  });

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box textAlign="center" mb={6}>
        <Typography variant="h3" fontWeight={700} gutterBottom>
          <VoteIcon sx={{ verticalAlign: "bottom", mr: 1.5 }} />
          انتخابات فعال
        </Typography>
        <Typography variant="body1" color="text.secondary">
          لیست انتخابات‌های در حال برگزاری و آینده
        </Typography>
      </Box>

      {/* Filter Switch */}
      <Box display="flex" justifyContent="flex-end" mb={4}>
        <FormControlLabel
          control={
            <Switch
              checked={filterStatus === "ongoing"}
              onChange={() =>
                setFilterStatus(filterStatus === "all" ? "ongoing" : "all")
              }
              color="primary"
            />
          }
          label={"نمایش انتخابات در حال برگزاری"}
        />
      </Box>

      {filteredElections.length === 0 ? (
        <Box textAlign="center" py={6}>
          <EventIcon sx={{ fontSize: 80, color: "text.disabled", mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            {filterStatus === "all"
              ? "در حال حاضر هیچ انتخابات فعالی وجود ندارد"
              : "در حال حاضر هیچ انتخابات در حال برگزاری وجود ندارد"}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredElections.map((election) => (
            <Grid item xs={12} sm={6} md={4} key={election.id}>
              <ElectionCard election={election} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

export default VoterDashboard;
