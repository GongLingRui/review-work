Fabric.js 的 `fabric.util` 对象提供了一系列实用的工具函数，涵盖了数学计算、动画处理、DOM 操作、对象操作、事件处理、图像处理等多个方面。下面是对 `fabric.util` 中所有方法的详细介绍（基于 Fabric.js 5.x 版本，部分方法在不同版本中可能略有差异）：

**1. 数组操作 (Array)**

*   **`fabric.util.array.min(array, byProperty)`**: 找出数组中的最小值。`byProperty` 是可选的，如果提供，则根据对象的指定属性值来比较。
*   **`fabric.util.array.max(array, byProperty)`**: 找出数组中的最大值。`byProperty` 用法同上。
*   **`fabric.util.array.invoke(array, methodName, ...args)`**: 对数组中的每个元素调用指定的方法。`methodName` 是方法名，`...args` 是传递给方法的参数。

**2. 动画 (Animation)**

*   **`fabric.util.animate(options)`**: 创建一个动画。`options` 对象包含以下属性：
    *   `startValue`: 动画起始值。
    *   `endValue`: 动画结束值。
    *   `duration`: 动画持续时间（毫秒）。
    *   `onChange`: 每帧变化时的回调函数，接收当前值作为参数。
    *   `onComplete`: 动画完成时的回调函数。
    *   `easing`: 缓动函数，控制动画的速度变化。Fabric.js 内置了多种缓动函数（见下文）。
*   **`fabric.util.requestAnimFrame(callback, element)`**: 请求动画帧。`callback` 是在下一帧渲染时执行的回调函数。`element` 是可选的，用于指定动画的参考元素（通常是 canvas 元素）。这是比 `requestAnimationFrame` 更推荐的方式，因为它在 Fabric.js 内部做了兼容性处理。
*   **`fabric.util.cancelAnimFrame(request)`**: 取消由 `requestAnimFrame` 发起的动画帧请求。

**3. 缓动函数 (Easing)**

Fabric.js 提供了丰富的缓动函数，用于 `fabric.util.animate` 的 `easing` 属性。这些函数都接收一个介于 0 和 1 之间的值（表示动画的进度），并返回一个经过缓动计算后的值。

*   `fabric.util.ease.easeInQuad`, `fabric.util.ease.easeOutQuad`, `fabric.util.ease.easeInOutQuad`
*   `fabric.util.ease.easeInCubic`, `fabric.util.ease.easeOutCubic`, `fabric.util.ease.easeInOutCubic`
*   `fabric.util.ease.easeInQuart`, `fabric.util.ease.easeOutQuart`, `fabric.util.ease.easeInOutQuart`
*   `fabric.util.ease.easeInQuint`, `fabric.util.ease.easeOutQuint`, `fabric.util.ease.easeInOutQuint`
*   `fabric.util.ease.easeInSine`, `fabric.util.ease.easeOutSine`, `fabric.util.ease.easeInOutSine`
*   `fabric.util.ease.easeInExpo`, `fabric.util.ease.easeOutExpo`, `fabric.util.ease.easeInOutExpo`
*   `fabric.util.ease.easeInCirc`, `fabric.util.ease.easeOutCirc`, `fabric.util.ease.easeInOutCirc`
*   `fabric.util.ease.easeInElastic`, `fabric.util.ease.easeOutElastic`, `fabric.util.ease.easeInOutElastic`
*   `fabric.util.ease.easeInBack`, `fabric.util.ease.easeOutBack`, `fabric.util.ease.easeInOutBack`
*   `fabric.util.ease.easeInBounce`, `fabric.util.ease.easeOutBounce`, `fabric.util.ease.easeInOutBounce`

**4. 类 (Class)**

*   **`fabric.util.createClass(parent, properties)`**: 创建一个类。`parent` 是可选的父类，`properties` 是一个对象，包含类的属性和方法。
*   **`fabric.util.mixin(destination, source)`**: 将 `source` 对象的属性混合到 `destination` 对象中。

**5.颜色 (Color)**

*   **`fabric.util.stringToColor(colorString)`**：将各种格式的颜色字符串（如十六进制、rgb、rgba、hsl、hsla）转换为 `fabric.Color` 对象。
*   **`fabric.util.color.toRgb(color)`**: 将颜色转换为 RGB 格式的字符串。
*   **`fabric.util.color.toRgba(color, opacity)`**: 将颜色转换为 RGBA 格式的字符串。
*   **`fabric.util.color.toHsl(color)`**: 将颜色转换为 HSL 格式的字符串。
*   **`fabric.util.color.toHsla(color, opacity)`**: 将颜色转换为 HSLA 格式的字符串。
*   **`fabric.util.color.toHex(color)`**: 将颜色转换为十六进制格式的字符串。
*   **`fabric.util.color.sourceFromHex(hexColor)`**:从十六进制的颜色中获取[R,G,B,alpha]的数组
*   **`fabric.util.color.sourceFromRgb(rgbColor)`**:从rgb的颜色中获取[R,G,B,alpha]的数组
*   **`fabric.util.color.sourceFromHsl(hslColor)`**:从hsl的颜色中获取[R,G,B,alpha]的数组
*   **`fabric.util.removeFromArray(array, value)`**: 从数组中移除指定的元素。

**6. DOM 操作 (Dom)**

*   **`fabric.util.getById(id)`**: 通过 ID 获取 DOM 元素。相当于 `document.getElementById`。
*   **`fabric.util.getElementOffset(element)`**: 获取元素相对于文档左上角的偏移量（top, left）。
*   **`fabric.util.getNodeCanvas(element)`**: 获取元素所在的 canvas 元素。
*   **`fabric.util.cleanUpJsdomNode(element)`**: 清理 JSDOM 环境下的节点。
*   **`fabric.util.isHTMLCanvas(element)`**: 判断一个元素是否是 HTMLCanvasElement。
*   **`fabric.util.setImageSmoothing(ctx, value)`**: 设置 canvas 上下文的图像平滑属性。`value` 为 `true` 或 `false`。
*   **`fabric.util.setStyle(element, styles)`**: 设置元素的 CSS 样式。`styles` 是一个对象，键值对表示样式属性和值。
*   **`fabric.util.setAttributes(element, attributes)`**:设置dom元素的各种属性,第二个参数是一个对象.
*   **`fabric.util.makeElement(tagName, attributes)`**:创建dom元素

**7. 事件 (Event)**

*   **`fabric.util.addListener(element, eventName, handler)`**: 添加事件监听器。
*   **`fabric.util.removeListener(element, eventName, handler)`**: 移除事件监听器。
*   **`fabric.util.getPointer(event, element)`**: 获取鼠标指针相对于指定元素的坐标。

**8. 函数 (Function)**

*   **`fabric.util.createAccessors(klass)`**: 为类创建属性的 getter 和 setter 方法。
*   **`fabric.util.wrapFunction(originalFn, newFn, context)`**包装一个函数。

**9. 几何 (Geometry)**

*   **`fabric.util.intersectLineLine(a1, a2, b1, b2)`**: 检测两条线段是否相交。
*   **`fabric.util.intersectLinePolygon(a1, a2, points)`**: 检测线段是否与多边形相交。
*   **`fabric.util.isPointInPolygon(point, points)`**: 判断点是否在多边形内。
*   **`fabric.util.transformPoint(point, transform, invert)`**: 对点应用变换矩阵。`transform` 是一个 2x3 的变换矩阵。`invert` 为 `true` 时应用逆变换。
*   **`fabric.util.rotatePoint(point, origin, radians)`**: 将点绕原点旋转指定弧度。
*   **`fabric.util.degreesToRadians(degrees)`**: 将角度转换为弧度。
*   **`fabric.util.radiansToDegrees(radians)`**: 将弧度转换为角度。

**10. 图像 (Image)**

*   **`fabric.util.loadImage(url, callback, context, options)`**: 加载图像。`callback` 是加载完成后的回调函数，接收 Image 对象作为参数。`context` 是回调函数的上下文。`options` 可选, 常用的有 `options.crossOrigin`.
*   **`fabric.util.enlivenObjects(objects, callback, namespace, reviver)`**: 将 JSON 数据反序列化为 Fabric.js 对象。`callback` 是反序列化完成后的回调函数。`namespace`指定命名空间,`reviver`是进一步处理的函数.
*  **`fabric.util.enlivenPatterns(patterns, callback)`**: 异步地将一组填充模式（patterns）的 JSON 数据反序列化为 Fabric.js 的 `fabric.Pattern` 对象。
*   **`fabric.util.groupSVGElements(elements, options, path)`**: 将一组 SVG 元素组合成一个 Fabric.js 组对象。
*   **`fabric.util.populateWithProperties(source, destination, properties)`**: 将 `source` 对象的指定属性复制到 `destination` 对象。
*   **`fabric.util.createCanvasElement()`**:创建一个canvas dom
*   **`fabric.util.copyCanvasElement(canvas)`**:复制一个canvas dom
*   **`fabric.util.toDataURL(canvasEl, format, quality)`**:将canvas导出成base64的图片

**11. 数学 (Misc)**

*   **`fabric.util.cos(angle)`**: 计算余弦值。
*   **`fabric.util.sin(angle)`**: 计算正弦值。
*   **`fabric.util.drawDashedLine(ctx, x, y, x2, y2, da)`**: 绘制虚线。
*   **`fabric.util.toFixed(number, fractionDigits)`**: 将数字格式化为指定小数位数的字符串。
* **`fabric.util.qrDecompose(matrix)`**: QR 分解
* **`fabric.util.qrDecompose(a)`**: 对矩阵进行 QR 分解, 得到旋转, 缩放等信息.
* **`fabric.util.composeMatrix(options)`**: 从平移, 旋转, 缩放等参数来构建一个形变矩阵.
* **`fabric.util.calcRotateMatrix(options)`**:计算旋转矩阵

**12. 对象 (Object)**

*   **`fabric.util.object.extend(destination, source, deep)`**: 扩展对象。将 `source` 对象的属性复制到 `destination` 对象。`deep` 为 `true` 时执行深拷贝。
*   **`fabric.util.object.clone(object, deep)`**: 克隆对象。`deep` 为 `true` 时执行深拷贝。
*    **`fabric.util.sizeOf(object)`**:计算对象占用的字节数

**13. 字符串 (String)**
*  **`fabric.util.string.camelize(string)`**: 转成驼峰。
*   **`fabric.util.string.capitalize(string, firstLetterOnly)`**:首字母大写, `firstLetterOnly`为true时,只大写首字母,其它会变成小写.
*  **`fabric.util.string.escapeXml(string)`**: xml转义

**14. SVG**

*   **`fabric.util.parseTransformAttribute(attributeValue)`**:解析SVG的transform属性

**15. TypeScript**

*   **`fabric.util.getKlass(type, namespace)`**:根据type字符串获取对应的类
*   **`fabric.util.resolveNamespace(namespace)`**: 解析命名空间字符串（如 `'fabric.Image'`）并返回对应的对象。

这就是 `fabric.util` 中所有主要方法的详细介绍。这些工具函数在开发 Fabric.js 应用时非常有用，可以简化很多常见的操作。建议在需要时查阅 Fabric.js 的官方文档，以获取最新、最准确的信息。
