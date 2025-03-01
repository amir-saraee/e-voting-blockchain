import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  CircularProgress,
  Chip,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  InputAdornment,
  FormControlLabel,
  Switch,
  MenuItem,
  Grid,
} from "@mui/material";
import axios from "axios";
import { ethers } from "ethers";
import votingAbi from "../abis/Voting.json";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { AdapterMomentJalaali } from "@mui/x-date-pickers/AdapterMomentJalaali";
import moment from "moment-jalaali";
import { Link } from "react-router-dom";
import { styled } from "@mui/material/styles";
import {
  Add as AddIcon,
  Event as EventIcon,
  HowToVote as VoteIcon,
  Person as PersonIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  CalendarToday,
  EventAvailable,
  CheckCircleOutline,
  AccessTime as TimeIcon,
  People as PeopleIcon,
  BarChart as ResultsIcon,
} from "@mui/icons-material";
import { getPersianDegree } from "../utils/degreeConverter";

moment.loadPersian({ dialect: "persian-modern" });

const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[8],
  background: "linear-gradient(145deg, #ffffff 0%, #f0f4f8 100%)",
  transition: "transform 0.3s, box-shadow 0.3s",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[12],
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  padding: theme.spacing(1, 2),
  fontSize: "0.9rem",
  "&:hover": {
    boxShadow: theme.shadows[2],
  },
}));

const ElectionCard = ({ election, onEndElection, onViewVoteDetails }) => {
  const theme = useTheme();
  const [timeLeft, setTimeLeft] = useState(null);

  const status = election?.status;

  useEffect(() => {
    if (status === "notStarted") {
      const timer = setInterval(() => {
        const now = new Date();
        const start = new Date(election.startTime);
        const difference = start - now;

        if (difference <= 0) {
          clearInterval(timer);
          setTimeLeft(null);
          return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [status, election.startTime]);

  const formatTimeLeft = () => {
    if (!timeLeft) return "۰ روز ۰ ساعت ۰ دقیقه ۰ ثانیه";
    return `${timeLeft.days} روز ${String(timeLeft.hours).padStart(
      2,
      "0"
    )} ساعت ${String(timeLeft.minutes).padStart(2, "0")} دقیقه ${String(
      timeLeft.seconds
    ).padStart(2, "0")} ثانیه`;
  };

  const calculateVoteCount = (election) =>
    election.candidates.reduce(
      (sum, candidate) => sum + (candidate.voteCount || 0),
      0
    );

  const voteCount = calculateVoteCount(election);
  const candidateCount = election.candidates.length;

  const statusConfig = {
    notStarted: { color: "warning", label: "آماده شروع", icon: <TimeIcon /> },
    ongoing: { color: "success", label: "در حال برگزاری", icon: <EventIcon /> },
    ended: { color: "error", label: "پایان یافته", icon: <CloseIcon /> },
  };

  return (
    <StyledCard>
      <CardHeader
        avatar={
          <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
            <EventIcon />
          </Avatar>
        }
        title={
          <Typography variant="h5" fontWeight={600}>
            {election.name}
          </Typography>
        }
        subheader={
          <Stack direction="row" spacing={1} alignItems="center" mt={1}>
            <Chip
              label={statusConfig[status].label}
              color={statusConfig[status].color}
              icon={statusConfig[status].icon}
              size="small"
              sx={{ borderRadius: 1 }}
            />
            <Chip
              icon={<VoteIcon fontSize="small" />}
              label={`${voteCount} رأی`}
              size="small"
              variant="outlined"
            />
            <Chip
              icon={<PeopleIcon fontSize="small" />}
              label={`${candidateCount} کاندیدا`}
              size="small"
              variant="outlined"
            />
          </Stack>
        }
      />
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <InfoIcon color="action" fontSize="small" />
            <Typography variant="body2">شناسه: {election.id}</Typography>
          </Stack>

          <Divider />

          <Stack spacing={1}>
            <Typography variant="caption" color="text.secondary">
              زمان شروع:
            </Typography>
            <Typography variant="body2">
              {moment(election.startTime).format("jD jMMMM jYYYY - HH:mm")}
            </Typography>
          </Stack>

          <Stack spacing={1}>
            <Typography variant="caption" color="text.secondary">
              زمان پایان:
            </Typography>
            <Typography variant="body2">
              {moment(election.endTime).format("jD jMMMM jYYYY - HH:mm")}
            </Typography>
          </Stack>

          {!election.isPublic && (
            <Stack spacing={1}>
              <Typography variant="caption" color="text.secondary">
                شرایط شرکت:
              </Typography>
              <Box display="flex" gap={1}>
                <Chip label={`حداقل سن: ${election.minAge}`} size="small" />
                <Chip
                  label={`تحصیلات: ${getPersianDegree(
                    election.requiredEducation
                  )}`}
                  size="small"
                />
              </Box>
            </Stack>
          )}

          <Divider sx={{ my: 1 }} />

          {status === "notStarted" && (
            <ActionButton
              fullWidth
              variant="outlined"
              color="warning"
              startIcon={<TimeIcon />}
            >
              شروع در: {formatTimeLeft()}
            </ActionButton>
          )}

          {status === "ongoing" && (
            <ActionButton
              fullWidth
              variant="contained"
              color="error"
              onClick={() => onEndElection(election.id)}
              startIcon={<CloseIcon />}
            >
              پایان انتخابات
            </ActionButton>
          )}

          <Stack direction="row" spacing={1}>
            <ActionButton
              fullWidth
              variant="outlined"
              component={Link}
              to={`/admin/elections/${election.id}`}
              startIcon={<InfoIcon />}
            >
              جزئیات
            </ActionButton>

            {status === "ended" ? (
              <ActionButton
                fullWidth
                variant="contained"
                component={Link}
                to={`/admin/results/${election.id}`}
                startIcon={<ResultsIcon />}
              >
                نتایج
              </ActionButton>
            ) : (
              <ActionButton
                fullWidth
                variant="outlined"
                onClick={() => onViewVoteDetails(election.id)}
                startIcon={<PeopleIcon />}
              >
                رأی‌دهندگان
              </ActionButton>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </StyledCard>
  );
};

function ElectionManagement() {
  const [elections, setElections] = useState([]);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openVoteDetails, setOpenVoteDetails] = useState(false);
  const [voteDetails, setVoteDetails] = useState([]);
  const [currentElectionId, setCurrentElectionId] = useState(null);
  const [electionName, setElectionName] = useState("");
  const [startTime, setStartTime] = useState(moment());
  const [endTime, setEndTime] = useState(moment());
  const [loading, setLoading] = useState(false);
  const [hasConditions, setHasConditions] = useState(false);
  const [minAge, setMinAge] = useState("");
  const [requiredEducation, setRequiredEducation] = useState("");
  const theme = useTheme();

  useEffect(() => {
    fetchElections();
  }, []);

  const fetchElections = () => {
    axios
      .get("http://localhost:3001/api/elections")
      .then((res) => setElections(res.data))
      .catch((err) => console.error("Error fetching elections:", err));
  };

  const handleCreateElection = async () => {
    if (!electionName || !startTime || !endTime) {
      alert("لطفاً همه فیلدها را پر کنید.");
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

      const tx = await contract.createElection(
        electionName,
        startTime.unix(),
        endTime.unix(),
        !hasConditions,
        hasConditions ? minAge : 0,
        hasConditions ? requiredEducation : ""
      );
      await tx.wait();

      setOpenCreateDialog(false);
      setElectionName("");
      setStartTime(moment());
      setEndTime(moment());
      setHasConditions(false);
      setMinAge("");
      setRequiredEducation("");
      fetchElections();
    } catch (error) {
      console.error("Error creating election:", error);
      alert("خطا در ایجاد انتخابات.");
    } finally {
      setLoading(false);
    }
  };

  const handleEndElection = (electionId) => {
    axios
      .post(`http://localhost:3001/api/elections/${electionId}/end`)
      .then(() => {
        alert("انتخابات خاتمه یافت.");
        fetchElections();
      })
      .catch((err) => {
        console.error("Error ending election:", err);
        alert("خطا در خاتمه دادن به انتخابات.");
      });
  };

  const fetchVoteDetails = (electionId) => {
    axios
      .get(`http://localhost:3001/api/elections/${electionId}/votes`)
      .then((res) => {
        setVoteDetails(res.data);
        setCurrentElectionId(electionId);
        setOpenVoteDetails(true);
      })
      .catch((err) => console.error("Error fetching vote details:", err));
  };

  return (
    <Box sx={{ py: 2 }}>
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
        <Typography variant="h3" fontWeight={700} fontSize={32}>
          <VoteIcon sx={{ verticalAlign: "middle", mr: 1 }} />
          مدیریت انتخابات
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenCreateDialog(true)}
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
          ایجاد انتخابات جدید
        </Button>
      </Box>

      <Grid container spacing={3}>
        {elections.length === 0 ? (
          <Box textAlign="center" width="100%" py={4}>
            <Typography variant="h6" color="text.secondary">
              هنوز انتخاباتی ایجاد نشده است.
            </Typography>
          </Box>
        ) : (
          elections.map((election) => (
            <Grid item xs={12} sm={6} md={4} key={election.id}>
              <ElectionCard
                election={election}
                onEndElection={handleEndElection}
                onViewVoteDetails={fetchVoteDetails}
              />
            </Grid>
          ))
        )}
      </Grid>

      <Dialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
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
          <AddIcon fontSize="large" />
          ایجاد انتخابات جدید
        </DialogTitle>

        <DialogContent sx={{ py: 4 }}>
          <Stack spacing={4} mt={4}>
            <TextField
              fullWidth
              variant="outlined"
              label="نام انتخابات"
              value={electionName}
              onChange={(e) => setElectionName(e.target.value)}
              slotProps={{
                inputLabel: { shrink: true, sx: { color: "text.primary" } },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <VoteIcon color="action" />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <LocalizationProvider dateAdapter={AdapterMomentJalaali}>
              <DateTimePicker
                label="زمان شروع"
                value={startTime}
                onChange={setStartTime}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    variant="outlined"
                    slotProps={{
                      inputLabel: { shrink: true },
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarToday color="action" />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                )}
              />

              <DateTimePicker
                label="زمان پایان"
                value={endTime}
                onChange={setEndTime}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    fullWidth
                    variant="outlined"
                    slotProps={{
                      inputLabel: { shrink: true },
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <EventAvailable color="action" />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                )}
              />
            </LocalizationProvider>

            <FormControlLabel
              control={
                <Switch
                  checked={hasConditions}
                  onChange={(e) => setHasConditions(e.target.checked)}
                  color="primary"
                />
              }
              label="انتخابات محدود به شرایط باشد؟"
              sx={{ fontWeight: 500 }}
            />
            {hasConditions && (
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="حداقل سن"
                  type="number"
                  value={minAge}
                  onChange={(e) => setMinAge(e.target.value)}
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
                <TextField
                  select
                  fullWidth
                  label="تحصیلات مورد نیاز"
                  value={requiredEducation}
                  onChange={(e) => setRequiredEducation(e.target.value)}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <InfoIcon color="action" />
                        </InputAdornment>
                      ),
                    },
                  }}
                >
                  <MenuItem value="diploma">دیپلم</MenuItem>
                  <MenuItem value="bachelor's">کارشناسی</MenuItem>
                  <MenuItem value="master's">کارشناسی ارشد</MenuItem>
                  <MenuItem value="doctorate">دکترا</MenuItem>
                </TextField>
              </Stack>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setOpenCreateDialog(false)}
            sx={{
              borderRadius: 1,
              px: 3,
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            لغو
          </Button>

          <Button
            variant="contained"
            onClick={handleCreateElection}
            disabled={loading}
            sx={{
              borderRadius: 1,
              px: 4,
              bgcolor: "primary.main",
              "&:hover": { bgcolor: "primary.dark" },
            }}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: "common.white" }} />
            ) : (
              <Stack direction="row" alignItems="center" gap={1}>
                <CheckCircleOutline fontSize="small" />
                ایجاد انتخابات
              </Stack>
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openVoteDetails}
        onClose={() => setOpenVoteDetails(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle
          sx={{
            bgcolor: theme.palette.primary.main,
            color: theme.palette.common.white,
            display: "flex",
            alignItems: "center",
            gap: 2,
            py: 2,
          }}
        >
          <PeopleIcon />
          لیست رأی‌دهندگان (انتخابات #{currentElectionId})
        </DialogTitle>

        <DialogContent sx={{ py: 3 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>#</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>آدرس کیف پول</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>زمان رأی</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {voteDetails.map((vote, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell sx={{ fontFamily: "monospace" }}>
                      {vote.voterAddress}
                    </TableCell>
                    <TableCell>
                      {moment(vote.timestamp).format("jD jMMMM jYYYY - HH:mm")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            variant="contained"
            onClick={() => setOpenVoteDetails(false)}
            sx={{ borderRadius: 1 }}
          >
            بستن
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ElectionManagement;
