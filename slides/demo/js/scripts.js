// @format

fetch('calls.wasm')
    .then(response => response.arrayBuffer())
    .then(bytes => WebAssembly.instantiate(bytes, {
        memory: new WebAssembly.Memory({
            initial: 256,
        }),
    }))
    .then(({module, instance}) => {
        console.log(module)
        console.log(instance)
        debugger
    })
