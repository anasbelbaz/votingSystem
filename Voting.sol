// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Voting is Ownable {
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint votedProposalId;
    }
    struct Proposal {
        string description;
        uint voteCount;
    }

    enum WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }
    
    event VoterRegistered(address voterAddress); 
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    event ProposalRegistered(uint proposalId);
    event Voted (address voter, uint proposalId);

    WorkflowStatus public workflowStatus;
    Proposal[] public proposalsArray;
    mapping (address => Voter) private voters;
    mapping (uint => Proposal[]) private proposals;


    constructor() Ownable() {
        workflowStatus = WorkflowStatus.RegisteringVoters;
        addVoter(msg.sender);
    }

    modifier onlyVoters() {
        require(voters[msg.sender].isRegistered, "You're not a voter");
        _;
    }
    
    // getters
    function getVoter(address _addr) external onlyVoters view returns (Voter memory) {
        return voters[_addr];
    }
    
    function getWinner() external view returns (string memory) {
        require(workflowStatus == WorkflowStatus.VotesTallied, 'Votes are not tallied yet');
        uint voteCount = 0;
        uint winnerId;

        for (uint i = 0; i < proposalsArray.length; i++) {
            if (voteCount < proposalsArray[i].voteCount) {
                voteCount = proposalsArray[i].voteCount;
                winnerId = i;
            }
        }
        
        return proposalsArray[winnerId].description;
    }

    // proposal handle
    function addProposal(string memory _desc) external onlyVoters {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationStarted, 'Proposals are not allowed yet');

        Proposal memory proposal;
        proposal.description = _desc;
        proposalsArray.push(proposal);
        emit ProposalRegistered(proposalsArray.length);
    }
 
    // voters handle
    function addVoter(address _addr) public onlyOwner {
        require(workflowStatus == WorkflowStatus.RegisteringVoters, 'Voters registration is not open yet');
        require(voters[_addr].isRegistered != true, 'Already registered');
    
        voters[_addr].isRegistered = true;
        emit VoterRegistered(_addr);
    }
 
    function deleteVoter(address _addr) external onlyOwner {
        require(voters[_addr].isRegistered == true, 'Not registered.');

        voters[_addr].isRegistered = false;
        emit VoterRegistered(_addr);
    }

    // vote handle
    function setVote(address _addr, uint _id) external onlyVoters {
        require(workflowStatus == WorkflowStatus.VotingSessionStarted, 'Voting session havent started yet');
        require(voters[_addr].hasVoted != true, 'You have already voted');
        require(_id <= proposalsArray.length, 'Proposal not found');

        voters[_addr].votedProposalId = _id;
        voters[_addr].hasVoted = true;
        proposalsArray[_id].voteCount++;

        emit Voted(_addr, _id);
    }

    // state handle
    function startProposalsRegistering() external onlyOwner {
        require(workflowStatus == WorkflowStatus.RegisteringVoters, 'Registering proposals cant be started now');

        workflowStatus = WorkflowStatus.ProposalsRegistrationStarted;
        emit WorkflowStatusChange(WorkflowStatus.RegisteringVoters, WorkflowStatus.ProposalsRegistrationStarted);
    }

    function endProposalsRegistering() external onlyOwner {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationStarted, 'Registering proposals havent started yet');
        require(proposalsArray.length > 2 , 'Need more than 1 proposal');

        workflowStatus = WorkflowStatus.ProposalsRegistrationEnded;
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationStarted, WorkflowStatus.ProposalsRegistrationEnded);
    }

    function startVotingSession() external onlyOwner {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationEnded, 'Registering proposals phase is not finished');
        
        workflowStatus = WorkflowStatus.VotingSessionStarted;
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationEnded, WorkflowStatus.VotingSessionStarted);
    }

    function endVotingSession() external onlyOwner {
        require(workflowStatus == WorkflowStatus.VotingSessionStarted, 'Voting session havent started yet');
        
        workflowStatus = WorkflowStatus.VotingSessionEnded;
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionStarted, WorkflowStatus.VotingSessionEnded);
    }

    function votesTally() external onlyOwner {
        require(workflowStatus == WorkflowStatus.VotingSessionEnded, 'Voting session is not closed');

        workflowStatus = WorkflowStatus.VotesTallied;
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionEnded, WorkflowStatus.VotesTallied);
    }
}