<template>
  <div v-if="isConnectedNode">
    <header class="header">
      <div class="header__button">
        <button class="button" @click="connect">
          Connect Wallet
        </button>
      </div>
      <div class="header__network">
        {{ currentNetwork}}
      </div>
    </header>

    <main class="main">
      <ValidationObserver  v-slot="{ invalid }">
        <div class="amount">
          <div class="amount__field">
            <label for="amount" class="amount__text">Amount</label>
            <ValidationProvider
              v-slot="{ errors }"
              :name="'Amount'"
              :rules="`required|integer|max_value:${balanceToken}|min_value:1`"
            >
              <input type="text" id="amount" class="amount__input" v-model="amountToken">
              <span class="amount__error">{{errors[0]}}</span>
            </ValidationProvider>
          </div>
          <div class="amount__select">
            <select name="" id="" class="amount__select-list" v-model="selectedSymbol">
              <option v-for="token in tokensInfo" :key="token.token" v-bind:value="token"> {{ token.symbol}} </option>
            </select>
          </div>
        </div>
          <div class="address">
            <div class="address__field">
              <label for="address" class="address__text">Address</label>
              <ValidationProvider
                v-slot="{ errors }"
                :name="'Recipient address'"
                :rules="`required`"
              >
                <input type="text" id="address" class="address__input" v-model="recipientAddress">
                <span class="amount__error">{{errors[0]}}</span>
              </ValidationProvider>
            </div>
          </div>
        <div class="balance">
          Your balance : {{balanceToken ? balanceToken : '-' }} {{selectedSymbol.symbol}}
        </div>
        <div class="allowance" >
          Your allowance : {{tokenAllowance ? tokenAllowance : '-'}}
        </div>
        <div class="buttons">
          <button class="buttons__allow btn"  @click="allowance(selectedSymbol)">
            Get allowance
          </button>
          <button class="buttons__approve btn" :disabled='invalid' @click="approve(selectedSymbol)">
            Approve
          </button>
          <button class="buttons__transfer btn" :disabled='invalid' @click="transfer(selectedSymbol)">
            Transfer
          </button>
        </div>
      </ValidationObserver>
      <Transactions />
      <UiLoader v-if="isPending"/>
      <wrong-network  v-if="wrongNetworkInWallet" @close-modal="closeModal"/>
    </main>
  </div>
</template>

<script>
import BigNumber from "bignumber.js";
import Transactions from "./Transactions";
import UiLoader from "./ui/loader";
import WrongNetwork from "../modals/WrongNetwork";
import {
  connectNode,
  fetchContractData,
  userAddress,
  transferToken,
  approveToken,
  getTransaction
} from "../core/web3";
import {ERC20} from "../core/abis";

export default {
  name: 'MainCont',
  components: {UiLoader, WrongNetwork, Transactions},
  data() {
    return {
      selectedSymbol: '',
      tokenAllowance: null,
      amountToken: null,
      recipientAddress: '',
      connected: null,
      allTransactions: [],
      isConnectedNode: false,
      balanceToken: null,
      pending: false
    }
  },
  watch: {
    connected(value){
      if(value) this.getAllTransactions()
    },
    selectedSymbol(value){
      this.balance(value)
      this.getAllTransactions(value)
    }
  },
  computed: {
    currentNetwork(){
      return this.$store.getters.getCurrentNetwork
    },
    wrongNetworkInWallet(){
      return this.$store.getters.getWrongNetworkStatus
    },
    tokensInfo(){
      return this.$store.getters.getTokensInfo
    },
    isPending(){
      return this.$store.getters.getLoader
    }
  },
  methods: {
    //подключить кошелек
    connect(){
      this.$store.dispatch('connectWallet')
    },
    //transfer token
    async transfer(selectedSymbol){
      try {
        const amount = new BigNumber(this.amountToken).shiftedBy(+selectedSymbol.decimal).toString()
        //запуск loader
        await this.$store.dispatch('startLoader', true)
        await transferToken(selectedSymbol.token, this.recipientAddress, amount )
        //убрать loader
        await this.$store.dispatch('startLoader', false)
        await this.balance(selectedSymbol)
      } catch (err) {
        console.log('Error transfer amount')
      }
    },
    //approve
    async approve(selectedSymbol){
      try {
        const amount = new BigNumber(this.amountToken).shiftedBy(+selectedSymbol.decimal).toString()
        await this.$store.dispatch('startLoader', true)
        await approveToken(selectedSymbol.token, this.recipientAddress, amount )
        await this.$store.dispatch('startLoader', false)
      } catch (err){
        console.log('Error approve amount')
      }
    },
    //allowance
    async allowance(selectedSymbol){
      try {
        const allowance = await fetchContractData('allowance', ERC20, selectedSymbol.token, [userAddress, this.recipientAddress])
        this.tokenAllowance = new BigNumber(allowance).shiftedBy(-selectedSymbol.decimal).toString()
      } catch (err) {
        console.log('Error get allowance')
      }
    },
    //закрыть модалку
    closeModal() {
      this.wrongNetworkWallet = !this.wrongNetworkWallet
    },
    // получить баланс по токену
    async balance(selectedSymbol){
      let balance = await fetchContractData('balanceOf', ERC20, selectedSymbol.token, [userAddress])
      this.balanceToken = new BigNumber(balance).shiftedBy(-selectedSymbol.decimal).toString()
    },
    //all transactions
    getAllTransactions(value){
      const _this = this
      _this.$store.dispatch('clearTransactions')

       getTransaction(value.token,  function(trans){
         _this.$store.dispatch('setTransactions',  trans)
      });
    },
  },
  mounted() {
    this.isConnectedNode = connectNode()
  },
}
</script>

<style lang="scss" scoped>
* {
  box-sizing: border-box;
}
.amount {
  margin-top: 105px;
  display: flex;
  align-items: center;
  &__field {
    display: flex;
    flex-direction: column;
  }
  &__text {
    font-weight: normal;
    font-size: 18px;
    line-height: 21px;
    color: #000000;
  }
  &__input {
    width: 845px;
    height: 70px;
    background: #F3F5FA;
    border: none;
    outline: none;
    cursor: pointer;
    padding-left: 20px;
    margin-top: 10px;
  }
  &__select {
    margin-left: 30px;
    margin-top: 25px;
    &-list {
      width: 140px;
      height: 70px;
      cursor: pointer;
      background: #63BCD8;
      border: none;
      outline: none;
      color: #ffffff;
      font-size: 21px;
      text-align: center;
    }
  }
  &__error {
    color: red;
    font-size: 16px;
  }
}
.address {
  margin-top: 53px;
  &__text {
    font-weight: normal;
    font-size: 18px;
    line-height: 21px;
  }
  &__field {

  }
  &__input {
    width: 100%;
    height: 70px;
    background: #F3F5FA;
    border: none;
    outline: none;
    cursor: pointer;
    padding-left: 20px;
    margin-top: 10px;
  }
}
.balance {
  margin-top: 47px;
}
.allowance {
  margin-top: 39px;
}
.buttons {
  margin-top: 47px;
  .btn {
    width: 187px;
    height: 50px;
    background: #63BCD8;
    border: none;
    cursor: pointer;
    color: #ffffff;
    padding: 0;
    font-size: 18px;
    font-weight: 800;
    line-height: 21px;
  }
  .btn + .btn {
    margin-left: 30px;
  }
}

.header {
  &__button {
    width: 187px;
    margin-left: auto;
  }
  &__network {
    margin: 15px 0 0 auto;
    width: 100px;
    text-align: center;
    color: #63BCD8;
    font-size: 18px;
  }
}
.button {
  width: 100%;
  height: 50px;
  background: #63BCD8;
  font-weight: bold;
  font-size: 18px;
  line-height: 21px;
  color: #ffffff;
  cursor: pointer;
  border: none;
  outline: none;
}
</style>
