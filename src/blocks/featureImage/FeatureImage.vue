<template>
  <div :class="{ 'upload-picture-block': !dataUrl }" @click="addImage">
    <input type="file" ref="fileInput" style="display:none" @change="previewFiles()" />
    <template v-if="!dataUrl">
      <i class="upload-icon"></i>
      <span>Upload feature image (optional)</span>
    </template>
    <figure v-if="dataUrl" class="featured-image">
      <img :src="dataUrl" />
      <figcaption>
        <input
          v-model="caption"
          placeholder="Type caption for image (optional)"
          @keyup="handleKeyup"
        />
      </figcaption>
    </figure>
  </div>
</template>

<script>
import { TextSelection } from "tiptap";
import axios from "axios";

export default {
  name: "Image",
  props: ["node", "updateAttrs", "view", "getPos"],
  data() {
    return {
      dataUrl: this.node.attrs.src
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
    previewFiles() {
      const file = this.$refs.fileInput.files[0];

      const imageType = /image.*/;
      if (file.type.match(imageType)) {
        const reader = new FileReader();
        reader.onload = async () => {
          const img = new Image();
          img.src = reader.result;
          this.dataUrl = img.src;

          const formData = new FormData();
          formData.append(file.name, file);
          // TODO handle image loading here later
          const response = await axios.post("/api/w/images", formData, {
            headers: {
              "Content-Type": "multipart/form-data"
            }
          });
          this.src = response.data.url;
        };
        reader.readAsDataURL(file);
      } else {
        console.log("File not supported!");
      }
      // this.$refs.fileInput.value = "";
    },
    addImage() {
      if (!this.src) this.$refs.fileInput.click();
    }
  }
};
</script>
