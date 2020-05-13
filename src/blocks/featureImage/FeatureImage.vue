<template>
  <div>
    <div
      :class="{ 'upload-picture-block': !dataUrl }"
      style="position: relative;"
    >
      <template v-if="!dataUrl">
        <i class="upload-icon"></i>
        <span>Upload feature image (optional)</span>
        <input
          type="file"
          ref="fileInput"
          style="position: absolute; opacity: 0; top: 0px; left: 0px; height: 100%; width: 100%; margin-top: 0px; margin-bottom: 0px"
          @change="previewFiles()"
        />
      </template>
      <figure v-if="dataUrl" class="featured-image">
        <img :src="dataUrl" @load="onImageLoad" />
        <figcaption>
          <input
            v-model="caption"
            placeholder="Type caption for image (optional)"
            @keyup="handleKeyup"
          />
        </figcaption>
      </figure>
    </div>
  </div>
</template>

<script>
import { TextSelection } from "tiptap";

export default {
  name: "Image",
  props: ["node", "updateAttrs", "view", "getPos", "options"],
  data() {
    return {
      dataUrl: this.node.attrs.src,
    };
  },
  watch: {
    "node.attrs.src"(newValue) {
      if (!this.dataUrl) this.dataUrl = newValue;
    },
  },
  computed: {
    src: {
      get() {
        return this.node.attrs.src;
      },
      set(src) {
        this.updateAttrs({
          src,
        });
      },
    },
    caption: {
      get() {
        return this.node.attrs.caption;
      },
      set(caption) {
        this.updateAttrs({
          caption,
        });
      },
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.$el.scrollIntoView(true);
    });
    this.view.featureImageInstance = this;
  },
  methods: {
    handleKeyup(event) {
      let {
        state: { tr },
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
          try {
            const response = await this.options.uploadImage(formData);
            this.src = response.data.url;
          } catch (error) {
            this.options.handleError(error);
            this.src = "";
            this.dataUrl = "";
          }
        };
        reader.readAsDataURL(file);
      } else {
        console.log("File not supported!");
      }
    },
    onImageLoad() {
      if (this.caption) return;
      this.caption = " ";
      this.$nextTick(() => {
        this.caption = "";
      });
    },
  },
};
</script>
