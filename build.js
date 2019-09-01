
let babelParser = require('@babel/parser');
let types = require('@babel/types');
let Scope = require('./scope');
let parseNode = require('./parseNode');
let parseNodeTS = require('./parseNodeTS');
let loadDTS = require('./parseDTS');
let cplusplus = require('./emitCPlusPlus');
let fs = require('fs');
let child_process = require('child_process');

function build(inFiles, opt=false, out='out', shouldILink=true) {
    loadDTS('lib/lib.rtsym.d.ts');
    let ast1 = [];
    for (let file of inFiles) {
        let inputText = fs.readFileSync(file).toString();
        let ast = babelParser.parse(inputText, {
            plugins: []
        }).program.body;
        parseNode(ast);
        ast1 = [...ast1, ...ast];
    }
    let ast2 = babelParser.parse(fs.readFileSync(__dirname + '/lib/rtsym.ts').toString(), {
        plugins: ['typescript']
    }).program.body;

    
    parseNodeTS(ast2);
    Scope.funcs[Scope.types.main.id].arg = [];
    let a = types.blockStatement([...ast1, ...ast2])
    fs.writeFileSync(__dirname + '/tmp.c', cplusplus(a));
    child_process.spawnSync('clang',['tmp.c', '-o', 'out', '-O3', '-ggdb3',...(shouldILink?['lib/c-head.c']:['-c'])], {cwd: __dirname,stdio:'inherit'});
    //fs.unlinkSync(__dirname + '/tmp.c');
    fs.copyFileSync(__dirname + '/out', './out'+(shouldILink?'':'.o'));

    if(!shouldILink) {
        child_process.spawnSync('clang',['lib/c-head.c', '-o', 'out', '-O3', '-ggdb3', '-c'], {cwd: __dirname,stdio:'inherit'});
        fs.copyFileSync(__dirname + '/out', 'chead.o');
    }
}
module.exports = build;