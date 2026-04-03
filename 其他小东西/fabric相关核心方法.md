好的，这次整理的是 Fabric.js 的初始化、基本形状和对象的添加，以及各个形状/对象类的简介。

**1. 初始化 Fabric.js Canvas**

*   **HTML:**
    ```html
    <canvas id="canvas"></canvas>
    ```
    在 HTML 中创建一个 `<canvas>` 标签，并设置一个唯一的 `id`。

*   **JavaScript:**
    ```javascript
    const canvas = new fabric.Canvas(element: HTMLCanvasElement | string | null, options?: {...});
    ```
    *   `element`:  要挂载的 `<canvas>` 元素、元素的 `id` (字符串)，或者 `null`。
    *   `options`:  一个可选的对象，用于配置 canvas 的行为和外观。常用选项包括：
        *   `width`:  画布的宽度 (number)。
        *   `height`:  画布的高度 (number)。
        *   `preserveObjectStacking`:  选中时是否保持对象的堆叠顺序 (boolean)。
        *   `selectionBorderColor`:  选择边框颜色 (string)。
        *   `selectionColor`: 选择框背景色(string);

    初始化挂载完毕后，即可通过实例化变量 `canvas` 对画布进行交互。

**2. 添加基本形状和对象**

Fabric.js 提供了丰富的 API 来创建、修改和管理各种形状和对象。以下是 Fabric.js 中一些常见的形状和对象的介绍：

*   **`fabric.Rect` (矩形):**

    ```javascript
    const rect = new fabric.Rect({
      left: 100,     // x 位置
      top: 100,      // y 位置
      width: 200,    // 宽
      height: 100,   // 高
      stroke: 'black', // 边框颜色
      strokeWidth: 1,  // 边框大小
      fill: 'red',    // 背景色
      // ...
    });
    canvas.add(rect);
    ```

*   **`fabric.Circle` (圆形):**

    ```javascript
    const circle = new fabric.Circle({
      left: 300,
      top: 300,
      fill: 'blue',
      radius: 50, // 半径
      // ...
    });
    canvas.add(circle);
    ```

*   **`fabric.Ellipse` (椭圆):**

    ```javascript
    const ellipse = new fabric.Ellipse({
      left: 200,
      top: 100,
      fill: 'blue',
      rx: 50, // radius x
      ry: 25,  //radius y
      // ...
    });
    canvas.add(ellipse);
    ```

*   **`fabric.Polygon` (多边形):**

    ```javascript
    const polyline = new fabric.Polygon([
      { x: 10, y: 10 },
      { x: 50, y: 30 },
      { x: 40, y: 70 },
      { x: 60, y: 90 },
      { x: 100, y: 150 } // 连接点, 首尾点闭合;
     ],{
      left: 100,
      top: 100,
      stroke: 'green',
      strokeWidth: 1,
    // ...
    });
    canvas.add(polyline);
    ```

*   **`fabric.Polyline` (多边线):**

    ```javascript
        const points = [
          { x: 10, y: 10 },
          { x: 50, y: 30 },
          { x: 40, y: 70 },
          { x: 60, y: 90 },
          { x: 100, y: 150 } // 连接点, 首尾点不闭合;
        ]
        const polyline = new fabric.Polyline(points, {
          stroke: 'black',
          strokeWidth: 1,
        // ...
        });
        canvas.add(polyline);
    ```

*   **`fabric.Line` (直线):**

    ```javascript
    //[50,100,200,200] 分别代表 [x1,y1,x2,y2]
    const line = new fabric.Line([50, 100, 200, 200], {
      stroke: 'green',
      strokeWidth: 2,
      // ...
    });
    canvas.add(line);
    ```

*   **`fabric.Path` (路径):**

    ```javascript
    const path = new fabric.Path('M 0 0 L 200 100 L 170 200 z', {
      fill: 'red',    //填充颜色
      stroke: 'blue', //边框颜色
      strokeWidth: 1  //边框宽度
    });
    canvas.add(path);
    ```
*SVG:可缩放矢量图形|MDN*
*如上一章节所说, <path>元素是SVG基本形状中最强大的一个.你可以用它创建线条,曲线,弧形等等.*

    *   `M`:  移动到坐标 (0, 0)。
    *   `L`:  从当前点绘制一条直线到坐标 (200, 100)。
    *   `L`: 从当前点绘制一条直线到坐标 (170,200)
    *   `z`:  表示关闭路径，即绘制一条直线回到起点。
    *通过这种方式,可以使用`fabric.Path`创建任意复杂的形状*

*   **文本类:**
    *   `fabric.Text`: 用于绘制不可编辑文本
    *   `fabric.IText`: 用于绘制不可换行可编辑文本
    *   `fabric.Textbox`:  用于绘制可调整文本框、可编辑文本

    ```javascript
    const text = new fabric.Textbox('Text', {
      left: 100,
      top: 200,
      // ...
    });
    canvas.add(text); //Textbox 或者 IText 或者 Text
    ```

*   **`fabric.Image`:**  用于绘制位图 (jpg, jpeg, png, .webp, .gif ...)

---

**总结:**

这次整理的内容涵盖了 Fabric.js 的基本使用方法：如何初始化一个 Canvas，以及如何添加各种基本形状（矩形、圆形、椭圆、多边形、多边线、直线、路径）和文本、图像对象。  Fabric.js 通过这些类提供了丰富的图形绘制能力。
好的，这次整理的是 Fabric.js 中图像 (Image) 的加载、组 (Group) 和活动选择 (ActiveSelection) 的使用，以及画布和对象的交互事件、对象属性的修改、复制粘贴、层级调整和群组操作。

**1. `fabric.Image` (图像)**

```javascript
fabric.Image.fromURL('/path/to/your/image.jpg', function(img) {
  // 调整图像参数
  img.set({
    left: 100,
    top: 100
    // ...
  });
  // 将图像添加到画布
  canvas.add(img);
});
```

*   `fabric.Image.fromURL()`:  从 URL 异步加载图像。

**2. `fabric.Group` (组)**

```javascript
const group = new fabric.Group([rect, circle], {
  left: 200,
  top: 200
  // ...
});
canvas.add(group);
```

*   `new fabric.Group([object1, object2, ...])`:  创建一个包含多个对象的新组。  组内的对象可以作为一个整体进行移动、缩放、旋转等操作。

**3. `fabric.ActiveSelection` (活动选择)**

```javascript
//例如存在3个矩形对象 rect1, rect2, rect3
//添加到画布
canvas.add(rect1, rect2, rect3);
//选择多个对象
canvas.setActiveObject((new fabric.ActiveSelection([rect1, rect2, rect3])));
```

*   `new fabric.ActiveSelection([object1, object2, ...])`: 创建一个包含多个对象的活动选择。  活动选择类似于一个临时的组，允许同时操作多个对象，但不会改变对象的层级关系。
*   `canvas.setActiveObject()`:  将指定的对象（或 `ActiveSelection`）设置为活动对象。

**4. 画布和对象的交互**

*   **画布交互常用功能 (Canvas Events):**

    *   `object:added`:  向画布中添加新对象时触发
    *   `object:removed`:  删除画布中对象时触发
    *   `object:modified`:  当对象结束修改时触发
    *   `object:rotating`: 当对象旋转时触发
    *   `object:scaling`:  当对象进行缩放时触发
    *   `object:moving`:  当对象移动位置时触发
    *   `object:skewing`: 当对象倾斜变化时触发
    *   `selection:cleared`:  清除画布任意对象选中状态时触发
    *   `selection:updated`:  画布选中对象更改时触发
    *   `selection:created`: 选中画布对象时触发
    *   `mouse:down`:  监听鼠标点下事件
    *   `mouse:move`:  监听鼠标移动事件
    *   `mouse:up`:  监听鼠标松开事件
    *   `mouse:over`: 监听鼠标悬浮事件
    *   `mouse:dblclick`: 监听鼠标双击事件

    ```javascript
    canvas.on('object:modified', e => {
      // 回调参数e中包含监听事件中所需要的数据信息;
      console.log(e)
    });
    ```

*   **对象交互常用功能 (Object Events):**

    *   `event:removed`:  所监听对象被删除
    *   `event:selected`: 所监听对象激活选中
    *   `event:deselected`: 所监听对象选中状态失效
    *   `event:modified`:  所监听对象属性值修改后
    *   `event:rotating`:  所监听对象旋转时
    *   `event:rotated`:  所监听对象旋转后
    *   `event:scaling`:  所监听对象缩放时
    *   `event:scaled`:  所监听对象缩放后
    *   `event:moving`:  所监听对象位置移动时
    *   `event:moved`:  所监听对象位置移动后
    *   `event:skewing`: 所监听对象倾斜变化时
    *   `event:skewed`:  所监听对象倾斜变化后
    *   `event:mousedown`: 鼠标点下区域处在所监听对象上
    *   `event:mouseup`:  鼠标松开区域处在所监听对象上
    *   `event:mouseover`: 鼠标悬浮区域处在所监听对象上
    *   `event:mousedblclick`: 双击所监听对象
     ```typescript
    //其中`event:`无需加上;
     canvas.on('modified', e => {
      // 回调参数e中包含监听事件中所需要的数据信息;
      console.log(e)
    });
     ```

**5. 修改对象的参数或者状态**

```javascript
// 方式1:
object.set('xx', xx);

// 方式2:
object.set({
  'xx': 'xx',
  'xx': 'xx',
});
```

*   `object.set()`:  设置对象的属性。

**6. 复制与粘贴对象**
```typescript
let clipboard: fabric.Object | fabric.Object[];
//复制;
//使用clone方法;
object.clone((copyElement: fabric.Object) => {
    clipboard = copyElement;
},
//对象所需的自定义参数名称,以字符串形式
['test1','test2']
);
//粘贴;
canvas.add(clipboard);
```
*复制多个对象的情况下, clipboard的类型应该是`fabric.Object[]`, 粘贴时应该循环添加*
*   `object.clone()`:  复制对象。

**7. 改变对象层级**
```typescript
//将对象至于最高层级;
object.bringToFront(); 或者 canvas.bringToFront(object);
//将对象向上提高一个层级;
object.bringForward(); 或者 canvas.bringForward(object);
//将对象降至最低;
object.sendToBack(); 或者 canvas.sendToBack(object);
//将对象向下一个层级;
object.sendBackwards(); 或者 canvas.sendBackwards(object);
```
*多选时应循环调用或者群组后调用再解散等方式处理*

**8. 群组对象与解散群组**

```typescript
 // 群组:
 //画布存在多个选中对象时:
 let activeKlass = this.canvas.getActiveObject() as fabric.ActiveSelection;
 activeKlass.toGroup();
 //画布不存在选中对象时, 假使需要将rect和circle这两个对象进行群组并添加至画布:
 const group = new fabric.Group([rect, circle], {
   // ...
 });
 // 将该群组对象添加至画布
 canvas.add(group);

 // 解散群组:
 group.toActiveSelection();
```

*   `activeSelection.toGroup()`:  将活动选择转换为组。
*   `group.toActiveSelection()`: 将群组转换为活动选择.
---

**总结:**

这次整理的内容包括：

*   如何使用 `fabric.Image.fromURL` 加载图像。
*   如何使用 `fabric.Group` 创建对象组。
*   如何使用 `fabric.ActiveSelection` 创建活动选择。
*   Fabric.js 中画布和对象的常用交互事件。
*   如何使用 `object.set()` 修改对象属性。
*   如何使用 `object.clone()` 复制对象。
*   如何使用 `bringToFront`, `bringForward`, `sendToBack`, `sendBackwards` 调整对象层级。
*  如何使用`toGroup`与`toActiveSelection`进行群组与解散群组
这些是 Fabric.js 中进行对象操作和交互的基础。
好的，这次整理的是 Fabric.js 中对象的锁定与解锁、画布内容的保存与加载（JSON 和图像格式），以及几个常用的方法：`add()`, `remove()`, `addWithUpdate()`, `removeWithUpdate()`, 和 `set()`。

**1. 锁定与解锁对象**

```javascript
// 当都为true即解锁(默认), 当都为false为锁定;
object.set({
  selection: false,   // 是否可以选中: boolean;
  evented: false,     // 是否允许交互事件: boolean;
});
```

*   `selection`:  控制对象是否可以被选中。
*   `evented`:  控制对象是否响应事件（如鼠标点击、悬停等）。

**2. 保存和加载 canvas 内容**

*   **保存 canvas 内容**

    *   **导出为 JSON:**  可以将 canvas 的内容导出为 JSON 格式，这样可以方便地保存和传输。

        ```typescript
        const json = canvas.toJSON();
        // 介绍toJSON API:
        // toJSON(propertiesToIncludeopt)
        // 希望在输出中额外包含的任何属性, 以字符串数组形式, 如['custom_param', ...]
        // propertiesToIncludeArray<optional>
        // 输出的Fabric规则json如下:
        // objects中将包含画布中所有图层对象内容:
        // { objects: [{type: 'rect', top: 0, width: 100, ... }, { type: 'image', ... }] };
        ```
         将导出的JSON进行字符串序列化,便于保存
        ```
         const jsonString = JSON.stringify(json);
        ```
    *   **导出为图像:**  可以将 canvas 的内容导出为图像（例如 .png 格式）。

        ```typescript
        const dataURL = canvas.toDataURL('image/png');
        ```
        其中位图对象(type:'image')的src属性值为base64时, 可能会出现字符串过长的情况,可通过替换属性值为既定的唯一标识,加载时统一替换回.
        其中lumen 2D编辑器正是如此处理, 详见项目内方法`fillingJson()` (by Hash Zhu)

*   **加载 canvas 内容**

    *   **从 JSON 加载:** 如果已经保存了 canvas 的 JSON 数据，可以将其加载回 canvas。

        ```javascript
        const jsonString = "{ objects: [{type: 'rect', top: 0, width: 100, ... }, { type: 'ima......";
        const json = JSON.parse(jsonString);
        canvas.loadFromJSON(json, function() {
          // 渲染 canvas
          canvas.renderAll();
        });
        ```
        *loadFromJSON API简介*
        ```typescript
         loadFromJSON(json:string|object, callback:function, reviveropt?:function)
         //该API接收三个参数:
          1. json 以上介绍的保存画布信息的json字符串或者json对象;
          2. callback 回调函数, 在解析JSON并初始化相应对象时调用;
          3. reviveopt 用于进一步解析JSON元素, 在创建每个fabric对象后调用;
        ```
        目前2D编辑器项目使用到该API的模块有:
        ```
         1. 历史操作记录存储;
         2. 导入项目;
         3. 导入模板及模板文字;
        ```
         Tips:
         ```
          1.该API会将画布内已有所有对象清除后渲染, 如需在调用前保存某些对象,应提前保存于变量中,后在callback内进行处理
          2.如存在继承重写Fabric.js源码类或API, 在调用该API时应特别注意并在callback中进行处理,或重写该API.
         ```
**3. 常用方法介绍**

*   **`add()` 与 `remove()`**

    ```typescript
    const rect = new fabric.Rect(...);
    const circle = new fabric.Circle(...);
    canvas.add(rect); // 这样用
    canvas.add(rect, circle); // 也可以这样用
    canvas.add(rect).add(circle); // 也可以这样用
    // ...
    canvas.remove(rect); // 用法同上
    // ...
    canvas.renderAll();
    ```
     *一般情况下,添加或者删除后 配合`renderAll()`或`requestRenderAll()`使用*

    *   `add()`:  将一个或多个对象添加到画布 (canvas) 中。
    *   `remove()`: 用于从画布中移除一个对象.

*   **`addWithUpdate()` 与 `removeWithUpdate()`**

    `addWithUpdate` 和 `removeWithUpdate` 是 `fabric.Group` 类的方法，用于在更新组的同时添加或移除对象。
    *   `addWithUpdate()`:  用于将一个对象添加到组中，并更新组的边界和位置。
    *    `removeWithUpdate()`: 用于用于从组中移除一个对象，并更新组的边界和位置
    ```typescript
       const rect1 = new fabric.Rect(...);
       const rect2 = new fabric.Rect(...);
       const group = new fabric.Group([rect1]);
       canvas.add(group);
       // 添加新对象到组中, 并更新组
       group.addWithUpdate(rect2); // 这样用
       group.removeWithUpdate(rect1); // 这样用
       canvas.renderAll();
    ```

*   **`set()`**

    ```javascript
    const rect = new fabric.Rect(...);
    rect.set('width', 100); // 这样用
    rect.set({
      height: 100,
      scaleX: 1.5,
      scaleY: 1.5,
      left: 100,
      top: 100,
      angle: 360,
      // ...
      // or add some custom p
    }); // 也可以这样用
    rect.set('fill', 'black').set('strokeWidth', 2).set('stroke', 'white'); //也可以这样用
    canvas.renderAll();
    ```

    *   `set()`:  可以用来一次性设置一个或多个属性，适用于 Fabric.js 中的各种对象（如 Rect、Circle、Text 等）。
    *Tips*
      1. 通过`set()`设置对象的`angle`属性将以对象的左上点为轴旋转，如需以对象中心点旋转，使用`object.rotate(角度)`。
      2. 设置`left`和`top`默认以画布的左上(0,0)坐标点与对象的左上坐标点进行相对位移，如需以对象的中心点进行相对位移，可通过设置对象的`originX`和`originY`的属性值为`center`。
      3. 设置对象的`width`和`height`属性, 并不会如预期改变对象在画布上的大小,而是将作用于其控制框控件,应通过设置其`scaleX`与`scaleY`。

---

**总结:**

这次整理的内容包括：

*   如何锁定和解锁 Fabric.js 对象。
*   如何使用 `toJSON` 和 `toDataURL` 保存画布内容。
*   如何使用 `loadFromJSON` 从 JSON 加载画布内容。
*   `add()`, `remove()`, `addWithUpdate()`, `removeWithUpdate()`, 和 `set()` 方法的用法和注意事项。

这些是 Fabric.js 中进行对象管理、画布保存/加载和属性设置的关键方法。
好的，这次整理的是 Fabric.js 中的几个重要方法：`renderAll()`, `requestRenderAll()`, `getObjects()`, `getActiveObjects()`, `getActiveObject()`, 以及 `loadFromJSON()` 的重写和源码分析。

**1. `renderAll()` 与 `requestRenderAll()`**

*   **`renderAll()`:**
    *   立即重新渲染整个画布。这意味着它会遍历所有的对象并将它们绘制到 canvas 上。
    *   通常在对 canvas 做了一些修改后，需要立即看到效果时使用这个方法。
    *   会清除整个画布

*   **`requestRenderAll()`:**
    *   与 `renderAll` 类似，但不会立即进行渲染，而是请求在下一次浏览器的重绘周期中进行渲染。
    *   这通常用于优化性能，避免在短时间内多次调用 `renderAll` 导致的多次重绘。
    *   不会清除整个画布

*   **调用时机:**

    *   `renderAll`: 当需要立即看到修改效果时使用。例如，在一个事件处理函数中修改了对象的属性，并希望立即看到变化。
    *   `requestRenderAll`: 当你在短时间内进行多次修改时使用，以避免多次重绘。例如，你在一个循环中对多个对象进行修改，可以使用 `requestRenderAll` 来减少重绘次数，提高性能。

*   **示例:**

    ```javascript
    // 添加一个矩形
    canvas.add(rect);
    // 立即渲染
    canvas.renderAll();

    // 修改多个对象属性
    for (let i = 0; i < 100; i++) {
      canvas.getObjects()[i].set('fill', 'red');
    }
    // 推迟到下一个重绘周期再重绘（性能较好）
    canvas.requestRenderAll();
    ```
    在这个示例中, renderAll 会立即渲染画布,而requestRenderAll 会在下一次浏览器重绘周期中进行渲染。这样可以避免在短时间内多次调用 renderAll 导致的性能问题(交互表现是卡顿)

*   **Tips:**

    在计算机图形学和网页开发中，重绘周期（或称为刷新周期、绘制周期）是指浏览器或绘图引擎对屏幕上的内容进行更新和重新绘制的时间间隔。通常，这个周期与显示器的刷新率相关联。例如，如果显示器的刷新率是 60Hz，那么重绘周期大约是每 16.67 毫秒（1000 毫秒 / 60）。

**2. `getObjects(typeopt?: string)`**

*   **用途:** 获取画布中的所有对象，或者根据类型获取特定类型的对象。
*   **参数:**
    *   `type` (可选): 一个字符串，表示要获取的对象类型。例如，如果你只想获取所有的矩形对象，可以传入 `rect`。如果不传入参数，则返回所有对象。
*   **用法:**
    ```javascript
        const allObject = canvas.getObjects();
        const allImageObject = canvas.getObjects('image');
    ```
* Tips:
    1. `typeopt`传参类型为Fabric.js中对象的所类型,包含以上基本形状与复杂对象的类型名称(字母小写);
    2. 以上`loadFromJSON` Tips中提及及"保存某些对象"的情况可使用该API获取保存;

**3. `getActiveObjects()`**

*   **用途:** 获取当前选中的所有对象，返回一个数组，数组内包含所有选中的对象。

    ```javascript
    const activeObjects = canvas.getActiveObjects();
    ```

**4. `getActiveObject()`**

*   **用途:**  获取当前被选中的对象。 在 Fabric.js 中，用户可以通过鼠标点击或拖动来选择画布上的对象。
    *   `getActiveObject()` 方法返回当前被选中的对象，如果没有对象被选中，则返回 `null`。
    *   所返回的对象类型为以上`复杂对象`所述的`ActiveSelection`类型, 该类型虽承自`fabric.Group`, 但不同点为是一种临时的分组方式，主要用于临时编辑, 例如说将选中的多个对象进行群组, 批量操作进行复制删除等等.

    ```typescript
    const activeObject = canvas.getActiveObject();
    // 1. duplicate(复制并粘贴)
    activeObject.clone((clonedObj) => {
     canvas.add(clonedObj)
    });

    // 2. 批量改变属性
    activeObject.set('xx', xx);

    // 3. 群组
    activeObject.toGroup();

    // ....
    ```

**5. `loadFromJSON()` 重写与源码分析**

*   **使用该API需要注意事项事项是需要确保你JSON字符串的格式是正确的, 否则将可能导致报错并加载失败**
```typescript
 //一般情况下, 通过toJSON()导出的JSON格式大致如下:
  {
   "version": "4.5.0", // fabric.js 版本号
   "objects": [ // 画布上的对象数组
    {
     "type": "rect",
     // ...其他对象属性
    }
    // ...其他对象属性
   ],
  // ...
  }
```
*   **项目重写代码位置:** `lumen/src/templates/2dEditor/core/plugin/OverwritePlugin/extension/loadFromJSON.ts`

    ```typescript
    // 重写方法
    fabric.Canvas.prototype.loadFromJSON = function(/* 重写所需参数+ */) {
      return new Promise((resolve, reject) => {
        // 可在该位置加上符合需求的逻辑;
        resolve(/* ... */)
      })
    }
    ```

*   **`fabric.js loadFromJSON` source code:**
```typescript
    loadFromJSON: function (json, callback, reviver) {
       if (!json) {
         return;
       }
       // serialize if it wasn't already
       var serialized = typeof json === 'string'
         ? JSON.parse(json)
         : fabric.util.object.clone(json);
       var _this = this,
           clipPath = serialized.clipPath,
           renderOnAddRemove = this.renderOnAddRemove;
       this.renderOnAddRemove = false;
       delete serialized.clipPath;
       this._enlivenObjects(serialized.objects, function (enlivenedObjects) {
         _this.clear();
         _this._setBgOverlay(serialized, function () {
           if (clipPath) {
             _this._enlivenObjects([clipPath], function (enlivenedCanvasClip) {
               _this.clipPath = enlivenedCanvasClip[0];
               _this._setupCanvas.call(_this, serialized, enlivenedObjects, renderOnAddRemove);
               callback && callback();
             });
           }
           else {
             _this._setupCanvas.call(_this, serialized, enlivenedObjects, renderOnAddRemove);
             callback && callback();
           }
         });
       }, reviver);
       return this;
     },
```
---
**总结**
这次整理了关于画布渲染,对象获取以及`loadFromJSON`的重写与源码分析
