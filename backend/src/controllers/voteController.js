const { Vote, Election, Candidate } = require("../models");

exports.castVote = async (req, res) => {
  try {
    const { electionId } = req.params;
    const { candidateId, voterAddress } = req.body;

    const vote = await Vote.create({ electionId, candidateId, voterAddress });
    res.json(vote);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getResults = async (req, res) => {
  try {
    const { electionId } = req.params;
    const election = await Election.findByPk(electionId, {
      include: [
        {
          model: Candidate,
          as: "candidates",
        },
      ],
    });
    if (!election) {
      return res.status(404).json({ error: "Election not found" });
    }

    // Collect candidate names and votes
    const names = election.candidates.map((candidate) => candidate.name);
    const votes = election.candidates.map((candidate) => candidate.voteCount);

    // Send the results
    res.json({ names, votes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// New endpoint: Get Votes
exports.getVotes = async (req, res) => {
  try {
    const { electionId } = req.params;
    const votes = await Vote.findAll({ where: { electionId } });
    res.json(votes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
