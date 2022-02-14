
const Web3 = require("web3")
import Web4 from '@cryptonteam/web4';
import BigNumber from 'bignumber.js';
const { ERC20 } = require('./abis.js');

let web4 = new Web4();
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
    return true;
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
    // console.log('contract', contract.methods)
    // console.log('userAddress',userAddress);
    //const balance = await contract.methods.balanceOf(userAddress).call();
    //console.log('balance', balance)
    return await contract.methods[method].apply(this, params).call()
  } catch (e) {
    console.log(e)
    return ''
  }
}

//получить баланс по токену
// export const balanceOfToken = async (token) => {
  // const decimals = await fetchContractData('decimals', ERC20, token)
  // console.log(decimals)
  // let balance = await fetchContractData('balanceOf', ERC20, token, [userAddress])
  // console.log(balance)
  // balance = new BigNumber(balance).shiftedBy(-decimals).toString()
  // console.log('Баланс: ', balance)
// }

//символ токенов
export const symbolOfToken = async (token) => {
  const symbol = await fetchContractData('symbol', ERC20, token);
  console.log(symbol)
  return symbol;
}

//transfer token
export const transferToken = async (token, recipient, amount) => {
  // web4 = new Web4();
  const { ethereum } = window;
  await web4.setProvider(ethereum, userAddress)
  ercAbstract = web4.getContractAbstraction(ERC20);
  instance = await ercAbstract.getInstance(token);

  return await instance.transfer(recipient, amount)
}

//approve token
export const approveToken = async (token, recipient, amount) => {
  const { ethereum } = window;
  await web4.setProvider(ethereum, userAddress)
  ercAbstract = web4.getContractAbstraction(ERC20);
  instance = await ercAbstract.getInstance(token);

  return await instance.approve(recipient, amount)
}

//allowance token
export const allowanceToken = async (user, recipient, token) => {
  const { ethereum } = window;
  await web4.setProvider(ethereum, userAddress)
  ercAbstract = web4.getContractAbstraction(ERC20);
  instance = await ercAbstract.getInstance(token);

  await instance.allowance(user, recipient)
}



