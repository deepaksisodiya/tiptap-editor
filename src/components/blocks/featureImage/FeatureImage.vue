<template>
  <div>
    <div
      :class="{ 'upload-picture-block': !data.fallback }"
      style="position: relative;"
    >
      <template v-if="!data.fallback">
        <i class="upload-icon"></i>
        <span>Upload feature image (optional)</span>
        <input
          type="file"
          ref="fileInput"
          style="position: absolute; opacity: 0; top: 0px; left: 0px; height: 100%; width: 100%; margin-top: 0px; margin-bottom: 0px"
          @change="previewFiles()"
        />
      </template>
      <figure
        v-if="data.fallback"
        class="featured-image"
        :class="{ selected: shouldShowClose }"
      >
        <div class="close-button" @click="removeImage">
          <i class="close-icon"></i>
        </div>
        <upload-progress
          v-show="!shouldHideProgress"
          :progress="upload.progress"
          :failed="upload.failed"
          :onRetry="previewFiles"
        />
        <picture @click="onImageClick">
          <source v-if="data.image" :srcset="data.image" type="image" />
          <source :srcset="data.fallback" type="image" />
          <img :src="data.fallback" @load="loaded" />
        </picture>
        <figcaption>
          <input
            v-model="caption"
            placeholder="Type caption for image (optional)"
            @keydown="handleKeydown"
            @paste.stop
          />
        </figcaption>
      </figure>
    </div>
  </div>
</template>

<script>
import { TextSelection } from "tiptap";
import { isDataURL } from "./../../../utils";
import UploadProgress from "../../UploadProgress";

export default {
  name: "FeatureImage",
  props: ["node", "updateAttrs", "view", "getPos", "options"],
  components: {
    UploadProgress
  },
  data() {
    return {
      data: this.node.attrs.src,
      shouldShowClose: false,
      upload: {
        progress: 0,
        failed: false,
        completed: false,
        retry: true,
        processing: false
      }
    };
  },
  inject: ["getEditorVm"],
  watch: {
    "node.attrs.src"(newValue) {
      if (!this.data.fallback) this.data = newValue;
    }
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
    },
    shouldHideProgress() {
      return (
        this.upload.completed || !isDataURL(this.data && this.data.fallback)
      );
    }
  },
  mounted() {
    this.view.featureImageInstance = this;
    this.getEditorVm().$watch("selectedEl", value => {
      if (this.shouldShowClose && value !== this.$el)
        this.shouldShowClose = false;
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
    onProgress(progress) {
      this.upload.progress = progress;
    },
    previewFiles() {
      const file = this.$refs.fileInput.files[0];

      const imageType = /image.*/;
      if (file.type.match(imageType)) {
        const reader = new FileReader();
        reader.onload = async () => {
          const img = new Image();
          img.src = reader.result;
          this.data = { fallback: img.src };

          try {
            this.upload.processing = true;
            const response = await this.options.uploadImage(
              file,
              this.onProgress
            );
            if (response && response.status === 200) {
              this.src = response.data;
              this.data = response.data;
              this.upload.completed = false;
            }
          } catch (error) {
            if (error.response && [415, 413].includes(error.response.status)) {
              this.deleteNode();
            } else {
              const editorVm = this.getEditorVm();
              editorVm.failedBlocks = editorVm.failedBlocks + 1;
              this.upload.failed = true;
            }
          } finally {
            this.upload.processing = false;
          }
        };
        reader.readAsDataURL(file);
      }
    },
    loaded() {
      if (this.caption) return;
      this.caption = " ";
      this.$nextTick(() => {
        this.caption = "";
      });
    },
    removeImage() {
      this.src = "";
      this.data = "";
    },
    onImageClick() {
      if (isDataURL(this.data && this.data.fallback) === false)
        this.shouldShowClose = !this.shouldShowClose;
      this.options.onSelection(this.shouldShowClose ? this.$el : "");
    }
  }
};
</script>
