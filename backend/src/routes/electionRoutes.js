// backend/src/routes/electionRoutes.js
const express = require("express");
const router = express.Router();
const electionController = require("../controllers/electionController");
const candidateController = require("../controllers/candidateController");
const voteController = require("../controllers/voteController");

// Election endpoints
router.get("/", electionController.getAllElections);
router.post("/", electionController.createElection);
router.get("/:electionId", electionController.getElectionById);
router.post("/:electionId/end", electionController.endElection);

// Candidate endpoints for an election
router.post("/:electionId/candidates", candidateController.addCandidate);
router.get("/:electionId/candidates", candidateController.getCandidates);

// Voting endpoints
router.post("/:electionId/vote", voteController.castVote);
router.get("/:electionId/results", voteController.getResults);
router.get("/:electionId/votes", voteController.getVotes);

module.exports = router;
