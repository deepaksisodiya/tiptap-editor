<template>
  <div
    :class="[
      'progress',
      'media-progress',
      failed ? 'media-progress-error' : ''
    ]"
    @click="handleRetry"
  >
    <div v-if="failed" class="media-error-content">
      <span class="error-text">Upload failed</span>
      <i v-if="retry" class="icon retry-uploading-icon"></i>
    </div>
    <div
      v-else
      class="progress-bar"
      role="progressbar"
      :aria-valuenow="progress"
      aria-valuemin="0"
      aria-valuemax="100"
      :style="{ width: progress + '%' }"
    />
  </div>
</template>

<script>
export default {
  name: "UploadProgress",
  props: {
    progress: {
      default: 0,
      type: Number
    },
    failed: {
      default: false,
      type: Boolean
    },
    retry: {
      default: true,
      type: Boolean
    },
    onRetry: {
      type: Function,
      default: Function.prototype
    }
  },
  methods: {
    handleRetry() {
      if (this.retry && typeof onRetry === "function") this.onRetry();
    }
  }
};
</script>
