<template>
  <div class="transactions">
    <p class="transactions__title">Your transactions</p>
    <div class="transactions__list">
      <div class="transactions__item" v-for="transaction in allTransactions" :key="transaction.blockNumber">
        <div class="transactions__type">
            <p>Type</p>
            <p>{{transaction.event}}</p>
        </div>
        <div class="transactions__from">
          <p>From</p>
          <p>{{transaction.returnValues.from}}</p>
        </div>
        <div class="transactions__to">
          <p>To</p>
          <p>{{transaction.returnValues.to}}</p>
        </div>

        <div class="transactions__amount">
          <p>Amount</p>
          <p>{{transaction.returnValues.value === '0' ? 0 : transaction.returnValues.value.replace(/0*$/,"")}}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Transactions',
  computed: {
    allTransactions(){
      return this.$store.getters.getAllTransactions
    }
  }
}
</script>

<style lang="scss" scoped>
* {
  box-sizing: border-box;
}
.transactions {
  margin-top: 59px;
  &__title {
    font-weight: 800;
    font-size: 22px;
    line-height: 26px;
    color: #000000;
  }
  &__item {
    display: flex;
    justify-content: space-between;
    background: #F3F5FA;
    padding: 0 20px;
    margin-bottom: 15px;
  }
}
</style>
