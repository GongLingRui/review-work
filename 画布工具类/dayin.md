这几个函数分别用于：

1.  **`getCylindricalIcon`:**  根据给定的上下直径和是否有把手，返回一组表示不同形状圆柱体（圆柱、锥形、梯形）的图标。
2.  **`getRotaryParams`:**  根据画布的宽度和高度，计算旋转打印所需的参数（如上下直径、水平禁止打印区域长度等）。
3.  **`getHorizontalProhibited`:**  计算旋转打印时，由于把手存在而导致的水平方向上单侧不可打印区域的长度。
4. **`fetchAndStorage`:** 尝试从IndexedDB中获取数据, 如果没有数据, 则从url中获取, 获取成功后将数据存入IndexedDB.

**`getCylindricalIcon` 函数:**

```typescript
export const getCylindricalIcon = (upperD: number, bottomD: number, hasHandle: boolean) => {
  let icons = [];

  if (upperD === bottomD) {
    // 圆柱
    if (hasHandle) {
      icons = [ic_column_l_h, ic_column_c, ic_column_r_h];
    } else {
      icons = [ic_column_l, ic_column_c, ic_column_r];
    }
  } else if (upperD > bottomD) {
    // 锥形
    if (hasHandle) {
      icons = [ic_cone_l_h, ic_cone_c, ic_cone_r_h];
    } else {
      icons = [ic_cone_l, ic_cone_c, ic_cone_r];
    }
  } else {
    // 梯形
    if (hasHandle) {
      icons = [ic_trapezoid_l_h, ic_trapezoid_c, ic_trapezoid_r_h];
    } else {
      icons = [ic_trapezoid_l, ic_trapezoid_c, ic_trapezoid_r];
    }
  }

  return icons;
}
```

*   **功能:**  根据输入的上下直径和是否有把手，返回一组表示不同形状圆柱体的图标资源（字符串，可能是图片路径或 base64 编码）。
*   **参数:**
    *   `upperD: number`:  上直径。
    *   `bottomD: number`:  下直径。
    *   `hasHandle: boolean`:  是否有把手。
*   **返回值:**  一个字符串数组，包含三个图标的资源（左、中、右）。
*   **逻辑:**
    *   使用 `if...else if...else` 语句根据上下直径的关系判断圆柱体的形状：
        *   `upperD === bottomD`:  圆柱。
        *   `upperD > bottomD`:  锥形（上大下小）。
        *   `upperD < bottomD`:  梯形（上小下大）。
    *   根据 `hasHandle` 的值，选择带把手或不带把手的图标。
    *   返回包含三个图标资源的数组。
    *   `ic_column_l_h`, `ic_column_c`等变量, 应该是全局变量, 值为图片的url。

**`getRotaryParams` 函数:**

```typescript
export const getRotaryParams = (width: number, height: number, handHeight?: number): RotaryParams => {
  let upperD = Math.round(StringUtil.pixelToMm(width, CanvasParams.canvas_dpi_def) / Math.PI);
  let bottomD = Math.round(StringUtil.pixelToMm(width, CanvasParams.canvas_dpi_def) / Math.PI);
  let r = upperD > bottomD ? upperD : bottomD;
  let horizontalProhibited = getHorizontalProhibited(r, handHeight ? handHeight : CanvasParams.canvas_handle_height_def);
  let ret: RotaryParams = {
    upperD: upperD,
    bottomD: bottomD,
    horizontalProhibited: horizontalProhibited,
    verticalRecommandedBlanklen: CanvasParams.verticalRecommandedBlanklen,
    cupHeight: Math.round(StringUtil.pixelToMm(height, CanvasParams.canvas_dpi_def)),
    hasHandle: false,
  }
  return ret;
}
```

*   **功能:**  计算旋转打印所需的参数。
*   **参数:**
    *   `width: number`:  画布的宽度（像素）。
    *   `height: number`:  画布的高度（像素）。
    *   `handHeight?: number`:  可选的把手高度（毫米）。如果未提供，则使用 `CanvasParams.canvas_handle_height_def`。
*   **返回值:**  一个 `RotaryParams` 对象，包含以下属性：
    *    `upperD`: 上直径(mm)。
    *    `bottomD`: 下直径(mm)。
    *    `horizontalProhibited`: 水平禁止打印长度(mm)。
    *   `verticalRecommandedBlanklen`: 垂直方向建议留白长度。
    *    `cupHeight`: 杯子高度(mm)。
    *   `hasHandle`:  是否有把手 (这里默认设置为 `false`，应该根据实际情况传入)。
*   **逻辑:**
    1.  **计算上下直径:**
        *   `StringUtil.pixelToMm(width, CanvasParams.canvas_dpi_def)`:  将画布宽度（像素）转换为毫米。
        *   ` / Math.PI`:  除以 π，得到直径。
        *    `Math.round(...)`:  四舍五入取整。
    2.  **计算半径:**
         * `let r = upperD > bottomD ? upperD : bottomD;`:  取上下直径中的较大值作为半径。
    3.  **计算水平禁止打印长度:**
        *   `getHorizontalProhibited(r, handHeight ? handHeight : CanvasParams.canvas_handle_height_def)`:  调用 `getHorizontalProhibited` 函数计算水平禁止打印长度。
    4.  **创建并返回 `RotaryParams` 对象:**
        *  `cupHeight`: 将画布高度(px)转为mm。

**`getHorizontalProhibited` 函数:**

```typescript
export const getHorizontalProhibited = (r: number, handleHeight: number) => {
  // 计算 cos(Θ)
  const cosTheta = r / (r + handleHeight);
  // 计算 Θ (弧度)
  const theta = Math.acos(cosTheta);
  // 计算单侧不可打印长度
  const prohibitedLength = r * theta;
  // 检查是否为整数，如果不是则保留一位小数
  if (Number.isInteger(prohibitedLength)) {
    return prohibitedLength;
  } else {
    return parseFloat(prohibitedLength.toFixed(1));
  }
}
```

*   **功能:**  计算由于把手存在而导致的水平方向上单侧不可打印区域的长度。
*   **参数:**
    *   `r: number`:  旋转体的半径（毫米）。
    *   `handleHeight: number`:  把手的高度（毫米）。
*   **返回值:**  单侧不可打印区域的长度（毫米）。
*   **逻辑:**
    1.  **计算 `cos(Θ)`:**
        *   `const cosTheta = r / (r + handleHeight);`:  根据几何关系，计算出夹角的余弦值。
    2.  **计算 `Θ` (弧度):**
        *   `const theta = Math.acos(cosTheta);`:  使用反余弦函数 (`Math.acos`) 计算出夹角（弧度）。
    3.  **计算单侧不可打印长度:**
        *   `const prohibitedLength = r * theta;`:  根据弧长公式 (弧长 = 半径 * 角度（弧度）) 计算出不可打印区域的长度。
    4.  **处理小数:**
        *    `if (Number.isInteger(prohibitedLength)) { ... } else { ... }`: 如果是整数则直接返回, 否则保留一位小数。

**`fetchAndStorage` 函数:**

```typescript
export const fetchAndStorage = async (storage: IndexedDBAk, key: string, url: string): Promise<ArrayBuffer> => {
  await storage.open();
  let arrayBuffer = await storage.get(key);
  if (!arrayBuffer) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok.');
    }
    arrayBuffer = await response.arrayBuffer();
    await storage.put(key, arrayBuffer);
  }
  return arrayBuffer;
}
```

*   **功能:**  首先尝试从 IndexedDB 中获取数据，如果 IndexedDB 中没有，则从指定的 URL 获取数据，并将获取到的数据存储到 IndexedDB 中。
*   **参数:**
    *   `storage: IndexedDBAk`:  IndexedDB 数据库对象 (假设 `IndexedDBAk` 是一个自定义的 IndexedDB 封装类)。
    *   `key: string`:  要获取的数据在 IndexedDB 中的键。
    *   `url: string`:  如果 IndexedDB 中没有数据，则从该 URL 获取数据。
*   **返回值:**  一个 Promise，解析后的值为 `ArrayBuffer` 类型的数据。
*   **逻辑:**
    1.  **`await storage.open();`:**  打开 IndexedDB 数据库。
    2.  **`let arrayBuffer = await storage.get(key);`:**  尝试从 IndexedDB 中获取数据。
    3.  **`if (!arrayBuffer) { ... }`:**  如果 IndexedDB 中没有数据：
        *   `const response = await fetch(url);`:  使用 `fetch` API 从 URL 获取数据。
        *   `if (!response.ok) { ... }`:  检查网络响应是否成功。如果失败，抛出错误。
        *   `arrayBuffer = await response.arrayBuffer();`:  将响应数据转换为 `ArrayBuffer`。
        *   `await storage.put(key, arrayBuffer);`:  将数据存储到 IndexedDB 中。
    4.  **`return arrayBuffer;`:**  返回数据。

**总结：**

*   `getCylindricalIcon`、`getRotaryParams` 和 `getHorizontalProhibited` 主要用于计算旋转打印相关的参数和获取图标资源。
*    `fetchAndStorage`是一个常用的缓存策略。

这几个函数在 2D 编辑器的旋转打印功能中起着重要作用。
