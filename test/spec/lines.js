var expect = require('chai').expect
  , fs = require('fs')
  , ast = require('mkast')
  , Node = ast.Node
  , transform = require('mktransform')
  , highlight = require('../../index')
  , utils = require('../util');

function assert(result) {
  // open document
  expect(result[0].type).to.eql(Node.DOCUMENT);

  expect(result[1].type).to.eql(Node.HTML_BLOCK);
  expect(/^<pre>/.test(result[1].literal)).to.eql(true);

  // eof main document
  expect(result[2].type).to.eql(Node.EOF);
}

describe('mkhighlight:', function() {
  
  it('should highlight code block w/ numbered lines', function(done) {
    var source = 'test/fixtures/code-block.md'
      , target = 'target/code-block.json.log'
      , data = ast.parse('' + fs.readFileSync(source))

    // mock file for correct relative path
    // mkcat normally injects this info
    data.file = source;

    var input = ast.serialize(data)
      , output = fs.createWriteStream(target)
      , opts = {
          input: input,
          output: output,
          transforms: [highlight],
          lines: true
        };
    
    transform(opts);

    output.once('finish', function() {
      var result = utils.result(target);
      assert(result);
      done();
    })
  });

});
