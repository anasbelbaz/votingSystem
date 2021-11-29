import React, { useState, useEffect} from 'react'
import Web3 from 'web3'
import {Navbar, Container, Button} from "react-bootstrap"

function Nav(props) { 

    const login = async () => {
        await window.ethereum
            .request({
            method: 'eth_requestAccounts',
            })
            .then((accounts) => {
            if (accounts[0]) {
                let web3 = new Web3(window.ethereum)
                web3.eth.getChainId().then(async (network) => {
                if (network === '3') {
                    props.setNetwork('ropsten')
                } else {
                    props.setNetwork('no-ropsten')
                }
                })
                props.setAddressState(true)
                props.setAddress( accounts[0])
            } else {
                props.setAddressState(false)
            }
            })
            .catch((err) => {
            console.log(err)
            return
            })
    }

    const init =async () => {
        
        if (typeof window.ethereum !== 'undefined') {

            await window.ethereum
            .request({
            method: 'eth_requestAccounts',
            })
            .then((accounts) => {
            if (accounts[0]) {
                let web3 = new Web3(window.ethereum)
                web3.eth.getChainId().then(async (network) => {
                if (network == '3') {
                    props.setNetwork('ropsten')
                } else {
                    console.log("test")
                    props.setNetwork('no-ropsten')
                }
                })
                props.setAddressState(true)
                props.setAddress( accounts[0])
            } else {
                props.setAddressState(false)
            }
            })
            .catch((err) => {
            console.log(err)
            return
            })

          window.ethereum.on('accountsChanged', function (accounts) {
            if (accounts[0]) {
              props.setAddressState(true)
              props.setAddress(accounts[0])
            } else {
              props.setAddressState(false)
            }
          })
          window.ethereum.on('chainChanged', function (network) {
            if (network == '0x3') {
              props.setNetwork('ropsten')
            } else {
                props.setNetwork('no-ropsten')
            }
          })
      
          window.ethereum.on('disconnect', function () {
            props.setAddressState(false)
        })
        } else {
            props.setAddress('')
            props.setAddressState(false)
        }
      }

    useEffect(() => {
        init();
      },[]);

  return (
    <Navbar>
        <Container>
            <Navbar.Brand href="#home">Voting System</Navbar.Brand>
            <Navbar.Toggle />
            <Navbar.Collapse className="justify-content-end">
            <Navbar.Text>
                {props.addressState ? (<><p style={{fontWeight: "bold"}}>address: {props.address.substring(0, 9) + "..."} | network: {props.network}</p></>) : (<Button onClick={() => login()}>Please Login</Button>)}
            </Navbar.Text>
            </Navbar.Collapse>
        </Container>
    </Navbar>
  )
}

export default Nav
