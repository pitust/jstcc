rtsym.defCFN('void puts(string)');
function putno(num) {
    rtsym.__loadName("number", num);
    rtsym.__cplusplus("printf(\"%lld\", number);");
}