<template>
  <div v-if="shouldDisplayTitleError" class="message-bar with-icon error">
    <p>{{ message }}</p>
    <div @click="closeTitleError" class="close-message-bar">
      <i class="close-icon"></i>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    closeTitleError: {
      type: Function,
      required: true
    },
    shouldDisplayTitleError: {
      type: Boolean,
      required: true
    },
    message: {
      type: String,
      required: true
    }
  }
};
</script>
