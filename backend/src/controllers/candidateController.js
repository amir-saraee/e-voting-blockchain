const { Candidate } = require("../models");

exports.addCandidate = async (req, res) => {
  try {
    const { electionId } = req.params;
    const { name } = req.body;
    const candidate = await Candidate.create({ name, electionId });
    res.json(candidate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCandidates = async (req, res) => {
  try {
    const { electionId } = req.params;
    const candidates = await Candidate.findAll({ where: { electionId } });
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
