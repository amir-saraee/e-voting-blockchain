import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Chip,
  Box,
  CircularProgress,
  Paper,
  Avatar,
  Divider,
  useTheme,
} from "@mui/material";
import {
  Event as CalendarIcon,
  People as CandidatesIcon,
  HowToVote as VoteIcon,
  ArrowBack as BackIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import axios from "axios";
import { styled } from "@mui/material/styles";
import moment from "moment-jalaali";

// Configure moment-jalaali for Persian dates
moment.loadPersian({ dialect: "persian-modern" });

const StyledCard = styled(Card)(({ theme }) => ({
  background: "linear-gradient(145deg, #f5f7fa 0%, #c3cfe2 100%)",
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[4],
  transition: "transform 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-4px)",
  },
}));

const TimePaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5),
  borderRadius: theme.spacing(1.5),
  background: "linear-gradient(45deg, #ffffff 30%, #f8f9fa 90%)",
  border: `1px solid ${theme.palette.divider}`,
  "& .MuiSvgIcon-root": {
    color: theme.palette.primary.main,
  },
}));

const CandidatePaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1.5),
  borderLeft: `4px solid ${theme.palette.primary.main}`,
  transition: "box-shadow 0.3s ease",
  "&:hover": {
    boxShadow: theme.shadows[3],
  },
}));

const LoadingOverlay = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "80vh",
  gap: theme.spacing(2),
  background: "rgba(255, 255, 255, 0.8)",
  borderRadius: theme.spacing(2),
}));

function ElectionDetails() {
  const { electionId } = useParams();
  const [election, setElection] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    axios
      .get(`http://localhost:3001/api/elections/${electionId}`)
      .then((res) => {
        setElection(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [electionId]);

  if (loading) {
    return (
      <LoadingOverlay>
        <CircularProgress
          size={60}
          thickness={4}
          sx={{ color: theme.palette.primary.main }}
        />
        <Typography variant="h6" color="textSecondary" mt={2}>
          در حال دریافت اطلاعات انتخابات...
        </Typography>
      </LoadingOverlay>
    );
  }

  if (!election) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        gap={2}
        py={8}
      >
        <Typography variant="h4" color="error" gutterBottom>
          انتخابات مورد نظر یافت نشد!
        </Typography>
        <Button
          startIcon={<BackIcon />}
          variant="outlined"
          color="primary"
          size="large"
          onClick={() => navigate(-1)}
          sx={{ borderRadius: 2 }}
        >
          بازگشت به صفحه اصلی
        </Button>
      </Box>
    );
  }

  // Use the status field directly from the backend
  const isActive = election.status === "ongoing";

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <StyledCard>
        <CardContent sx={{ p: 4 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={4}
            pb={2}
            borderBottom={`2px solid ${theme.palette.divider}`}
          >
            <Typography
              variant="h3"
              component="h1"
              sx={{ fontWeight: 700, color: "primary.main" }}
            >
              {election.name}
            </Typography>
            <Chip
              label={
                election.status === "notStarted"
                  ? "آماده شروع"
                  : election.status === "ongoing"
                  ? "در حال برگزاری"
                  : "پایان یافته"
              }
              color={
                election.status === "notStarted"
                  ? "warning"
                  : election.status === "ongoing"
                  ? "success"
                  : "error"
              }
              sx={{
                fontSize: "1rem",
                px: 2,
                py: 1,
                borderRadius: 1,
                boxShadow: theme.shadows[1],
              }}
            />
          </Box>

          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6}>
              <TimePaper>
                <Box display="flex" alignItems="center" gap={2}>
                  <CalendarIcon fontSize="medium" />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      زمان شروع
                    </Typography>
                    <Typography variant="h6" fontWeight={500}>
                      {moment(election.startTime).format(
                        "jD jMMMM jYYYY - HH:mm"
                      )}
                    </Typography>
                  </Box>
                </Box>
              </TimePaper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TimePaper>
                <Box display="flex" alignItems="center" gap={2}>
                  <CalendarIcon fontSize="medium" />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      زمان پایان
                    </Typography>
                    <Typography variant="h6" fontWeight={500}>
                      {moment(election.endTime).format(
                        "jD jMMMM jYYYY - HH:mm"
                      )}
                    </Typography>
                  </Box>
                </Box>
              </TimePaper>
            </Grid>
          </Grid>

          <Divider
            sx={{
              my: 4,
              borderWidth: 1,
              borderColor: theme.palette.divider,
              background: `linear-gradient(90deg, transparent 0%, ${theme.palette.primary.main} 50%, transparent 100%)`,
            }}
          />

          <Box mb={4}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              <CandidatesIcon fontSize="large" color="primary" />
              <Typography variant="h4" color="text.primary">
                لیست کاندیداها
              </Typography>
            </Box>

            {election.candidates.length === 0 ? (
              <Box
                textAlign="center"
                py={4}
                bgcolor="action.hover"
                borderRadius={2}
              >
                <Typography variant="h6" color="text.secondary">
                  هنوز کاندیدایی ثبت نام نکرده است
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {election.candidates.map((candidate) => (
                  <Grid item xs={12} sm={6} key={candidate.id}>
                    <CandidatePaper>
                      <Box display="flex" alignItems="center" gap={3}>
                        <Avatar
                          sx={{
                            width: 56,
                            height: 56,
                            bgcolor: "primary.main",
                            fontSize: "1.5rem",
                          }}
                        >
                          {candidate.name.charAt(0)}
                        </Avatar>
                        <Box flex={1}>
                          <Typography
                            variant="h6"
                            fontWeight={600}
                            gutterBottom
                          >
                            {candidate.name}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={1.5}>
                            <VoteIcon fontSize="small" color="action" />
                            <Typography variant="body1" color="text.secondary">
                              <Box
                                component="span"
                                fontWeight={600}
                                color="primary.main"
                              >
                                {candidate.voteCount}
                              </Box>{" "}
                              رای
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </CandidatePaper>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>

          <Box display="flex" justifyContent="flex-end" mt={6}>
            <Button
              variant="contained"
              startIcon={<BackIcon />}
              onClick={() => navigate(-1)}
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                fontSize: "1.1rem",
                boxShadow: theme.shadows[2],
                "&:hover": {
                  boxShadow: theme.shadows[4],
                },
              }}
            >
              بازگشت
            </Button>
          </Box>
        </CardContent>
      </StyledCard>
    </Container>
  );
}

export default ElectionDetails;
