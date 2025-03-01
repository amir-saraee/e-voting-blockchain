import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { ethers } from "ethers";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Avatar,
  useTheme,
  Chip,
  Alert,
} from "@mui/material";
import votingAbi from "../abis/Voting.json";
import {
  HowToVote as VoteIcon,
  ArrowBack as BackIcon,
  CheckCircle as SuccessIcon,
  AccountBalanceWallet as WalletIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { getPersianDegree } from "../utils/degreeConverter";

// Function to connect wallet and cast vote
async function connectWalletAndVote(electionId, candidateId) {
  if (!window.ethereum) throw new Error("لطفاً MetaMask را نصب کنید!");
  await window.ethereum.request({ method: "eth_requestAccounts" });
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const walletAddress = await signer.getAddress();
  console.log("Connected wallet:", walletAddress);

  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
  const contract = new ethers.Contract(contractAddress, votingAbi.abi, signer);

  const tx = await contract.vote(electionId, candidateId);
  await tx.wait();
}

// Styled Election Header Component
const ElectionHeader = ({ election, walletAddress, hasVoted }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        background: `linear-gradient(45deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
        borderRadius: 2,
        p: 4,
        mb: 6,
        color: "white",
        boxShadow: theme.shadows[4],
      }}
    >
      <Typography variant="h3" gutterBottom>
        {election.name}
      </Typography>
      <Chip
        label={
          election.status === "ongoing"
            ? "در حال برگزاری"
            : election.status === "notStarted"
            ? "آماده شروع"
            : "پایان یافته"
        }
        color={
          election.status === "ongoing"
            ? "success"
            : election.status === "notStarted"
            ? "warning"
            : "error"
        }
        sx={{ mb: 2 }}
      />
      {!election.isPublic && (
        <Box mt={2}>
          <Typography variant="body1">شرایط شرکت:</Typography>
          <Typography>حداقل سن: {election.minAge || "نامشخص"}</Typography>
          <Typography>
            تحصیلات: {getPersianDegree(election.requiredEducation) || "نامشخص"}
          </Typography>
        </Box>
      )}
      <Box mt={2} display="flex" alignItems="center" gap={2}>
        {walletAddress ? (
          <Typography>
            کیف پول متصل: {walletAddress.slice(0, 6)}...
            {walletAddress.slice(-4)}
          </Typography>
        ) : (
          <Typography color="warning.main">
            لطفاً کیف پول خود را متصل کنید
          </Typography>
        )}
      </Box>
      {hasVoted && (
        <Alert severity="info" sx={{ mt: 2 }}>
          شما قبلاً در این انتخابات رأی داده‌اید.
        </Alert>
      )}
    </Box>
  );
};

// Styled Candidate Card Component
const CandidateCard = ({ candidate, selected, onSelect, disabled }) => {
  const theme = useTheme();
  return (
    <Card
      onClick={!disabled ? onSelect : undefined}
      sx={{
        cursor: disabled ? "not-allowed" : "pointer",
        border: selected ? `2px solid ${theme.palette.primary.main}` : "none",
        boxShadow: selected ? theme.shadows[4] : theme.shadows[1],
        transition: "all 0.3s",
        "&:hover": !disabled && {
          boxShadow: theme.shadows[6],
          transform: "translateY(-4px)",
        },
        borderRadius: 2,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <CardContent sx={{ textAlign: "center" }}>
        <Avatar
          sx={{
            bgcolor: theme.palette.primary.main,
            width: 64,
            height: 64,
            mb: 2,
            mx: "auto",
          }}
        >
          {candidate.name[0]}
        </Avatar>
        <Typography variant="h6" fontWeight={600}>
          {candidate.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          شناسه: {candidate.id}
        </Typography>
      </CardContent>
    </Card>
  );
};

// Main VotingPage Component
function VotingPage() {
  const theme = useTheme();
  const { electionId } = useParams();
  const [election, setElection] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [voted, setVoted] = useState(false);
  const [error, setError] = useState(null);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  // Get wallet address from MetaMask
  const walletAddress = window.ethereum?.selectedAddress || null;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch election details
        const electionRes = await axios.get(
          `http://localhost:3001/api/elections/${electionId}`
        );
        setElection(electionRes.data);

        // Fetch candidates
        const candidatesRes = await axios.get(
          `http://localhost:3001/api/elections/${electionId}/candidates`
        );
        setCandidates(candidatesRes.data);

        // Fetch voting history to check if user has voted
        if (walletAddress) {
          const votesRes = await axios.get(
            `http://localhost:3001/api/elections/${electionId}/votes`
          );
          const userVote = votesRes.data.find(
            (vote) =>
              vote.voterAddress.toLowerCase() === walletAddress.toLowerCase()
          );
          if (userVote) {
            setHasVoted(true);
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("خطا در بارگذاری اطلاعات.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [electionId, walletAddress]);

  const handleSelectCandidate = (candidate) => {
    if (!hasVoted) {
      setSelectedCandidate(candidate);
      setOpenConfirmDialog(true);
    }
  };

  const handleConfirmVote = async () => {
    setOpenConfirmDialog(false);
    setVoting(true);
    setError(null);
    setHasVoted(true); // Optimistic update
    try {
      await connectWalletAndVote(electionId, selectedCandidate.id);
      setVoted(true);
    } catch (err) {
      if (err.message?.includes("You have already voted")) {
        setError(
          "شما قبلاً در این انتخابات رأی داده‌اید. لطفاً نتایج را مشاهده کنید."
        );
      } else {
        setHasVoted(false); // Roll back if vote fails for another reason
        setError(err.message || "خطا در ثبت رأی.");
      }
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ textAlign: "center", py: 10 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" mt={2}>
          در حال بارگذاری...
        </Typography>
      </Container>
    );
  }

  if (!election) {
    return (
      <Container sx={{ textAlign: "center", py: 10 }}>
        <WarningIcon sx={{ fontSize: 80, color: "error.main", mb: 2 }} />
        <Typography variant="h4">انتخابات یافت نشد</Typography>
        <Button component={Link} to="/voter" variant="contained" sx={{ mt: 2 }}>
          بازگشت به داشبورد
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Back Button */}
      <Box mb={4}>
        <Button
          component={Link}
          to="/voter"
          startIcon={<BackIcon />}
          variant="outlined"
          sx={{
            borderRadius: 2,
            px: 3,
            "&:hover": { boxShadow: theme.shadows[2] },
          }}
        >
          بازگشت به داشبورد
        </Button>
      </Box>

      {/* Election Header */}
      <ElectionHeader
        election={election}
        walletAddress={walletAddress}
        hasVoted={hasVoted}
      />

      {/* Election Status Check */}
      {election.status !== "ongoing" ? (
        <Box textAlign="center" py={6}>
          <Typography variant="h4" color="error" gutterBottom>
            {election.status === "ended"
              ? "این انتخابات خاتمه یافته است"
              : "این انتخابات هنوز شروع نشده است"}
          </Typography>
          {election.status === "ended" && (
            <Button
              component={Link}
              to={`/voter/results/${electionId}`}
              variant="contained"
            >
              مشاهده نتایج
            </Button>
          )}
        </Box>
      ) : candidates.length === 0 ? (
        <Box textAlign="center" py={6}>
          <Typography variant="h6" color="text.secondary">
            هنوز کاندیدایی برای این انتخابات ثبت نشده است.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {candidates.map((candidate) => (
            <Grid item xs={12} sm={6} md={4} key={candidate.id}>
              <CandidateCard
                candidate={candidate}
                selected={selectedCandidate?.id === candidate.id}
                onSelect={() => handleSelectCandidate(candidate)}
                disabled={hasVoted}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>تأیید رأی</DialogTitle>
        <DialogContent>
          <Typography>
            آیا مطمئن هستید که می‌خواهید به{" "}
            <strong>{selectedCandidate?.name}</strong> رأی دهید؟
          </Typography>
          <Typography variant="caption" color="error" mt={1}>
            * این عمل قابل بازگشت نیست.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDialog(false)}>لغو</Button>
          <Button onClick={handleConfirmVote} disabled={voting || hasVoted}>
            {voting ? <CircularProgress size={24} /> : "تأیید"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Message */}
      {voted && (
        <Box textAlign="center" py={6}>
          <SuccessIcon sx={{ fontSize: 80, color: "success.main", mb: 3 }} />
          <Typography variant="h4" gutterBottom>
            رأی شما با موفقیت ثبت شد!
          </Typography>
          <Button component={Link} to="/voter" variant="contained">
            بازگشت به داشبورد
          </Button>
        </Box>
      )}

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
          {error.includes("قبلاً رأی داده‌اید") && (
            <Button
              component={Link}
              to={`/voter/results/${electionId}`}
              sx={{ ml: 2 }}
            >
              مشاهده نتایج
            </Button>
          )}
        </Alert>
      )}
    </Container>
  );
}

export default VotingPage;
