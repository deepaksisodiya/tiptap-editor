<template>
  <figure class="file-attachment">
    <div :class="['file-attachment-panel', { selected: shouldShowClose }]">
      <div class="close-button" @click="deleteNode">
        <i class="close-icon"></i>
      </div>
      <div class="file-attachment-container" @click="onDocumentClick">
        <i class="icon file-type-icon" :class="getIconClass()"></i>
        <div class="file-attachment-content">
          <p class="file-name">
            {{ name }}
          </p>
          <div class="file-meta-container">
            <small class="file-meta" v-if="!upload.failed">
              {{ size }}
            </small>
            <small class="file-meta" v-if="upload.failed">
              <i class="icon file-upload-error-icon"></i>
              Upload Failed
            </small>
            <upload-progress
              v-show="!shouldHideProgress() && !upload.failed"
              :progress="upload.progress"
              :failed="upload.failed"
              :processing="upload.processing"
              @click="onLoaded"
            />
          </div>
        </div>
      </div>
      <ul
        class="file-cta-container"
        v-if="shouldHideProgress() && data && !upload.failed"
        @click="download"
      >
        <li class="download-cta">
          Download
        </li>
      </ul>
      <ul class="file-cta-container" v-if="upload.failed">
        <li class="cancel-cta" @click="deleteNode">
          Cancel
        </li>
        <li class="retry-cta" @click="onLoaded">
          Retry
        </li>
      </ul>
    </div>
    <figcaption>
      <input
        v-model="caption"
        placeholder="Type caption for Audio (optional)"
        @keydown="handleKeydown"
        @paste.stop
      />
    </figcaption>
  </figure>
</template>

<script>
import { TextSelection } from "tiptap";
import { returnFileSize, isDataURL } from "./../../../utils";
import UploadProgress from "../../UploadProgress";

export default {
  name: "Document",
  props: ["node", "updateAttrs", "view", "getPos", "options", "editor"],
  data() {
    return {
      data: this.node.attrs.src,
      file: null,
      name: "",
      size: "",
      format: "",
      shouldShowClose: false,
      upload: {
        progress: 0,
        failed: false,
        completed: false,
        processing: false
      }
    };
  },
  inject: ["getEditorVm"],
  components: {
    UploadProgress
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
  computed: {
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
    this.getEditorVm().$watch("selectedEl", value => {
      if (this.shouldShowClose && value !== this.$el)
        this.shouldShowClose = false;
    });
    const documentInputEl = document.getElementById("document-input");
    this.file = documentInputEl.files[0];
    documentInputEl.value = "";
    this.onLoaded();
  },
  beforeDestroy() {
    const editorVm = this.getEditorVm();
    if (this.upload.failed) editorVm.failedBlocks = editorVm.failedBlocks - 1;
  },
  methods: {
    getIconClass() {
      return `${this.format}-icon`;
    },
    shouldHideProgress() {
      return this.upload.completed || !isDataURL(this.data);
    },
    download() {
      window.open(this.data, "_blank");
    },
    onDocumentClick() {
      if (!isDataURL(this.data) || this.upload.failed)
        this.shouldShowClose = !this.shouldShowClose;
      this.options.onSelection(this.shouldShowClose ? this.$el : "");
    },
    onProgress(progress) {
      this.upload.progress = progress;
    },
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
    async onLoaded() {
      if (this.data.includes("data:") && this.file) {
        const file = this.file;
        this.name = file.name;
        this.size = returnFileSize(file.size);
        this.format =
          file.type.split("/").length > 1 && file.type.split("/")[1];

        try {
          this.upload.processing = true;
          this.upload.failed = false;
          this.upload.progress = 0;
          const response = await this.options.uploadDocument(
            file,
            this.onProgress
          );
          if (response && response.status === 200) {
            const { document: src, format } = response.data;
            this.updateAttrs({
              src,
              format,
              name: this.name,
              size: this.size
            });
            this.data = src;
            this.upload.completed = true;
          }
        } catch (error) {
          if (error.response && [415, 413].includes(error.response.status)) {
            this.deleteNode();
          } else {
            this.upload.failed = true;
          }
        } finally {
          this.upload.processing = false;
        }
      }
    }
  }
};
</script>
