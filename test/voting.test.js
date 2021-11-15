const { expectEvent, expectRevert } = require("@openzeppelin/test-helpers");
const { expect } = require("chai");
const Voting = artifacts.require("Voting");

contract("Voting", function (accounts) {
    const owner = accounts[0];

    const user_1 = accounts[1];
    const user_2 = accounts[2];

    const proposal_1 = "macron";
    const proposal_2 = "melanchon";

    context("register voters", function () {
        beforeEach(async function () {
            this.voting = await Voting.new({ from: owner });
        });
        it("check workflow status", async function() {
            this.voting.startProposalsRegistering({ from: owner });
            await expectRevert(
                this.voting.addVoter(user_1, { from: owner }),
                "Voters registration is not open yet"
            );
        });

        it("check only owner", async function() {
            await expectRevert(
                this.voting.addVoter(user_2, { from: user_1 }),
                "Ownable: caller is not the owner"
            );
        });

        it("check already registered voters", async function() {
            await this.voting.addVoter(user_1, { from: owner });
            await expectRevert(
                this.voting.addVoter(user_1, { from: owner }),
                "Already registered"
            );
        });

        it("add voter", async function() {
            const receipt = await this.voting.addVoter(user_1, { from: owner });
            voter = await this.voting.getVoter(user_1, { from: user_1 });
            expect(voter.isRegistered).to.equal(true);
            expectEvent(receipt, "VoterRegistered");
        });
    });

    context("register proposals", function () {
        beforeEach(async function () {
            this.voting = await Voting.new({ from: owner });
            await this.voting.addVoter(user_1, { from: owner });
            await this.voting.addVoter(user_2, { from: owner });
        });

        it("check workflow status", async function() {
            await this.voting.startProposalsRegistering({ from: owner });
            await this.voting.endProposalsRegistering({ from: owner });
            await expectRevert(
                this.voting.addProposal(proposal_1, { from: user_1 }),
                "Proposals are not allowed yet"
            );
        });

        it("should add a proposal", async function() {
            await this.voting.startProposalsRegistering({ from: owner });
            const receipt = await this.voting.addProposal(proposal_1, { from: user_1 });
            const proposal = await this.voting.getOneProposal(0, { from: user_1 });
            expect(proposal.description).to.equal(proposal_1);
            expectEvent(receipt, "ProposalRegistered");
        });
    });

    context("register votes", function () {
        beforeEach(async function () {
            this.voting = await Voting.new({ from: owner });
            await this.voting.addVoter(user_1, { from: owner });
            await this.voting.startProposalsRegistering({ from: owner });
            await this.voting.addProposal(proposal_1, { from: user_1 });
            await this.voting.endProposalsRegistering({ from: owner });
        });

        it("check workflow status", async function() {
            await expectRevert(
                this.voting.setVote(0, { from: user_1 }),
                "Voting session havent started yet"
            );
        });

        it("check already voted", async function() {
            await this.voting.startVotingSession({ from: owner });
            await this.voting.setVote(0, { from: user_1 });
            await expectRevert(
                this.voting.setVote(0, { from: user_1 }),
                "You have already voted"
            );
        });


        it("vote", async function() {
            await this.voting.startVotingSession({ from: owner });
            const receipt = await this.voting.setVote(0, { from: user_1 });
            const voter = await this.voting.getVoter(user_1, { from: user_1 });
            const proposal = await this.voting.getOneProposal(0, { from: user_1 });
            expect(voter.votedProposalId).to.be.equal('0');
            expect(voter.hasVoted).to.be.equal(true);
            expect(proposal.description).to.be.equal(proposal_1);
            expect(proposal.voteCount).to.be.equal('1');
            expectEvent(receipt, "Voted");
        });
    });

    context("tally votes", function () {
        beforeEach(async function () {
            this.voting = await Voting.new({ from: owner });
        });
        
        it("tally votes", async function() {
            await this.voting.addVoter(user_1, { from: owner });
            await this.voting.addVoter(user_2, { from: owner });
            await this.voting.startProposalsRegistering({ from: owner });
            await this.voting.addProposal(proposal_1, { from: user_1 });
            await this.voting.addProposal(proposal_2, { from: user_2 });
            await this.voting.endProposalsRegistering({ from: owner });
            await this.voting.startVotingSession({ from: owner });
            await this.voting.setVote(1, {from: user_1});
            await this.voting.setVote(1, {from: user_2});
            await this.voting.endVotingSession({from: owner});
            await this.voting.tallyVotes({ from: owner });
            const winningProposal = await this.voting.getWinner({ from: owner });
            expect(winningProposal.description).to.be.equal(proposal_2);
            expect(winningProposal.voteCount).to.be.equal('2');
        });
    });
});