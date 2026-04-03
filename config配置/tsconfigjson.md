好的，面试官您好！现在我来详细分析这份 TypeScript 配置文件（`tsconfig.json`），并探讨其各个配置项的作用、影响以及在实际项目中的应用。

**文件概述**

`tsconfig.json` 是 TypeScript 项目的配置文件，它告诉 TypeScript 编译器如何编译项目中的 TypeScript 代码。这份配置文件包含了大量的配置选项，用于控制编译过程的各个方面，例如：

*   语言特性
*   模块解析
*   类型检查
*   代码生成
*   与其他工具的集成

**配置项详解**

我将按照配置文件中的分组，逐一解释每个配置项的作用。

**1. `compilerOptions` (编译器选项)**

这是 `tsconfig.json` 文件中最重要的部分，它包含了大量的配置选项，用于控制 TypeScript 编译器的行为。

**1.1. `Projects` (项目)**

这一组配置选项与 TypeScript 的项目引用（project references）功能有关。项目引用允许你将一个大型的 TypeScript 项目拆分成多个更小的、可独立编译的项目，并通过 `references` 字段来指定项目之间的依赖关系。

*   **`incremental`: true,** (注释掉)
    *   启用增量编译。TypeScript 编译器会跟踪文件的变化，只重新编译发生变化的文件及其依赖的文件，从而加快编译速度。
    *   增量编译的信息会保存在 `.tsbuildinfo` 文件中。
*   **`composite`: true,** (注释掉)
    *   启用项目引用。
    *   当 `composite` 设置为 `true` 时，TypeScript 会将当前项目视为一个独立的编译单元，并生成相应的声明文件（`.d.ts`）和映射文件（`.d.ts.map`）。
    *   其他项目可以通过 `references` 字段来引用这个项目。
*   **`tsBuildInfoFile`: "./",** (注释掉)
    *   指定 `.tsbuildinfo` 文件的保存位置。
    *   `.tsbuildinfo` 文件用于存储增量编译的信息。
*   **`disableSourceOfProjectReferenceRedirect`: true,** (注释掉)
    *   禁用项目引用重定向到源文件。
    *   当引用一个复合项目时，TypeScript 默认会优先使用源文件（`.ts`），而不是声明文件（`.d.ts`）。
    *   禁用这个选项可以强制 TypeScript 使用声明文件。
*   **`disableSolutionSearching`: true,** (注释掉)
    *   禁用解决方案搜索。
    *   当在 VS Code 等编辑器中打开一个包含多个 TypeScript 项目的目录时，TypeScript 会自动搜索这些项目并建立项目之间的引用关系。
    *   禁用这个选项可以防止 TypeScript 自动加载其他项目。
*   **`disableReferencedProjectLoad`: true,** (注释掉)
    *   禁用自动加载引用的项目。
    *   当打开一个 TypeScript 项目时，TypeScript 会自动加载该项目引用的所有项目。
    *   禁用这个选项可以减少 TypeScript 自动加载的项目数量。

**1.2. `Language and Environment` (语言和环境)**

这一组配置选项控制 TypeScript 的语言特性和目标运行环境。

*   **`target`: "ES2017",**
    *   指定编译后的 JavaScript 代码的目标版本。
    *   `"ES2017"` 表示生成的代码将兼容 ECMAScript 2017 标准。
    *   常见的选项还包括：`"ES5"`, `"ES6"`, `"ES2018"`, `"ES2019"`, `"ES2020"`, `"ESNext"`。
*   **`lib`: \["dom", "esnext", "WebWorker"\],**
    *   指定一组库声明文件（`.d.ts`），用于描述目标运行环境。
    *   `"dom"`:  包含 DOM API 的声明，例如 `window`, `document` 等。
    *   `"esnext"`:  包含最新的 ECMAScript 特性的声明。
    *   `"WebWorker"`: 包含 Web Worker API 的声明。
    *   常见的选项还包括：`"es5"`, `"es6"`, `"es2015"`, `"es2016"`, `"es2017"`, `"es2018"`, `"es2019"`, `"es2020"`, `"dom.iterable"`, `"scripthost"` 等。
*   **`jsx`: "react",**
    *   指定如何处理 JSX 代码。
    *   `"react"`:  将 JSX 代码转换为 `React.createElement` 调用。
    *   其他选项：
        *   `"preserve"`:  保留 JSX 代码，不进行转换（通常用于与其他构建工具集成）。
        *   `"react-native"`:  用于 React Native 项目。
        *   `"react-jsx"`:  将 JSX 代码转换为 `_jsx` 调用（React 17+）。
        *   `"react-jsxdev"`:  与 `"react-jsx"` 类似，但用于开发环境。
*   **`experimentalDecorators`: true,** (注释掉)
    *   启用对装饰器（decorators）的实验性支持。
    *   装饰器是一种特殊的语法，可以用于修改类、方法、属性等的行为。
    *   注意：装饰器目前仍然是一个实验性特性。
*   **`emitDecoratorMetadata`: true,** (注释掉)
    *   启用为装饰器生成元数据。
    *   这通常与 `experimentalDecorators` 一起使用，用于依赖注入等场景。
*   **`jsxFactory`: "",** (注释掉)
    *   指定 JSX 工厂函数（当 `jsx` 为 `"react"` 时）。
    *   默认为 `React.createElement`。
*   **`jsxFragmentFactory`: "",** (注释掉)
    *   指定 JSX 片段工厂函数（当 `jsx` 为 `"react"` 时）。
    *   默认为 `React.Fragment`。
*   **`jsxImportSource`: "",** (注释掉)
    *   指定 JSX 工厂函数的导入源（当 `jsx` 为 `"react-jsx"` 或 `"react-jsxdev"` 时）。
    *   默认为 `"react"`。
*   **`reactNamespace`: "",** (注释掉)
    *   指定 `createElement` 调用的对象（当 `jsx` 为 `"react"` 时）。
    *   默认为 `"React"`。
*   **`noLib`: true,** (注释掉)
    *   禁用包含任何库文件，包括默认的 `lib.d.ts`。
    *   这通常用于非常特殊的情况，例如当你需要完全控制 TypeScript 使用的类型定义时。
*   **`useDefineForClassFields`: true,** (注释掉)
    *   使用 ECMAScript 标准的方式定义类字段。
    *   这会影响类字段的初始化行为，使其更符合规范。

**1.3. `Modules` (模块)**

这一组配置选项控制 TypeScript 如何解析模块。

*   **`module`: "esnext",**
    *   指定生成的模块代码的类型。
    *   `"esnext"`:  生成 ES 模块（使用 `import` 和 `export`）。
    *   常见的选项还包括：`"commonjs"`, `"amd"`, `"umd"`, `"system"`, `"es2015"`, `"es2020"`。
*   **`rootDir`: "./",** (注释掉)
    *   指定项目源代码的根目录。
    *   TypeScript 会根据 `rootDir` 来解析相对路径。
*   **`moduleResolution`: "node",**
    *   指定模块解析策略。
    *   `"node"`:  使用 Node.js 的模块解析算法。
    *   其他选项：`"classic"`（TypeScript 的旧版解析算法）。
*   **`baseUrl`: "./",**
    *   指定解析非相对模块名称的基准目录。
    *   例如，如果 `baseUrl` 设置为 `"./src"`，那么 `import "components/Button"` 会被解析为 `"./src/components/Button"`。
*   **`paths`: { "src/*": \["./src/*" ] },**
    *   配置模块路径映射。
    *   允许你为模块导入路径设置别名。
    *   例如，`"src/*": ["./src/*"]` 表示将 `import "src/components/Button"` 解析为 `"./src/components/Button"`。
        *   **与 `baseUrl` 的区别:**
            *   `baseUrl` 用于解析非相对模块名称。
            *   `paths` 用于重映射模块路径，可以用于相对和非相对模块名称。
    *   可以配置多个路径映射。
*   **`rootDirs`: \[],** (注释掉)
    *   允许将多个目录视为一个逻辑目录。
    *   这在某些特殊情况下很有用，例如当你需要将不同目录下的文件组织成一个逻辑模块时。
*   **`typeRoots`: \[],** (注释掉)
    *   指定类型声明文件（`.d.ts`）的查找目录。
    *   默认为 `["./node_modules/@types"]`。
*   **`types`: \[],** (注释掉)
    *   指定要包含的类型声明包的名称。
    *   例如，`"types": ["node", "jest"]` 表示只包含 `@types/node` 和 `@types/jest` 的类型声明。
*   **`allowUmdGlobalAccess`: true,** (注释掉)
    *   允许从模块中访问 UMD 全局变量。
*   **`resolveJsonModule`: true,** (注释掉)
    *   允许导入 `.json` 文件。
    *   导入的 JSON 文件会被转换为一个对象。
*   **`noResolve`: true,** (注释掉)
    *   禁止 `import`、`require` 或 `<reference>` 扩展 TypeScript 应该添加到项目中的文件数量。

**1.4. `JavaScript Support` (JavaScript 支持)**

这一组配置选项控制 TypeScript 如何处理 JavaScript 文件。

*   **`allowJs`: true,** (注释掉)
    *   允许 TypeScript 编译 JavaScript 文件。
    *   这使得你可以逐步将 JavaScript 项目迁移到 TypeScript。
*   **`checkJs`: false,**
    *   对 JavaScript 文件进行类型检查（当 `allowJs` 为 `true` 时）。
    *   TypeScript 会尝试推断 JavaScript 代码中的类型，并报告类型错误。
*   **`maxNodeModuleJsDepth`: 1,** (注释掉)
    *   指定检查 `node_modules` 中 JavaScript 文件的最大深度（当 `allowJs` 为 `true` 时）。

**1.5. `Emit` (代码生成)**

这一组配置选项控制 TypeScript 如何生成 JavaScript 代码、声明文件和 source map。

*   **`declaration`: true,** (注释掉)
    *   生成声明文件（`.d.ts`）。
    *   声明文件包含了 TypeScript 代码的类型信息，可以供其他 TypeScript 项目或 JavaScript 项目使用。
*   **`declarationMap`: true,** (注释掉)
    *   为声明文件生成 source map（`.d.ts.map`）。
    *   这使得你可以在调试时将声明文件映射回 TypeScript 源代码。
*   **`emitDeclarationOnly`: true,** (注释掉)
    *   只生成声明文件，不生成 JavaScript 代码。
*   **`sourceMap`: true,** (注释掉)
    *   生成 source map（`.js.map`）。
    *   source map 允许你在调试时将 JavaScript 代码映射回 TypeScript 源代码。
*   **`outFile`: "./",** (注释掉)
    *   将所有输出文件合并到一个 JavaScript 文件中。
    *   如果 `declaration` 为 `true`，则还会生成一个包含所有声明文件的文件。
    *   注意：`outFile` 不能与 `module: "esnext"` 或 `module: "es2015"` 等现代模块系统一起使用。
*   **`outDir`: "./",** (注释掉)
    *   指定输出文件的目录。
*   **`removeComments`: true,** (注释掉)
    *   从生成的 JavaScript 代码中移除注释。
*   **`noEmit`: true,** (注释掉)
    *   不生成任何输出文件（通常用于只进行类型检查）。
*   **`importHelpers`: true,** (注释掉)
    *   从 `tslib` 导入辅助函数（例如 `__extends`, `__assign` 等）。
    *   这可以减少生成的 JavaScript 代码的大小，因为辅助函数只需要导入一次，而不是在每个文件中都重复生成。
*   **`importsNotUsedAsValues`: "remove",** (注释掉)
    *   指定如何处理只用于类型的导入。
    *   `"remove"`:  移除只用于类型的导入。
    *   `"preserve"`:  保留只用于类型的导入。
    *   `"error"`:  如果存在只用于类型的导入，则报错。
*   **`downlevelIteration`: true,** (注释掉)
    *   为迭代器（例如 `for...of` 循环）生成更兼容但更冗长、性能较低的 JavaScript 代码。
    *   这在目标环境不支持原生迭代器时很有用。
*   **`sourceRoot`: "",** (注释掉)
    *   指定调试器查找 TypeScript 源文件的根路径。
*   **`mapRoot`: "",** (注释掉)
    *   指定调试器查找 source map 文件的位置，而不是生成的位置。
*   **`inlineSourceMap`: true,** (注释掉)
    *   将 source map 内嵌到生成的 JavaScript 文件中。
*   **`inlineSources`: true,** (注释掉)
    *   将 TypeScript 源代码内嵌到 source map 中。
*   **`emitBOM`: true,** (注释掉)
    *   在输出文件的开头添加 UTF-8 字节顺序标记（BOM）。
*   **`newLine`: "crlf",** (注释掉)
    *   指定生成文件中的换行符。
    *   `"crlf"`:  回车换行（Windows）。
    *   `"lf"`:  换行（Linux、macOS）。
*   **`stripInternal`: true,** (注释掉)
    *   禁止生成带有 `@internal` JSDoc 注释的声明。
*   **`noEmitHelpers`: true,** (注释掉)
    *   禁止生成自定义的辅助函数（例如 `__extends`）。
*   **`noEmitOnError`: true,** (注释掉)
    *   如果存在类型检查错误，则禁止生成输出文件。
*   **`preserveConstEnums`: true,** (注释掉)
    *   禁止在生成的代码中擦除 `const enum` 声明。
*   **`declarationDir`: "./",** (注释掉)
    *   指定生成的声明文件的输出目录。
*   **`preserveValueImports`: true,** (注释掉)
    *   保留 JavaScript 输出中未使用的导入值，否则将被删除。

**1.6. `Interop Constraints` (互操作约束)**

这一组配置选项控制 TypeScript 如何与其他 JavaScript 代码互操作。

*   **`isolatedModules`: true,** (注释掉)
    *   确保每个文件都可以被安全地转译，而无需依赖其他导入。
    *   这可以提高构建速度，并避免一些潜在的问题。
*   **`allowSyntheticDefaultImports`: true,** (注释掉)
    *   允许从没有默认导出的模块中导入默认导出（例如 `import x from "y"`）。
    *   这主要用于兼容 CommonJS 模块。
*   **`esModuleInterop`: true,**
    *   生成额外的 JavaScript 代码，以简化对 CommonJS 模块的导入。
    *   这会启用 `allowSyntheticDefaultImports`。
    *   建议开启此选项，以提高与 CommonJS 模块的兼容性。
*   **`preserveSymlinks`: true,** (注释掉)
    *   禁用将符号链接解析到其实际路径。
    *   这与 Node.js 中的 `--preserve-symlinks` 标志相对应。
*   **`forceConsistentCasingInFileNames`: true,**
    *   强制在导入中使用正确的大小写。
    *   这可以避免在不同操作系统上出现问题。

**1.7. `Type Checking` (类型检查)**

这一组配置选项控制 TypeScript 的类型检查的严格程度。

*   **`strict`: true,**
    *   启用所有严格的类型检查选项。
    *   建议开启此选项，以获得最佳的类型安全性。
    *   开启 `strict` 相当于同时开启了以下选项：
        *   `noImplicitAny`
        *   `noImplicitThis`
        *   `alwaysStrict`
        *   `strictBindCallApply`
        *   `strictNullChecks`
        *   `strictFunctionTypes`
        *   `strictPropertyInitialization`
*   **`noImplicitAny`: true,** (注释掉)
    *   禁止隐式的 `any` 类型。
    *   如果 TypeScript 无法推断出表达式或声明的类型，则会报错。
*   **`strictNullChecks`: true,** (注释掉)
    *   启用严格的 `null` 和 `undefined` 检查。
    *   `null` 和 `undefined` 将被视为不同的类型，不能赋值给其他类型（除非显式声明为可空类型）。
*   **`strictFunctionTypes`: true,** (注释掉)
    *   启用严格的函数类型检查。
    *   在赋值函数时，会检查参数和返回值的类型是否兼容。
*   **`strictBindCallApply`: true,** (注释掉)
    *   启用对 `bind`、`call` 和 `apply` 方法的严格类型检查。
    *   会检查这些方法的参数是否与原始函数的参数匹配。
*   **`strictPropertyInitialization`: true,** (注释掉)
    *   启用严格的属性初始化检查。
    *   会检查类中声明的属性是否在构造函数中被初始化。
*   **`noImplicitThis`: true,** (注释掉)
    *   禁止隐式的 `this` 类型为 `any`。
    *   如果 TypeScript 无法推断出 `this` 的类型，则会报错。
*   **`useUnknownInCatchVariables`: true,** (注释掉)
    *   将 `catch` 子句中的变量类型设置为 `unknown`，而不是 `any`。
    *   `unknown` 类型更安全，因为你必须在使用之前显式地检查或断言它的类型。
*   **`alwaysStrict`: true,** (注释掉)
    *   始终以严格模式解析代码，并在生成的 JavaScript 文件中添加 `"use strict"`。
*   **`noUnusedLocals`: true,**
    *   报告未使用的局部变量的错误。
    *   这有助于发现潜在的代码问题。
*   **`noUnusedParameters`: true,** (注释掉)
    *   报告未使用的函数参数的错误。
*   **`exactOptionalPropertyTypes`: true,** (注释掉)
    *   将可选属性类型视为精确的，而不是添加 `undefined`。
*   **`noImplicitReturns`: true,** (注释掉)
    *   报告函数中没有显式返回值的代码路径的错误。
*   **`noFallthroughCasesInSwitch`: true,** (注释掉)
    *   报告 `switch` 语句中 fallthrough case 的错误。
    *   这有助于避免意外的错误。
*   **`noUncheckedIndexedAccess`: true,** (注释掉)
    *   在索引签名结果中包含 `undefined`。
    *   这使得访问可能不存在的属性时更安全。
*   **`noImplicitOverride`: true,** (注释掉)
    *   确保派生类中重写成员时使用 `override` 修饰符。
*   **`noPropertyAccessFromIndexSignature`: true,** (注释掉)
    *   强制使用索引访问器来访问使用索引类型声明的键。
*   **`allowUnusedLabels`: false,**
    *   禁止未使用的标签。
    *   标签通常用于循环和 `switch` 语句，但未使用的标签可能会导致代码混乱。
*   **`allowUnreachableCode`: true,** (注释掉)
    *   允许不可达代码（不会影响程序行为，但可能表示存在逻辑错误）。

**1.8. `Completeness` (完整性)**

*   **`skipDefaultLibCheck`: true,** (注释掉)
    *   跳过对 TypeScript 包含的默认 `.d.ts` 文件的类型检查。
*   **`skipLibCheck`: true**
    *   跳过对所有 `.d.ts` 文件的类型检查。
    *   这可以加快编译速度，但可能会导致一些类型错误被忽略。

**2. `include`**

*   ```javascript
    "include": [
      "./src/**/*",
      "./gatsby-node.ts",
      "./gatsby-config.ts",
      "./plugins/**/*"
    ]
    ```
*   指定要编译的文件和目录。
*   `"./src/**/*"`:  包含 `src` 目录下的所有文件和子目录。
*   `"./gatsby-node.ts"`, `"./gatsby-config.ts"`:  包含根目录下的 `gatsby-node.ts` 和 `gatsby-config.ts` 文件（这两个文件是 Gatsby 项目的配置文件）。
*   `"./plugins/**/*"`:  包含 `plugins` 目录下的所有文件和子目录。

**总结与建议**

这份 `tsconfig.json` 文件配置了 TypeScript 编译器的各种选项，以满足项目的需求。以下是一些总结和建议：

*   **开启严格模式:**  `"strict": true` 开启了所有严格的类型检查选项，这有助于提高代码的质量和可维护性。
*   **配置模块解析:**  `"module": "esnext"` 和 `"moduleResolution": "node"` 启用了 ES 模块和 Node.js 的模块解析算法，这是现代 JavaScript 项目的常见配置。
*   **配置路径别名:**  `"paths"` 配置了路径别名，可以简化模块导入路径。
*   **跳过声明文件检查:**  `"skipLibCheck": true` 跳过了对声明文件的类型检查，可以加快编译速度。
*   **包含必要的文件:**  `"include"` 指定了要编译的文件和目录，确保 TypeScript 编译器能够找到所有需要编译的文件。
*    **代码检查：** 开启`noUnusedLocals`有助于发现潜在的问题
*   **根据项目需求调整配置:**  根据项目的具体需求，你可能需要调整 `tsconfig.json` 中的某些配置选项。例如：
    *   如果你的项目需要兼容旧版本的 JavaScript，你可能需要将 `"target"` 设置为 `"ES5"` 或 `"ES6"`。
    *   如果你的项目使用了装饰器，你需要启用 `"experimentalDecorators"` 和 `"emitDecoratorMetadata"` 选项。
    *   如果你的项目使用了 React Native，你需要将 `"jsx"` 设置为 `"react-native"`。

希望这次的解答足够详细！如果您还有其他问题，欢迎继续提问。
```js
{
  "compilerOptions": {
    /* Visit https://aka.ms/tsconfig.json to read more about this file */
    /* Projects */
    // "incremental": true,                              /* Enable incremental compilation */
    // "composite": true,                                /* Enable constraints that allow a TypeScript project to be used with project references. */
    // "tsBuildInfoFile": "./",                          /* Specify the folder for .tsbuildinfo incremental compilation files. */
    // "disableSourceOfProjectReferenceRedirect": true,  /* Disable preferring source files instead of declaration files when referencing composite projects */
    // "disableSolutionSearching": true,                 /* Opt a project out of multi-project reference checking when editing. */
    // "disableReferencedProjectLoad": true,             /* Reduce the number of projects loaded automatically by TypeScript. */
    /* Language and Environment */
    "target": "ES2017", /* Set the JavaScript language version for emitted JavaScript and include compatible library declarations. */
    "lib": [
      "dom",
      "esnext",
      "WebWorker"
    ], /* Specify a set of bundled library declaration files that describe the target runtime environment. */
    "jsx": "react", /* Specify what JSX code is generated. */
    // "experimentalDecorators": true,                   /* Enable experimental support for TC39 stage 2 draft decorators. */
    // "emitDecoratorMetadata": true,                    /* Emit design-type metadata for decorated declarations in source files. */
    // "jsxFactory": "",                                 /* Specify the JSX factory function used when targeting React JSX emit, e.g. 'React.createElement' or 'h' */
    // "jsxFragmentFactory": "",                         /* Specify the JSX Fragment reference used for fragments when targeting React JSX emit e.g. 'React.Fragment' or 'Fragment'. */
    // "jsxImportSource": "",                            /* Specify module specifier used to import the JSX factory functions when using `jsx: react-jsx*`.` */
    // "reactNamespace": "",                             /* Specify the object invoked for `createElement`. This only applies when targeting `react` JSX emit. */
    // "noLib": true,                                    /* Disable including any library files, including the default lib.d.ts. */
    // "useDefineForClassFields": true,                  /* Emit ECMAScript-standard-compliant class fields. */
    /* Modules */
    "module": "esnext", /* Specify what module code is generated. */
    // "rootDir": "./",                                  /* Specify the root folder within your source files. */
    "moduleResolution": "node", /* Specify how TypeScript looks up a file from a given module specifier. */
    "baseUrl": "./", /* Specify the base directory to resolve non-relative module names. */
    "paths": {
      "src/*": [
        "./src/*"
      ]
    }, /* Specify a set of entries that re-map imports to additional lookup locations. */
    // "rootDirs": [],                                   /* Allow multiple folders to be treated as one when resolving modules. */
    // "typeRoots": [],                                  /* Specify multiple folders that act like `./node_modules/@types`. */
    // "types": [],                                      /* Specify type package names to be included without being referenced in a source file. */
    // "allowUmdGlobalAccess": true,                     /* Allow accessing UMD globals from modules. */
    // "resolveJsonModule": true,                        /* Enable importing .json files */
    // "noResolve": true,                                /* Disallow `import`s, `require`s or `<reference>`s from expanding the number of files TypeScript should add to a project. */
    /* JavaScript Support */
    // "allowJs": true,                                  /* Allow JavaScript files to be a part of your program. Use the `checkJS` option to get errors from these files. */
    "checkJs": false, /* Enable error reporting in type-checked JavaScript files. */
    // "maxNodeModuleJsDepth": 1,                        /* Specify the maximum folder depth used for checking JavaScript files from `node_modules`. Only applicable with `allowJs`. */
    /* Emit */
    // "declaration": true,                              /* Generate .d.ts files from TypeScript and JavaScript files in your project. */
    // "declarationMap": true,                           /* Create sourcemaps for d.ts files. */
    // "emitDeclarationOnly": true,                      /* Only output d.ts files and not JavaScript files. */
    // "sourceMap": true,                                /* Create source map files for emitted JavaScript files. */
    // "outFile": "./",                                  /* Specify a file that bundles all outputs into one JavaScript file. If `declaration` is true, also designates a file that bundles all .d.ts output. */
    // "outDir": "./",                                   /* Specify an output folder for all emitted files. */
    // "removeComments": true,                           /* Disable emitting comments. */
    // "noEmit": true,                                   /* Disable emitting files from a compilation. */
    // "importHelpers": true,                            /* Allow importing helper functions from tslib once per project, instead of including them per-file. */
    // "importsNotUsedAsValues": "remove",               /* Specify emit/checking behavior for imports that are only used for types */
    // "downlevelIteration": true,                       /* Emit more compliant, but verbose and less performant JavaScript for iteration. */
    // "sourceRoot": "",                                 /* Specify the root path for debuggers to find the reference source code. */
    // "mapRoot": "",                                    /* Specify the location where debugger should locate map files instead of generated locations. */
    // "inlineSourceMap": true,                          /* Include sourcemap files inside the emitted JavaScript. */
    // "inlineSources": true,                            /* Include source code in the sourcemaps inside the emitted JavaScript. */
    // "emitBOM": true,                                  /* Emit a UTF-8 Byte Order Mark (BOM) in the beginning of output files. */
    // "newLine": "crlf",                                /* Set the newline character for emitting files. */
    // "stripInternal": true,                            /* Disable emitting declarations that have `@internal` in their JSDoc comments. */
    // "noEmitHelpers": true,                            /* Disable generating custom helper functions like `__extends` in compiled output. */
    // "noEmitOnError": true,                            /* Disable emitting files if any type checking errors are reported. */
    // "preserveConstEnums": true,                       /* Disable erasing `const enum` declarations in generated code. */
    // "declarationDir": "./",                           /* Specify the output directory for generated declaration files. */
    // "preserveValueImports": true,                     /* Preserve unused imported values in the JavaScript output that would otherwise be removed. */
    /* Interop Constraints */
    // "isolatedModules": true,                          /* Ensure that each file can be safely transpiled without relying on other imports. */
    // "allowSyntheticDefaultImports": true,             /* Allow 'import x from y' when a module doesn't have a default export. */
    "esModuleInterop": true, /* Emit additional JavaScript to ease support for importing CommonJS modules. This enables `allowSyntheticDefaultImports` for type compatibility. */
    // "preserveSymlinks": true,                         /* Disable resolving symlinks to their realpath. This correlates to the same flag in node. */
    "forceConsistentCasingInFileNames": true, /* Ensure that casing is correct in imports. */
    /* Type Checking */
    "strict": true, /* Enable all strict type-checking options. */
    // "noImplicitAny": true,                            /* Enable error reporting for expressions and declarations with an implied `any` type.. */
    // "strictNullChecks": true,                         /* When type checking, take into account `null` and `undefined`. */
    // "strictFunctionTypes": true,                      /* When assigning functions, check to ensure parameters and the return values are subtype-compatible. */
    // "strictBindCallApply": true,                      /* Check that the arguments for `bind`, `call`, and `apply` methods match the original function. */
    // "strictPropertyInitialization": true,             /* Check for class properties that are declared but not set in the constructor. */
    // "noImplicitThis": true,                           /* Enable error reporting when `this` is given the type `any`. */
    // "useUnknownInCatchVariables": true,               /* Type catch clause variables as 'unknown' instead of 'any'. */
    // "alwaysStrict": true,                             /* Ensure 'use strict' is always emitted. */
    "noUnusedLocals": true, /* Enable error reporting when a local variables aren't read. */
    // "noUnusedParameters": true,                       /* Raise an error when a function parameter isn't read */
    // "exactOptionalPropertyTypes": true,               /* Interpret optional property types as written, rather than adding 'undefined'. */
    // "noImplicitReturns": true,                        /* Enable error reporting for codepaths that do not explicitly return in a function. */
    // "noFallthroughCasesInSwitch": true,               /* Enable error reporting for fallthrough cases in switch statements. */
    // "noUncheckedIndexedAccess": true,                 /* Include 'undefined' in index signature results */
    // "noImplicitOverride": true,                       /* Ensure overriding members in derived classes are marked with an override modifier. */
    // "noPropertyAccessFromIndexSignature": true,       /* Enforces using indexed accessors for keys declared using an indexed type */
    "allowUnusedLabels": false, /* Disable error reporting for unused labels. */
    // "allowUnreachableCode": true,                     /* Disable error reporting for unreachable code. */
    /* Completeness */
    // "skipDefaultLibCheck": true,                      /* Skip type checking .d.ts files that are included with TypeScript. */
    "skipLibCheck": true /* Skip type checking all .d.ts files. */
  },
  "include": [
    "./src/**/*",
    "./gatsby-node.ts",
    "./gatsby-config.ts",
    "./plugins/**/*"
  ]
}
```
