# Credits

## Card meanings and names

The 78 card names, upright/reversed meanings, and source text are converted from
the JSON data in [ekelen/tarot-api](https://github.com/ekelen/tarot-api), which
documents its content as parsed from A. E. Waite's _The Pictorial Key to the
Tarot_ (1911). Waite's text is public domain. The source repository's
[package metadata](https://github.com/ekelen/tarot-api/blob/master/package.json)
declares the ISC license. Meanings in this app are kept verbatim from the data.
Keyword arrays are split from its semicolon-separated phrases without
rewriting the meaning fields.

## Card scans

Card scans are the public-domain 1909 Rider-Waite-Smith originals by Pamela
Colman Smith, sourced from the specifically named `RWS1909` files in the
[Wikimedia Commons Rider-Waite tarot category](https://commons.wikimedia.org/wiki/Category:Rider-Waite_tarot_deck).
Each source file is marked public domain on Wikimedia Commons. The source scans
are resized to 400px wide and converted to WebP for this app.

Automated access to the Sacred Texts image index was blocked during this build,
so Wikimedia Commons was used as the alternative source permitted by the task.
The local `card-back.webp` is a generated placeholder design, not a scan.

## Build script

Clone [ekelen/tarot-api](https://github.com/ekelen/tarot-api) outside this
project, then pass its `static/card_data.json` path to:

```sh
pnpm build:cards -- "C:\\path\\to\\tarot-api\\static\\card_data.json"
```
