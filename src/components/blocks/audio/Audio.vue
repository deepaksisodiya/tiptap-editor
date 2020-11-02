<template>
  <figure :class="['audio-player-container', { selected: shouldShowClose }]">
    <div class="close-button" @click="deleteNode">
      <i class="close-icon"></i>
    </div>
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

export default {
  name: "Audio",
  props: ["node", "updateAttrs", "view", "getPos", "options", "editor"],
  data() {
    return {
      data: this.node.attrs.src,
      shouldShowClose: false
    };
  },
  inject: ["getEditorVm"],
  components: {
    AudioPlayer
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
    async onLoadedMetaData() {
      const audioInputEl = document.getElementById("audio-input");

      if (this.data.includes("data:") && audioInputEl.files.length != 0) {
        const file = audioInputEl.files[0];
        const formData = new FormData();
        formData.append("audio", file);

        try {
          const response = await this.options.uploadAudio(formData);
          if (response && response.status === 200) {
            const { audio: src, duration } = response.data;
            this.updateAttrs({ src, duration });
            this.src = src;
            this.data = src;
          }
        } catch (error) {
          this.deleteNode();
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
