let babelParser = require('@babel/parser');
let fs = require('fs');
let Scope = require('./scope');


function assert(a, er) {
    if (!a) {
        console.error('\x1b[34;1m', er, '\x1b[0m');
        process.exit(1);
    }
}

let s = Scope.globalScope;
let types = Scope.types;
let funcs = Scope.funcs;

function loadFile(f) {
    let dts = fs.readFileSync(__dirname + '/' + f).toString();
    let ast = babelParser.parse(dts, {
        plugins: ['typescript']
    });
    parseDTS(ast.program.body)
}

function typeAnnotationToString(annot) {
    if (annot.type == 'TSNumberKeyword') return '__ctord_number';
    if (annot.type == 'TSFunctionType') {
        // TODO: TSFunctionType
        assert(false, `You are *NOT* allowed to use \`TSFunctionType\` <line ${annot.loc.start.line}; column ${annot.loc.start.column}>.`)
    }
    if (annot.type == 'TSStringKeyword') return '__ctord_string';
    if (annot.type == 'TSBooleanKeyword') return '__ctord_boolean';
    if (annot.type == 'TSSymbolKeyword') return 'symbol';
    if (annot.type == 'TSVoidKeyword') return 'undefined';
    if (annot.type == 'TSUndefinedKeyword') return 'undefined';
    if (annot.type == 'TSTypeReference') {
        return annot.typeName.name;
    }
    if (annot.type == 'TSArrayType') return '#' + typeAnnotationToString(annot.elementType);
    if (annot.type == 'TSUnionType') assert(false, `You are *NOT* allowed to use \`TSUnionType\` <line ${annot.loc.start.line}; column ${annot.loc.start.column}>.`)
    if (annot.type == 'TSAnyKeyword') assert(false, `You are *NOT* allowed to use \`any\` <line ${annot.loc.start.line}; column ${annot.loc.start.column}>.`)
    console.log(annot)
}
function parseDTS(n) {
    if (n instanceof Array) {
        for (let a of n) parseDTS(a);
        return;
    }

    if (n.type == 'VariableDeclaration') {
        for (let varDecl of n.declarations) parseDTS(varDecl);
        n.jstype = 'undefined';
        return;
    }
    if (n.type == 'VariableDeclarator') {
        let varName = n.id.name;
        let v = typeAnnotationToString(n.id.typeAnnotation.typeAnnotation);
        s.creat(varName, v);
        return;
    }
    if (n.type == 'TSDeclareFunction') {
        let name = n.id.name;
        let args = n.params.map(e => typeAnnotationToString(e.typeAnnotation.typeAnnotation));
        let rets = typeAnnotationToString(n.returnType.typeAnnotation);
        funcs['!' + name] = {
            rets,
            arg: args,
            dts: true
        }
        Scope.types[name] = {
            typeID: rets,
            id: '!' + name,
            isa: 'func',
            props: {},
            dts: true
        };
        return;
    }
    if (n.type == 'TSInterfaceDeclaration' || n.type == 'ClassDeclaration') {
        let name = n.id.name;
        if (name == 'Number') name = 'number';
        if (name == 'Symbol') name = 'symbol';
        if (name == 'String') name = 'string';
        if (name == 'Boolean') name = 'boolean';
        types[name] = {
            isa: 'normal',
            props: Object.create(null),
            dts: true
        };
        types['__ctord_' + name] = {
            isa: 'normal',
            props: Object.create(null),
            dts: true
        }; 
        for (let node of n.body.body) {
            if (node.type == 'TSConstructSignatureDeclaration') node.key = {name: 'new'};
            if (node.type == 'TSMethodSignature' || node.type == 'TSConstructSignatureDeclaration') {
                let methName = node.key.name;
                if (methName == 'new' || methName == 'constructor') {
                    let rets = node.returnType ? '__ctord_' + typeAnnotationToString(node.returnType.typeAnnotation) : '__ctord_' + name;
                    let args = node.parameters.map(e => typeAnnotationToString(e.typeAnnotation.typeAnnotation));
                    funcs['!' + name] = {
                        rets,
                        arg: args,
                        dts: true
                    }
                    types['_' + args.length + '_' + name] = {
                        typeID: rets,
                        id: '!' + name,
                        isa: 'func',
                        props: {},
                        dts: true
                    }
                } else {
                    let rets = node.returnType ? '__ctord_' + typeAnnotationToString(node.returnType.typeAnnotation) : 'invalid';
                    assert(rets != 'invalid', `Doesn't rets <line ${node.loc.start.line}; column ${node.loc.start.column}>.`)
                    let args = node.parameters.map(e => typeAnnotationToString(e.typeAnnotation.typeAnnotation));
                    funcs['!' + name + '::' + methName] = {
                        rets,
                        arg: args,
                        dts: true
                    }
                    types[name + '::' + methName] = {
                        props: {},
                        dts: true
                    };
                    types['_' + args.length + '_' + name + '::' + methName] = {
                        typeID: rets,
                        id: '!' + name + '::' + methName,
                        isa: 'func',
                        props: {},
                        dts: true
                    };
                    types[(node.static ? '' : '__ctord_') + name].props[methName] = name + '::' + methName;
                }
            } else if (node.type == 'TSPropertySignature') {
                let t = typeAnnotationToString(node.typeAnnotation.typeAnnotation);
                types['__ctord_' + name].props[node.key.name] = t;
            } else if (node.type == 'TSDeclareMethod') {
                let rets = node.returnType ? typeAnnotationToString(node.returnType.typeAnnotation) : 'undefined';
                let args = node.params.map(e => typeAnnotationToString(e.typeAnnotation.typeAnnotation));
                funcs['_' + args.length + '!' + name + '::' + node.key.name] = {
                    rets,
                    arg: args,
                    dts: true
                }
                types[name + '::' + node.key.name] = {
                    props: {},
                    dts: true
                };
                types['_' + args.length + '_' + name + '::' + node.key.name] = {
                    typeID: rets,
                    id: '_' + args.length + '!' + name + '::' + node.key.name,
                    isa: 'func',
                    props: {},
                    dts: true,
                    classOwn: name
                };
                //console.debug('[loaded symbol]','_' + args.length + '_' + name + '::' + node.key.name);
                types[(node.static ? '' : '__ctord_') + name].props[node.key.name] = name + '::' + node.key.name;
            } else if (node.type == 'ClassProperty') {
                let t = typeAnnotationToString(node.typeAnnotation.typeAnnotation);
                types[(node.static ? '' : '__ctord_') + name].props[node.key.name] = t;
            } else assert(false, '.d.ts doesn\'t support: ' + node.type + ` <line ${node.loc.start.line}; column ${node.loc.start.column}>.`);
        }
        return;
    }
    if (n.type == 'TSTypeAliasDeclaration') {
        types[n.id.name] = typeAnnotationToString(n.typeAnnotation);
        return;
    }
    assert(false, '.d.ts doesn\'t support: ' + n.type);
}
module.exports = loadFile;