import React, { useState, useEffect} from 'react'
import {Container, Row, Col, Button ,Form, Spinner} from "react-bootstrap"
import Web3 from 'web3'
import Nav from "./components/Nav"
import NFTcontractBuild from "./lib/abi.json"
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';

function App() { 
  const [contract, setContract] = useState('')
  const [address, setAddress] = useState('')
  const [network, setNetwork] = useState('')
  const [addressState, setAddressState] = useState(false)
  const [currentState, setCurrentState] = useState('RegisteringVoters')
  const [proposalState, setProposalState] = useState('')
  const [winner, setWinner] = useState('')
  const [loading, setLoading] = useState(false)

  
  const initContract = async () => {
    const web3 = new Web3(window.ethereum)
    let contract = await new web3.eth.Contract(
      NFTcontractBuild,
      process.env.REACT_APP_CONTRACT_ADR
    )
    setContract(contract)
  }


  const addVoter = async(event) => {
    event.preventDefault();
    let voter = event.target.voter.value
    await initContract()
    const web3 = new Web3(window.ethereum)
    const isAddress = await web3.utils.isAddress(voter)
    if(!isAddress){alert('please enter a valid address');return; }

    setLoading(true)
    contract.methods
        .addVoter(voter)
        .send({from: "0xab7b1563C4cA2A002b3F8bFf9dC1499CEdF8e4F3"})
        .on('error', function (error) {
          console.log('error', error)
          setLoading(false)
          alert("An error occured")
        }).then(function (receipt) {
          console.log('receipt', receipt)
          setLoading(false)
          alert("Success")
        })
  }

  const addProposal = async (event) => {
    event.preventDefault();
    let proposal = event.target.proposal.value
    if(!proposal){alert('please enter a proposal');return; }

    await initContract()

    setLoading(true)
    const web3 = new Web3(window.ethereum)
    await contract.methods.addProposal(proposal).send({from: address})    
    .on('error', function (error) {
      console.log('error', error)
      setLoading(false)
      alert("An error occured")
    }).then(function (receipt) {
      console.log('receipt', receipt)
      setLoading(false)
      alert("Success")
    })
  }


  const setVote = async (event) => {
    event.preventDefault();
    let proposal = event.target.proposal.value
    await initContract()

    setLoading(true)
    const web3 = new Web3(window.ethereum)
    await contract.methods.setVote(proposal).send({from: address})    
    .on('error', function (error) {
      console.log('error', error)
      setLoading(false)
      alert("An error occured")
    }).then(function (receipt) {
      console.log('receipt', receipt)
      setLoading(false)
      alert("Success")
    })
  }
  

  const startProposalsRegistering = async () => {

    await initContract()

    setLoading(true)
    const web3 = new Web3(window.ethereum)
    const result = await contract.methods.startProposalsRegistering().send({from: "0xab7b1563C4cA2A002b3F8bFf9dC1499CEdF8e4F3"}) 
    .on('error', function (error) {
          console.log('error', error)
          setLoading(false)
          alert("An error occured")
        }).then(function (receipt) {
          console.log('receipt', receipt)
          setCurrentState("Proposals Registering")
          setLoading(false)
          alert("Success")
        })
  }
  const endProposalsRegistering = async () => {
     await initContract()
     setLoading(true)
    const web3 = new Web3(window.ethereum)
    const result = await contract.methods.endProposalsRegistering().send({from: "0xab7b1563C4cA2A002b3F8bFf9dC1499CEdF8e4F3"}) 
    .on('error', function (error) {
          console.log('error', error)
          setLoading(false)
          alert("An error occured")
        }).then(function (receipt) {
          console.log('receipt', receipt)
          setCurrentState("Proposals Registering has ended")
          setLoading(false)
          alert("Success")
        })
  }
  const startVotingSession = async () => {
     await initContract()

     setLoading(true)
    const web3 = new Web3(window.ethereum)
    const result = await contract.methods.startVotingSession().send({from: "0xab7b1563C4cA2A002b3F8bFf9dC1499CEdF8e4F3"}) 
    .on('error', function (error) {
          console.log('error', error)
          setLoading(false)
          alert("An error occured")
        }).then(function (receipt) {
          console.log('receipt', receipt)
          
          setCurrentState("Voting Session has started")
          setLoading(false)
          alert("Success")
        })
  }
  const endVotingSession = async () => {
     await initContract()

     setLoading(true)
    const web3 = new Web3(window.ethereum)
    const result = await contract.methods.endVotingSession().send({from: "0xab7b1563C4cA2A002b3F8bFf9dC1499CEdF8e4F3"}) 
    .on('error', function (error) {
          console.log('error', error)
          setLoading(false)
          alert("An error occured")
        }).then(function (receipt) {
          console.log('receipt', receipt)
          setCurrentState("Voting Session has ended")
          setLoading(false)
          alert("Success")
        })
  }

  const tally = async () => {
     await initContract()

     setLoading(true)
    const web3 = new Web3(window.ethereum)
    const result = await contract.methods.tallyVotes().send({from: "0xab7b1563C4cA2A002b3F8bFf9dC1499CEdF8e4F3"}) 
    .on('error', function (error) {
          console.log('error', error)
          alert("An error occured")
          setLoading(false)
        }).then(function (receipt) {
          console.log('receipt', receipt)
          setCurrentState("Votes are tallied")
          setLoading(false)
          alert("Success")
        })
  }

  const getOneProposal= async(event) => {
    event.preventDefault();
    let proposal = event.target.proposal.value
    if(!proposal){alert("please enter a valide number"); return;}
    await initContract()

    setLoading(true)
    const web3 = new Web3(window.ethereum)
    const result = await contract.methods.getOneProposal(proposal).call()
    if(result[0]){
      setProposalState({voteCount: result[1], description: result[0]})
    } else {
      setLoading(false)
      setProposalState('Invalid proposal id')
    }
  }

  const getWinner = async() => {

    await initContract()

    setLoading(true)
    const web3 = new Web3(window.ethereum)
    const result = await contract.methods.getWinner().call()
    if(result[0]){
      setLoading(false)
      setWinner({voteCount: result[1], description: result[0]})
    } else {
      setLoading(false)
      setWinner('Invalid proposal id')
    }
  }
  
  useEffect(() => {
    initContract();
  },[]);

  return (<>
    <Nav  address={address}
          setAddress={setAddress}
          network={network}
          setNetwork={setNetwork}
          addressState={addressState}
          setAddressState={setAddressState}/>
{loading ?  
  <Container style={{marginTop: "20%"}}> 
    <Col className="d-flex justify-content-center">
    <Spinner animation="grow" />Transaction is being mined in the block chain...

      <Spinner animation="grow" /></Col> 
  </Container> : 
  <Container>
      <Row><Col className="d-flex justify-content-center">Current state: {currentState}</Col></Row>
      <Row>
        <Col xs={12} md={6} lg={6} style={{display: address == "0xab7b1563c4ca2a002b3f8bff9dc1499cedf8e4f3" ? "block" : "none"}}>
          <Row className="mt-5">
            <Col ><p >Only admin commands</p></Col>
          </Row>
          <Row className="mt-5">
              <Form onSubmit={addVoter}>
                <Form.Group className="mb-3">
                  <Form.Label>Voter </Form.Label>
                  <Form.Control name="voter" type="text" placeholder="enter valid metamask address"/>
                </Form.Group>

                <Button style={{backgroundColor: "black", borderColor: "black"}} disabled={network == "ropsten" ? false: true} variant="primary" type="submit">
                  Add
                </Button>
              </Form>
          </Row>

              <Row className="mt-5">
                <Col xs={12} md={12} lg={12}>Proposals</Col>
                <Col xs={6} md={6} lg={6}><Button style={{backgroundColor: "black", borderColor: "black"}} disabled={network == "ropsten" ? false: true} onClick={() => startProposalsRegistering()}>startProposalsRegistering</Button></Col>
                <Col xs={6} md={6} lg={6}><Button style={{backgroundColor: "black", borderColor: "black"}} disabled={network == "ropsten" ? false: true} onClick={() => endProposalsRegistering()}>endProposalsRegistering</Button></Col>
              </Row>
              <Row className="mt-5">
                <Col xs={12} md={12} lg={12}>Voting Session</Col>
                <Col xs={6} md={6} lg={6}><Button style={{backgroundColor: "black", borderColor: "black"}} disabled={network == "ropsten" ? false: true} onClick={() => startVotingSession()}>startVotingSession</Button></Col>
                <Col xs={6} md={6} lg={6}><Button style={{backgroundColor: "black", borderColor: "black"}} disabled={network == "ropsten" ? false: true} onClick={() => endVotingSession()}>endVotingSession</Button></Col>

              </Row>
              <Row className="mt-5">
                <Col xs={12} md={12} lg={12}>Tally votes</Col>
                <Col xs={6} md={6} lg={6}><Button style={{backgroundColor: "black", borderColor: "black"}} disabled={network == "ropsten" ? false: true} onClick={() => tally()}>tally</Button></Col>
              </Row>
      </Col>
        <Col xs={12} md={address == "0xab7b1563c4ca2a002b3f8bff9dc1499cedf8e4f3" ? 6 :  12} lg={address == "0xab7b1563c4ca2a002b3f8bff9dc1499cedf8e4f3" ? 6 :  12}>
              <Row className="mt-5">
                <Form onSubmit={addProposal}>
                  <Form.Group className="mb-3">
                    <Form.Label>Proposals </Form.Label>
                    <Form.Control type="text" name="proposal" placeholder="Enter Proposal" />
                  </Form.Group>

                  <Button style={{backgroundColor: "black", borderColor: "black"}} disabled={network == "ropsten" ? false: true} variant="primary" type="submit">
                    Add
                  </Button>
                </Form>

              </Row>
              <Row className="mt-5">
                <Form onSubmit={getOneProposal}>
                  <Form.Group className="mb-3">
                    <Form.Label>Get one proposal</Form.Label>
                    <Form.Control type="number" name="proposal" placeholder="Enter Proposal id" />
                  </Form.Group>

                  <Button style={{backgroundColor: "black", borderColor: "black"}} disabled={network == "ropsten" ? false: true} variant="primary" type="submit">
                    Get
                  </Button>
                </Form>
                {proposalState && proposalState.voteCount ? 
                (<p>Proposal: {proposalState.description} | vote count: {proposalState.voteCount}</p> )
                : (<p>{proposalState}</p>)}
              </Row>
              <Row className="mt-5">
                <Form onSubmit={setVote}>
                  <Form.Group className="mb-3">
                    <Form.Label>Vote</Form.Label>
                    <Form.Control type="number" name="proposal" placeholder="Enter Proposal id" />
                  </Form.Group>

                  <Button style={{backgroundColor: "black", borderColor: "black"}} disabled={network == "ropsten" ? false: true} variant="primary" type="submit">
                    Vote
                  </Button>
                </Form>
         
              </Row>
              <Row className="mt-5">
                <Button style={{backgroundColor: "black", borderColor: "black"}} disabled={network == "ropsten" ? false: true} onClick={() => getWinner()} variant="primary">
                    Get Winner
                  </Button>
                {winner && winner.voteCount ? 
                (<p>Winner: {winner.description} | vote count: {winner.voteCount}</p> )
                : (<p>{winner}</p>)}
              </Row>
      </Col>

    </Row>

  </Container>

}
    
  </>)
}

export default App
