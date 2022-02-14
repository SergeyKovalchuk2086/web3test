<template>
<div class="wrong">
  <div class="wrong__box">
    <div class="wrong__box-text">
      You have selected the <span>Mainnet</span> network, please, select the <span>Rinkeby</span> network in your wallet
    </div>
    <div class="wrong__box-button">
      <button @click="closeModal">
        Ok
      </button>
    </div>
  </div>
</div>
</template>

<script>
export default {
  name: 'WrongNetwork',
  data(){
    return {

    }
  },
  methods: {
    closeModal(){
      this.$emit('close-modal')
    }
  }
}
</script>

<style lang="scss" scoped>
.wrong {
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0, 0.7);
  position: fixed;
  top: 0;
  left: 0;
  z-index: 150;
  overflow: auto;
  display: flex;
  justify-content: center;
  align-items: center;
  &__box {
    width: 300px;
    padding: 20px;
    background: beige;
    border-radius: 5px;
    &-text{
      text-align: center;
      font-size: 18px;
      span {
        color: red;
      }
    }
    &-button {
      width: 80px;
      margin: 20px auto 0;
      button {
        width: 100%;
        height: 50px;
        cursor: pointer;
        background: none;
        border-radius: 5px;
        outline: none;
        border: 1px solid black;
      }
    }
  }


}
</style>
