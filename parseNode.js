let Scope = require('./scope');
function assert(a, er) {
    if (!a) {
        console.error('\x1b[34;1m', er, '\x1b[0m');
        process.exit(1);
    }
}
function resolveSetter(scope, node, type) {
    function getType(n) {
        if (n.type == 'Identifier') return scope.get(n.name);
        let obj_t = getType(n.object);
        if (n.property.name == 'prototype' && Scope.types[obj_t].isa == 'func') {
            return Scope.types[obj_t].typeID;
        }
        let param_t = Scope.types[obj_t].props[n.property.name];
        if (!param_t) return type;
        return param_t;
    }
    assert(getType(node) == type, 'Wrong type, expected `' + type + '` got `' + getType(node) + '`');
    function set(n, tld = true) {
        if (n.type == 'Identifier') return scope.get(n.name);
        let obj_t = set(n.object, false);
        if (n.property.name == 'prototype' && Scope.types[obj_t].isa == 'func') {
            return Scope.types[obj_t].typeID;
        }
        if (tld) {
            Scope.types[obj_t].props[n.property.name] = type;
        }
        let param_t = Scope.types[obj_t].props[n.property.name];
        return param_t;
    }
    set(node);
}
let returnType = undefined;
function parseNode(n, s = Scope.globalScope) {
    if (n instanceof Array) {
        for (let node of n)
            parseNode(node, s);
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
        if (n.callee.type == 'MemberExpression' && n.callee.object.type == 'Identifier' && n.callee.object.name == 'rtsym' && !n.callee.computed && n.callee.property.type == 'Identifier') {
            let rtsym_name = n.callee.property.name;
            if (rtsym_name == 'forceType' && n.arguments[0].type == 'StringLiteral' && n.arguments[1].type == 'StringLiteral') {
                s.force(n.arguments[0].value, '__ctord_' + n.arguments[1].value);
                return;
            }
            if (rtsym_name == 'defCFN' && n.arguments[0].type == 'StringLiteral') {
                let cfn = n.arguments[0].value;
                let re = /^\s*(?<ret>\S+)\s+(?<name>\S+)\s*\((?<args>[^\)\n]+)\)\s*$/;
                let mr = re.exec(cfn);
                assert(mr, 'Could parse function signature: "' + cfn + '"');
                let { ret, name, args: rawArgs } = mr.groups;
                let args = rawArgs.split(',').map(e => e.trim()).map(e => {
                    if (e == 'string') return '__ctord_' + e;
                    return e;
                });
                if (ret == 'void') ret = 'undefined';
                Scope.types[name] = {
                    props: {}
                };
                Scope.types['_' + args.length + '_' + name] = {
                    typeID: 'invalid',
                    id: '!' + name,
                    isa: 'func',
                    props: {}
                };
                Scope.funcs['!' + name] = {
                    rets: ret,
                    isCtor: false,
                    arg: args
                }
                return;
            }
        }
        parseNode(n.callee, s)
        n.callee.jstype = '_' + n.arguments.length + '_' + n.callee.jstype;
        let funcType = Scope.types[n.callee.jstype];
        let funcInfo;
        try {
            funcInfo = Scope.funcs[funcType.id];
        } catch (e) {
            assert(false, 'Function undefined: ' + n.callee.jstype + ' @ line ' + n.loc.start.line);
        }
        assert(funcInfo != undefined, `Function \`${n.callee.jstype}\` does not exist`);
        funcInfo.arg = n.arguments.map((e,i) => {
            parseNode(e, s);
            if (funcInfo.arg[i] == 'unk') {
                return e.jstype;
            }
            return funcInfo.arg[i];
        });
        for (let argument in n.arguments) {
            parseNode(n.arguments[argument], s)
            if (n.arguments[argument].jstype == 'unk') {
                n.arguments[argument].set(funcInfo.arg[argument]);
                n.arguments[argument].jstype = funcInfo.arg[argument];
            }
            assert(funcInfo.arg[argument] == n.arguments[argument].jstype, `Wrong type, found ${n.arguments[argument].jstype}, expected ${funcInfo.arg[argument]}` + ' @ line ' + n.loc.start.line);
        }
        n.jstype = funcInfo.rets;
        return;
    }
    if (n.type == 'NewExpression') {
        parseNode(n.callee, s)
        let type = Scope.types[n.callee.jstype];
        let funcInfo = Scope.funcs[type.id];
        funcInfo.arg = n.arguments.map((e,i) => {
            if (funcInfo.arg[i] == 'unk') {
                parseNode(e, s);
                return e.jstype;
            }
            return funcInfo.arg[i];
        });
        for (let argument in n.arguments) {
            parseNode(n.arguments[argument], s)
            assert(funcInfo.arg[argument] == n.arguments[argument].jstype, `Wrong type, found ${n.arguments[argument].jstype}, expected ${funcInfo.arg[argument]}`);
        }
        n.jstype = funcInfo.isCtor ? '__ctord_' + name : type.typeID;
        assert(type.typeID != 'invalid', 'Couldn\'t construct an unconstructable object')
        return;
    }
    if (n.type == 'MemberExpression') {
        parseNode(n.object, s);
        let propName = n.property.name;

        n.jstype = Scope.types[n.object.jstype].props[propName];
        return;
    }
    if (n.type == 'Identifier') {
        n.jstype = s.get(n.name);
        n.set = function(type) {
            s.ik(n.name, type);
        }
        return;
    }
    if (n.type == 'UpdateExpression') {
        n.jstype = '__ctord_number'
        return;
    }
    if (n.type == 'VariableDeclaration') {
        for (let varDecl of n.declarations) parseNode(varDecl, s);
        n.jstype = 'undefined';
        return;
    }
    if (n.type == 'VariableDeclarator') {
        let varName = n.id.name;
        let type = 'undefined';
        if (n.init) {
            parseNode(n.init, s);
            type = n.init.jstype;
        }
        s.creat(varName, type);
        return;
    }
    if (n.type == 'ExpressionStatement') {
        parseNode(n.expression, s);
        n.jstype = 'undefined';
        return;
    }
    if (n.type == 'IfStatement') {
        parseNode(n.test, s);
        parseNode(n.consequent, s);
        if (n.alternate) parseNode(n.alternate, s);
        n.jstype = 'undefined';
        return;
    }
    if (n.type == 'FunctionDeclaration') {
        let { name } = n.id;
        let savedReturnType = returnType;
        returnType = undefined;
        Scope.types[name] = {
            typeID: '__ctord_' + name,
            id: '!' + name,
            isa: 'func',
            props: {}
        };
        Scope.types['__ctord_' + name] = {
            isa: 'normal',
            props: {}
        };
        Scope.funcs['!' + name] = {
            rets: returnType,
            isCtor: returnType == undefined,
            arg: ('a'.repeat(n.params.length).split('').map(_ => 'unk'))
        }
        let ns = s.createDownstream();
        for (let i in n.params) {
            let a = n.params[i];
            ns.creatTBI(a.name, function (type) {
                Scope.funcs['!' + name].arg[i] = type;
            });
        }
        parseNode(n.body, ns);
        returnType = savedReturnType;
        n.jstype = name;
        return;
    }
    if (n.type == 'BlockStatement') {
        for (let statement of n.body) parseNode(statement, s);
        n.jstype = 'undefined';
        return;
    }
    if (n.type == 'BinaryExpression') {
        parseNode(n.left, s);
        parseNode(n.right, s);
        if (n.operator == '+' && n.left.jstype == 'string' && n.right.jstype == 'string') {
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
    if (n.type == 'ReturnStatement') {
        parseNode(n.argument, s);
        returnType = n.argument.jstype;
        n.jstype = 'undefined';
        return;
    }
    if (n.type == 'AssignmentExpression') {
        parseNode(n.right, s);
        resolveSetter(s, n.left, n.right.jstype);
        return;
    }
    if (n.type == 'ForStatement') {
        let s2 = s.createDownstream();
        parseNode(n.init, s2);
        parseNode(n.test, s2);
        parseNode(n.update, s2);
        parseNode(n.body, s2);
        return;
    }
    if (n.type == 'WhileStatement') {
        let s2 = s.createDownstream();
        parseNode(n.test, s2);
        parseNode(n.body, s2);
        return;
    }
    console.error(n);
    assert(false, 'Not supported: ' + n.type + ` @ ${n.loc.start.line}`);
}
module.exports = parseNode;