<template>
  <figure :class="{ selected: shouldShowClose }">
    <div class="close-button" @click="deleteNode">
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
</template>

<script>
import { TextSelection } from "tiptap";
import { isDataURL } from "./../../../utils";
import UploadProgress from "../../UploadProgress";

export default {
  name: "ImageBlock",
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
  watch: {
    "upload.failed"(newValue, oldValue) {
      if (newValue !== oldValue) {
        const editorVm = this.getEditorVm();
        if (newValue) editorVm.failedBlocks++;
        else editorVm.failedBlocks--;
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.view.focus();
      this.$el.scrollIntoView(true);
    });
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
    onImageClick() {
      if (
        isDataURL(this.data && this.data.fallback) === false ||
        this.upload.failed
      )
        this.shouldShowClose = !this.shouldShowClose;
      this.options.onSelection(this.shouldShowClose ? this.$el : "");
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
          if (response.data.meta) {
            this.height = response.data.meta.height;
            this.width = response.data.meta.width;
          }
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
    loaded() {
      const imageInputEl = document.getElementById("image-input");

      if (
        this.data.fallback.includes("data:") &&
        imageInputEl.files.length != 0
      ) {
        this.file = imageInputEl.files[0];
        imageInputEl.value = "";
        this.uploadFile();
      }
    }
  },
  beforeDestroy() {
    const editorVm = this.getEditorVm();

    if (this.upload.failed) editorVm.failedBlocks = editorVm.failedBlocks - 1;
  }
};
</script>
