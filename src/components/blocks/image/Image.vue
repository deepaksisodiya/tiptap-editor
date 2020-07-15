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
        event.preventDefault();
      }
    },
    deleteNode() {
      let {
        state: { tr }
      } = this.view;
      const pos = this.getPos();
      let textSelection = TextSelection.create(tr.doc, pos, pos + 1);
      this.view.dispatch(
        tr.setSelection(textSelection).deleteSelection(this.src)
      );
      this.view.focus();
    },
    isDataURL(data) {
      const regex = new RegExp(
        /^\s*data:([a-z]+\/[a-z]+(;[a-z\-]+\=[a-z\-]+)?)?(;base64)?,[a-z0-9\!\$\&\'\,\(\)\*\+\,\;\=\-\.\_\~\:\@\/\?\%\s]*\s*$/i
      );
      return !!data.match(regex);
    },
    onImageClick() {
      if (this.isDataURL(this.src) === false)
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
