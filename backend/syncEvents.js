// backend/syncEvents.js
const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");
const { Election, Candidate, Vote, Voter } = require("./src/models");
require("dotenv").config();
const { Op } = require("sequelize");

async function syncEventsFromChain() {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      "http://127.0.0.1:8545"
    );
    const abiPath = path.join(__dirname, "abis", "Voting.json");
    const votingArtifact = JSON.parse(fs.readFileSync(abiPath));
    const votingAbi = votingArtifact.abi;

    const contractAddress = process.env.CONTRACT_ADDRESS;
    if (!contractAddress) {
      throw new Error("CONTRACT_ADDRESS is not set in the .env file");
    }
    const contract = new ethers.Contract(contractAddress, votingAbi, provider);

    console.log("Listening for on-chain events...");

    // Listen for ElectionCreated events with eligibility data
    contract.on("ElectionCreated", async (...args) => {
      try {
        // Expect additional parameters: isPublic, minAge, requiredEducation
        const [
          electionId,
          name,
          startTime,
          endTime,
          isPublic,
          minAge,
          requiredEducation,
          event,
        ] = args;

        const startTimestamp =
          typeof startTime.toNumber === "function"
            ? startTime.toNumber() * 1000
            : Number(startTime) * 1000;
        const endTimestamp =
          typeof endTime.toNumber === "function"
            ? endTime.toNumber() * 1000
            : Number(endTime) * 1000;

        console.log(
          "ElectionCreated event detected:",
          electionId.toString(),
          name,
          startTimestamp,
          endTimestamp,
          isPublic,
          minAge,
          requiredEducation
        );

        // Determine election status based on start time
        const currentTime = Date.now();
        let status = "notStarted";
        if (startTimestamp <= currentTime) {
          status = "ongoing";
        }

        const [election, created] = await Election.findOrCreate({
          where: { id: electionId.toString() },
          defaults: {
            id: electionId.toString(),
            name: name,
            startTime: new Date(startTimestamp),
            endTime: new Date(endTimestamp),
            status: status,
            isPublic: isPublic,
            minAge: isPublic ? null : minAge,
            requiredEducation: isPublic ? "" : requiredEducation,
          },
        });
        console.log(
          created
            ? "New election inserted in DB:"
            : "Election already exists in DB:",
          election.name
        );
      } catch (err) {
        console.error("Error processing ElectionCreated event:", err);
      }
    });

    // Listen for CandidateAdded events
    contract.on(
      "CandidateAdded",
      async (electionId, candidateId, name, event) => {
        try {
          console.log(
            "CandidateAdded event detected:",
            electionId.toString(),
            candidateId.toString(),
            name
          );

          // Check if the election exists in our database
          const election = await Election.findByPk(electionId.toString());
          if (!election) {
            console.error(
              `Election ${electionId.toString()} not found in database`
            );
            return;
          }

          // Create or update the candidate
          const [candidate, created] = await Candidate.findOrCreate({
            where: {
              electionId: electionId.toString(),
              blockchainId: candidateId.toString(),
            },
            defaults: {
              name: name,
              voteCount: 0,
            },
          });

          console.log(
            created
              ? "New candidate inserted in DB:"
              : "Candidate already exists in DB:",
            candidate.name
          );
        } catch (err) {
          console.error("Error processing CandidateAdded event:", err);
        }
      }
    );

    // Listen for Voted events
    contract.on("Voted", async (electionId, candidateId, voter, event) => {
      try {
        console.log(
          "Voted event detected:",
          electionId.toString(),
          candidateId.toString(),
          voter
        );

        const candidate = await Candidate.findOne({
          where: {
            electionId: electionId.toString(),
            blockchainId: candidateId.toString(),
          },
        });

        if (candidate) {
          candidate.voteCount = candidate.voteCount + 1;
          await candidate.save();

          await Vote.create({
            electionId: electionId.toString(),
            candidateId: candidate.id,
            voterAddress: voter,
            timestamp: new Date(),
          });

          console.log("Vote recorded for candidate:", candidate.name);
        } else {
          console.error("Candidate not found for vote recording");
        }
      } catch (err) {
        console.error("Error processing Voted event:", err);
      }
    });

    // Listen for VoterRegistered events
    contract.on("VoterRegistered", async (voter, age, education, event) => {
      try {
        console.log(
          "VoterRegistered event detected:",
          voter,
          age.toString(),
          education
        );

        // Create or update the voter
        const [voterRecord, created] = await Voter.findOrCreate({
          where: { address: voter },
          defaults: {
            address: voter,
            age: age.toString(),
            education: education,
            registeredAt: new Date(),
          },
        });

        console.log(
          created
            ? "New voter registered in DB:"
            : "Voter already exists in DB:",
          voter
        );
      } catch (err) {
        console.error("Error processing VoterRegistered event:", err);
      }
    });

    // Listen for AdminTransferred events
    contract.on("AdminTransferred", async (oldAdmin, newAdmin, event) => {
      try {
        console.log("AdminTransferred event detected:", oldAdmin, newAdmin);

        // Log the admin change (you might want to store this in the database)
        console.log(
          `Admin rights transferred from ${oldAdmin} to ${newAdmin} at ${new Date()}`
        );
      } catch (err) {
        console.error("Error processing AdminTransferred event:", err);
      }
    });

    // Setup periodic check to update election statuses
    setInterval(async () => {
      try {
        const currentTime = new Date();

        // Find elections that should be started
        await Election.update(
          { status: "ongoing" },
          {
            where: {
              status: "notStarted",
              startTime: { [Op.lte]: currentTime },
            },
          }
        );

        // Find elections that should be completed
        await Election.update(
          { status: "completed" },
          {
            where: {
              status: "ongoing",
              endTime: { [Op.lte]: currentTime },
            },
          }
        );
      } catch (err) {
        console.error("Error updating election statuses:", err);
      }
    }, 60000); // Check every minute
  } catch (error) {
    console.error("Error setting up event listener:", error);
  }
}

module.exports = { syncEventsFromChain };
