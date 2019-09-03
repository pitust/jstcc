#!/usr/bin/env node
const commander = require('commander');
const build = require('./build');
const program = new commander.Command();
program.version('0.1.0');
program
    .name('jstcc')
    .option('-O, --optimize', 'Call clang with -O3')
    .option('-s, --small', 'Call clang with -Oz and strip')
    .option('-o, --output-file <o>', 'Set the output file')
    .option('-c, --no-linker', 'Don\'t run linker')
    .option('--freestanding', 'Don\'t link against stdjslib.js')
    .option('-6, --allow-es6-imports', 'Allow es6 imports (exprerimental, TODO)');
program.parse(process.argv);
if (!program.freestandig) {
    program.args.unshift(__dirname + '/lib/stdjslib.js');
}
build(program.args, program.optimize, program.outputFile, program.linker);