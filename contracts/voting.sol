// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    address public admin;
    uint public electionCount = 0;
    uint[] public electionIds;

    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    struct Election {
        uint id;
        string name;
        uint startTime;
        uint endTime;
        bool exists;
        // Eligibility fields:
        bool isPublic; // if true, no restrictions apply
        uint minAge; // required minimum age if not public
        string requiredEducation; // required education if not public
        mapping(uint => Candidate) candidates;
        uint candidateCount;
        mapping(address => bool) hasVoted;
    }

    struct Voter {
        bool registered;
        uint age;
        string education;
    }

    // Mapping from election ID to Election
    mapping(uint => Election) public elections;
    // Mapping from voter address to on-chain voter details
    mapping(address => Voter) public voters;

    // Updated event with eligibility criteria
    event ElectionCreated(
        uint electionId,
        string name,
        uint startTime,
        uint endTime,
        bool isPublic,
        uint minAge,
        string requiredEducation
    );
    event CandidateAdded(uint electionId, uint candidateId, string name);
    event Voted(uint electionId, uint candidateId, address voter);
    event VoterRegistered(address voter, uint age, string education);
    event AdminTransferred(address oldAdmin, address newAdmin);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    // New function to transfer admin rights
    function transferAdmin(address newAdmin) public onlyAdmin {
        require(newAdmin != address(0), "New admin cannot be zero address");
        address oldAdmin = admin;
        admin = newAdmin;
        emit AdminTransferred(oldAdmin, newAdmin);
    }

    // Helper function to convert education string to a numeric level.
    // Levels: diploma = 1, bachelor's = 2, master's = 3, doctorate = 4.
    function _educationLevel(
        string memory education
    ) internal pure returns (uint) {
        bytes32 eduHash = keccak256(bytes(education));
        if (eduHash == keccak256(bytes("diploma"))) return 1;
        if (eduHash == keccak256(bytes("bachelor's"))) return 2;
        if (eduHash == keccak256(bytes("master's"))) return 3;
        if (eduHash == keccak256(bytes("doctorate"))) return 4;
        return 0;
    }

    // Function to register a voter with their eligibility details on-chain.
    function registerVoter(uint _age, string memory _education) public {
        require(!voters[msg.sender].registered, "Voter already registered");
        require(_age > 0, "Age must be greater than 0");
        require(bytes(_education).length > 0, "Education cannot be empty");
        // Ensure that the education field is one of the default options.
        require(
            _educationLevel(_education) > 0,
            "Invalid education qualification"
        );
        voters[msg.sender] = Voter({
            registered: true,
            age: _age,
            education: _education
        });
        emit VoterRegistered(msg.sender, _age, _education);
    }

    // Updated createElection function with input validation
    function createElection(
        string memory _name,
        uint _startTime,
        uint _endTime,
        bool _isPublic,
        uint _minAge,
        string memory _requiredEducation
    ) public onlyAdmin {
        require(bytes(_name).length > 0, "Election name cannot be empty");
        require(_startTime < _endTime, "Start time must be before end time");
        require(_endTime > block.timestamp, "End time must be in the future");

        // If not public, require a valid education level and age
        if (!_isPublic) {
            require(_minAge > 0, "Minimum age must be greater than 0");
            require(
                _educationLevel(_requiredEducation) > 0,
                "Invalid required education qualification"
            );
        }

        electionCount++;
        Election storage newElection = elections[electionCount];
        newElection.id = electionCount;
        newElection.name = _name;
        newElection.startTime = _startTime;
        newElection.endTime = _endTime;
        newElection.exists = true;
        newElection.isPublic = _isPublic;
        if (!_isPublic) {
            newElection.minAge = _minAge;
            newElection.requiredEducation = _requiredEducation;
        }
        electionIds.push(electionCount);
        emit ElectionCreated(
            electionCount,
            _name,
            _startTime,
            _endTime,
            _isPublic,
            _minAge,
            _requiredEducation
        );
    }

    // Function to add a candidate to an election with duplicate check
    function addCandidate(
        uint _electionId,
        string memory _candidateName
    ) public onlyAdmin {
        require(
            bytes(_candidateName).length > 0,
            "Candidate name cannot be empty"
        );
        Election storage election = elections[_electionId];
        require(election.exists, "Election does not exist");

        // Check for duplicate candidate names
        for (uint i = 1; i <= election.candidateCount; i++) {
            require(
                keccak256(bytes(election.candidates[i].name)) !=
                    keccak256(bytes(_candidateName)),
                "Candidate with this name already exists"
            );
        }

        election.candidateCount++;
        election.candidates[election.candidateCount] = Candidate(
            election.candidateCount,
            _candidateName,
            0
        );
        emit CandidateAdded(
            _electionId,
            election.candidateCount,
            _candidateName
        );
    }

    // Updated vote function with eligibility checks
    function vote(uint _electionId, uint _candidateId) public {
        Election storage election = elections[_electionId];
        require(election.exists, "Election does not exist");
        require(
            block.timestamp >= election.startTime,
            "Election hasn't started yet"
        );
        require(block.timestamp <= election.endTime, "Election has ended");
        require(!election.hasVoted[msg.sender], "You have already voted");
        require(
            _candidateId > 0 && _candidateId <= election.candidateCount,
            "Invalid candidate"
        );

        // If election is not public, check voter's eligibility.
        if (!election.isPublic) {
            Voter storage voter = voters[msg.sender];
            require(voter.registered, "Voter not registered on-chain");
            require(
                voter.age >= election.minAge,
                "Voter does not meet minimum age"
            );
            uint voterEdu = _educationLevel(voter.education);
            uint requiredEdu = _educationLevel(election.requiredEducation);
            require(
                voterEdu >= requiredEdu,
                "Voter's education does not meet the required level"
            );
        }

        // Mark the voter as having voted and increment candidate's vote count.
        election.hasVoted[msg.sender] = true;
        election.candidates[_candidateId].voteCount++;
        emit Voted(_electionId, _candidateId, msg.sender);
    }

    // New function to check election status
    function getElectionStatus(
        uint _electionId
    ) public view returns (string memory) {
        Election storage election = elections[_electionId];
        require(election.exists, "Election does not exist");

        if (block.timestamp < election.startTime) {
            return "Not Started";
        } else if (block.timestamp <= election.endTime) {
            return "Active";
        } else {
            return "Completed";
        }
    }

    // Function to check if a user has voted in an election
    function hasVoted(
        uint _electionId,
        address _voter
    ) public view returns (bool) {
        Election storage election = elections[_electionId];
        require(election.exists, "Election does not exist");
        return election.hasVoted[_voter];
    }

    // Function to get a candidate's details
    function getCandidate(
        uint _electionId,
        uint _candidateId
    ) public view returns (string memory, uint) {
        Election storage election = elections[_electionId];
        require(election.exists, "Election does not exist");
        require(
            _candidateId > 0 && _candidateId <= election.candidateCount,
            "Invalid candidate"
        );
        Candidate storage candidate = election.candidates[_candidateId];
        return (candidate.name, candidate.voteCount);
    }

    // Function to get all candidates for an election
    function getAllCandidates(
        uint _electionId
    ) public view returns (string[] memory, uint[] memory) {
        Election storage election = elections[_electionId];
        require(election.exists, "Election does not exist");
        string[] memory names = new string[](election.candidateCount);
        uint[] memory votes = new uint[](election.candidateCount);
        for (uint i = 1; i <= election.candidateCount; i++) {
            Candidate storage candidate = election.candidates[i];
            names[i - 1] = candidate.name;
            votes[i - 1] = candidate.voteCount;
        }
        return (names, votes);
    }

    // Function to get all elections along with eligibility criteria
    function getAllElections()
        public
        view
        returns (
            uint[] memory,
            string[] memory,
            uint[] memory,
            uint[] memory,
            bool[] memory,
            uint[] memory,
            string[] memory
        )
    {
        uint length = electionIds.length;
        uint[] memory ids = new uint[](length);
        string[] memory names = new string[](length);
        uint[] memory startTimes = new uint[](length);
        uint[] memory endTimes = new uint[](length);
        bool[] memory isPublicArr = new bool[](length);
        uint[] memory minAges = new uint[](length);
        string[] memory requiredEducations = new string[](length);

        for (uint i = 0; i < length; i++) {
            uint electionId = electionIds[i];
            Election storage election = elections[electionId];
            ids[i] = election.id;
            names[i] = election.name;
            startTimes[i] = election.startTime;
            endTimes[i] = election.endTime;
            isPublicArr[i] = election.isPublic;
            minAges[i] = election.isPublic ? 0 : election.minAge;
            requiredEducations[i] = election.isPublic
                ? ""
                : election.requiredEducation;
        }

        return (
            ids,
            names,
            startTimes,
            endTimes,
            isPublicArr,
            minAges,
            requiredEducations
        );
    }

    // Get the number of candidates in an election
    function getCandidateCount(uint _electionId) public view returns (uint) {
        Election storage election = elections[_electionId];
        require(election.exists, "Election does not exist");
        return election.candidateCount;
    }
}
