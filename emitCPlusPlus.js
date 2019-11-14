let Scope = require('./scope')
const clipboardy = require('clipboardy');

function assert(a, er) {
    if (!a) {
        console.error('\x1b[34;1m', er, '\x1b[0m');
        process.exit(1);
    }
}
let idmap = {
    'undefined': 'undefined',
    'string': 'string',
    'boolean': 'boolean',
    'number': 'number',
    'length': 'length',
};
let i = 1;
function get(nm) {
    return nm.replace(/:/g, '_');
}
let c_init = '';
let g_init = '';
let d = {};
let file = '';
function cpp(n) {
    if (n instanceof Array) {
        let s = '';
        for (let node of n)
            s += cpp(node);
        return s;
    }

    if (n.type == 'FunctionDeclaration') {
        let nm_t = Scope.types[n.jstype];
        let fn_t = Scope.funcs[nm_t.id]
        let name = n.jstype;
        let rets = fn_t.rets;
        let args = [...fn_t.arg.map((e, i) => `t_${get(e)}* v_${get(n.params[i].name)}`)].join(',');
        let args_fn = [`t_undefined* v_this`, ...fn_t.arg.map((e, i) => `t_${get(e)}* v_${get(n.params[i].name)}`)].join(',');
        let this_nm = get('this');
        d[name] = 'undefined';
        let rett = rets || 'undefined';
        return `t_${get(rets || 'undefined')}* fn_${get(name)}(${args_fn}){${cpp(n.body)}${rett == 'undefined' ? 'return v_undefined;' : ''}}t_${get(rets || nm_t.typeID)}* ctor_${get(name)}(${args}){t_${get('__ctord_' + name)}* v_${this_nm} = getProto_${get('__ctord_' + name)}();${cpp(n.body)}return v_${this_nm};}`
    }
    if (n.type == 'BlockStatement') {
        let s = '';
        for (let node of n.body)
            s += cpp(node);
        return s;
    }
    if (n.type == 'ExpressionStatement') {
        return cpp(n.expression) + ';';
    }
    if (n.type == 'CallExpression') {
        if (n.callee.type == 'MemberExpression' && n.callee.object.type == 'Identifier' && n.callee.object.name == 'rtsym' && !n.callee.computed && n.callee.property.type == 'Identifier') {
            let rtsym_name = n.callee.property.name;
            if (rtsym_name == '__cplusplus' && n.arguments[0].type == 'StringLiteral') {
                return `\n#line ${n.loc.start.line} "${file.replace(/\\/g,'\\\\')}"\n` + n.arguments[0].value + `\n#line 1 "${file.replace(/\\/g,'\\\\')}"\n`;
            }
            if (rtsym_name == '__assembly' && n.arguments[0].type == 'StringLiteral') {
                return `asm volaitle(${JSON.stringify(n.arguments[0].value)})`;
            }
            if (rtsym_name == '__loadName' && n.arguments[0].type == 'StringLiteral') {
                return `long long ${n.arguments[0].value} = unpack_int(${cpp(n.arguments[1])})`;
            }
            if (rtsym_name == '__getName' && n.arguments[0].type == 'StringLiteral') {
                return `num(${n.arguments[0].value})`;
            }
            if (rtsym_name == '__createGet' && n.arguments[0].type == 'StringLiteral') {
                return `long long ${n.arguments[0].value};`;
            }
            if (rtsym_name == 'getCurrentLineInfo') {
                return `str(${JSON.stringify(`${n.loc.start.line}:${n.loc.start.column}`)})`;
            }
            if (rtsym_name == 'defCFN' && n.arguments[0].type == 'StringLiteral') {
                let cfn = n.arguments[0].value;
                let re = /^\s*(?<ret>\S+)\s+(?<name>\S+)\s*\((?<args>[^\)\n]+)\)\s*$/;
                let mr = re.exec(cfn);
                assert(mr, 'Could parse function signature: "' + cfn + '"');
                let { ret, name, args: rawArgs } = mr.groups;
                let args = rawArgs.split(',').map(e => e.trim());
                let use_name = `_${args.length}_` + name;
                if (ret == 'void') ret = 'undefined';
                let upkNm = {
                    'string': 'unpack_str',
                    'number': '(int)unpack_int',
                    'boolean': 'unpack_bool'
                };
                let pkNm = {
                    'string': 'str',
                    'number': 'num',
                    'boolean': 'boolify'
                };
                d[name] = 'undefined';
                g_init += `t_${get(ret)}* fn_${get(use_name)}(t_undefined* _,${args.map((e,i) => `t_${get(e)}* a_${i}`).join(',')}){${ret != 'undefined' ? `return ${pkNm[ret]}(` : ''}${name}(${args.map((e,i) => upkNm[e] + '(a_' + i + ')').join(',')})${ret != 'undefined' && ')' || `;return v_undefined`};}`;
                return ``;
            }
            if (rtsym_name == 'forceType') {
                return ``;
            }
            if (rtsym_name == '__offset' && n.arguments[0].type == 'StringLiteral' && n.arguments[1].type == 'StringLiteral') {
                let ptype = n.arguments[0].value;
                let pprop = n.arguments[1].value;
                return `num((&v_${get(ptype)}) - (&(v_${get(ptype)}).v_${get(pprop)}))`;
            }
        }
        if (n.callee.type == 'MemberExpression') {
            return `fn_${get(n.callee.jstype)}(${[cpp(n.callee.object), ...n.arguments.map(cpp)].join(',')})`;
        } else {
            return `fn_${get(n.callee.jstype)}(${['v_' + get(Scope.types[n.callee.jstype].classOwn || 'undefined'), ...n.arguments.map(cpp)].join(',')})`;
        }
    }
    if (n.type == 'NewExpression') {
        assert(n.callee.type == 'Identifier', 'You can only construct classes by names');
        return `ctor_${get(n.callee.jstype)}(${[...n.arguments.map(cpp)].join(',')});`;
    }
    if (n.type == 'StringLiteral') {
        return `str(${JSON.stringify(n.value)})`
    }
    if (n.type == 'NumericLiteral') {
        return `num(${JSON.stringify(n.value)}LL)`
    }
    if (n.type == 'Identifier') {
        return `v_${get(n.name)}`
    }
    if (n.type == 'ReturnStatement') {
        return `return ${cpp(n.argument)};`
    }
    if (n.type == 'AssignmentExpression') {
        return `${cpp(n.left)} = ${cpp(n.right)}`
    }
    if (n.type == 'BooleanLiteral') {
        return n.value ? 'true' : 'false'
    }
    if (n.type == 'VariableDeclaration') {
        let o = '';
        for (let d of n.declarations) {
            o += `t_${get(d.init.jstype)}* v_${get(d.id.name)}`
            if (d.init) o += `=${cpp(d.init)}`
        }
        o += ';'
        return o;
    }
    if (n.type == 'IfStatement') {
        if (n.alternate) {
            return `if (unpack_bool(${cpp(n.test)})) {${cpp(n.consequent)}} else {${cpp(n.alternate)}}`;
        } else {
            return `if (unpack_bool(${cpp(n.test)})) {${cpp(n.consequent)}}`;
        }
    }
    if (n.type == 'MemberExpression') {
        return cpp(n.object) + '->' + cpp(n.property);
    }
    if (n.type == 'ThisExpression') {
        return 'v_' + get('this');
    }
    if (n.type == 'BinaryExpression') {
        let dez = {
            '+': 'plus',
            '-': 'minus',
            '&': 'and',
            '|': 'or',
            '^': 'xor',
            '/': 'div',
            '*': 'mul',
            '==': 'eq',
            '!=': 'neq',
            '>': 'gt',
            '<': 'lt',
        }
        if (n.jstype == 'string') {
            return `strop_${dez[n.operator]}(${cpp(n.left)},${cpp(n.right)})`;
        }
        return `op_${dez[n.operator]}(${cpp(n.left)},${cpp(n.right)})`;
    }
    if (n.type == 'UnaryExpression') {
        let dez = {
            '!': 'not',
            '-': 'rev'
        }
        return `uop_${dez[n.operator]}(${cpp(n.argument)})`;
    }
    if (n.type == 'ClassDeclaration') {
        let class_name = n.id.name;
        if (class_name == 'Number') class_name = 'number';
        if (class_name == 'Symbol') class_name = 'symbol';
        if (class_name == 'String') class_name = 'string';
        if (class_name == 'Boolean') class_name = 'boolean';
        let o = '';
        for (let node of n.body.body) {
            if (node.type == 'ClassMethod') {
                let rets;
                let fn_name = node.key.name;
                let is_ctor = (fn_name == 'new' || fn_name == 'constructor');
                if (is_ctor) {
                    let fn_type = Scope.types[((!node.static) ? '__ctord_' : '') + class_name].props[fn_name];
                    let fn_type_data = Scope.types[(fn_name == 'new' || fn_name == 'constructor') ? class_name : fn_type];
                    let args = node.params.map(e => `t_${get(e.jstype)}*  v_${get(e.name)}`).join(',');

                    rets = fn_type_data.typeID;
                    o += `t_${get(rets)}* ctor_${get(class_name)}(${args}){t_${get('__ctord_' + class_name)}* v_${get('this')} = getProto_${get('__ctord_' + class_name)}();${cpp(node.body)}return v_${get('this')};};`
                    d[fn_name] = class_name;
                } else {
                    let fn_type = `_${node.params.length}_` + Scope.types[(!node.static ? '__ctord_' : '') + class_name].props[fn_name];
                    let fn_type_data = Scope.types[fn_type];
                    let args = [...(!node.static ? [`t_${get('__ctord_' + class_name)}* v_${get('this')}`] : []), ...node.params.map(e => `t_${get(e.jstype)}*  v_${get(e.name)}`)].join(',');

                    rets = fn_type_data.typeID;
                    o += `t_${get(rets)}* fn_${get(fn_type)}(${args}){${cpp(node.body)}${rets == 'undefined' ? 'return v_undefined;' : ''}};`
                    d[fn_name] = class_name;
                }


            }
        }
        return o;
    }
    if (n.type == 'ForStatement') {
        return `for (${cpp(n.init)};unpack_bool(${cpp(n.test)});${cpp(n.update)}){${cpp(n.body)}}`;
    }
    if (n.type == 'WhileStatement') {
        return `while (unpack_bool(${cpp(n.test)})){${cpp(n.body)}}`;
    }
    if (n.type == 'UpdateExpression') {
        return `num_${n.operator == '++' ? 'inc' : 'dec'}(${cpp(n.argument)})`;
    }

    console.log(n);
    try {
        clipboardy.writeSync(`
    if (n.type == '${n.type}') {
        // TODO: ${n.type}
        console.log(n);
        assert(false, 'Not implemented just yet: ${n.type}');
    }`);
    } catch (e) { }
    assert(false, 'Not supported: ' + n.type + ` @ line ${n.loc.start.line}`);
}
function createCopyCtor(t, t_info) {
    let fields = Object.keys(t_info.props);
    fields = fields.map(e => `a->v_${get(e)}=v_${t}->v_${get(e)}`);
    return `t_${t}* getProto_${t}(){t_${t}* a = malloc(sizeof(t_${t}));${fields.join(';')};return a;}`;
}
function cppType(t) {
    if (Scope.types[t].dts) return '';
    let t_info = Scope.types[t];
    let type = get(t);
    c_init += `v_${type} = malloc(sizeof(t_${type}));`;
    return `struct t_${type} {${Object.keys(t_info.props).map(k => `t_${get(t_info.props[k])}* v_${k};`).join('')}char pad;};t_${type}* v_${type};${createCopyCtor(type, t_info)}`;

}
function cppDef(t) {
    if (Scope.types[t].dts) return '';
    let type = get(t);
    return `struct t_${type};typedef struct t_${type} t_${type};`
}
function cppEx(astBox) {
    let c = '';
    for (let t of Object.keys(Scope.types)) {
        c += cppDef(t);
    }
    for (let t of Object.keys(Scope.types)) {
        c += cppType(t);
    }
    let genedc = '';
    for (let f in astBox) {
        file = f;
        genedc += `\n#line 1 "${f.replace(/\\/g,'\\\\')}.c"\n${cpp(astBox[f])}`;
    }
    return (`#line 269 "emitCPlusPlus.js"\n#include "lib/c-head.h"\n${g_init};\n#line 1 "all.d.ts.c"\n` + c + genedc + `\n#line 269 "emitCPlusPlus.js"\nint main() {${c_init};v_undefined=malloc(sizeof(t_undefined));fn_${get('main')}(v_undefined);}`).replace(/;;+/g, ';');
}
module.exports = cppEx;