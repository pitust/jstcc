function puts(str) {
    rtsym.forceType("str", "string");
    for (let i = 0;i < str.length;i++) {
        rtsym.__loadName("c", str.charCodeAt(i));
        rtsym.__cplusplus('printf("%c", (char)c);');
    }
    rtsym.__cplusplus('printf("\\n");');
}