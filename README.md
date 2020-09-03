# tiptap-editor

## How to use it

```
import Post from 'tiptap-editor';
const { Article } = Post;

import "./node_modules/tiptap-editor/src/assets/scss/base.scss";
import "./node_modules/tiptap-editor/src/assets/scss/editor.scss";
import "./node_modules/tiptap-editor/src/assets/scss/article.scss";

<Article
  :on-update-post="onUpdatePost"
  :content="blocks"
  :title="title"
  :upload-image="uploadImage"
  :get-embeds="getEmbeds"
/>
```

## Props details

| Props                   | Type     | Details                                                                      |
|-------------------------|----------|------------------------------------------------------------------------------|
| onUpdatePost            | function | Method call when there is some changes in editor, default debounce is 300 ms |
| content                  | JSON     | content json                                                                  |
| title                   | String   | title of the post                                                            |
| upload-image            | function | method to post image to server, should return promise                        |
| get-embeds              | function | method to get embeds, should return promise                                  |
