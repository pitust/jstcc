let Scope = require('./scope');
let babelParser = require('@babel/parser');
function assert(a, er) {
    if (!a) {
        console.error('\x1b[34;1m', er, '\x1b[0m');
        process.exit(1);
    }
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
    if (annot.type == 'TSTypeReference') return '__ctord_' + annot.typeName.name;
    if (annot.type == 'TSArrayType') return '#' + typeAnnotationToString(annot.elementType);
    if (annot.type == 'TSUnionType') assert(false, `You are *NOT* allowed to use \`TSUnionType\` <line ${annot.loc.start.line}; column ${annot.loc.start.column}>.`)
    if (annot.type == 'TSAnyKeyword') assert(false, `You are *NOT* allowed to use \`any\` <line ${annot.loc.start.line}; column ${annot.loc.start.column}>.`)
    console.error('ZZZ', annot)
}
let returnType = undefined;
function parseNodeTS(n, s = Scope.globalScope, this_t = 'invalid') {
    if (n == null) return;
    if (n instanceof Array) {
        for (let node of n)
            parseNodeTS(node, s, this_t);
        return;
    }
    if (n.typeAnnotation && n.type.includes('Declarat')) {
        if (n.typeAnnotation.typeAnnotation) {
            n.jstype = typeAnnotationToString(n.typeAnnotation.typeAnnotation);
        } else {
            n.jstype = typeAnnotationToString(n.typeAnnotation);
        }
        return;
    }
    if (n.type == 'NumericLiteral') {
        n.jstype = '__ctord_number';
        return;
    }
    if (n.type == 'StringLiteral') {
        n.jstype = '__ctord_string';
        return;
    }
    if (n.type == 'BooleanLiteral') {
        n.jstype = '__ctord_boolean';
        return;
    }
    if (n.type == 'CallExpression') {
        parseNodeTS(n.callee, s, this_t);
        n.callee.jstype = '_' + n.arguments.length + '_' + n.callee.jstype;
        let funcType = Scope.types[n.callee.jstype];
        let funcInfo = Scope.funcs[funcType.id];
        assert(funcInfo != undefined, `Function \`${n.callee.jstype}\` does not exist`);
        if (funcInfo.arg == 'unk') {
            funcInfo.arg = n.arguments.map(e => {
                parseNodeTS(e, s, this_t);
                return e.jstype;
            });
        }
        for (let argument in n.arguments) {
            parseNodeTS(n.arguments[argument], s, this_t)
            assert(funcInfo.arg[argument] == n.arguments[argument].jstype, `Wrong type, found ${n.arguments[argument].jstype}, expected ${funcInfo.arg[argument]}  <line ${n.arguments[argument].loc.start.line}; column ${n.arguments[argument].loc.start.column}>`);
        }
        n.jstype = funcInfo.rets;
        return;
    }
    if (n.type == 'NewExpression') {
        parseNodeTS(n.callee, s, this_t)
        let type = Scope.types[n.callee.jstype];
        let funcInfo = Scope.funcs[type.id];
        if (funcInfo.arg == 'unk') {
            funcInfo.arg = n.arguments.map(e => {
                parseNodeTS(e, s, this_t);
                return e.jstype;
            });
        }
        for (let argument in n.arguments) {
            parseNodeTS(n.arguments[argument], s, this_t)
            assert(funcInfo.arg[argument] == n.arguments[argument].jstype, `Wrong type, found ${n.arguments[argument].jstype}, expected ${funcInfo.arg[argument]}  <line ${n.arguments[argument].loc.start.line}; column ${n.arguments[argument].loc.start.column}>`);
        }
        n.jstype = type.typeID;
        assert(type.typeID != 'invalid', 'Couldn\'t construct an unconstructable object')
        return;
    }
    if (n.type == 'MemberExpression') {
        parseNodeTS(n.object, s, this_t);
        let propName = n.property.name;
        n.jstype = Scope.types[n.object.jstype].props[propName];
        return;
    }
    if (n.type == 'Identifier') {
        n.jstype = s.get(n.name);
        return;
    }
    if (n.type == 'IfStatement') {
        parseNodeTS(n.test, s, this_t);
        parseNodeTS(n.consequent, s, this_t);
        if (n.alternate) parseNodeTS(n.alternate, s, this_t);
        n.jstype = 'undefined';
        return;
    }
    if (n.type == 'VariableDeclaration') {
        for (let varDecl of n.declarations) parseNodeTS(varDecl, s, this_t);
        n.jstype = 'undefined';
        return;
    }
    if (n.type == 'VariableDeclarator') {
        let varName = n.id.name;
        let type = 'undefined';
        if (n.init) {
            parseNodeTS(n.init, s, this_t);
            type = n.init.jstype;
        }
        s.creat(varName, type);
        return;
    }
    if (n.type == 'ExpressionStatement') {
        parseNodeTS(n.expression, s, this_t);
        n.jstype = 'undefined';
        return;
    }
    if (n.type == 'FunctionDeclaration') {
        let { name } = n.id;
        let savedReturnType = returnType;
        returnType = '__ctord_' + typeAnnotationToString(node.typeAnnotation.typeAnnotation);
        Scope.types[name] = {
            typeID: '__ctord__' + name,
            id: '!' + name,
            isa: 'func',
            props: {}
        };
        Scope.types['__ctord__' + name] = {
            isa: 'normal',
            props: {}
        };
        Scope.funcs['!' + name] = {
            rets: returnType,
            isCtor: false,
            arg: node.params.map(e => typeAnnotationToString(e.typeAnnotation.typeAnnotation))
        }
        let s2 = s.createDownstream();
        for (let a of node.params) {
            s2.creat(a.name, typeAnnotationToString(e.typeAnnotation.typeAnnotation));
        }
        parseNodeTS(n.body, s2, this_t);
        returnType = savedReturnType;
        n.jstype = name;
        return;
    }
    if (n.type == 'BlockStatement') {
        for (let statement of n.body) parseNodeTS(statement, s, this_t);
        n.jstype = 'undefined';
        return;
    }
    if (n.type == 'BinaryExpression') {
        parseNodeTS(n.left, s, this_t);
        parseNodeTS(n.right, s, this_t);
        if (n.operator == '+' && n.left.jstype == '__ctord_string' && n.right.jstype == '__ctord_string') {
            n.jstype = '__ctord_string';
            return;
        }
        n.jstype = '__ctord_' + (({
            '!=': 'boolean',
            '!==': 'boolean',
            '==': 'boolean',
            '===': 'boolean',
            '>': 'boolean',
            '<': 'boolean',
            '>=': 'boolean',
            '<=': 'boolean',
            '&&': 'boolean',
            '||': 'boolean',
            '+': 'number',
            '-': 'number',
            '/': 'number',
            '*': 'number',
            '&': 'number',
            '|': 'number',
            '^': 'number',
            '%': 'number',
        })[n.operator])
        return;
    }
    if (n.type == 'UnaryExpression') {
        parseNodeTS(n.argument, s, this_t);
        n.jstype = '__ctord_' + (({
            '!': 'boolean',
            '+': 'number',
            '-': 'number',
            '~': 'number',
        })[n.operator]);
        return;
    }
    if (n.type == 'ReturnStatement') {
        parseNodeTS(n.argument, s, this_t);

        assert(returnType == n.argument.jstype, 'ReturnType wrong, expected ' + returnType + ' and found ' + n.argument.jstype + ` <line ${n.loc.start.line}; column ${n.loc.start.column}>`);
        n.jstype = 'undefined';
        return;
    }
    if (n.type == 'ThisExpression') {
        n.jstype = this_t;
        return;
    }
    if (n.type == 'AssignmentExpression') {
        parseNodeTS(n.right, s, this_t);
        return;
    }
    if (n.type == 'IfStatement') {
        parseNodeTS(n.consequent, s, this_t);
        parseNodeTS(n.alternate, s, this_t);
        return;
    }

    if (n.type == 'ClassDeclaration') {
        let name = n.id.name;
        if (name == 'Number') name = 'number';
        if (name == 'Symbol') name = 'symbol';
        if (name == 'String') name = '__ctord_string';
        if (name == 'Boolean') name = 'boolean';
        Scope.types[name] = {
            isa: 'normal',
            props: {}
        };
        Scope.types['__ctord_' + name] = {
            isa: 'normal',
            props: {}
        };
        for (let node of n.body.body) {
            if (node.type == 'TSConstructSignatureDeclaration') node.key = { name: 'new' };
            if (node.type == 'TSMethodSignature' || node.type == 'TSConstructSignatureDeclaration') {
                let methName = node.key.name;
                if (methName == 'new' || methName == 'constructor') {
                    let rets = node.returnType ? '__ctord_' + typeAnnotationToString(node.typeAnnotation.typeAnnotation) : '__ctord_' + name;
                    let args = node.parameters.map(e => typeAnnotationToString(e.typeAnnotation.typeAnnotation));
                    Scope.funcs['!' + name] = {
                        rets,
                        arg: args
                    }
                    Object.assign(Scope.types[name], {
                        typeID: rets,
                        id: '!' + name,
                        isa: 'func',
                        props: {}
                    });
                } else {
                    let rets = node.returnType ? '__ctord_' + typeAnnotationToString(node.typeAnnotation.typeAnnotation) : 'invalid';
                    assert(rets != 'invalid', `Doesn't rets <line ${node.loc.start.line}; column ${node.loc.start.column}>.`)
                    let args = node.parameters.map(e => typeAnnotationToString(e.typeAnnotation.typeAnnotation));
                    Scope.funcs['!' + name + '::' + methName] = {
                        rets,
                        arg: args
                    }
                    Scope.types[name + '::' + methName] = {
                        typeID: rets,
                        id: '!' + name + '::' + methName,
                        isa: 'func',
                        props: {}
                    };
                    Scope.types['__ctord_' + name].props[methName] = name + '::' + methName;
                }
            } else if (node.type == 'TSPropertySignature') {
                let t = typeAnnotationToString(node.typeAnnotation.typeAnnotation);
                Scope.types['__ctord_' + name].props[node.key.name] = t;
            } else if (node.type == 'ClassMethod') {
                let args = node.params.map(e => typeAnnotationToString(e.typeAnnotation.typeAnnotation));
                let rets;
                if (node.key.name == 'new' || node.key.name == 'constructor') {
                    rets = node.returnType ? typeAnnotationToString(node.returnType.typeAnnotation) : '__ctord_' + name;
                    Scope.funcs['!' + name] = {
                        rets,
                        arg: args
                    }
                    Object.assign(Scope.types[name], {
                        typeID: rets,
                        id: '!' + name,
                        isa: 'func',
                        props: {}
                    });
                } else {
                    rets = node.returnType ? typeAnnotationToString(node.returnType.typeAnnotation) : 'undefined';
                    Scope.funcs['_' + args.length + '!' + name + '::' + node.key.name] = {
                        rets,
                        arg: args
                    }
                    Scope.types[name + '::' + node.key.name] = {
                        props: {}
                    };
                    Scope.types['_' + args.length + '_' + name + '::' + node.key.name] = {
                        typeID: rets,
                        id: '_' + args.length + '!' + name + '::' + node.key.name,
                        isa: 'func',
                        props: {},
                        classOwn: name
                    };
                    Scope.types[(node.static ? '' : '__ctord_') + name].props[node.key.name] = name + '::' + node.key.name;
                }
                let savedReturnType = returnType;
                returnType = rets;
                let s2 = s.createDownstream();
                for (let a of node.params) {
                    s2.creat(a.name, typeAnnotationToString(a.typeAnnotation.typeAnnotation));
                    a.jstype = typeAnnotationToString(a.typeAnnotation.typeAnnotation);
                }
                parseNodeTS(node.body, s2, node.static ? name : '__ctord_' + name);
                returnType = savedReturnType;
            } else if (node.type == 'ClassProperty') {
                let t = typeAnnotationToString(node.typeAnnotation.typeAnnotation);
                Scope.types[(node.static ? '' : '__ctord_') + name].props[node.key.name] = t;
            } else assert(false, '.d.ts doesn\'t support: ' + node.type + ` <line ${node.loc.start.line}; column ${node.loc.start.column}>.`);
        }
        return;
    }
    assert(false, 'Not supported: ' + n.type)
}
module.exports = parseNodeTS;