const { Election, Candidate } = require("../models");

exports.getAllElections = async (req, res) => {
  try {
    const elections = await Election.findAll({
      include: [
        {
          model: Candidate,
          as: "candidates",
        },
      ],
    });
    res.json(elections);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createElection = async (req, res) => {
  try {
    // Expect extra eligibility fields from the client:
    const { name, startTime, endTime, isPublic, minAge, requiredEducation } =
      req.body;
    const election = await Election.create({
      name,
      startTime,
      endTime,
      isPublic,
      // if isPublic is true, no restrictions apply
      minAge: isPublic ? null : minAge,
      requiredEducation: isPublic ? null : requiredEducation,
    });
    res.json(election);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getElectionById = async (req, res) => {
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
    res.json(election);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.endElection = async (req, res) => {
  try {
    const { electionId } = req.params;
    const election = await Election.findByPk(electionId);
    if (!election) {
      return res.status(404).json({ error: "Election not found" });
    }

    // Update the election status to 'ended'
    election.status = "ended";
    await election.save();
    res.json({ message: "Election ended successfully", election });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
