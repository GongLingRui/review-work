```typescript
import { CONS_STATISTIC_TYPE } from 'src/common/cons/CommonCons';
import { StatisticalReportManager } from 'src/common/logic/StatisticalReportManager';
import { AppsDataTYPE } from 'src/templates/2dEditor/components/FrontApps/const'
import { ConsoleUtil } from './ConsoleUtil';

/**
 * 封装一个方法来测量事件处理函数的执行时间
 * @param callback 要测量的事件处理函数
 * @returns 一个新的函数，该函数在执行时会测量执行时间
 */
export const measureExecutionTime = (callback: (item?: any) => Promise<any>) => {
  return async (item?: any) => {
    const start = performance.now(); // 获取开始时间
    let value = '0'; // 默认失败
    let templateId = null;
    let type = null;

    try {
      const result = await callback(item); // 执行传入的回调函数，等待其完成
      value = result?.value || '0'; // 成功或失败
      templateId = result?.templateId; // 获取返回的 templateId
      type = result?.type; // 获取返回的 type
    } catch (error) {
      ConsoleUtil.error('error==:', error);
      return;
    }

    const end = performance.now(); // 获取结束时间
    const timeTaken = (end - start) / 1000; // 计算执行时间并转换为秒数

    const eventTypeMap = {
      [AppsDataTYPE['1']]: CONS_STATISTIC_TYPE.canvas_AIPortrait_click,
      [AppsDataTYPE['2']]: CONS_STATISTIC_TYPE.canvas_masterLand_click,
      [AppsDataTYPE['3']]: CONS_STATISTIC_TYPE.canvas_MasterPortrait_click,
      [AppsDataTYPE['4']]: CONS_STATISTIC_TYPE.canvas_PopArtMaker_click,
      [AppsDataTYPE['5']]: CONS_STATISTIC_TYPE.canvas_AIProductDesigner_click,
      [AppsDataTYPE['6']]: CONS_STATISTIC_TYPE.canvas_PetPortrait_click,
      [AppsDataTYPE['7']]: CONS_STATISTIC_TYPE.canvas_LineArt_click,
    };

    const eventType = eventTypeMap[type];
    if (eventType) {
      StatisticalReportManager.getInstance().addStatisticalEvent(
        eventType,
        value,
        {
          "template": templateId,
          "useTime": timeTaken
        }
      );
    }

  };
}
```

这段代码定义了一个名为 `measureExecutionTime` 的高阶函数，其主要目的是测量并记录一个异步事件处理函数（回调函数）的执行时间，并上报统计数据。下面是对代码的详细讲解：

**1.  导入模块：**

*   `import { CONS_STATISTIC_TYPE } from 'src/common/cons/CommonCons';`:  从 `'src/common/cons/CommonCons'` 文件中导入 `CONS_STATISTIC_TYPE`。  `CONS_STATISTIC_TYPE` 很可能是一个枚举或常量对象，定义了不同类型的统计事件。
*   `import { StatisticalReportManager } from 'src/common/logic/StatisticalReportManager';`: 从 `'src/common/logic/StatisticalReportManager'` 文件中导入 `StatisticalReportManager` 类。  `StatisticalReportManager` 应该是一个用于管理和上报统计数据的类。
*   `import { AppsDataTYPE } from 'src/templates/2dEditor/components/FrontApps/const';`:  从 `'src/templates/2dEditor/components/FrontApps/const'` 文件中导入 `AppsDataTYPE`。 `AppsDataTYPE` 可能是一个枚举或者常量对象，用于标识不同类型的应用或功能。
*    `import { ConsoleUtil } from './ConsoleUtil';`: 导入一个`ConsoleUtil`工具类,很可能封装了`console.log`, `console.error`等方法.

**2.  `measureExecutionTime` 函数：**

*   `export const measureExecutionTime = (callback: (item?: any) => Promise<any>) => { ... };`:  定义了一个名为 `measureExecutionTime` 的函数，并将其导出。
    *   `export`:  表示这个函数可以被其他模块导入和使用。
    *   `const`:  表示 `measureExecutionTime` 是一个常量，不能被重新赋值。
    *   `(callback: (item?: any) => Promise<any>)`:  `measureExecutionTime` 函数接受一个名为 `callback` 的参数。
        *   `callback`:  这是一个函数类型的参数，表示要测量的事件处理函数。
        *   `(item?: any)`:  `callback` 函数可以接受一个可选参数 `item`，类型为 `any`，表示任意类型。
        *   `=> Promise<any>`:  `callback` 函数返回一个 `Promise` 对象，`Promise` 的解析值可以是任意类型（`any`）。这表明 `callback` 是一个异步函数。
    *   `=> { ... }`:  `measureExecutionTime` 函数的返回值是一个新的异步函数。

**3.  返回的匿名异步函数：**

*   `return async (item?: any) => { ... };`:  `measureExecutionTime` 函数返回一个新的异步函数。
    *   `async`:  关键字表示这是一个异步函数，可以使用 `await` 关键字来等待 `Promise` 对象的结果。
    *   `(item?: any)`:  这个新的函数也接受一个可选参数 `item`，类型为 `any`。这个参数会被传递给 `callback` 函数。
    *   `=> { ... }`: 函数体。

**4.  函数体内部逻辑：**

*   `const start = performance.now();`:  获取当前时间戳（以毫秒为单位，精度更高），作为开始时间。`performance.now()` 提供比 `Date.now()` 更精确的时间测量。
*   `let value = '0';`: 初始化一个变量 `value`，默认值为字符串 `'0'`。  `value` 用于存储 `callback` 函数的执行结果（成功或失败的标识）。
*   `let templateId = null;`: 初始化一个变量 `templateId`，默认值为 `null`。 `templateId` 用于存储 `callback` 函数返回的模板 ID。
*   `let type = null;`: 初始化一个变量 `type`，默认值为 `null`。`type` 用于存储callback返回的类型。

*   **`try...catch` 块：**
    *   `try { ... }`:  尝试执行 `callback` 函数。
        *   `const result = await callback(item);`:  执行传入的 `callback` 函数，并将 `item` 作为参数传递给它。  `await` 关键字会等待 `callback` 函数返回的 `Promise` 对象解析完成。
        *   `value = result?.value || '0';`:  从 `result` 对象中获取 `value` 属性。如果 `result` 为 `null` 或 `undefined`，或者 `result.value` 为 `null` 或 `undefined`，则 `value` 的值为 `'0'`。  这里使用了可选链操作符 (`?.`) 和空值合并运算符 (`||`)。
        *   `templateId = result?.templateId;`:  从 `result` 对象中获取 `templateId` 属性。
        *   `type = result?.type;`:  从`result`中获取`type`属性.
    *   `catch (error) { ... }`:  如果 `callback` 函数执行过程中发生错误，则捕获错误。
        *    `ConsoleUtil.error('error==:', error);`:  打印错误信息。
        *   `return;`:  直接返回，不再执行后续的统计上报逻辑。

*   `const end = performance.now();`:  获取当前时间戳，作为结束时间。
*   `const timeTaken = (end - start) / 1000;`:  计算执行时间（以秒为单位）。

*   **`eventTypeMap` 对象：**
    ```typescript
    const eventTypeMap = {
      [AppsDataTYPE['1']]: CONS_STATISTIC_TYPE.canvas_AIPortrait_click,
      [AppsDataTYPE['2']]: CONS_STATISTIC_TYPE.canvas_masterLand_click,
      [AppsDataTYPE['3']]: CONS_STATISTIC_TYPE.canvas_MasterPortrait_click,
      [AppsDataTYPE['4']]: CONS_STATISTIC_TYPE.canvas_PopArtMaker_click,
      [AppsDataTYPE['5']]: CONS_STATISTIC_TYPE.canvas_AIProductDesigner_click,
      [AppsDataTYPE['6']]: CONS_STATISTIC_TYPE.canvas_PetPortrait_click,
      [AppsDataTYPE['7']]: CONS_STATISTIC_TYPE.canvas_LineArt_click,
    };
    ```
    *   这是一个映射表，将 `AppsDataTYPE` 中的不同类型映射到 `CONS_STATISTIC_TYPE` 中的不同统计事件类型。  例如，如果 `type` 的值为 `AppsDataTYPE['1']`，则对应的 `eventType` 为 `CONS_STATISTIC_TYPE.canvas_AIPortrait_click`。

*   `const eventType = eventTypeMap[type];`:  根据 `type` 值从 `eventTypeMap` 中获取对应的统计事件类型。
*    **`if (eventType)`**: 检查`eventType`是否有效
    *   `StatisticalReportManager.getInstance().addStatisticalEvent(eventType, value, { "template": templateId, "useTime": timeTaken });`:  调用 `StatisticalReportManager` 实例的 `addStatisticalEvent` 方法来上报统计数据。
        *   `eventType`:  统计事件类型。
        *   `value`:  事件的值（成功或失败）。
        *   `{ "template": templateId, "useTime": timeTaken }`:  一个包含额外信息的对象，包括模板 ID 和执行时间。

**总结：**

`measureExecutionTime` 函数是一个非常有用的工具函数，它通过高阶函数的方式，将性能测量和统计上报的逻辑与具体的事件处理函数解耦。  它能够：

1.  **测量执行时间：**  精确测量异步事件处理函数的执行时间。
2.  **处理错误：**  捕获并记录事件处理函数中的错误。
3.  **上报统计数据：**  将执行时间、结果、模板 ID 等信息上报给统计管理器。
4. **类型映射:** 通过`eventTypeMap`将事件处理函数的类型和统计类型对应起来.
5.  **代码复用：**  避免在每个事件处理函数中重复编写性能测量和统计上报的代码。
6.  **可读性和可维护性：**  使代码更清晰、更易于维护。

**如何使用：**

```typescript
import { measureExecutionTime } from './your-module'; // 导入 measureExecutionTime

// 假设有一个异步的事件处理函数
const myEventHandler = async (data) => {
  // 模拟一些异步操作
  await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
  // 返回一些结果
    return { value: '1', templateId: 'template_123', type: AppsDataTYPE['1'] };
};

// 使用 measureExecutionTime 包装 myEventHandler
const measuredEventHandler = measureExecutionTime(myEventHandler);

// 调用 measuredEventHandler，它会自动测量执行时间并上报统计数据
measuredEventHandler({ some: 'data' }); // 传入参数
```

通过这种方式，`myEventHandler` 函数的执行时间、结果和模板 ID 都会被自动测量和上报，而 `myEventHandler` 函数本身不需要包含任何与性能测量或统计上报相关的代码。
