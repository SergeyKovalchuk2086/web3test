<template>
  <div>
    <header class="header">
      <div class="header__button">
        <button v-if="connected" class="button" @click="disconnect">
          Disconnect Wallet
        </button>
        <button v-else class="button" @click="connect">
          Connect Wallet
        </button>
      </div>
      <div class="header__network">
        {{ network}}
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
              :rules="`required|integer|max_value:${selectedSymbol.balance}|min_value:1`"
            >
              <input type="text" id="amount" class="amount__input" v-model="amountToken">
              <span class="amount__error">{{errors[0]}}</span>
            </ValidationProvider>
          </div>
          <div class="amount__select">
            <select name="" id="" class="amount__select-list" v-model="selectedSymbol">
              <option v-for="token in tokensInfo" :key="token.symbol" v-bind:value="token"> {{ token.symbol}} </option>
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
          Your balance : {{selectedSymbol.balance ? selectedSymbol.balance : '-' }} {{selectedSymbol.symbol}}
        </div>

        <div class="allowance" >
          Your allowance : {{tokenAllowance ? tokenAllowance : '-'}}
        </div>

        <div class="buttons">
          <button class="buttons__allow btn"  :disabled='invalid' @click="allowance(selectedSymbol.symbol)">
            Get allowance
          </button>

          <button class="buttons__approve btn" :disabled='invalid' @click="approve(selectedSymbol.symbol)">
            Approve
          </button>

          <button class="buttons__transfer btn" :disabled='invalid' @click="transfer(selectedSymbol.symbol)">
            Transfer
          </button>
        </div>
      </ValidationObserver>

      <Transactions />
      <wrong-network  v-if="wrongNetworkWallet" @close-modal="closeModal"/>
    </main>
  </div>
</template>

<script>
import Transactions from "./Transactions";
import {
  connectNode,
  fetchContractData,
  connectWallet,
  userAddress,
  transferToken,
  approveToken,
} from "../core/web3";
import BigNumber from "bignumber.js";
import WrongNetwork from "../modals/WrongNetwork";
const { ERC20 } = require('../core/abis');


export default {
  name: 'MainCont',
  components: {WrongNetwork, Transactions},
  data() {
    return {
      tokens: [
        '0x4b107a23361770534bd1839171bbf4b0eb56485c',
        '0xc13da4146d381c7032ca1ed6050024b4e324f4ef',
        '0x8d0c36c8842d1dc9e49fbd31b81623c1902b7819',
        '0xa364f66f40b8117bbdb772c13ca6a3d36fe95b13',
      ],
      tokensInfo: [],
      selectedSymbol: '',
      tokenAllowance: null,
      amountToken: null,
      recipientAddress: '',
      connected: null,
      transaction: {},
      network: '',
      wrongNetworkWallet: false
    }
  },
  computed: {

  },
  watch: {
    connected(value){
      if(value) this.getAllBalance();
    }
  },
  methods: {
    //подключить кошелек
    async connect(){
      this.connected = await connectWallet()
      if (this.connected){
        this.$store.commit('setStatusWallet', this.connected)
        this.network = 'Rinkeby'
      } else {
        this.network = 'Mainnet'
        this.wrongNetworkWallet = true;
      }


      // console.log('connect')
      // console.log(this.connected)
      // console.log(this.$store.getters['getStatusWallet']);
    },
    disconnect(){
      this.connected = !this.connected
      // console.log('disconnect')
    },

    //получение всех балансов
    async getAllBalance(){
       let symbolOfToken;
       let decimals;
       let balance;

      //перебор токенов
      for (const token of this.tokens) {
        //символ токена
        symbolOfToken = await fetchContractData('symbol', ERC20, token);
        // console.log('symbol', symbolOfToken)

        // точность
        decimals = await fetchContractData('decimals', ERC20, token)
        // console.log(decimals)

        // баланс
        balance = await fetchContractData('balanceOf', ERC20, token, [userAddress])
        balance = new BigNumber(balance).shiftedBy(-decimals).toString()
        // console.log(balance)

        const tokenInfo = {
          token: token,
          symbol: symbolOfToken,
          balance: balance
        }
        this.tokensInfo.push(tokenInfo);
      }
    },

    //transfer token
    async transfer(selectedSymbol){
      let decimal;
      let amount;
      for (const token of this.tokensInfo) {
        if(token.symbol === selectedSymbol) {
          decimal = await fetchContractData('decimals', ERC20, token.token);
          amount = new BigNumber(this.amountToken).shiftedBy(+decimal).toString();

          // console.log(typeof this.recipientAddress)
          const res = await transferToken(token.token, this.recipientAddress, amount )
          // console.log(res)

          //ждём конец транзакции
          if(res.receipt.status) {
            this.transaction = {
              type: 'Transfer',
              from: `${userAddress}`,
              to: `${this.recipientAddress}`,
              amount: this.amountToken,
              tokenSymbol: this.selectedSymbol.symbol
            }
            this.$store.commit('setTransaction', this.transaction)
          }
        }
      }
    },


    //approve
    async approve(selectedSymbol){
      let decimal;
      let amount;
      for (const token of this.tokensInfo) {
        if(token.symbol === selectedSymbol) {
          decimal = await fetchContractData('decimals', ERC20, token.token);
          amount = new BigNumber(this.amountToken).shiftedBy(+decimal).toString();

          let res = await approveToken(token.token, this.recipientAddress, amount )

          if(res.receipt.status) {
            this.transaction = {
              type: 'Approve',
              from: `${userAddress}`,
              to: `${this.recipientAddress}`,
              amount: this.amountToken,
              tokenSymbol: this.selectedSymbol.symbol
            }
            this.$store.commit('setTransaction', this.transaction)
          }
        }
      }
    },

    //allowance
    async allowance(selectedSymbol){
      let allowance;
      let decimals;
      for (const token of this.tokensInfo) {
        if (token.symbol === selectedSymbol) {
          allowance = await fetchContractData('allowance', ERC20, token.token, [userAddress, this.recipientAddress]);
          decimals = await fetchContractData('decimals', ERC20, token.token)

          this.tokenAllowance = new BigNumber(allowance).shiftedBy(-decimals).toString()
          // console.log(allowance)
        }
      }
    },
    closeModal() {
      this.wrongNetworkWallet = !this.wrongNetworkWallet
    }
  },
  mounted() {
    connectNode();
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
