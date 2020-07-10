# design_assets

 

### This is a repo with assets that will be shared by ###

* [web](https://bitbucket.org/scrolldev/web)
* [design](https://bitbucket.org/scrolldev/design)


### Adding this repo as submodule for any repo

```shell
cd repo
git submodule add git@bitbucket.org:scrolldev/design_assets.git
```

### Updating the submodule inside parent module

```shell
git submodule update --init --recursive
```

### Making changes to submodule from parent module

```shell
cd repo/design_assets
git add .
git commit -m 'msg'
git push origin master

cd ../
git submodule update --init --recursive
git add .
git commit -m 'msg'
git push origin master
```