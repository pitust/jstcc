#include "stdio.h"
#include "stddef.h"
#include "stdint.h"
#include "stdlib.h"
#include "stdbool.h"
#include "string.h"
#include "math.h"

void *gc_alloc(uint64_t len);
#define true 1
#define false 0
// this is defined on per-file basis
char *get_rtti_type(uint64_t rttiID);
typedef struct
{
    uint64_t rttiID;
    bool real;
} t_boolean;
typedef struct
{
    uint64_t rttiID;
    int64_t real;
} t_number;
typedef struct
{
    uint64_t rttiID;
    t_number *v_length;
    char *real;
    char pad;
} t_string;

t_number *num(long long int real)
{
    t_number *t = gc_alloc(sizeof(t_number));
    t->real = real;
    t->rttiID = 1;
    return t;
}
void num_inc(t_number *t)
{
    t->real++;
}
void num_dec(t_number *t)
{
    t->real--;
}
long long int unpack_int(t_number *p)
{
    return p->real;
}

t_boolean *boolify(bool real)
{
    t_boolean *t = gc_alloc(sizeof(t_number));
    t->real = real;
    t->rttiID = 2;
    return t;
}
bool unpack_bool(t_boolean *p)
{
    return p->real;
}

typedef struct
{
    char pad;
} t_undefined;
t_undefined *v_undefined;
t_number *op_plus(t_number *a, t_number *b)
{
    return num(a->real + b->real);
}
t_boolean *op_lt(t_number *a, t_number *b)
{
    return boolify(a->real < b->real);
}
t_boolean *op_gt(t_number *a, t_number *b)
{
    return boolify(a->real > b->real);
}
t_number *uop_rev(t_number *a)
{
    return num(-a->real);
}
t_string *str(char *real)
{
    t_string *t = gc_alloc(sizeof(t_string));
    t->real = strdup(real);
    t->rttiID = 0;
    t->v_length = num(strlen(real));
    return t;
}
t_string *fn__0_number__toString(t_number *v_this)
{
    long long len = ceil(log10(v_this->real));
    char *buf = gc_alloc(len + 1);
    buf[len] = 0;
    sprintf(buf, "%ld", v_this->real);
    return str(buf);
}
#define t___ctord_string t_string
char *unpack_str(t_string *p)
{
    return p->real;
}

t_string *strop_plus(t_string *a, t_string *b)
{
    t_string *t = gc_alloc(sizeof(t_string));
    t->real = gc_alloc(strlen(a->real) + strlen(b->real) + 1);
    strcpy(t->real, a->real);
    strcat(t->real, b->real);
    t->v_length = num(strlen(a->real) + strlen(b->real));
    return t;
}
t_number *fn_string__charCodeAt(t_string *v_this, t_number *v_addr)
{
    return num(v_this->real[v_addr->real]);
}
// Garbage collector
#pragma region gc
typedef struct heapAddrEnt
{
    uint64_t elem;
    uint64_t alloclen;
    uint8_t flags;
} heapAddrEnt;

struct
{
    uint64_t size;
    uint64_t alloced;
    heapAddrEnt *addrs;
} addrHeap;
uint64_t _parent(uint64_t whose)
{
    return whose / 2;
}
uint64_t _sonLeft(uint64_t whose)
{
    return whose * 2;
}
uint64_t _sonRight(uint64_t whose)
{
    return whose * 2 + 1;
}
uint64_t find_heap(uint64_t el)
{
    uint64_t cur = 1;
    while (true)
    {
        if (cur > addrHeap.size)
            return 0; // fail
        if (addrHeap.addrs[cur].elem == el)
            return cur;
        if (addrHeap.addrs[cur].elem < el)
            cur = _sonLeft(cur);
        if (addrHeap.addrs[cur].elem > el)
            cur = _sonRight(cur);
    }
}
void add_heap(uint64_t x, uint64_t len)
{
    if (find_heap(x) != 0)
    {
        uint64_t hpid = find_heap(x);
        addrHeap.addrs[hpid].flags = 0;
        addrHeap.addrs[hpid].alloclen = len;
        addrHeap.addrs[hpid].elem = x;
    }
    addrHeap.size++;
    if (addrHeap.size > addrHeap.alloced)
    {
        addrHeap.addrs = realloc(addrHeap.addrs, (addrHeap.alloced *= 2) * sizeof(heapAddrEnt));
    }
    addrHeap.addrs[addrHeap.size].elem = x;
    addrHeap.addrs[addrHeap.size].alloclen = len;
    int v = addrHeap.size;
    while (v != 1 && addrHeap.addrs[_parent(v)].elem < addrHeap.addrs[v].elem)
    {
        heapAddrEnt e = addrHeap.addrs[_parent(v)];
        addrHeap.addrs[_parent(v)] = addrHeap.addrs[v];
        e = addrHeap.addrs[v];
        v = _parent(v);
    }
}


uint8_t heap_getFlags(uint64_t el)
{
    uint64_t heapEl = find_heap(el);
    return addrHeap.addrs[heapEl].flags;
}
void heap_setFlags(uint64_t el, uint8_t flags)
{
    uint64_t heapEl = find_heap(el);
    addrHeap.addrs[heapEl].flags = flags;
}
uintptr_t stackTop;
void gc_init()
{
    stackTop = (uintptr_t)__builtin_frame_address(0);
    addrHeap.addrs = malloc(10 * sizeof(heapAddrEnt));
    addrHeap.alloced = 10;
    addrHeap.size = 0;
}
uint64_t gac;
void sweep();
void *gc_alloc(uint64_t len)
{
    gac += len;
    if (gac > 1e5)
    {
        sweep();
        gac = 0;
    }
    void *mem = malloc(len);
    add_heap((uint64_t)mem, len);
    return mem;
}
#define GC_FREE 2
#define GC_USED 1
uint64_t _sweep_area(uintptr_t start, uintptr_t max)
{
    uint64_t bc = 0;
    uintptr_t shr = 0;
    for (uint64_t i = start; i < max; i++)
    {
        bc++;
        uint8_t byte = *((uint8_t *)(i));
        shr = shr << 8;
        shr |= byte;
        uint64_t id = find_heap(shr);
        if (id == 0)
            continue;
        if (addrHeap.addrs[id].flags & GC_FREE)
        {
            printf("\n\x1b[31m   FATAL ERROR\x1b[0m  \tFreed element found on the stack!");
            exit(99);
        }
        addrHeap.addrs[id].flags = GC_USED;
        bc += _sweep_area(addrHeap.addrs[id].elem, addrHeap.addrs[id].alloclen + addrHeap.addrs[id].elem);
    }
    return bc;
}
void sweep()
{
    uintptr_t stackCur = (uintptr_t)__builtin_frame_address(0);
    for (int i = 0; i < addrHeap.size; i++)
    {
        addrHeap.addrs[i].flags |= GC_USED;
        addrHeap.addrs[i].flags ^= GC_USED;
    }
    int n = 0, m = 0;
    uint64_t b = _sweep_area(stackCur, stackTop);
    for (int i = 1; i < addrHeap.size; i++)
    {
        if (addrHeap.addrs[i].flags & GC_FREE)
            continue;
        n++;
        if (!(addrHeap.addrs[i].flags & GC_USED))
        {
            free((void *)addrHeap.addrs[i].elem);
            addrHeap.addrs[i].flags |= GC_FREE;
            m++;
        }
    }
}
#pragma endregion