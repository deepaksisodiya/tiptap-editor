<template>
  <figure @click="onImageClick" :class="{ selected: shouldShowClose }">
    <div class="close-button" @click="deleteNode">
      <i class="close-icon"></i>
    </div>
    <img ref="img" :src="dataUrl" :height="height" :width="width" />
    <figcaption>
      <input
        v-model="caption"
        placeholder="Type caption for image (optional)"
        @keyup="handleKeyup"
        @paste.stop
      />
    </figcaption>
  </figure>
</template>

<script>
import { TextSelection } from "tiptap";

export default {
  name: "Image",
  props: ["node", "updateAttrs", "view", "getPos"],
  data() {
    return {
      height: "",
      width: "",
      dataUrl: this.node.attrs.src,
      shouldShowClose: false
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
    window.imageInstance = this;
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
    },
    deleteNode() {
      let {
        state: { tr, schema }
      } = this.view;
      const pos = this.getPos();
      tr = tr.insert(pos + 1, schema.node("paragraph"));
      let textSelection = TextSelection.create(tr.doc, pos, pos + 1);
      tr = tr.setSelection(textSelection).deleteSelection();
      this.view.dispatch(tr);
      this.view.focus();
    },
    onImageClick() {
      this.shouldShowClose = !this.shouldShowClose;
    }
  }
};
</script>
