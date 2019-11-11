/// <reference no-default-lib="true"/>

class cplusplusInt {
	__address: number;
	read(): number {
		rtsym.__createGet("out");
		rtsym.__loadName("addr", this.__address);
		rtsym.__cplusplus("out = *(int*)(addr);");
		return rtsym.__getName("out");
	};
	write(n: number): void {
		rtsym.__loadName("addr", this.__address);
		rtsym.__loadName("num", n);
		rtsym.__cplusplus("*(int*)(addr) = num;");
	};
	asAddr(): void {
		this.__address = this.read();
	}
}
class Memory {
	addr: number;
	len: number;
	constructor(len: number) {
		rtsym.__createGet("addr");
		rtsym.__loadName("len", len);
		rtsym.__cplusplus("addr = (int64_t)malloc(len);");
		this.addr = rtsym.__getName("addr");
		this.len = len;
	};
}
class Uint8View {
	buffer: Memory;
	read(off: number): number {
		if (off < this.buffer.len) {
			rtsym.__createGet("out");
			rtsym.__loadName("addr", this.buffer.addr + off);
			rtsym.__cplusplus("out = (int)(char)*(int*)addr;");
			return rtsym.__getName("out");
		}
		return -1;
	};
	write(off: number, val: number): void {
		if (off < this.buffer.len) {
			rtsym.__loadName("addr", this.buffer.addr + off);
			rtsym.__loadName("val", val);
			rtsym.__cplusplus("*(char*)addr = (char) val;");
		}
	};
	constructor(len: number) {
		this.buffer = new Memory(len);
	};
	static from(buf: Memory): Uint8View {
		var a = new Uint8View(0);
		a.buffer = buf;
		return a;
	};
}