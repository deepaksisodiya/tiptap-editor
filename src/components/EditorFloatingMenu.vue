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
    <ul class="kitchensink">
      <li @click="toggleMenu">
        <i class="add-icon" :class="{ 'close-icon': shouldShowMenu }"></i>
      </li>
      <li v-if="showTooltip" class="popover right-popover">
        <div class="popover-content">
          <h3>WELCOME TO SCROLLSTACK</h3>
          <p>
            Tap the (+) button to add images, videos, embeds and more to your
            story.
          </p>
          <button @click="onClickOk" class="dark-button">
            <span>OK, Got it</span>
          </button>
        </div>
      </li>
      <li @click="onClickImage()" v-if="shouldShowMenu">
        <i class="image-icon"></i>
      </li>
      <li
        :class="{ 'is-active': isActive.embed() }"
        v-if="shouldShowMenu"
        @click="onClickEmbed(commands.embed, 'video')"
      >
        <i class="video-icon"></i>
      </li>
      <li @click="onClickAudio()" v-if="shouldShowMenu">
        <i class="audio-icon"></i>
      </li>
      <li
        v-if="shouldShowMenu"
        :class="{ 'is-active': isActive.ordered_list() }"
        @click="onClickMenuItem(commands.ordered_list)"
      >
        <i class="list-icon"></i>
      </li>
      <li
        :class="{ 'is-active': isActive.embed() }"
        v-if="shouldShowMenu"
        @click="onClickEmbed(commands.embed, 'link')"
      >
        <i class="link-icon"></i>
      </li>
      <li
        :class="{ 'is-active': isActive.horizontal_rule() }"
        v-if="shouldShowMenu"
        @click="onClickMenuItem(commands.horizontal_rule)"
      >
        <i class="separator-icon"></i>
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
      shouldShowMenu: false,
      showTooltip: localStorage && !localStorage.getItem("editorTour")
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
    onClickAudio() {
      this.addAudioAt = this.editor.view.state.tr.selection.head;
      this.$refs.audioInput.click();
      this.hideFloatingMenu();
    },
    previewFiles(command) {
      const file = this.$refs.imageInput.files[0];

      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.src = reader.result;
          command({
            src: { fallback: img.src },
            addImageAt: this.addImageAt
          });
        };
        reader.readAsDataURL(file);
      }
    },
    previewAudio(command) {
      const audioFile = this.$refs.audioInput.files[0];
      const audioType = /audio.*/;

      if (audioFile && audioFile.type.match(audioType)) {
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
    toggleMenu(e) {
      if (!this.shouldShowMenu) {
        const nodePos = this.editor.view.posAtCoords({
          left: e.clientX + 100,
          top: e.clientY
        });
        this.editor.setSelection(nodePos.pos, nodePos.pos);
      }
      if (localStorage && !localStorage.getItem("editorTour")) {
        this.onClickOk();
      }
      this.shouldShowMenu = !this.shouldShowMenu;
      this.editor.setOptions({});
    },
    onClickOk() {
      if (!localStorage) return;
      localStorage.setItem("editorTour", true);
      this.showTooltip = false;
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
    }
  }
};
</script>
