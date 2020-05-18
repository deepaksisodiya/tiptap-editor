<template>
  <div
    v-if="hasError"
    class="message-bar with-icon"
    :class="[isAlert ? 'alert' : 'error']"
  >
    <p>{{ errorMessage }}</p>
    <div @click="onClickClose" class="close-message-bar">
      <i class="close-icon"></i>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    onClickClose: {
      type: Function,
      required: true
    },
    hasError: {
      type: Boolean,
      required: true
    },
    errorMessage: {
      type: String,
      required: true
    },
    errorName: {
      type: String,
      required: true
    }
  },
  computed: {
    isAlert() {
      return this.errorName === "offline";
    }
  }
};
</script>
