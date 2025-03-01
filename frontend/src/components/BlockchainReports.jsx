import { useState, useEffect } from "react";
import { ethers } from "ethers";
import votingAbi from "../abis/Voting.json";
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Box,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

function BlockchainReports() {
  const [elections, setElections] = useState([]);
  const [candidatesByElection, setCandidatesByElection] = useState([]);
  const [votedEvents, setVotedEvents] = useState([]); // New state for vote events
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
        const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
        const contract = new ethers.Contract(
          contractAddress,
          votingAbi.abi,
          provider
        );

        // Fetch elections
        const [
          ids,
          names,
          startTimes,
          endTimes,
          isPublicArr,
          minAges,
          requiredEducations,
        ] = await contract.getAllElections();

        // Log data for debugging
        console.log("ids:", ids);
        console.log("minAges:", minAges);

        const electionData = ids.map((id, index) => {
          const startTimeMs = startTimes[index]
            ? startTimes[index] * BigInt(1000)
            : BigInt(0);
          const endTimeMs = endTimes[index]
            ? endTimes[index] * BigInt(1000)
            : BigInt(0);
          return {
            id: id ? id.toString() : "N/A",
            name: names[index] || "نامشخص",
            startTime: startTimeMs
              ? new Date(Number(startTimeMs)).toLocaleString()
              : "N/A",
            endTime: endTimeMs
              ? new Date(Number(endTimeMs)).toLocaleString()
              : "N/A",
            isPublic: isPublicArr[index] || false,
            minAge: minAges[index] ? minAges[index].toString() : "0",
            requiredEducation: requiredEducations[index] || "نامشخص",
          };
        });

        // Fetch candidates
        const candidatesData = await Promise.all(
          ids.map(async (id) => {
            const [names, votes] = await contract.getAllCandidates(id);
            return {
              electionId: id.toString(),
              candidates: names.map((name, index) => ({
                name,
                voteCount: votes[index].toString(),
              })),
            };
          })
        );

        // Fetch Voted events
        const filter = contract.filters.Voted();
        const logs = await provider.getLogs({
          fromBlock: 0,
          toBlock: "latest",
          address: contractAddress,
          topics: filter.topics,
        });
        console.log("Fetched logs:", logs);

        const votedEvents = logs
          .map((log) => {
            try {
              const event = contract.interface.parseLog(log);
              if (
                !event.args ||
                !event.args.electionId ||
                !event.args.candidateId
              ) {
                console.error(
                  "Event args missing properties:",
                  event,
                  "Log:",
                  log
                );
                return null;
              }
              return {
                electionId: event.args.electionId.toString(),
                candidateId: event.args.candidateId.toString(),
                voter: event.args.voter || "N/A",
                txHash: log.transactionHash,
              };
            } catch (error) {
              console.error("Error parsing log:", error, "Log:", log);
              return null;
            }
          })
          .filter((event) => event !== null);

        console.log("Voted events:", votedEvents);

        setElections(electionData);
        setCandidatesByElection(candidatesData);
        setVotedEvents(votedEvents);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("خطا در بارگذاری داده‌های بلاک‌چین. لطفاً دوباره تلاش کنید.");
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" sx={{ mt: 4 }}>
        {error}
      </Typography>
    );
  }

  return (
    <Paper sx={{ padding: 4, marginTop: 4 }}>
      <Typography variant="h4" gutterBottom>
        گزارش‌های بلاک‌چین
      </Typography>
      <Typography variant="h6" sx={{ mb: 2 }}>
        تعداد کل انتخابات: {elections.length}
      </Typography>

      {/* Elections Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>شناسه انتخابات</TableCell>
            <TableCell>نام</TableCell>
            <TableCell>زمان شروع</TableCell>
            <TableCell>زمان پایان</TableCell>
            <TableCell>عمومی</TableCell>
            <TableCell>حداقل سن</TableCell>
            <TableCell>تحصیلات مورد نیاز</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {elections.map((election) => (
            <TableRow key={election.id}>
              <TableCell>{election.id}</TableCell>
              <TableCell>{election.name}</TableCell>
              <TableCell>{election.startTime}</TableCell>
              <TableCell>{election.endTime}</TableCell>
              <TableCell>{election.isPublic ? "بله" : "خیر"}</TableCell>
              <TableCell>{election.minAge}</TableCell>
              <TableCell>{election.requiredEducation}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Candidates Section with Charts */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        کاندیداها
      </Typography>
      {candidatesByElection.map((election) => (
        <Accordion key={election.electionId} sx={{ mt: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">
              کاندیداهای انتخابات با شناسه: {election.electionId}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="h6" gutterBottom>
              نمودار آرا
            </Typography>
            <BarChart
              xAxis={[
                {
                  scaleType: "band",
                  data: election.candidates.map((c) => c.name),
                },
              ]}
              series={[
                { data: election.candidates.map((c) => Number(c.voteCount)) },
              ]}
              height={300}
              margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
            />
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>نام</TableCell>
                  <TableCell>تعداد آرا</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {election.candidates.map((candidate, index) => (
                  <TableRow key={index}>
                    <TableCell>{candidate.name}</TableCell>
                    <TableCell>{candidate.voteCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AccordionDetails>
        </Accordion>
      ))}

      {/* Vote Details Section */}
      <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
        آرا ثبت‌شده
      </Typography>
      <Accordion sx={{ mt: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">جزئیات آرا</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>شناسه انتخابات</TableCell>
                <TableCell>شناسه کاندیدا</TableCell>
                <TableCell>آدرس رای‌دهنده</TableCell>
                <TableCell>هش تراکنش</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {votedEvents.map((event, index) => (
                <TableRow key={index}>
                  <TableCell>{event.electionId}</TableCell>
                  <TableCell>{event.candidateId}</TableCell>
                  <TableCell>{event.voter}</TableCell>
                  <TableCell>{event.txHash}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
}

export default BlockchainReports;
