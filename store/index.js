import BigNumber from "bignumber.js";
import {connectWallet, fetchContractData, userAddress} from "../core/web3";
import {network, tokens} from "../core/constants";
import {ERC20} from "../core/abis";

export const state = () => ({
  isConnected: null,
  currentNetwork: '',
  wrongNetwork: false,
  tokensInfo: [],
  allTransactions: [],
  loader: false
})

export const mutations = {
  SET_CURRENT_NETWORK(state, network) {
    state.currentNetwork = network
  },
  SET_WRONG_NETWORK_STATUS(state, status) {
    state.wrongNetwork = status
  },
  SET_TOKEN_INFO(state, arr) {
    state.tokensInfo = arr
  },
  SET_TRANSACTIONS(state, transArr) {
    state.allTransactions = [...state.allTransactions, transArr]
  },
  CLEAR_TRANSACTIONS(state){
    state.allTransactions = []
  },
  START_LOADER(state, status) {
    state.loader = status
  }
}

export const actions = {
  async connectWallet({commit, dispatch}){
    const chainId = await connectWallet();
    if(chainId === 4) {
      commit('SET_CURRENT_NETWORK', network.Rinkeby)
      dispatch('getAllInfoAboutToken')
    } else {
      commit('setCurrentNetwork', network.Mainnet)
      commit('SET_WRONG_NETWORK_STATUS', true)
    }
  },
  async getAllInfoAboutToken({commit, state}) {
    try {
      let arrayInfo = []
      //перебор токенов для получение инфы
      for (const token of tokens) {
        const [
          symbolOfToken,
          decimals
        ] = await Promise.all([
          fetchContractData('symbol', ERC20, token),
          fetchContractData('decimals', ERC20, token)
        ])

        const tokenInfo = {
          token: token,
          symbol: symbolOfToken,
          decimal: decimals
        }
        arrayInfo.push(tokenInfo);
      }
      commit('SET_TOKEN_INFO', arrayInfo)
    } catch (err) {
      console.log('Get token info error')
    }
  },
  setTransactions({commit}, transArr) {
    commit('SET_TRANSACTIONS', transArr)
  },
  clearTransactions({commit}){
    commit('CLEAR_TRANSACTIONS')
  },
  startLoader({commit}, status){
    commit('START_LOADER', status)
  }
}

export const getters = {
  getCurrentNetwork : state => state.currentNetwork,
  getWrongNetworkStatus : state => state.wrongNetwork,
  getTokensInfo : state => state.tokensInfo,
  getAllTransactions : state => state.allTransactions,
  getLoader : state => state.loader
}
