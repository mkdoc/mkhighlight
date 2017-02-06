# Syntax Highlight

[![Build Status](https://travis-ci.org/mkdoc/mkhighlight.svg?v=3)](https://travis-ci.org/mkdoc/mkhighlight)
[![npm version](http://img.shields.io/npm/v/mkhighlight.svg?v=3)](https://npmjs.org/package/mkhighlight)
[![Coverage Status](https://coveralls.io/repos/mkdoc/mkhighlight/badge.svg?branch=master&service=github&v=3)](https://coveralls.io/github/mkdoc/mkhighlight?branch=master)

> Highlight code blocks

Syntax highlight code blocks in the input stream using [source-highlight][].

## Install

```
npm i mkhighlight --save
```

For the command line interface install [mkdoc][] globally (`npm i -g mkdoc`).

---

- [Install](#install)
- [Usage](#usage)
- [Example](#example)
- [Help](#help)
- [API](#api)
  - [highlight](#highlight)
- [License](#license)

---

## Usage

Pass the transform implementation to [mktransform][]:

```javascript
var highlight = require('mkhighlight')
  , ast = require('mkast')
  , tfm = require('mktransform');

ast.src('```javascript\nvar foo = "bar"\n```')
  .pipe(tfm(highlight))
  .pipe(ast.stringify({indent: 2}))
  .pipe(process.stdout);
```

## Example

To highlight code blocks in a document with ANSI escape sequences:

```shell
mkcat README.md | mkhigh -o esc | mkout
```

To highlight code blocks for a standalone HTML page:

```shell
mkcat README.md | mkhigh | mkpage | mkhtml > README.html
```

Number lines in the code blocks:

```shell
mkcat README.md | mkhigh --lines | mkpage | mkhtml > README.html
```

## Help

```
Usage: mkhigh [-lph] [--lines] [--preserve] [--help] [--version] [--out=<val>]
              [--src=<lang>] [--alias-[NAME]=<val...>]

  Highlight code blocks.

Options
  -o, --out=[VAL]         Set output format (default: html)
  -s, --src=[LANG]        Source language (overrides info string)
  --alias-[NAME]=[VAL...] Alias info strings to source languages
  -l, --lines             Number lines in output
  -p, --preserve          Keep code elements
  -h, --help              Display help and exit
  --version               Print the version and exit

mkhighlight@1.0.1
```

## API

### highlight

```javascript
highlight(through, ast, opts)
```

For each code block with an info string call source-highlight(1) and
rewrite the output nodes to include the highlighted response.

* `through` module for subclassing streams.
* `ast` module for working with ast nodes.
* `opts` options passed to the `transform` function.

#### Options

* `src` String source language, overrides info string.
* `out` String output format.
* `alias` Object map of info string languages to source languages.
* `lines` Boolean number lines in highlighted output.
* `preserve` Boolean Keep a `<code>` element in the result.

## License

MIT

---

Created by [mkdoc](https://github.com/mkdoc/mkdoc) on February 6, 2017

[source-highlight]: https://www.gnu.org/software/src-highlite/source-highlight.html
[mkdoc]: https://github.com/mkdoc/mkdoc
[mktransform]: https://github.com/mkdoc/mktransform
[commonmark]: http://commonmark.org
[jshint]: http://jshint.com
[jscs]: http://jscs.info

