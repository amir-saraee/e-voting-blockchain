import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Grid,
  Avatar,
  Chip,
  CircularProgress,
  Divider,
  useTheme,
  InputAdornment,
  Stack,
} from "@mui/material";
import axios from "axios";
import { ethers } from "ethers";
import votingAbi from "../abis/Voting.json";
import {
  PersonAdd as AddCandidateIcon,
  HowToVote as ElectionIcon,
  Person as PersonIcon,
  Campaign as CampaignIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  BarChart as BarChartIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[6],
  background: "linear-gradient(145deg, #f5f7fa 0%, #e0e7ff 100%)",
}));

const CandidateCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(1.5),
  borderLeft: `4px solid ${theme.palette.primary.main}`,
  transition: "transform 0.3s, box-shadow 0.3s",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[8],
  },
  background: "linear-gradient(45deg, #ffffff 30%, #f8fafc 90%)",
}));

function CandidateManagement() {
  const theme = useTheme();
  const [candidates, setCandidates] = useState([]);
  const [elections, setElections] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [candidateName, setCandidateName] = useState("");
  const [selectedElectionId, setSelectedElectionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedFilterElection, setSelectedFilterElection] = useState("all"); // New filter state

  useEffect(() => {
    fetchCandidates();
    fetchElections();
  }, []);

  const fetchCandidates = () => {
    axios
      .get("http://localhost:3001/api/candidates")
      .then((res) => setCandidates(res.data))
      .catch((err) => console.error("Error fetching candidates:", err));
  };

  const fetchElections = () => {
    axios
      .get("http://localhost:3001/api/elections")
      .then((res) => setElections(res.data))
      .catch((err) => console.error("Error fetching elections:", err));
  };

  const handleAddCandidate = async () => {
    if (!selectedElectionId || !candidateName) {
      alert("لطفاً یک انتخابات را انتخاب کرده و نام کاندیدا را وارد کنید.");
      return;
    }

    const selectedElection = elections.find(
      (election) => election.id === selectedElectionId
    );
    if (selectedElection && selectedElection.status === "ended") {
      alert("این انتخابات خاتمه یافته است. نمی‌توانید کاندیدا اضافه کنید.");
      return;
    }

    try {
      if (!window.ethereum) {
        alert("لطفاً MetaMask را نصب کنید!");
        return;
      }
      setLoading(true);
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
      const signer = await provider.getSigner();
      const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;

      const contract = new ethers.Contract(
        contractAddress,
        votingAbi.abi,
        signer
      );
      const tx = await contract.addCandidate(selectedElectionId, candidateName);
      await tx.wait();
      alert("کاندیدا با موفقیت اضافه شد!");
      setOpenDialog(false);
      setCandidateName("");
      setSelectedElectionId("");
      fetchCandidates();
      setLoading(false);
    } catch (error) {
      console.error("Error adding candidate:", error);
      setLoading(false);
      alert("خطا در اضافه کردن کاندیدا.");
    }
  };

  const getElectionName = (electionId) => {
    const found = elections.find(
      (election) => election.id.toString() === electionId.toString()
    );
    return found ? found.name : electionId;
  };

  const getElectionStatus = (electionId) => {
    const found = elections.find(
      (election) => election.id.toString() === electionId.toString()
    );
    return found ? found.status : "نامشخص";
  };

  // Filter candidates based on the selected election
  const filteredCandidates =
    selectedFilterElection === "all"
      ? candidates
      : candidates.filter(
          (candidate) => candidate.electionId === selectedFilterElection
        );

  const CandidateCardComponent = ({ candidate }) => (
    <CandidateCard>
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Avatar
            sx={{
              bgcolor: theme.palette.primary.main,
              width: 48,
              height: 48,
            }}
          >
            <PersonIcon />
          </Avatar>
          <Box flex={1}>
            <Typography variant="h5" fontWeight={600}>
              {candidate.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              شناسه بلاک‌چین: {candidate.blockchainId || "نامشخص"}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 2, borderColor: theme.palette.divider }} />

        <Stack spacing={1.5}>
          <Box display="flex" alignItems="center" gap={1}>
            <ElectionIcon fontSize="small" color="action" />
            <Typography variant="body1">
              انتخابات: <strong>{getElectionName(candidate.electionId)}</strong>
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <ScheduleIcon fontSize="small" color="action" />
            <Typography variant="body1">
              وضعیت:
              <Chip
                label={
                  getElectionStatus(candidate.electionId) === "ongoing"
                    ? "در حال برگزاری"
                    : getElectionStatus(candidate.electionId) === "notStarted"
                    ? "آماده شروع"
                    : "پایان یافته"
                }
                color={
                  getElectionStatus(candidate.electionId) === "ongoing"
                    ? "success"
                    : getElectionStatus(candidate.electionId) === "notStarted"
                    ? "warning"
                    : "error"
                }
                size="small"
                sx={{ ml: 1, borderRadius: 1 }}
              />
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <BarChartIcon fontSize="small" color="action" />
            <Typography variant="body1">
              تعداد آرا: <strong>{candidate.voteCount || 0}</strong>
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </CandidateCard>
  );

  return (
    <StyledCard>
      <CardContent sx={{ p: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 6,
            p: 2,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: theme.shadows[2],
          }}
        >
          <Typography
            variant="h3"
            component="h1"
            sx={{ fontWeight: 700, fontSize: 32 }}
          >
            <CampaignIcon sx={{ verticalAlign: "bottom", mr: 1.5 }} />
            مدیریت کاندیداها
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddCandidateIcon />}
            onClick={() => setOpenDialog(true)}
            sx={{
              borderRadius: 2,
              px: 4,
              py: 1.5,
              fontSize: "1.1rem",
              background: `linear-gradient(45deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              boxShadow: theme.shadows[2],
              "&:hover": {
                boxShadow: theme.shadows[4],
              },
            }}
          >
            افزودن کاندیدا
          </Button>
        </Box>

        {/* Election Filter Dropdown */}
        <Box mb={4}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>فیلتر بر اساس انتخابات</InputLabel>
            <Select
              value={selectedFilterElection}
              onChange={(e) => setSelectedFilterElection(e.target.value)}
              label="فیلتر بر اساس انتخابات"
            >
              <MenuItem value="all">همه انتخابات</MenuItem>
              {elections.map((election) => (
                <MenuItem key={election.id} value={election.id}>
                  {election.name} (ID: {election.id})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Grid container spacing={3}>
          {filteredCandidates.length === 0 ? (
            <Box textAlign="center" width="100%" py={4}>
              <Typography variant="h6" color="text.secondary">
                {selectedFilterElection === "all"
                  ? "هنوز کاندیدایی ثبت نشده است."
                  : "هیچ کاندیدایی برای این انتخابات یافت نشد."}
              </Typography>
            </Box>
          ) : (
            filteredCandidates.map((candidate) => (
              <Grid item xs={12} sm={6} md={4} key={candidate.id}>
                <CandidateCardComponent candidate={candidate} />
              </Grid>
            ))
          )}
        </Grid>

        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle
            sx={{
              bgcolor: "primary.main",
              color: "common.white",
              display: "flex",
              alignItems: "center",
              gap: 2,
              py: 2,
            }}
          >
            <AddCandidateIcon fontSize="large" />
            افزودن کاندیدای جدید
          </DialogTitle>

          <DialogContent sx={{ py: 4 }}>
            <Stack spacing={3} mt={4}>
              <FormControl fullWidth>
                <InputLabel>انتخاب انتخابات</InputLabel>
                <Select
                  value={selectedElectionId}
                  label="انتخاب انتخابات"
                  onChange={(e) => setSelectedElectionId(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <ElectionIcon color="action" />
                        </InputAdornment>
                      ),
                    },
                  }}
                >
                  <MenuItem value="">
                    <em>انتخاب کنید</em>
                  </MenuItem>
                  {elections
                    .filter((election) => election.status !== "ended")
                    .sort((a, b) => (a.status === "ongoing" ? -1 : 1))
                    .map((election) => (
                      <MenuItem key={election.id} value={election.id}>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Chip
                            label={`ID: ${election.id}`}
                            size="small"
                            sx={{ borderRadius: 1 }}
                          />
                          {election.name}
                          <Chip
                            label={
                              election.status === "ongoing"
                                ? "در حال برگزاری"
                                : "آماده شروع"
                            }
                            color={
                              election.status === "ongoing"
                                ? "success"
                                : "warning"
                            }
                            size="small"
                            sx={{ borderRadius: 1 }}
                          />
                        </Box>
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>

              <TextField
                label="نام کامل کاندیدا"
                fullWidth
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon color="action" />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Stack>
          </DialogContent>

          <DialogActions sx={{ px: 3, py: 2, gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => setOpenDialog(false)}
              startIcon={<CancelIcon />}
              sx={{
                borderRadius: 1,
                px: 3,
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              انصراف
            </Button>
            <Button
              variant="contained"
              onClick={handleAddCandidate}
              disabled={loading}
              startIcon={
                loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  <CheckIcon />
                )
              }
              sx={{
                borderRadius: 1,
                px: 4,
                bgcolor: "primary.main",
                "&:hover": { bgcolor: "primary.dark" },
              }}
            >
              {loading ? "در حال ثبت..." : "ثبت کاندیدا"}
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </StyledCard>
  );
}

export default CandidateManagement;
