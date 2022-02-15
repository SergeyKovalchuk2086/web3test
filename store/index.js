import {connectWallet, fetchContractData, userAddress} from "../core/web3";
import {network} from "../core/constants";
import {ERC20} from "../core/abis";
import BigNumber from "bignumber.js";

export const state = () => ({
  isConnected: null,
  currentNetwork: '',
  wrongNetwork: false,
  tokens: [
    '0x4b107a23361770534bd1839171bbf4b0eb56485c',
    '0xc13da4146d381c7032ca1ed6050024b4e324f4ef',
    '0x8d0c36c8842d1dc9e49fbd31b81623c1902b7819',
    '0xa364f66f40b8117bbdb772c13ca6a3d36fe95b13',
    '0x59c106284a67515eDe58B7524D3eDD06C8d8479F'
  ],
  tokensInfo: [],
  allTransactions: []
})

export const mutations = {
  setStatusWallet(state, status) {
    state.isConnected = status
  },
  setCurrentNetwork(state, network) {
    state.currentNetwork = network
  },
  wrongNetworkInWallet(state, status) {
    state.wrongNetwork = status
  },
  setTokenInfo(state, arr) {
    state.tokensInfo = arr
  },
  set_transactions(state, transArr) {
    state.allTransactions = [...state.allTransactions, transArr]
  },
  clear_transactions(state){
    state.allTransactions = []
  }
}

export const actions = {
  SET_STATUS({commit}, status) {
    commit('setStatusWallet', status)
  },
  async CONNECT_WALLET({commit, dispatch}){
    const chainId = await connectWallet();
    if(chainId === 4) {
      commit('setCurrentNetwork', network.Rinkeby)
      dispatch('GET_ALL_INFO_ABOUT_TOKEN')
    } else {
      commit('setCurrentNetwork', network.Mainnet)
      commit('wrongNetworkInWallet', true)
    }

  },
  async GET_ALL_INFO_ABOUT_TOKEN({commit, state}) {
    let arrayInfo = []

    //перебор токенов
    for (const token of state.tokens) {

      //символ токена
      const symbolOfToken = await fetchContractData('symbol', ERC20, token);
      // console.log('symbol', symbolOfToken)

      // точность
      const decimals = await fetchContractData('decimals', ERC20, token)
      // console.log(decimals)

      // баланс
      let balance = await fetchContractData('balanceOf', ERC20, token, [userAddress])
      balance = new BigNumber(balance).shiftedBy(-decimals).toString()
      // console.log(balance)

      const tokenInfo = {
        token: token,
        symbol: symbolOfToken,
        balance: balance,
        decimal: decimals
      }
      arrayInfo.push(tokenInfo);
    }
    commit('setTokenInfo', arrayInfo)
  },

  SET_TRANSACTIONS({commit}, transArr) {
    commit('set_transactions', transArr)
  },
  CLEAR_TRANSACTIONS({commit}){
    commit('clear_transactions')
}
}

export const getters = {
  getCurrentNetwork : state => state.currentNetwork,
  wrongNetworkStatus : state => state.wrongNetwork,
  getTokensInfo : state => state.tokensInfo,
  getAllTransactions : state => state.allTransactions
}
