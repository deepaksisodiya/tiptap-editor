<template>
  <figure :class="{ selected: shouldShowClose }">
    <div class="close-button" @click="deleteNode">
      <i class="close-icon"></i>
    </div>
    <img
      @click="onImageClick"
      ref="img"
      :src="dataUrl"
      :height="height"
      :width="width"
      @load="loaded"
    />
    <figcaption>
      <input
        v-model="caption"
        placeholder="Type caption for image (optional)"
        @keydown="handleKeydown"
        @paste.stop
      />
    </figcaption>
  </figure>
</template>

<script>
import { TextSelection } from "tiptap";

export default {
  name: "ImageBlock",
  props: ["node", "updateAttrs", "view", "getPos", "options"],
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
  },
  methods: {
    handleKeydown(event) {
      let {
        state: { tr }
      } = this.view;
      const pos = this.getPos();
      if (event.key === "Enter") {
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
    },
    async loaded() {
      this.caption = "";
      const fileInputEl = document.getElementById("image-input");
      if (this.dataUrl.includes("data:") && fileInputEl.files.length != 0) {
        const file = fileInputEl.files[0];
        const formData = new FormData();
        formData.append("image", file);

        try {
          const response = await this.options.uploadImage(formData);
          if (response && response.status === 200)
            this.src = response.data.image;
        } catch (error) {
          this.options.handleError(error);
          this.deleteNode();
        } finally {
          fileInputEl.value = "";
        }
      }
    }
  }
};
</script>
