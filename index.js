var spawn = require('child_process').spawn
  , COMMAND = 'source-highlight';

/**
 *  For each code block with an info string call source-highlight(1) and
 *  rewrite the output nodes to include the highlighted response.
 *
 *  @function highlight
 *
 *  @param through module for subclassing streams.
 *  @param ast module for working with ast nodes.
 *  @param opts options passed to the `transform` function.
 *
 *  @option {String} src source language, overrides info string.
 *  @option {String} out output format.
 *  @option {Object} alias map of info string languages to source languages.
 *  @option {Boolean} lines number lines in highlighted output.
 *  @option {Boolean} colons remove colons from line numbers.
 *  @option {Boolean} preserve Keep a `<code>` element in the result.
 */
function highlight(through, ast, opts) {
  var Node = ast.Node;

  opts.colons = opts.colons === undefined ? true : opts.colons

  function transform(chunk, encoding, cb) {
    var scope = this;

    if(Node.is(chunk, Node.CODE_BLOCK) && (opts.src || chunk.info)) {
      var src = opts.src || chunk.info.split(/\s+/)[0]
        , literal = chunk.literal
        , out = opts.out || 'html-css'
        , args
        , result = new Buffer(0);

      // lookup source language aliases when available
      if(!opts.src && opts.alias && opts.alias[src]) {
        src = opts.alias[src];
      }

      args = [
        '--src-lang',
        src,
        '--out-format',
        out
      ];

      // number source code lines
      if(opts.lines) {
        literal = literal.replace(/\n$/, '');
        args.push('--line-number= ');
      }

      var ps = spawn(COMMAND, args);

      // get response data from the process
      ps.stdout.on('data', function(data) {
        result = Buffer.concat(
          [result, data], result.length + data.length);
      })

      ps.once('close', function(code) {
        var doc
          , next;

        if(code === 0) {

          // handle as html output
          if(out === 'html' || out === 'html-css') {
            doc = ast.parse('' + result);

            // remove the generated comment
            doc.firstChild.unlink();

            // add chunks to the stream
            next = doc.firstChild;

            // strip obsolete tags, breaks HTML5 validation
            next.literal = next.literal.replace(/<\/?tt>/g, '')

            // rewrite the <pre> element to preserve an inner <code>
            // element with a class attribute, this is in keeping with
            // how a code block is rendered by the default HTML renderer
            if(opts.preserve) {
              next.literal = next.literal.replace(
                /^<pre>/, '<pre class="source"><code class="language-' + src + '">');
              next.literal = next.literal.replace(/<\/pre>/, '</code></pre>');
            }

            if(opts.lines && opts.colons) {
              // remove colons from line numbers
              next.literal = next.literal
                .replace(
                  /(<span class="linenum">\s*[0-9]+):(<\/span>)/g, '$1$2')
            }

            // write the parsed HTML blocks to the stream
            while(next) {
              scope.push(Node.serialize(next));
              next = next.next;
            }

          // preserve as a code block
          }else{
            chunk.literal = '' + result;
            scope.push(Node.serialize(chunk));
          }

          cb();
        }else{
          cb(null, chunk);
        }
      })

      // write the code block data to the process
      ps.stdin.end(literal);

    // pass through on non-zero exit code
    }else{
      cb(null, chunk);
    }
  }

  return through.transform(transform);
}

module.exports = highlight;
