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
      :class="[
        'progress-bar',
        progress === 100 && processing ? 'processing-progress-bar' : ''
      ]"
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
    processing: {
      default: false,
      type: Boolean
    }
  },
  methods: {
    handleRetry(e) {
      if (this.retry) this.$emit("click", e);
    }
  }
};
</script>
