<template>
  <figure :class="['audio-player-container', { selected: shouldShowClose }]">
    <div class="close-button" @click="deleteNode">
      <i class="close-icon"></i>
    </div>
    <upload-progress
      v-show="!shouldHideProgress"
      :progress="upload.progress"
      :failed="upload.failed"
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
        complted: false
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
      return this.upload.complted || !isDataURL(this.data);
    },
    disabled() {
      return this.data.includes("data:");
    }
  },
  mounted() {
    this.getEditorVm().$watch("selectedEl", value => {
      if (this.shouldShowClose && value !== this.$el)
        this.shouldShowClose = false;
    });
  },
  destroyed() {
    const editorVm = this.getEditorVm();

    editorVm.failedBlocks = editorVm.failedBlocks - 1;
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
      if (!isDataURL(this.data)) this.shouldShowClose = !this.shouldShowClose;
      this.options.onSelection(this.shouldShowClose ? this.$el : "");
    },
    onProgress(progress) {
      this.upload.progress = progress;
    },
    async onLoadedMetaData() {
      const audioInputEl = document.getElementById("audio-input");

      if (this.data.includes("data:") && audioInputEl.files.length != 0) {
        const file = audioInputEl.files[0];
        const formData = new FormData();
        formData.append("audio", file);

        try {
          const response = await this.options.uploadAudio(
            formData,
            this.onProgress
          );
          if (response && response.status === 200) {
            const { audio: src, duration } = response.data;
            this.updateAttrs({ src, duration });
            this.data = src;
            this.upload.completed = false;
          }
        } catch (error) {
          const editorVm = this.getEditorVm();

          editorVm.failedBlocks = editorVm.failedBlocks + 1;
          this.upload.failed = true;
        } finally {
          audioInputEl.value = "";
        }
      }
    },
    setCursorBelowBlock() {
      const newPos = this.getPos() + 2;
      this.editor.focus(newPos, newPos);
    }
  }
};
</script>
