
let babelParser = require('@babel/parser');
let path = require('path');
let Scope = require('./scope');
let parseNode = require('./parseNode');
let parseNodeTS = require('./parseNodeTS');
let loadDTS = require('./parseDTS');
let cplusplus = require('./emitCPlusPlus');
let fs = require('fs');
let child_process = require('child_process');

function build(inFiles, opt, out, shouldILink, cc, noRTTI) {
    loadDTS('lib/lib.rtsym.d.ts');
    let astBox = {};
    for (let file of inFiles) {
        let inputText = fs.readFileSync(file).toString();
        let ast = babelParser.parse(inputText, {
            plugins: []
        }).program.body;
        parseNode(ast);
        astBox[file] = ast;
    }
    {
        let ast = babelParser.parse(fs.readFileSync(__dirname + '/lib/rtsym.ts').toString(), {
            plugins: ['typescript']
        }).program.body;
        parseNodeTS(ast);
        astBox[__dirname + '/lib/rtsym.ts'] = ast;
    }
    Scope.funcs[Scope.types.main.id].arg = [];
    fs.writeFileSync(__dirname + '/tmp.c', cplusplus(astBox, !noRTTI, shouldILink));
    let a = child_process.spawnSync(cc, ['tmp.c', '-lm', '-o', path.resolve(out) , '-O' + opt, '-ggdb', ...(shouldILink ? [__dirname + '/lib/c-head.c'] : ['-c'])], { cwd: __dirname, stdio: 'inherit' });
    if (!shouldILink && !fs.existsSync('chead.o')) {
        child_process.spawnSync(cc, ['lib/c-head.c', '-lm', '-o', process.cwd() + '/chead.o', '-O3', '-ggdb', '-c'], { cwd: __dirname, stdio: 'inherit' });
    }
}
module.exports = build;