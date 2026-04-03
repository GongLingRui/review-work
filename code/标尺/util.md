这段代码定义了一些用于绘制和处理图形的实用函数，主要用于在 HTML5 画布上绘制标尺、线段、文本、矩形和遮罩。以下是对每个函数的详细解读：

### 1. `getGap` 函数
```javascript
/**
 * 计算尺子子间距
 * @param zoom 缩放比例
 * @returns 返回计算出的尺子间距
 */
const getGap = (zoom: number) => {
  const zooms = [0.02, 0.05, 0.1, 0.2, 0.5, 2, 5, 10];
  const gaps = [1000, 250, 100, 50, 25, 10, 2.5, 1];

  let i = 0;
  while (i < zooms.length && zooms[i] < zoom) {
    i++;
  }

  return gaps[i - 1] || 1000;
};
```
`getGap` 函数根据给定的缩放比例 `zoom` 计算并返回适当的尺子间距。它使用两个数组 `zooms` 和 `gaps` 来定义不同缩放比例下的间距。通过遍历 `zooms` 数组找到合适的间距并返回。

### 2. `mergeLines` 函数
```javascript
/**
 * 线段合并
 * @param rect Rect数组
 * @param isHorizontal
 * @returns 合并后的Rect数组
 */
const mergeLines = (rect: Rect[], isHorizontal: boolean) => {
  const axis = isHorizontal ? 'left' : 'top';
  const length = isHorizontal ? 'width' : 'height';
  rect.sort((a, b) => a[axis] - b[axis]);
  const mergedLines = [];
  let currentLine = Object.assign({}, rect[0]);
  for (const item of rect) {
    const line = Object.assign({}, item);
    if (currentLine[axis] + currentLine[length] >= line[axis]) {
      currentLine[length] =
        Math.max(currentLine[axis] + currentLine[length], line[axis] + line[length]) -
        currentLine[axis];
    } else {
      mergedLines.push(currentLine);
      currentLine = Object.assign({}, line);
    }
  }
  mergedLines.push(currentLine);
  return mergedLines;
};
```
`mergeLines` 函数用于合并相交的线段。它接收一个 `Rect` 数组和一个布尔值 `isHorizontal`，表示线段是否为水平线。函数首先根据 `axis`（水平线为 'left'，垂直线为 'top'）对线段进行排序，然后遍历线段数组，合并相交的线段，最后返回合并后的线段数组。

### 3. `darwLine` 函数
```javascript
const darwLine = (
  ctx: CanvasRenderingContext2D,
  options: {
    left: number;
    top: number;
    width: number;
    height: number;
    stroke?: string | CanvasGradient | CanvasPattern;
    lineWidth?: number;
  }
) => {
  ctx.save();
  const { left, top, width, height, stroke, lineWidth } = options;
  ctx.beginPath();
  stroke && (ctx.strokeStyle = stroke);
  ctx.lineWidth = lineWidth ?? 1;
  ctx.moveTo(left, top);
  ctx.lineTo(left + width, top + height);
  ctx.stroke();
  ctx.restore();
};
```
`darwLine` 函数用于在画布上绘制一条线段。它接收一个 `CanvasRenderingContext2D` 对象和一些绘制选项（包括起点坐标、线段长度、颜色和线宽）。函数保存当前画布状态，设置绘制属性，绘制线段，然后恢复画布状态。

### 4. `darwText` 函数
```javascript
const darwText = (
  ctx: CanvasRenderingContext2D,
  options: {
    left: number;
    top: number;
    text: string;
    fill?: string | CanvasGradient | CanvasPattern;
    align?: CanvasTextAlign;
    angle?: number;
    fontSize?: number;
  }
) => {
  ctx.save();
  const { left, top, text, fill, align, angle, fontSize } = options;
  fill && (ctx.fillStyle = fill);
  ctx.textAlign = align ?? 'left';
  ctx.textBaseline = 'top';
  ctx.font = `${fontSize ?? 10}px sans-serif`;
  if (angle) {
    ctx.translate(left, top);
    ctx.rotate((Math.PI / 180) * angle);
    ctx.translate(-left, -top);
  }
  ctx.fillText(text, left, top);
  ctx.restore();
};
```
`darwText` 函数用于在画布上绘制文本。它接收一个 `CanvasRenderingContext2D` 对象和一些绘制选项（包括文本内容、位置、颜色、对齐方式、旋转角度和字体大小）。函数保存当前画布状态，设置绘制属性，绘制文本，然后恢复画布状态。

### 5. `darwRect` 函数
```javascript
const darwRect = (
  ctx: CanvasRenderingContext2D,
  options: {
    left: number;
    top: number;
    width: number;
    height: number;
    fill?: string | CanvasGradient | CanvasPattern;
    stroke?: string;
    strokeWidth?: number;
  }
) => {
  ctx.save();
  const { left, top, width, height, fill, stroke, strokeWidth } = options;
  ctx.beginPath();
  fill && (ctx.fillStyle = fill);
  ctx.rect(left, top, width, height);
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = strokeWidth ?? 1;
    ctx.stroke();
  }
  ctx.restore();
};
```
`darwRect` 函数用于在画布上绘制矩形。它接收一个 `CanvasRenderingContext2D` 对象和一些绘制选项（包括矩形位置、大小、填充颜色、边框颜色和边框宽度）。函数保存当前画布状态，设置绘制属性，绘制矩形，然后恢复画布状态。

### 6. `drawMask` 函数
```javascript
const drawMask = (
  ctx: CanvasRenderingContext2D,
  options: {
    isHorizontal: boolean;
    left: number;
    top: number;
    width: number;
    height: number;
    backgroundColor: string;
  }
) => {
  ctx.save();
  const { isHorizontal, left, top, width, height, backgroundColor } = options;
  try {
    const gradient = isHorizontal
      ? ctx.createLinearGradient(left, height / 2, left + width, height / 2)
      : ctx.createLinearGradient(width / 2, top, width / 2, height + top);
    const transparentColor = new fabric.Color(backgroundColor);
    transparentColor.setAlpha(0);
    gradient?.addColorStop(0, transparentColor.toRgba());
    gradient?.addColorStop(0.33, backgroundColor);
    gradient?.addColorStop(0.67, backgroundColor);
    gradient?.addColorStop(1, transparentColor.toRgba());
    darwRect(ctx, {
      left,
      top,
      width,
      height,
      fill: gradient,
    });
    ctx.restore();
  } catch (error) {
    ConsoleUtil.error('createLinearGradient error:', error);
  }
};
```
`drawMask` 函数用于在画布上绘制一个带有渐变效果的遮罩。它接收一个 `CanvasRenderingContext2D` 对象和一些绘制选项（包括遮罩位置、大小、背景颜色和方向）。函数创建一个线性渐变对象，根据方向设置渐变颜色，然后调用 `darwRect` 函数绘制矩形遮罩。如果创建渐变对象时发生错误，会记录错误信息。

### 总结
这段代码提供了一些实用函数，用于在 HTML5 画布上绘制标尺、线段、文本、矩形和遮罩。每个函数都接收一个 `CanvasRenderingContext2D` 对象和一些绘制选项，设置绘制属性，执行绘制操作，然后恢复画布状态。这些函数可以用于实现复杂的绘图功能，如绘制标尺、合并线段、绘制带有渐变效果的遮罩等。
