const Web3 = require("web3")
import Web4 from '@cryptonteam/web4';
import {ERC20} from "../core/abis";

let web4;
export let web3Wallet;
export let userAddress;
let chainId;
let web3Guest;
let tokenSymbol;
let ercAbstract;
let instance;

//подключить кошелёк metamask
export const connectWallet = async () => {
  try {
    const { ethereum } = window; // ethereum - metamask
    if (!ethereum) {
      console.log('metamask is not install')
      return false;
    }
    web3Wallet = new Web3(ethereum); // init web3
    if (await web3Wallet.eth.getCoinbase() === null) { // проверяем подключен ли metamask
      await ethereum.enable(); // подключить metamask
    }
    userAddress = await web3Wallet.eth.getCoinbase(); // получить адрес пользователя
    chainId = await web3Wallet.eth.net.getId(); // запись сети
    if (+chainId !== 4) {
      console.log('current project work on rinkeby network')
      return false;
    }
    web4 = new Web4();
    await web4.setProvider(ethereum, userAddress)
    ercAbstract = web4.getContractAbstraction(ERC20);

    return chainId;
    // return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

export const connectNode = () => {
  try {
    let bscUrl
    if (process.env.IS_MAINNET === 'true') {
      bscUrl = 'https://mainnet.infura.io/v3/09bd9836805a42219fe900b94c5e6370'
    } else {
      bscUrl = 'wss://rinkeby.infura.io/ws/v3/09bd9836805a42219fe900b94c5e6370'
    }
    const provider = new Web3.providers.WebsocketProvider(bscUrl)
    web3Guest = new Web3(provider)
    // console.log(web3Guest)
    return true
  } catch (e) {
    return false
  }
}

export const fetchContractData = async (method, ERC20, address, params) => {
  try {
    const contract = new web3Guest.eth.Contract(ERC20, address)
    return await contract.methods[method].apply(this, params).call()
  } catch (e) {
    console.log(e)
    return ''
  }
}

//transfer token
export const transferToken = async (token, recipient, amount) => {
  instance = await ercAbstract.getInstance(token);
  return await instance.transfer(recipient, amount)
}

//approve token
export const approveToken = async (token, recipient, amount) => {
  instance = await ercAbstract.getInstance(token);
  return await instance.approve(recipient, amount)
}

//allowance token
export const allowanceToken = async (user, recipient, token) => {
  instance = await ercAbstract.getInstance(token);
  await instance.allowance(user, recipient)
}

//get transactions
export const getTransaction = async (token, fn) => {
  instance = await ercAbstract.getInstance(token);
  await instance.contract.events.Transfer({
    fromBlock: 0,
    filter: {
      from: userAddress
    }
  }, (e, r) => fn(r) )
}
