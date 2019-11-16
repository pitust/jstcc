/// <reference no-default-lib="true"/>


declare class rtsym {
    static __cplusplus(cpp: string): void;
    static __loadName(name: string, n: number): void;
    static __getName(name: string): number;
    static __assembly(asm: string): void;
    static __createGet(varName: string): void;
    static __offset(type: string, prop: string): void;
    static gcForceFree(): void;
    static forceType(varID: string, type: string): void;
    static getCurrentLineInfo(): string;
    
    static defCFN(sig: string): void;
}
declare class String {
    length: number;
    charCodeAt(i: number): number;
}
declare class Number {
    toString(): string;
    toString(radix: number): string;
}
declare class cplusplusInt {
    read(): number;
    write(n: number): void;
	__address: number;
}
declare class ArrayBuffer {
    addr: cplusplusInt;
    len: cplusplusInt;
    new(len: number): ArrayBuffer;
}
declare class Uint8View {
    buffer: ArrayBuffer;
    read(off: number): number;
    write(off: number, val: number): void;
    new(len: number): Uint8View;
    static from(buf: ArrayBuffer): Uint8View;
}
declare class Memory {
	addr: number;
	len: number;
	constructor(len: number);
}