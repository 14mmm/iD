# iD - friendly JavaScript editor for [TransforMap](http://transformap.co/)

## Basics

* iD is a JavaScript [OpenStreetMap](http://www.openstreetmap.org/) editor, adapted for TransforMap.
* It's latest stable release is deployed on [http://editor.transformap.co](editor.transformap.co)

## Participate!

* Get in touch with TransforMap's techie circle here [on Discourse](http://discourse.transformap.co/c/engineering).
* See [open issues in the issue tracker](https://github.com/TransforMap/iD/issues?state=open) if you're looking for something to do

## Developing

If you want to deploy a new version on editor.transformap.co:

* Get an account, ask here on [Discourse](http://discourse.transformap.co/t/id-editor-deployment-coordination/366/6).
* clone this or a fork
* edit
* call "make", your changes get compiled into dist/
* check out the "dist" branch: "git checkout dist"
* the "dist" branch is simply a copy of the "dist/"-folder with compiled source
* copy all files from dist/ into the /-folder of the "dist"-branch, commit.
* git remote add update dokku@apps.ecobytes.net:id (needed only 1st time)
* git push --set-upstream origin dist (needed only 1st time)
* git push update dist:master

## License

iD is available under the [WTFPL](http://sam.zoy.org/wtfpl/), though obviously, if you want to dual-license
any contributions that's cool. It includes [d3js](http://d3js.org/), which BSD-licensed.

## Thank you

Initial development of iD was made possible by a [grant of the Knight Foundation](http://www.mapbox.com/blog/knight-invests-openstreetmap/).
