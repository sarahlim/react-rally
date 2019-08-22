---
title: All the memory safety of C combined with all the blazing speed of JavaScript
author:
    - Sarah "Slim" Lim ([\@soylentqueen](https://twitter.com/soylentqueen))
    - Notion

theme: slim
slideNumber: true
height: 850
width: 1250
transition: none
---

## My WebAssembly knowledge in 2018


::: columns
::: column

- Fast (successor to asm.js)

- Many use cases
    - Games
    - Graphics
    - Large Fibonacci numbers

- Formally verified specification

- Might put me out of a job
:::

:::column

![WebAssembly logo](https://webassembly.org/css/webassembly.svg){width=500px}


:::
:::


## Some context

I'm an academic pretending to be a software engineer

## By day 🌝

- Building [Notion](http://notion.so), a practical computing toolkit
- Previously building [Khan Academy](http://khanacademy.org)
- Totally a "professional JavaScript developer"

## By night 🌚

- Programming languages $\times$ human computer interaction
- Functional programming and rich static type systems
- Skipped Operating Systems to study type theory

## Two kinds of WebAssembly talks

![Some WebAssembly talks are fairly shallow and broad](img/some-talks.png)

::: notes
There are at least two kinds of WebAssembly talks.

The first variant is a broad and shallow overview of the technology. In 30 minutes, you can learn:

- What WebAssembly is, and what it's good for
- How to build a simple program that computes a very large number
- How to gently correct people who claim it will "replace JavaScript"
- System still mostly a black box
:::


## Two kinds of WebAssembly talks

![This WebAssembly talk is narrow and deep](img/0.1-this-talk.png)

::: notes
This is not that talk.

Instead of doing a broad and practical overview of Wasm, this talk goes narrow and deep.

- Start with a seemingly straightforward and contrived premise
- Go deep into WebAssembly internals to accomplish said premise
- Do lots of gross and unsafe programming

Along the way, we'll explore:

- The JavaScript API for interacting with Wasm modules
- Wasm module layout
- Stack machine and instruction semantics
:::


## Why visit the abyss?

---

Have you encountered a **nifty-sounding technology** and thought to yourself:

> This seems nifty!

. . .

> Too bad I am a JavaScript developer and don't actually understand this lol ¯\\\_(ツ)\_\/¯


## "I'm just a frontend developer..."

- Algebraic data types??
- Containers???????
- Stack machines????

## Not on my watch

We're going to talk about some gory details and it's going to be great

---

## Ok so WebAssembly

From [webassembly.org](https://webassembly.org/) (emphasis mine):

> WebAssembly (abbreviated Wasm) is a **binary instruction format** for a **stack-based virtual machine**.

. . .

> Wasm is designed as a portable **target for compilation of high-level languages** like C/C++/Rust.


## WebAssembly

- Typed (`i32`, `i64`, `f32`, `f64`)
- Readable text format based on **S-expressions**

    - `(cons 1 (cons 2 (cons 3 nil)))`
    - `(+ 1 2 (* 3 4))`



## Compilation target

For "high-level" languages like C, C++, Rust

## Compiling functions


:::::: columns
::: {.column width=30%}

C++

```{.cpp .med}
int addOne(int x) {
    return x + 1;
}
```

:::

::: {.column width=70%}

WebAssembly

```{.js .med}
(func $func0 (param $var0 i32) (result i32)
  get_local $var0
  i32.const 1
  i32.add
)
```

:::
::::::


## Compiling modules


:::::: columns
::: {.column width=35%}

```{.cpp .small}
int addOne(int x) {
    return x + 1;
}

int main(int argc) {
    return addOne(argc);
}
```
:::

::: {.column width=65%}

<span style="opacity: 0;">WebAssembly</span>

```{.js style="opacity: 0;"}
(module
  (type $type0 (func (param i32) (result i32)))
  (table 0 anyfunc)
  (memory 1)
  (export "memory" memory)
  (export "_Z6addOnei" $func0)
  (export "main" $func1)
  (func $func0 (param $var0 i32) (result i32)
    get_local $var0
    i32.const 1
    i32.add
  )
  (func $func1 (param $var0 i32) (result i32)
    get_local $var0
    call $func0
  )
)
```

:::

::::::


## Compiling modules


:::::: columns
::: {.column width=35%}

```{.cpp .small}
int addOne(int x) {
    return x + 1;
}

int main(int argc) {
    return addOne(argc);
}
```
:::

::: {.column width=65%}

```{.js .small}
(module
  (type $type0 (func (param i32) (result i32)))
  (table 0 anyfunc)
  (memory 1)
  (export "memory" memory)
  (export "_Z6addOnei" $func0)
  (export "main" $func1)
  (func $func0 (param $var0 i32) (result i32)
    get_local $var0
    i32.const 1
    i32.add
  )
  (func $func1 (param $var0 i32) (result i32)
    get_local $var0
    call $func0
  )
)
```

:::
::::::


## Stack-based virtual machine

- An execution paradigm for the language
- Enables **more compact programs** compared to a register-based model


## Stack machine semantics


```js
(func $func0 (param $var0 i32) (result i32)
  get_local $var0
  i32.const 1
  i32.add
)

(func $func1 (param $var0 i32) (result i32)
  get_local $var0
  call $func0
)
```

<style type="text/css">
div.wasm-stack {
    border-bottom: 5px solid #555;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding-bottom: 10px;
}

div.wasm-stack > pre {
    width: 90%;
    margin: 10px auto;
}
</style>


## Stack machine semantics
<!-- 1 -->

:::::: {.columns style="display: flex;"}
::: {.column style="width: 60%; position: relative;"}

1. **`get_local $var0`{.js}**

2. `call $func0`{.js}

    1. `get_local $var0`{.js}

    2. `i32.const 1`{.js}

    3. `i32.add`{.js}

:::

::: {.column .wasm-stack style="width: 40%;"}

```{style="align-self: flex-end;"}
1
```

```{style="align-self: flex-end; background: var(--green)"}
$var0
```

:::
::::::


## Stack machine semantics
<!-- 2 -->


:::::: {.columns style="display: flex;"}
::: {.column style="width: 60%; position: relative;"}

1. `get_local $var0`{.js}
2. `i32.const 1`{.js}
3. `i32.add`{.js}

<span style="position: absolute; left: 10%; top: 0; color: red;">
➡️
</span>

:::

::: {.column .wasm-stack style="width: 40%;"}

```{style="align-self: flex-end; opacity: 0;"}
1
```

```{style="align-self: flex-end; background: var(--green)"}
$var0
```

:::
::::::


## Stack machine semantics
<!-- 3 -->


:::::: {.columns style="display: flex;"}
::: {.column style="width: 60%; position: relative;"}

1. `get_local $var0`{.js}
2. `i32.const 1`{.js}
3. `i32.add`{.js}

<span style="position: absolute; left: 10%; top: 25%; color: red;">
➡️
</span>

:::

::: {.column .wasm-stack style="width: 40%;"}


```{style="align-self: flex-end; opacity: 0; background: var(--green);"}
1
```

```{style="align-self: flex-end;"}
$var0
```

:::
::::::


## Stack machine semantics
<!-- 4 -->


:::::: {.columns style="display: flex;"}
::: {.column style="width: 60%; position: relative;"}

1. `get_local $var0`{.js}
2. `i32.const 1`{.js}
3. `i32.add`{.js}

<span style="position: absolute; left: 10%; top: 25%; color: red;">
➡️
</span>

:::

::: {.column .wasm-stack style="width: 40%;"}


```{style="align-self: flex-end; background: var(--green);"}
1
```

```{style="align-self: flex-end;"}
$var0
```

:::
::::::


## Stack machine semantics
<!-- 5 -->


:::::: {.columns style="display: flex;"}
::: {.column style="width: 60%; position: relative;"}

1. `get_local $var0`{.js}
2. `i32.const 1`{.js}
3. `i32.add`{.js}

<span style="position: absolute; left: 10%; top: 52.5%; color: red;">
➡️
</span>

:::

::: {.column .wasm-stack style="width: 40%;"}


```{style="align-self: flex-end;"}
1
```

```{style="align-self: flex-end;"}
$var0
```

:::
::::::


## Stack machine semantics
<!-- 6 -->


:::::: {.columns style="display: flex;"}
::: {.column style="width: 60%; position: relative;"}

1. `get_local $var0`{.js}
2. `i32.const 1`{.js}
3. `i32.add`{.js}

<span style="position: absolute; left: 10%; top: 52.5%; color: red;">
➡️
</span>

:::

::: {.column .wasm-stack style="width: 40%;"}


```{style="align-self: flex-end; opacity: 0;"}
1
```

```{style="align-self: flex-end; opacity: 0;"}
$var0
```

:::
::::::


## Stack machine semantics
<!-- 7 -->


:::::: {.columns style="display: flex;"}
::: {.column style="width: 60%; position: relative;"}

1. `get_local $var0`{.js}
2. `i32.const 1`{.js}
3. `i32.add`{.js}

<span style="position: absolute; left: 10%; top: 52.5%; color: red;">
➡️
</span>

:::

::: {.column .wasm-stack style="width: 40%;"}


```{style="align-self: flex-end; opacity: 0;"}
1
```

```{style="align-self: flex-end; background: var(--green);"}
$var0 + 1
```

:::
::::::


## Remark

Stack machine is equivalent to **postorder traversal**!

. . .

:::::: columns
::: {.column width=30%}

```js
(i32.add
 (get_local $0)
 (i32.const 1)
)
```

:::

::: {.column width=30%}

```js
get_local $var0
i32.const 1
i32.add
```

:::
::::::


## Module layout


:::::: columns
::: {.column width=65%}

```js
(module
  (type $type0 (func (param i32) (result i32)))
  (table 0 anyfunc)
  (memory 1)
  (export "memory" memory)
  (export "_Z6addOnei" $func0)
  (export "main" $func1)
  (func $func0 (param $var0 i32) (result i32)
    get_local $var0
    i32.const 1
    i32.add
  )
  (func $func1 (param $var0 i32) (result i32)
    get_local $var0
    call $func0
  )
)
```

:::
::: {.column style="width: 35%; position: relative;"}
::: {style="position: absolute; top: 15px;"}
Types section
:::
::: {style="position: absolute; top: calc(15px * 2 + 1em);"}
Types section
:::
:::
::::::


::: notes

[Module Layout](https://github.com/sunfishcode/wasm-reference-manual/blob/master/WebAssembly.md#module)


- import
- export
- start
- global
- memory
- data
- table
- elements
- function and code

- function index space
- global index space
- linear memory index space
- table index space
:::


## JavaScript API

Loading a `.wasm` file in five lines of JavaScript*

```js
fetch('demo/calls.wasm')
    .then(response => response.arrayBuffer())
    .then(bytes => WebAssembly.instantiate(bytes, {
        memory: new WebAssembly.Memory({ initial: 256 }),
    }))
    .then(({module, instance}) => {
        // ... do stuff
    })
```

\*obligatory remark about [`instantiateStreaming`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WebAssembly/instantiateStreaming)

<script type="text/javascript">
fetch('demo/calls.wasm')
    .then(response => response.arrayBuffer())
    .then(bytes => WebAssembly.instantiate(bytes, {
        memory: new WebAssembly.Memory({ initial: 256 }),
    }))
    .then(({module, instance}) => {
        console.log(module)
        console.log(instance)
        window.module = module
        window.instance = instance
    })
</script>

## Inspecting exports

```js
WebAssembly.Module.exports(module)
```

```js
[ { "name": "memory", "kind": "memory" }
, { "name": "_Z11getCallsPtrv", "kind": "function" }
, { "name": "_Z6addOnei", "kind": "function" }
, { "name": "main", "kind": "function" }
]
```

## Calling functions


::: {.columns style="display: flex;"}

::: {.column style="width: 50%; display: flex; flex-direction: column; align-items: flex-start;"}

```js
instance.exports
```

```js
{ Z11getCallsPtrv: function 0()
, _Z6addOnei: function 1()
, main: function 2()
, memory: WebAssembly.Memory
}
```

:::

::: {.column style="width: 50%; display: flex; flex-direction: column; align-items: flex-start;"}

```js
instance.exports._Z6addOnei(2019)
```

```js
2020
```

:::
:::

## Further reading

WebAssembly is easy to get started with!

::: columns
::: column

### Playing around

- [WebAssembly reference manual](https://github.com/sunfishcode/wasm-reference-manual/blob/master/WebAssembly.md#s-signed-integer-instruction-family)
- [WebAssembly Explorer](https://mbebenita.github.io/WasmExplorer/)

:::
::: column

### Design docs

- [Modules](https://github.com/WebAssembly/design/blob/master/Modules.md#integration-with-es6-modules)
- [Semantics](https://github.com/WebAssembly/design/blob/master/Semantics.md)
- [Binary encoding](https://github.com/WebAssembly/design/blob/master/BinaryEncoding.md)

:::
:::


## With thanks

- [Meg Grasse](http://meggyg.me/), Apple
- [Jesse Tov](http://users.cs.northwestern.edu/~jesse/), Northwestern University
- [Nick Fitzgerald](http://fitzgeraldnick.com/), Mozilla
- [Jim Blandy](https://www.red-bean.com/~jimb/), Mozilla

## Talk to me on the internet

- Email: <slim@sarahlim.com>
- Twitter: [\@soylentqueen](http://twitter.com/soylentqueen)
- GitHub: <http://github.com/sarahlim/wasm-trace>


# Extra slides

Axes to grind

## A formal semantics from the start

- Binary code format...
- Represented as a language with syntax and structured control flow, rather than unrestricted jumps.

> Validation ensures that the module is well-defined and that <mark>its code cannot exhibit any undefined behavior</mark>. In particular, along with some runtime checks, this ensures that <mark>no program can access or corrupt memory it does not own</mark>.

## Typing rules for instructions

(Not intended for audience consumption)

![Typing rules for instructions](img/typing-instructions.png){width=80%}


## Typing rules for modules

(Still not intended for audience consumption)

![Typing rules for modules](img/typing-modules.png)


## This is actually impressive


::: columns
::: column

![Instructions](img/typing-instructions.png)
![Modules](img/typing-modules.png)


:::
::: column

- Looks scary :scream:

- But compare to JVM bytecode verification: 150 pages of the current spec ¯\\\_(ツ)_/¯


:::
:::



## Soundness


> Soundness proves that the reduction rules...actually cover all execution states that can arise for valid programs. In other words, it proves the absence of undefined behavior in the execution semantics.

- **Type safety:** no invalid calls, no illegal accesses to locals
- **Memory safety:** no buffer overflows, no dangling pointers; code and call stack are not accessible to the program

::: notes

- **Soundness:** you can only prove true things
    - Easy; just ensure your axioms are true and all inference rules preserve truth.
- **Completeness:** you can prove _all_ true things
    - Hard; you need strong enough axioms to model semantic truth. It's not obvious that this is even possible.

different formalizations for different purposes, e.g.,

- operational/computational semantics for execution
- axiomatic/declarative semantics for deductive reasoning

JS is nondeterministic:

- `for...in` iterates through enumerable properties in unspecified order
    - Defining a collection as an inductive relation captures non-determinism, but cannot be executed
    - Defining semantics as an eval function can be executed but not capture non-determinism

Daejun Park, Andrei Stefanescu, Grigore Rosu. KJS: A Complete Formal Semantics of JavaScript (PLDI '15).

:::
