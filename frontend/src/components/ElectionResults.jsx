import { useState, useEffect } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Grid,
  Paper,
  Divider,
  useTheme,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  HowToVote as VoteIcon,
  People as CandidatesIcon,
  Event as CalendarIcon,
} from "@mui/icons-material";
import axios from "axios";
import { styled } from "@mui/material/styles";
import { BarChart } from "@mui/x-charts/BarChart";
import moment from "moment-jalaali";
import { useAuth } from "../context/AuthContext";

// Configure moment-jalaali for Persian dates
moment.loadPersian({ dialect: "persian-modern" });

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[6],
  background: "linear-gradient(145deg, #ffffff 0%, #f0f4f8 100%)",
}));

const StatPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1.5),
  textAlign: "center",
  background: "linear-gradient(45deg, #f8f9fa 30%, #ffffff 90%)",
  border: `1px solid ${theme.palette.divider}`,
  "& .MuiSvgIcon-root": {
    color: theme.palette.primary.main,
    fontSize: "2rem",
  },
}));

function ElectionResults() {
  const { electionId } = useParams();
  const [election, setElection] = useState(null);
  const [results, setResults] = useState(null);
  const [votes, setVotes] = useState([]);
  const [userVote, setUserVote] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();
  const context = useOutletContext();
  const walletAddress = context?.walletAddress;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch election details
        const electionRes = await axios.get(
          `http://localhost:3001/api/elections/${electionId}`
        );
        setElection(electionRes.data);

        // Fetch results (names and vote counts)
        const resultsRes = await axios.get(
          `http://localhost:3001/api/elections/${electionId}/results`
        );
        setResults(resultsRes.data);

        // Fetch individual votes for additional stats
        const votesRes = await axios.get(
          `http://localhost:3001/api/elections/${electionId}/votes`
        );
        setVotes(votesRes.data);

        // Check user's vote (only for voters with a connected wallet)
        if (user && user.role === "voter" && walletAddress) {
          const userVoteData = votesRes.data.find(
            (vote) =>
              vote.voterAddress.toLowerCase() === walletAddress.toLowerCase()
          );
          if (userVoteData) {
            const candidate = electionRes.data.candidates.find(
              (c) => c.id === userVoteData.candidateId
            );
            setUserVote({
              candidateName: candidate ? candidate.name : "کاندیدای ناشناس",
            });
          }
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setLoading(false);
      }
    };

    fetchData();
  }, [electionId, user, walletAddress]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: "center" }}>
        <CircularProgress size={60} sx={{ color: "primary.main" }} />
        <Typography variant="h6" color="text.secondary" mt={2}>
          در حال بارگذاری نتایج...
        </Typography>
      </Container>
    );
  }

  if (!election || !results || !results.names || !results.votes) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="h4" color="error" gutterBottom>
          داده‌های انتخابات یافت نشد!
        </Typography>
        <Button
          variant="outlined"
          startIcon={<BackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mt: 2, borderRadius: 2 }}
        >
          بازگشت به داشبورد
        </Button>
      </Container>
    );
  }

  // Calculate additional statistics
  const totalVotes = results.votes.reduce((sum, vote) => sum + vote, 0);
  const candidateCount = results.names.length;
  const uniqueVoters = [...new Set(votes.map((vote) => vote.voterAddress))]
    .length;

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <StyledCard>
        <CardContent sx={{ p: 4 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={4}
          >
            <Typography
              variant="h3"
              component="h1"
              sx={{ fontWeight: 700, color: "primary.main", fontSize: 32 }}
            >
              نتایج انتخابات: {election.name}
            </Typography>
            <Button
              variant="contained"
              startIcon={<BackIcon />}
              onClick={() => navigate(-1)}
              sx={{
                borderRadius: 2,
                px: 3,
                py: 1,
                boxShadow: theme.shadows[2],
                "&:hover": { boxShadow: theme.shadows[4] },
              }}
            >
              بازگشت
            </Button>
          </Box>

          {/* User Vote Information (for voters only) */}
          {user && user.role === "voter" && (
            <Box mb={4}>
              {walletAddress ? (
                userVote ? (
                  <Alert severity="success" sx={{ borderRadius: 2 }}>
                    شما به کاندیدای <strong>{userVote.candidateName}</strong>{" "}
                    رأی داده‌اید.
                  </Alert>
                ) : (
                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    رأی شما در این انتخابات ثبت نشده است.
                  </Alert>
                )
              ) : (
                <Alert severity="warning" sx={{ borderRadius: 2 }}>
                  لطفاً کیف پول خود را متصل کنید تا رأی شما نمایش داده شود.
                </Alert>
              )}
            </Box>
          )}

          {/* Election Statistics */}
          <Grid container spacing={3} mb={6}>
            <Grid item xs={12} sm={4}>
              <StatPaper>
                <VoteIcon />
                <Typography variant="h6" mt={1}>
                  کل آرا
                </Typography>
                <Typography variant="h4" color="primary.main" fontWeight={600}>
                  {totalVotes}
                </Typography>
              </StatPaper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatPaper>
                <CandidatesIcon />
                <Typography variant="h6" mt={1}>
                  تعداد کاندیداها
                </Typography>
                <Typography variant="h4" color="primary.main" fontWeight={600}>
                  {candidateCount}
                </Typography>
              </StatPaper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatPaper>
                <CalendarIcon />
                <Typography variant="h6" mt={1}>
                  تعداد رای‌دهندگان
                </Typography>
                <Typography variant="h4" color="primary.main" fontWeight={600}>
                  {uniqueVoters}
                </Typography>
              </StatPaper>
            </Grid>
          </Grid>

          {/* Election Timing */}
          <Box mb={6}>
            <Typography variant="h5" gutterBottom>
              زمان‌بندی انتخابات
            </Typography>
            <Box display="flex" gap={2}>
              <Chip
                icon={<CalendarIcon />}
                label={`شروع: ${moment(election.startTime).format(
                  "jD jMMMM jYYYY - HH:mm"
                )}`}
                variant="outlined"
                color="primary"
              />
              <Chip
                icon={<CalendarIcon />}
                label={`پایان: ${moment(election.endTime).format(
                  "jD jMMMM jYYYY - HH:mm"
                )}`}
                variant="outlined"
                color="primary"
              />
            </Box>
          </Box>

          {/* Bar Chart for Results */}
          <Box>
            <Typography variant="h5" gutterBottom>
              نتایج کاندیداها
            </Typography>
            <BarChart
              xAxis={[
                {
                  scaleType: "band",
                  data: results.names,
                  label: "نام کاندیدا",
                },
              ]}
              series={[
                {
                  data: results.votes,
                  label: "تعداد آرا",
                  color: theme.palette.primary.main,
                },
              ]}
              height={400}
              margin={{ top: 20, bottom: 60, left: 60, right: 20 }}
              sx={{
                "& .MuiChartsAxis-label": { fontSize: "1rem", fontWeight: 500 },
                "& .MuiChartsLegend-root": { display: "none" },
              }}
            />
          </Box>

          <Divider sx={{ my: 6, borderColor: theme.palette.divider }} />
        </CardContent>
      </StyledCard>
    </Container>
  );
}

export default ElectionResults;
