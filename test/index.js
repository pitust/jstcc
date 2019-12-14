function main() {
    puts("hello!");
    let f = 'a';
    rtsym.gcForceFree();
    puts(f);
    puts((123).toString());
}