#!/usr/bin/env node
const commander = require('commander');
const build = require('./build');
const program = new commander.Command();
program.version('0.1.0');
program
    .name('jstcc')
    .option('-O, --optimize', 'Optimize for speed')
    .option('-s, --small', 'Optimize for size')
    .option('-o, --output-file <o>', 'Set the output file')
    .option('-c, --no-linker', 'Don\'t run linker')
    .option('--freestanding', 'Don\'t link against stdjslib.js')
    .option('--no-rtti', 'Disable RTTI symbols')
    .option('--cc <cc>', 'Set C Compiler (Also CC env var)')
    .option('-6, --allow-es6-imports', 'Allow es6 imports (exprerimental, TODO)');
program.parse(process.argv);
if (!program.freestandig) {
    program.args.unshift(__dirname + '/lib/stdjslib.js');
}
let opt = '0';
if (program.optimize) opt = '3';
if (program.small) opt = 's';
build(program.args, opt, program.outputFile || 'a', program.linker, program.cc || process.env.CC || 'clang', program.small, program.noRtti);