<template>
  <figure :class="['audio-player-container', { selected: shouldShowClose }]">
    <div class="close-button" @click="deleteNode">
      <i class="close-icon"></i>
    </div>
    <upload-progress
      v-show="!shouldHideProgress"
      :progress="upload.progress"
      :failed="upload.failed"
      :processing="upload.processing"
      @click="uploadFile"
    />
    <audio-player
      :src="data"
      :disabled="disabled"
      @click="handlePlayerClick"
      @error="handlePlayerError"
      @loadedmetadata="onLoadedMetaData"
    />
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
import AudioPlayer from "scroll-vue-player";
import { isDataURL } from "./../../../utils";
import UploadProgress from "../../UploadProgress";

export default {
  name: "Audio",
  props: ["node", "updateAttrs", "view", "getPos", "options", "editor"],
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
  components: {
    AudioPlayer,
    UploadProgress
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
      return this.upload.completed || !isDataURL(this.data);
    },
    disabled() {
      return this.data.includes("data:");
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
    this.getEditorVm().$watch("selectedEl", value => {
      if (this.shouldShowClose && value !== this.$el)
        this.shouldShowClose = false;
    });
  },
  beforeDestroy() {
    const editorVm = this.getEditorVm();

    if (this.upload.failed) editorVm.failedBlocks = editorVm.failedBlocks - 1;
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
    handlePlayerError(e) {
      this.options.handleError(e, "audio-media");
    },
    handlePlayerClick({ target }) {
      const button = this.$el.querySelector(".player-button");
      this.setCursorBelowBlock();
      if (button.contains(target)) return;
      if (!isDataURL(this.data) || this.upload.failed)
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
        const response = await this.options.uploadAudio(
          this.file,
          this.onProgress
        );
        if (response && response.status === 200) {
          const { audio: src, duration } = response.data;
          this.updateAttrs({ src, duration });
          this.data = src;
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
    onLoadedMetaData() {
      const audioInputEl = document.getElementById("audio-input");

      if (this.data.includes("data:") && audioInputEl.files.length != 0) {
        this.file = audioInputEl.files[0];
        audioInputEl.value = "";
        this.uploadFile();
      }
    },
    setCursorBelowBlock() {
      const newPos = this.getPos() + 2;
      this.editor.focus(newPos, newPos);
    }
  }
};
</script>
