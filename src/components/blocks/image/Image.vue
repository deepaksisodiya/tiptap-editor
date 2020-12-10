<template>
  <figure :class="{ selected: shouldShowClose }">
    <div class="close-button" @click="deleteNode">
      <i class="close-icon"></i>
    </div>
    <picture @click="onImageClick">
      <source v-if="data.image" :srcset="data.image" type="image" />
      <source :srcset="data.fallback" type="image" />
      <img :src="data.fallback" @load="loaded" />
      <upload-progress
        v-show="!shouldHideProgress"
        :progress="upload.progress"
        :failed="upload.failed"
        :processing="upload.processing"
        @click="loaded"
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
      height: "",
      width: "",
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
    this.$nextTick(() => {
      this.view.focus();
      this.$el.scrollIntoView(true);
    });
    this.getEditorVm().$watch("selectedEl", value => {
      if (this.shouldShowClose && value !== this.$el)
        this.shouldShowClose = false;
    });
    this.file = document.getElementById("image-input").files[0];
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
    async loaded() {
      const imageInputEl = document.getElementById("image-input");

      if (
        (this.data.fallback.includes("data:") &&
          imageInputEl.files.length != 0) ||
        this.file
      ) {
        const file = this.file || imageInputEl.files[0];

        try {
          this.upload.processing = true;
          this.upload.failed = false;
          this.upload.progress = 0;
          const response = await this.options.uploadImage(
            file,
            this.onProgress
          );
          if (response && response.status === 200) {
            this.src = response.data;
            this.data = response.data;
            this.upload.completed = true;
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
          imageInputEl.value = "";
          this.upload.processing = false;
        }
      }
    }
  },
  beforeDestroy() {
    const editorVm = this.getEditorVm();

    if (this.upload.failed) editorVm.failedBlocks = editorVm.failedBlocks - 1;
  }
};
</script>
