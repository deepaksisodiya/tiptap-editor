<template>
  <figure>
    <audio controls="controls" :src="data" />
    <figcaption>
      <input
        v-model="caption"
        placeholder="Type caption for Audio (optional)"
        @paste.stop
      />
    </figcaption>
  </figure>
</template>

<script>
export default {
  name: "Audio",
  props: ["node", "updateAttrs", "view", "getPos", "options"],
  data() {
    return {
      data: this.node.attrs.src
    };
  },
  computed: {
    src: {
      get() {
        return this.node.attrs.src;
      },
      set(src) {
        this.updateAttrs({
          src
        });
      }
    },
    caption: {
      get() {
        return this.node.attrs.caption;
      },
      set(caption) {
        this.updateAttrs({
          caption
        });
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.view.focus();
      this.$el.scrollIntoView(true);
    });
  }
};
</script>
