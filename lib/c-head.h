#include "stdio.h"
#include "stddef.h"
#include "stdlib.h"
#include "stdbool.h"
#include "string.h"
#define true 1
#define false 0
typedef struct 
{
    long long int real;
} t_number;
t_number* num(long long int real);
void num_inc(t_number* t);
void num_dec(t_number* t);
long long int unpack_int(t_number* p);

typedef struct 
{
    bool real;
} t_boolean;
t_boolean* boolify(bool real);
bool unpack_bool(t_boolean* p);

typedef struct{char pad;} t_undefined;
t_undefined* v_undefined;
t_number* op_plus(t_number* a, t_number* b);
t_boolean* op_lt(t_number* a, t_number* b);
t_boolean* op_gt(t_number* a, t_number* b);
t_number* uop_rev(t_number* a);

typedef struct 
{
    t_number* v_length;
    char* real;
    char pad;
} t_string;
t_string* str(char* real);
#define t___ctord_string t_string
char* unpack_str(t_string* p);

t_string* strop_plus(t_string* a, t_string* b);
t_number* fn_string__charCodeAt(t_string* v_this, t_number* v_addr);