<template>
  <div
    v-show="progress < 100"
    :class="[
      'progress',
      'media-progress',
      failed ? 'media-progress-error' : ''
    ]"
  >
    <div v-if="failed" class="media-error-content">
      <span class="error-text">Upload failed</span>
      <i class="icon retry-uploading-icon"></i>
    </div>
    <div
      else
      class="progress-bar"
      role="progressbar"
      aria-valuenow="45"
      aria-valuemin="0"
      aria-valuemax="100"
      :style="{ width: progress }"
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
    show: {
      default: false,
      type: Boolean
    },
    failed: {
      default: false,
      type: Boolean
    }
  }
};
</script>
