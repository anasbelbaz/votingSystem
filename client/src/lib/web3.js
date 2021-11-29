import Web3 from 'web3'
import store from '../store'
// import NFTcontractBuild from '../truffle/build/contracts/HuskySneazzyEP.json'
import NFTcontractBuild from './abi.json'

let walletAddress = ''
let nftContract
// testnet 43113
// mainnet 43114

// testnet 0xa869
// mainnet 0xa86a

export const init = async () => {
  if (typeof window.ethereum !== 'undefined') {
    window.ethereum.on('accountsChanged', function (accounts) {
      if (accounts[0]) {
        store.commit('setWalletAddress', accounts[0])
        store.commit('setWalletState', true)
        walletAddress = accounts[0]
      } else {
        store.commit('setWalletState', false)
      }
    })

    window.ethereum.on('chainChanged', function (network) {
      if (network == '0xa86a') {
        store.commit('setWalletNetwork', 'avax')
      } else {
        store.commit('setWalletNetwork', 'no-avax')
      }
    })

    window.ethereum.on('disconnect', function () {
      store.commit('setWalletState', false)
    })
  } else {
    store.commit('setWalletNetwork', 'no-metamask')
    store.commit('setWalletState', false)
  }
}

export const connectWallet = async () => {
  await window.ethereum
    .request({
      method: 'eth_requestAccounts',
    })
    .then((accounts) => {
      if (accounts[0]) {
        let web3 = new Web3(window.ethereum)
        web3.eth.getChainId().then(async (network) => {
          // if (network == '43113' && walletAddress) {
          if (network == '43114' && walletAddress) {
            store.commit('setWalletNetwork', 'avax')
          } else {
            store.commit('setWalletNetwork', 'no-avax')
          }
        })

        store.commit('setWalletAddress', accounts[0])
        store.commit('setWalletState', true)
        walletAddress = accounts[0]
      } else {
        store.commit('setWalletState', false)
      }
    })
    .catch((err) => {
      console.log(err)
      return
    })
}

export const switchChain = async () => {
  await window.ethereum
    .request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0xa86a' }],
    })
    .catch((err) => {
      console.log(err)
      return
    })
}

export const checkConnection = async () => {
  // Check if browser is running Metamask
  let web3
  if (window.ethereum) {
    web3 = new Web3(window.ethereum)

    // Check if User is already connected by retrieving the accounts
    web3.eth.getAccounts().then(async (addr) => {
      if (addr[0]) {
        walletAddress = addr[0]
        store.commit('setWalletAddress', addr[0])
        store.commit('setWalletState', true)
      } else {
        store.commit('setWalletState', false)
      }
    })

    web3.eth.getChainId().then(async (network) => {
      if (network == '43114' && walletAddress) {
        store.commit('setWalletNetwork', 'avax')
      } else {
        store.commit('setWalletNetwork', 'no-avax')
      }
    })
  }
}

export const initContract = async () => {
  const web3 = new Web3(window.ethereum)

  nftContract = new web3.eth.Contract(
    NFTcontractBuild,
    process.env.REACT_APP_CONTRACT_ADR
  )
}

export const request_mintNft = async (counter, price) => {
  await initContract()
  const web3 = new Web3(window.ethereum)

  return (
    nftContract.methods
      .mint(counter)
      .send({
        from: walletAddress,
        value: web3.utils.toWei((price * counter).toString(), 'ether'),
      })
      .on('transactionHash', function () {})
      // receive transaction's hash (hash)
      .on('receipt', function () {
        // receive transaction's receipt (receipt)
      })
      .on('error', function (error) {
        // If the transaction was rejected by the network with a receipt, the second parameter will be the receipt.
        console.log('error', error)
        store.commit('setMintSpinner', false)
        store.commit('setAlert', {
          content: error.code
            ? error.message
            : 'Transaction has been reverted by the EVM.',
          type: 'danger',
        })
      })
  )
}

export const request_totalSupply = async () => {
  await initContract()
  return nftContract.methods.totalSupply().call()
}

export const request_nftLimit = async () => {
  await initContract()
  return nftContract.methods.MAX_NFT().call()
}

export const request_nftPrice = async () => {
  await initContract()
  const web3 = new Web3(window.ethereum)
  const price = await nftContract.methods.NFT_PRICE().call()

  return web3.utils.fromWei(`${price}`, 'ether')
}
