# For development

## Project setup
```
git clone git@github.com:scrolltech/tiptap-editor.git
npm install
```

## Compiles and hot-reloads for development
```
npm run serve
```

## build for github pages
```
npm run build
```

## deploy to github pages
```
sh deploy
```

## build for plugin
```
npm run build:plugin
```

## Lints and fixes files
```
npm run lint
```

## How to do the local development with any project

https://hackernoon.com/node-js-yarning-for-local-packages-9a7970edea7

if you have tiptap-editor and web in same directory, then

```
cd web
yarn add file:./../tiptap-editor/
```

## Update submodule
```
git submodule update --remote
```