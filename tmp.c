#line 269 "emitCPlusPlus.js"
#include "lib/c-head.h"
t_undefined *fn_puts(t_undefined *_, t_string *a_0)
{
    puts(unpack_str(a_0));
    return v_undefined;
};
struct t_cplusplusInt;
typedef struct t_cplusplusInt t_cplusplusInt;
struct t___ctord_cplusplusInt;
typedef struct t___ctord_cplusplusInt t___ctord_cplusplusInt;
struct t_cplusplusInt__read;
typedef struct t_cplusplusInt__read t_cplusplusInt__read;
struct t_cplusplusInt__write;
typedef struct t_cplusplusInt__write t_cplusplusInt__write;
struct t_Uint8View;
typedef struct t_Uint8View t_Uint8View;
struct t___ctord_Uint8View;
typedef struct t___ctord_Uint8View t___ctord_Uint8View;
struct t_Uint8View__read;
typedef struct t_Uint8View__read t_Uint8View__read;
struct t_Uint8View__write;
typedef struct t_Uint8View__write t_Uint8View__write;
struct t_Uint8View__from;
typedef struct t_Uint8View__from t_Uint8View__from;
struct t_Memory;
typedef struct t_Memory t_Memory;
struct t___ctord_Memory;
typedef struct t___ctord_Memory t___ctord_Memory;
struct t_puts;
typedef struct t_puts t_puts;
struct t_putno;
typedef struct t_putno t_putno;
struct t___ctord_putno;
typedef struct t___ctord_putno t___ctord_putno;
struct t_main;
typedef struct t_main t_main;
struct t___ctord_main;
typedef struct t___ctord_main t___ctord_main;
struct t_cplusplusInt__asAddr;
typedef struct t_cplusplusInt__asAddr t_cplusplusInt__asAddr;
struct t_cplusplusInt
{
    char pad;
};
t_cplusplusInt *v_cplusplusInt;
t_cplusplusInt *getProto_cplusplusInt()
{
    t_cplusplusInt *a = malloc(sizeof(t_cplusplusInt));
    return a;
}
struct t___ctord_cplusplusInt
{
    t_number *v___address;
    t_cplusplusInt__read *v_read;
    t_cplusplusInt__write *v_write;
    t_cplusplusInt__asAddr *v_asAddr;
    char pad;
};
t___ctord_cplusplusInt *v___ctord_cplusplusInt;
t___ctord_cplusplusInt *getProto___ctord_cplusplusInt()
{
    t___ctord_cplusplusInt *a = malloc(sizeof(t___ctord_cplusplusInt));
    a->v___address = v___ctord_cplusplusInt->v___address;
    a->v_read = v___ctord_cplusplusInt->v_read;
    a->v_write = v___ctord_cplusplusInt->v_write;
    a->v_asAddr = v___ctord_cplusplusInt->v_asAddr;
    return a;
}
struct t_cplusplusInt__read
{
    char pad;
};
t_cplusplusInt__read *v_cplusplusInt__read;
t_cplusplusInt__read *getProto_cplusplusInt__read()
{
    t_cplusplusInt__read *a = malloc(sizeof(t_cplusplusInt__read));
    return a;
}
struct t_cplusplusInt__write
{
    char pad;
};
t_cplusplusInt__write *v_cplusplusInt__write;
t_cplusplusInt__write *getProto_cplusplusInt__write()
{
    t_cplusplusInt__write *a = malloc(sizeof(t_cplusplusInt__write));
    return a;
}
struct t_Uint8View
{
    t_Uint8View__from *v_from;
    char pad;
};
t_Uint8View *v_Uint8View;
t_Uint8View *getProto_Uint8View()
{
    t_Uint8View *a = malloc(sizeof(t_Uint8View));
    a->v_from = v_Uint8View->v_from;
    return a;
}
struct t___ctord_Uint8View
{
    t___ctord_Memory *v_buffer;
    t_Uint8View__read *v_read;
    t_Uint8View__write *v_write;
    char pad;
};
t___ctord_Uint8View *v___ctord_Uint8View;
t___ctord_Uint8View *getProto___ctord_Uint8View()
{
    t___ctord_Uint8View *a = malloc(sizeof(t___ctord_Uint8View));
    a->v_buffer = v___ctord_Uint8View->v_buffer;
    a->v_read = v___ctord_Uint8View->v_read;
    a->v_write = v___ctord_Uint8View->v_write;
    return a;
}
struct t_Uint8View__read
{
    char pad;
};
t_Uint8View__read *v_Uint8View__read;
t_Uint8View__read *getProto_Uint8View__read()
{
    t_Uint8View__read *a = malloc(sizeof(t_Uint8View__read));
    return a;
}
struct t_Uint8View__write
{
    char pad;
};
t_Uint8View__write *v_Uint8View__write;
t_Uint8View__write *getProto_Uint8View__write()
{
    t_Uint8View__write *a = malloc(sizeof(t_Uint8View__write));
    return a;
}
struct t_Uint8View__from
{
    char pad;
};
t_Uint8View__from *v_Uint8View__from;
t_Uint8View__from *getProto_Uint8View__from()
{
    t_Uint8View__from *a = malloc(sizeof(t_Uint8View__from));
    return a;
}
struct t_Memory
{
    char pad;
};
t_Memory *v_Memory;
t_Memory *getProto_Memory()
{
    t_Memory *a = malloc(sizeof(t_Memory));
    return a;
}
struct t___ctord_Memory
{
    t_number *v_addr;
    t_number *v_len;
    char pad;
};
t___ctord_Memory *v___ctord_Memory;
t___ctord_Memory *getProto___ctord_Memory()
{
    t___ctord_Memory *a = malloc(sizeof(t___ctord_Memory));
    a->v_addr = v___ctord_Memory->v_addr;
    a->v_len = v___ctord_Memory->v_len;
    return a;
}
struct t_puts
{
    char pad;
};
t_puts *v_puts;
t_puts *getProto_puts()
{
    t_puts *a = malloc(sizeof(t_puts));
    return a;
}
struct t_putno
{
    char pad;
};
t_putno *v_putno;
t_putno *getProto_putno()
{
    t_putno *a = malloc(sizeof(t_putno));
    return a;
}
struct t___ctord_putno
{
    char pad;
};
t___ctord_putno *v___ctord_putno;
t___ctord_putno *getProto___ctord_putno()
{
    t___ctord_putno *a = malloc(sizeof(t___ctord_putno));
    return a;
}
struct t_main
{
    char pad;
};
t_main *v_main;
t_main *getProto_main()
{
    t_main *a = malloc(sizeof(t_main));
    return a;
}
struct t___ctord_main
{
    char pad;
};
t___ctord_main *v___ctord_main;
t___ctord_main *getProto___ctord_main()
{
    t___ctord_main *a = malloc(sizeof(t___ctord_main));
    return a;
}
struct t_cplusplusInt__asAddr
{
    char pad;
};
t_cplusplusInt__asAddr *v_cplusplusInt__asAddr;
t_cplusplusInt__asAddr *getProto_cplusplusInt__asAddr()
{
    t_cplusplusInt__asAddr *a = malloc(sizeof(t_cplusplusInt__asAddr));
    return a;
}
#line 1 "E:\\jstcc/lib/stdjslib.js"
;
t_undefined *fn_putno(t_undefined *v_this, t_number *v_num)
{
    long long number = unpack_int(v_num);
#line 4 "E:\\jstcc/lib/stdjslib.js"
    printf("%d", number);
#line 1 "E:\\jstcc/lib/stdjslib.js"
    ;
    return v_undefined;
}
t___ctord_putno *ctor_putno(t_number *v_num)
{
    t___ctord_putno *v_this = getProto___ctord_putno();
    long long number = unpack_int(v_num);
#line 4 "E:\\jstcc/lib/stdjslib.js"
    printf("%d", number);
#line 1 "E:\\jstcc/lib/stdjslib.js"
    ;
    return v_this;
}
#line 1 ".\\index.js"
t_undefined *fn_main(t_undefined *v_this)
{
    fn_puts(v_undefined, str("hello!"));
    fn_putno(v_undefined, num(32LL));
    return v_undefined;
}
t___ctord_main *ctor_main()
{
    t___ctord_main *v_this = getProto___ctord_main();
    fn_puts(v_undefined, str("hello!"));
    fn_putno(v_undefined, num(32LL));
    return v_this;
}
#line 1 "E:\\jstcc/lib/rtsym.ts"
t_number *fn_cplusplusInt__read(t___ctord_cplusplusInt *v_this)
{
    long long out;
    long long addr = unpack_int(v_this->v___address);
#line 8 "E:\\jstcc/lib/rtsym.ts"
    out = *(int *)(addr);
#line 1 "E:\\jstcc/lib/rtsym.ts"
    ;
    return num(out);
};
t_undefined *fn_cplusplusInt__write(t___ctord_cplusplusInt *v_this, t_number *v_n)
{
    long long addr = unpack_int(v_this->v___address);
    long long num = unpack_int(v_n);
#line 14 "E:\\jstcc/lib/rtsym.ts"
    *(int *)(addr) = num;
#line 1 "E:\\jstcc/lib/rtsym.ts"
    ;
    return v_undefined;
};
t_undefined *fn_cplusplusInt__asAddr(t___ctord_cplusplusInt *v_this)
{
    v_this->v___address = fn_cplusplusInt__read(v_this);
    return v_undefined;
};
t___ctord_Memory *ctor_Memory(t_number *v_len)
{
    t___ctord_Memory *v_this = getProto___ctord_Memory();
    long long addr;
    long long len = unpack_int(v_len);
#line 26 "E:\\jstcc/lib/rtsym.ts"
    addr = (int64_t)malloc(len);
#line 1 "E:\\jstcc/lib/rtsym.ts"
    ;
    v_this->v_addr = num(addr);
    v_this->v_len = v_len;
    return v_this;
};
t_number *fn_Uint8View__read(t___ctord_Uint8View *v_this, t_number *v_off)
{
    if (unpack_bool(op_lt(v_off, v_this->v_buffer->v_len)))
    {
        long long out;
        long long addr = unpack_int(op_plus(v_this->v_buffer->v_addr, v_off));
#line 37 "E:\\jstcc/lib/rtsym.ts"
        out = (int)(char)*(int *)addr;
#line 1 "E:\\jstcc/lib/rtsym.ts"
        ;
        return num(out);
    }
    return uop_rev(num(1LL));
};
t_undefined *fn_Uint8View__write(t___ctord_Uint8View *v_this, t_number *v_off, t_number *v_val)
{
    if (unpack_bool(op_lt(v_off, v_this->v_buffer->v_len)))
    {
        long long addr = unpack_int(op_plus(v_this->v_buffer->v_addr, v_off));
        long long val = unpack_int(v_val);
#line 46 "E:\\jstcc/lib/rtsym.ts"
        *(char *)addr = (char)val;
#line 1 "E:\\jstcc/lib/rtsym.ts"
        ;
    }
    return v_undefined;
};
t___ctord_Uint8View *ctor_Uint8View(t_number *v_len)
{
    t___ctord_Uint8View *v_this = getProto___ctord_Uint8View();
    v_this->v_buffer = ctor_Memory(v_len);
    return v_this;
};
t___ctord_Uint8View *fn_Uint8View__from(t___ctord_Memory *v_buf)
{
    t___ctord_Uint8View *v_a = ctor_Uint8View(num(0LL));
    v_a->v_buffer = v_buf;
    return v_a;
};
#line 269 "emitCPlusPlus.js"
int main()
{
    v_cplusplusInt = malloc(sizeof(t_cplusplusInt));
    v___ctord_cplusplusInt = malloc(sizeof(t___ctord_cplusplusInt));
    v_cplusplusInt__read = malloc(sizeof(t_cplusplusInt__read));
    v_cplusplusInt__write = malloc(sizeof(t_cplusplusInt__write));
    v_Uint8View = malloc(sizeof(t_Uint8View));
    v___ctord_Uint8View = malloc(sizeof(t___ctord_Uint8View));
    v_Uint8View__read = malloc(sizeof(t_Uint8View__read));
    v_Uint8View__write = malloc(sizeof(t_Uint8View__write));
    v_Uint8View__from = malloc(sizeof(t_Uint8View__from));
    v_Memory = malloc(sizeof(t_Memory));
    v___ctord_Memory = malloc(sizeof(t___ctord_Memory));
    v_puts = malloc(sizeof(t_puts));
    v_putno = malloc(sizeof(t_putno));
    v___ctord_putno = malloc(sizeof(t___ctord_putno));
    v_main = malloc(sizeof(t_main));
    v___ctord_main = malloc(sizeof(t___ctord_main));
    v_cplusplusInt__asAddr = malloc(sizeof(t_cplusplusInt__asAddr));
    v_undefined = malloc(sizeof(t_undefined));
    fn_main(v_undefined);
}