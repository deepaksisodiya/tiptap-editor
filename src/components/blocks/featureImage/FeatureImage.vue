<template>
  <div>
    <div
      :class="{ 'upload-picture-block': !data.fallback }"
      style="position: relative;"
    >
      <template v-if="!data.fallback">
        <i class="icon upload-icon"></i>
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
        <picture @click="onImageClick">
          <source v-if="data.image" :srcset="data.image" type="image" />
          <source :srcset="data.fallback" type="image" />
          <img
            :src="data.fallback"
            @load="loaded"
            :height="height"
            :width="width"
          />
          <upload-progress
            v-show="!shouldHideProgress"
            :progress="upload.progress"
            :failed="upload.failed"
            :processing="upload.processing"
            @click="uploadFile"
          />
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
    },
    "upload.failed"(newValue, oldValue) {
      if (newValue !== oldValue) {
        const editorVm = this.getEditorVm();
        if (newValue) editorVm.failedBlocks++;
        else editorVm.failedBlocks--;
      }
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
    height: {
      get() {
        return this.node.attrs.height;
      },
      set(height) {
        this.updateAttrs({
          height
        });
      }
    },
    width: {
      get() {
        return this.node.attrs.width;
      },
      set(width) {
        this.updateAttrs({
          width
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
    async uploadFile() {
      try {
        this.upload.processing = true;
        this.upload.failed = false;
        this.upload.progress = 0;
        const response = await this.options.uploadImage(
          this.file,
          this.onProgress
        );
        if (response && response.status === 200) {
          const imgObj = {
            image: response.data.image,
            fallback: response.data.fallback
          };
          this.src = imgObj;
          this.data = imgObj;
          this.height = response.data.meta.height;
          this.width = response.data.meta.width;
          this.upload.completed = true;
        }
      } catch (e) {
        if (e && e.response && [415, 413].includes(e.response.status)) {
          this.deleteNode();
        } else {
          this.upload.failed = true;
        }
      } finally {
        this.upload.processing = false;
      }
    },
    previewFiles() {
      this.file = this.$refs.fileInput && this.$refs.fileInput.files[0];
      const imageType = /image.*/;
      if (this.file.type.match(imageType)) {
        const reader = new FileReader();
        reader.onload = async () => {
          this.data = { fallback: reader.result };
          this.uploadFile();
        };
        reader.readAsDataURL(this.file);
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
      this.height = "";
      this.width = "";
    },
    onImageClick() {
      if (isDataURL(this.data && this.data.fallback) === false)
        this.shouldShowClose = !this.shouldShowClose;
      this.options.onSelection(this.shouldShowClose ? this.$el : "");
    }
  }
};
</script>
