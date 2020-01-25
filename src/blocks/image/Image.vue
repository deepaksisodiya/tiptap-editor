<template>
  <figure>
    <img :src="src" />
    <figcaption>
      <input
        v-model="caption"
        placeholder="Type caption for image (optional)"
        @keyup="handleKeyup"
      />
    </figcaption>
  </figure>
</template>

<script>
import { TextSelection } from "tiptap";

export default {
  name: "Image",
  props: ["node", "updateAttrs", "view", "getPos"],
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
      this.$el.scrollIntoView();
    });
  },
  methods: {
    handleKeyup(event) {
      let {
        state: { tr }
      } = this.view;
      const pos = this.getPos();
      if (event.key === "Backspace" && !this.caption) {
        let textSelection = TextSelection.create(tr.doc, pos, pos + 1);
        this.view.dispatch(
          tr.setSelection(textSelection).deleteSelection(this.src)
        );
        this.view.focus();
      } else if (event.key === "Enter") {
        let textSelection = TextSelection.create(tr.doc, pos + 2, pos + 2);
        this.view.dispatch(tr.setSelection(textSelection));
        this.view.focus();
      }
    }
  }
};
</script>
