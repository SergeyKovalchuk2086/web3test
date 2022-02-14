export const state = () => ({
  isConnected: null,
  transactions: []
})

export const mutations = {
  setStatusWallet(state, status) {
    state.isConnected = status
  },
  setTransaction(state, transaction) {
    state.transactions.push(transaction)
  }
}

export const actions = {
  SET_STATUS({commit}, status) {
    commit('setStatusWallet', status)
  },
  SET_TRANSACTION({commit}, transaction) {
    commit('setTransaction', transaction)
  }
}

export const getters = {
  getStatusWallet : state => state.isConnected,
  getAllTransactions : state => state.transactions
}
