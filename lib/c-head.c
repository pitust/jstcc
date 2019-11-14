#include "stdio.h"
#include "stddef.h"
#include "stdint.h"
#include "stdlib.h"
#include "stdbool.h"
#include "string.h"
#include "math.h"

#define true 1
#define false 0
typedef struct 
{
    bool real;
} t_boolean;
typedef struct 
{
    int64_t real;
} t_number;
typedef struct 
{
    t_number* v_length;
    char* real;
    char pad;
} t_string;

t_number* num(long long int real) {
    t_number* t = malloc(sizeof(t_number));
    t->real = real;
    return t;
}
void num_inc(t_number* t) {
    t->real++;
}
void num_dec(t_number* t) {
    t->real--;
}
long long int unpack_int(t_number* p) {
    return p->real;
}


t_boolean* boolify(bool real) {
    t_boolean* t = malloc(sizeof(t_number));
    t->real = real;
    return t;
}
bool unpack_bool(t_boolean* p) {
    return p->real;
}

typedef struct{char pad;} t_undefined;
t_undefined* v_undefined;
t_number* op_plus(t_number* a, t_number* b) {
    return num(a->real + b->real);
}
t_boolean* op_lt(t_number* a, t_number* b) {
    return boolify(a->real < b->real);
}
t_boolean* op_gt(t_number* a, t_number* b) {
    return boolify(a->real > b->real);
}
t_number* uop_rev(t_number* a) {
    return num(-a->real);
}
t_string* str(char* real) {
    t_string* t = malloc(sizeof(t_string));
    t->real = strdup(real);
    t->v_length = num(strlen(real));
    return t;
}
t_string* fn__0_number__toString(t_number* v_this) {
    long long len = ceill(log10(v_this->real));
    char* buf = malloc(len + 1);
    buf[len] = 0;
    sprintf(buf, "%lld", v_this->real);
    return str(buf);
}
#define t___ctord_string t_string
char* unpack_str(t_string* p) {
    return p->real;
}

t_string* strop_plus(t_string* a, t_string* b) {
    t_string* t = malloc(sizeof(t_string));
    t->real = malloc(strlen(a->real) + strlen(b->real) + 1);
    strcpy(t->real, a->real);
    strcat(t->real, b->real);
    t->v_length = num(strlen(a->real) + strlen(b->real));
    return t;
}
t_number* fn_string__charCodeAt(t_string* v_this, t_number* v_addr) {
    return num(v_this->real[v_addr->real]);
}