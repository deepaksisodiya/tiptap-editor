<template>
  <div
    class="editor__floating-menu"
    :class="{ 'is-plus-active': menu.isActive }"
    :style="`top: ${menu.top - 20}px`"
  >
    <input
      type="file"
      id="image-input"
      ref="imageInput"
      v-show="false"
      accept="image/*"
      @change="previewFiles(commands.image)"
    />
    <input
      type="file"
      id="audio-input"
      ref="audioInput"
      v-show="false"
      @change="previewAudio(commands.audio)"
    />
    <!-- limiting document block to pdf for now by adding accept attribute -->
    <input
      type="file"
      accept=".pdf"
      id="document-input"
      ref="documentInput"
      v-show="false"
      @change="previewDocument(commands.document)"
    />
    <ul class="kitchensink">
      <li @click="toggleMenu">
        <i class="icon add-icon" :class="{ 'close-icon': shouldShowMenu }"></i>
      </li>
      <li @click="onClickImage()" v-if="shouldShowMenu">
        <i class="icon image-icon"></i>
      </li>
      <li
        :class="{ 'is-active': isActive.embed() }"
        v-if="shouldShowMenu"
        @click="onClickEmbed(commands.embed, 'video')"
      >
        <i class="icon video-icon"></i>
      </li>
      <li
        :class="{ 'has-menu-popover': showAttachmentOptions }"
        v-if="shouldShowMenu"
        @click="onClickAttachment"
      >
        <i class="icon attachment-icon"></i>
        <div
          class="overlay dark-overlay clear-overlay mobile-overlay"
          v-if="showAttachmentOptions"
        ></div>
        <div
          class="menu-popover kitchensink-menu-popover"
          v-if="showAttachmentOptions"
        >
          <ul class="menu-popover-items-container">
            <li class="menu-popover-item">
              <a href="#" @click="onClickAudio">
                <i class="icon audio-attachment-icon"></i>
                <span>Audio</span>
              </a>
            </li>
            <li class="menu-popover-item">
              <a href="#" @click="onClickPdf">
                <i class="icon pdf-attachment-icon"></i>
                <span>PDF</span>
              </a>
            </li>
          </ul>
          <button class="light-button" @click="onClickAttachment">
            <span>Cancel</span>
          </button>
        </div>
      </li>
      <li
        v-if="shouldShowMenu"
        :class="{ 'is-active': isActive.ordered_list() }"
        @click="onClickMenuItem(commands.ordered_list)"
      >
        <i class="icon list-icon"></i>
      </li>
      <li
        :class="{ 'is-active': isActive.embed() }"
        v-if="shouldShowMenu"
        @click="onClickEmbed(commands.embed, 'link')"
      >
        <i class="icon link-icon"></i>
      </li>
      <li
        :class="{ 'is-active': isActive.code_block() }"
        v-if="shouldShowMenu"
        @click="onClickMenuItem(commands.code_block)"
      >
        <i class="icon code-icon"></i>
      </li>
      <li
        :class="{ 'is-active': isActive.horizontal_rule() }"
        v-if="shouldShowMenu"
        @click="onClickMenuItem(commands.horizontal_rule)"
      >
        <i class="icon separator-icon"></i>
      </li>
      <li v-if="shouldShowMenu" style="display:none">
        <i class="kitchensink-divider"></i>
      </li>
      <!--
              For now disable the lock icon from floating menu kitchsink for pre-alpha relese
              later do like :style="`display: ${hasLock ? 'none' : 'inline'}`"
              :style="`display: ${hasLock ? 'none' : 'none'}`"
      -->
      <!-- <li
              v-if="shouldShowMenu"
              :style="`display: ${hasLock ? 'none' : 'none'}`"
              :class="{ 'is-active': isActive.lock() }"
              @click="onClickMenuItem(commands.lock)"
            >
              <i class="lock-icon"></i>
      </li>-->
    </ul>
  </div>
</template>

<script>
import FloatingMenu from "./../extensions/FloatingMenu";
import { contains } from "prosemirror-utils";

export default {
  props: {
    editor: {
      default: null,
      type: Object
    },
    beforeUpload: {
      type: Function,
      default: () => true
    }
  },
  data() {
    return {
      menu: {
        isActive: false,
        left: 0,
        bottom: 0
      },
      addImageAt: null,
      addAudioAt: null,
      addDocumentAt: null,
      shouldShowMenu: false,
      showAttachmentOptions: false
    };
  },
  computed: {
    focused() {
      return this.editor.view.focused;
    },
    focus() {
      return this.editor.focus;
    },
    commands() {
      return this.editor.commands;
    },
    isActive() {
      return this.editor.isActive;
    },
    getMarkAttrs() {
      return this.editor.getMarkAttrs.bind(this.editor);
    },
    getNodeAttrs() {
      return (
        this.editor.getNodeAttrs && this.editor.getNodeAttrs.bind(this.editor)
      );
    },
    hasLock() {
      return contains(
        this.editor.view.state.doc,
        this.editor.schema.nodes.lock
      );
    }
  },
  watch: {
    editor: {
      immediate: true,
      handler(editor) {
        if (editor) {
          if (editor) {
            this.$nextTick(() => {
              editor.registerPlugin(
                FloatingMenu({
                  editor,
                  element: this.$el,
                  onUpdate: menu => {
                    // the second check ensures event is fired only once
                    if (menu.isActive && this.menu.isActive === false) {
                      this.$emit("show", menu);
                    } else if (!menu.isActive && this.menu.isActive === true) {
                      this.$emit("hide", menu);
                    }
                    this.menu = menu;
                  }
                })
              );
            });
          }
        }
      }
    },
    shouldShowMenu() {
      const {
        state: {
          doc: {
            content: { content }
          }
        }
      } = this.editor;
      if (content.length === 2) {
        this.editor.setOptions({});
      }
    }
  },
  beforeDestroy() {
    this.editor.unregisterPlugin("floating_menu");
  },
  methods: {
    onClickImage() {
      this.addImageAt = this.editor.view.state.tr.selection.head;
      this.$refs.imageInput.click();
      this.hideFloatingMenu();
    },
    onClickAudio(e) {
      e.preventDefault();
      this.addAudioAt = this.editor.view.state.tr.selection.head;
      this.$refs.audioInput.click();
      this.hideFloatingMenu();
    },
    onClickPdf(e) {
      e.preventDefault();
      this.addDocumentAt = this.editor.view.state.tr.selection.head;
      this.$refs.documentInput.click();
      this.hideFloatingMenu();
    },
    onClickAttachment(e) {
      e.preventDefault();
      e.stopPropagation();
      this.showAttachmentOptions = !this.showAttachmentOptions;
    },
    previewFiles(command) {
      const { imageInput } = this.$refs;
      const imageFile = imageInput.files[0];

      if (imageFile && !this.beforeUpload(imageFile, "image")) {
        imageInput.value = "";
        return;
      }

      if (imageFile) {
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.src = reader.result;
          command({
            src: { fallback: img.src },
            addImageAt: this.addImageAt
          });
        };
        reader.readAsDataURL(imageFile);
      }
    },
    previewAudio(command) {
      const { audioInput } = this.$refs;
      const audioFile = audioInput.files[0];

      if (audioFile && !this.beforeUpload(audioFile, "audio")) {
        audioInput.value = "";
        return;
      }

      if (audioFile) {
        const reader = new FileReader();
        reader.onload = () => {
          command({
            src: reader.result,
            addAudioAt: this.addAudioAt
          });
        };
        reader.readAsDataURL(audioFile);
      }
    },
    previewDocument(command) {
      const { documentInput } = this.$refs;
      const documentFile = documentInput.files[0];

      if (documentFile && !this.beforeUpload(documentFile, "document")) {
        documentFile.value = "";
        return;
      }

      if (documentFile) {
        const reader = new FileReader();
        reader.onload = () => {
          command({
            src: reader.result,
            addDocumentAt: this.addDocumentAt
          });
        };
        reader.readAsDataURL(documentFile);
      }
    },
    toggleMenu(e) {
      if (!this.shouldShowMenu) {
        const nodePos = this.editor.view.posAtCoords({
          left: e.clientX + 100,
          top: e.clientY
        });
        this.editor.setSelection(nodePos.pos, nodePos.pos);
      }
      this.shouldShowMenu = !this.shouldShowMenu;
      this.showAttachmentOptions = false;
      this.editor.setOptions({});
    },
    onClickEmbed(command, type) {
      command({ type });
      this.hideFloatingMenu();
    },
    onClickMenuItem(command) {
      command();
      this.hideFloatingMenu();
    },
    hideFloatingMenu() {
      this.shouldShowMenu = false;
      this.showAttachmentOptions = false;
    }
  }
};
</script>
