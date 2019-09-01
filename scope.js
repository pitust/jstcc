let types = {};
let funcs = {};
module.exports = class Scope {
    get(name, isTS = false) {
        if (types['__ctord_' + name] && isTS) return '__ctord_' + name;
        if (types[name]) return name;
        if (this.scope[name]) return this.scope[name];
        if (this.upstream == null) return 'undefined';
        return this.upstream.get(name);
    }
    creat(name, type) {
        this.scope[name] = type;
    }
    force(name, type) {
        if (this.scope[name]) {
            this.scope[name] = type;
            return;
        }
        if (this.upstream == null) return;
        this.upstream.force(name, type);
    }
    ik(name, type) {
        if (this.ikdict[name]) {
            this.scope[name] = type;
            this.ikdict[name](type);
        }
        if (this.upstream == null) return;
        this.upstream.ik(name, type);
    }
    creatTBI(name, ik) {
        this.scope[name] = 'unk';
        this.ikdict[name] = ik;
    }
    constructor() {
        this.scope = {};
        this.ikdict = {};
        this.upstream = null;
    }
    createDownstream() {
        let s = new Scope();
        s.upstream = this;
        return s;
    }
};
module.exports.globalScope = new module.exports();
module.exports.types = types;
module.exports.funcs = funcs;