<template>
  <div class="spinner__bg">
    <div class="spinner" />
  </div>
</template>

<script>
export default {
  name: 'UiLoader',
  props: {
    loaderStatusText: {
      type: String,
      default: 'Loading',
    },
  },
};
</script>

<style lang="scss" scoped>
.spinner__bg {
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
}
.spinner {
  position: absolute;
  top: 350px;
  left: 600px;
  margin: auto;
  box-sizing: border-box;
  background-clip: padding-box;
  width: 200px;
  height: 200px;
  border-radius: 100px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  //-webkit-mask: linear-gradient(rgba(0, 0, 0, 0.1), #000000 90%);
  transform-origin: 50% 60%;
  transform: perspective(200px) rotateX(66deg);
  animation: spinner-wiggle 1.2s infinite;
}

.spinner:before,
.spinner:after {
  content: "";
  position: absolute;
  margin: -4px;
  box-sizing: inherit;
  width: inherit;
  height: inherit;
  border-radius: inherit;
  opacity: .05;
  border: inherit;
  border-color: transparent;
  animation: spinner-spin 1.2s cubic-bezier(0.6, 0.2, 0, 0.8) infinite, spinner-fade 1.2s linear infinite;
}

.spinner:before {
  border-top-color: #FF284C;
}

.spinner:after {
  border-top-color: #FF284C;
  animation-delay: 0.3s;
}

@keyframes spinner-spin {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes spinner-fade {
  20% {
    opacity: .1;
  }
  40% {
    opacity: 1;
  }
  60% {
    opacity: .1;
  }
}

.dots {
  padding-right: 10px;

  &:after {
    margin-left: -3px;
    content: ' .';
    animation: dots 1s steps(5, end) infinite;
  }
}

</style>
