import { useState, useEffect } from "react";
import {
  Container,
  Box,
  Typography,
  Button,
  Avatar,
  Chip,
  Divider,
  IconButton,
  useTheme,
  styled,
} from "@mui/material";
import { Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ethers } from "ethers";
import {
  ExitToApp as LogoutIcon,
  AccountBalanceWallet as WalletIcon,
  ContentCopy as CopyIcon,
  Check as CheckIcon,
} from "@mui/icons-material";

const StyledHeader = styled(Box)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
  marginBottom: theme.spacing(4),
  boxShadow: theme.shadows[4],
  color: theme.palette.common.white,
}));

const WalletCard = styled(Box)(({ theme }) => ({
  background: theme.palette.background.paper,
  borderRadius: theme.spacing(1.5),
  padding: theme.spacing(2),
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  boxShadow: theme.shadows[2],
  "&:hover": {
    boxShadow: theme.shadows[4],
  },
}));

function VoterLayout() {
  const theme = useTheme();
  const { user, logout } = useAuth();
  const [walletAddress, setWalletAddress] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const checkWalletConnection = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          setWalletAddress(address);
        } catch (error) {
          console.error("Error connecting to wallet:", error);
        }
      }
    };

    checkWalletConnection();
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("لطفاً یک کیف پول مانند MetaMask نصب کنید!");
      return;
    }

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setWalletAddress(address);
    } catch (error) {
      console.error("Error connecting to wallet:", error);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <StyledHeader>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: "common.white", color: "primary.main" }}>
              {user.email[0].toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h3" fontWeight={700}>
                پنل رأی دهنده
              </Typography>
              <Typography variant="body1">خوش آمدید، {user.email}</Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            color="secondary"
            startIcon={<LogoutIcon />}
            onClick={logout}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              fontWeight: 600,
              boxShadow: theme.shadows[2],
              "&:hover": {
                boxShadow: theme.shadows[4],
              },
            }}
          >
            خروج از سیستم
          </Button>
        </Box>

        <Divider sx={{ my: 3, borderColor: "rgba(255,255,255,0.2)" }} />

        {walletAddress ? (
          <WalletCard>
            <WalletIcon fontSize="large" color="primary" />
            <Box flex={1}>
              <Typography variant="body2" color="text.secondary">
                آدرس کیف پول متصل:
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography
                  variant="body1"
                  fontFamily="monospace"
                  color="black"
                >
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </Typography>
                <IconButton
                  size="small"
                  onClick={copyToClipboard}
                  sx={{ color: "text.secondary" }}
                >
                  {copied ? (
                    <CheckIcon fontSize="small" />
                  ) : (
                    <CopyIcon fontSize="small" />
                  )}
                </IconButton>
              </Box>
            </Box>
            <Chip
              label="متصل"
              color="success"
              variant="outlined"
              icon={<CheckIcon />}
              sx={{ borderRadius: 1 }}
            />
          </WalletCard>
        ) : (
          <Button
            fullWidth
            variant="contained"
            startIcon={<WalletIcon />}
            onClick={connectWallet}
            sx={{
              borderRadius: 2,
              py: 1.5,
              fontSize: "1.1rem",
              fontWeight: 600,
              background: `linear-gradient(45deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
              color: "common.white",
              boxShadow: theme.shadows[3],
              "&:hover": {
                boxShadow: theme.shadows[5],
              },
            }}
          >
            اتصال به کیف پول
          </Button>
        )}
      </StyledHeader>
      <Outlet context={{ walletAddress }} />
    </Container>
  );
}

export default VoterLayout;
