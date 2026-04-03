这段代码定义了一个名为 `CanvasRuler` 的类，用于在 `fabric.js` 画布上绘制标尺和辅助线。它还提供了一些方法来启用、禁用、显示、隐藏和清除辅助线。以下是对每个部分的详细解读：

### 1. 导入依赖
```javascript
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Canvas, Point, IEvent } from 'fabric/fabric-impl';
import { fabric } from 'fabric';
import { getGap, mergeLines, darwRect, darwText, darwLine, drawMask } from './utils';
import { throttle } from 'lodash-es';
import { setupGuideLine } from './guideline';
import StringUtil from 'src/common/utils/stringUtil';
import { CanvasParams } from 'src/templates/2dEditor/cons/2dEditorCons';
```
导入了一些依赖，包括 `fabric.js`、一些实用函数、`lodash-es` 的 `throttle` 函数、自定义的 `setupGuideLine` 函数和一些其他的工具类和常量。

### 2. 定义 `RulerOptions` 接口
```typescript
export interface RulerOptions {
  canvas: Canvas;
  ruleSize?: number;
  fontSize?: number;
  enabled?: boolean;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  highlightColor?: string;
}
```
定义了 `RulerOptions` 接口，用于配置标尺的选项，包括画布、标尺宽高、字体大小、是否启用标尺、背景颜色、文字颜色、边框颜色和高亮颜色。

### 3. 定义 `Rect` 和 `HighlightRect` 类型
```typescript
export type Rect = { left: number; top: number; width: number; height: number };

export type HighlightRect = {
  skip?: 'x' | 'y';
} & Rect;
```
定义了 `Rect` 类型，用于表示矩形区域。`HighlightRect` 类型继承自 `Rect`，并添加了一个可选的 `skip` 属性，用于跳过特定方向的绘制。

### 4. 定义 `CanvasRuler` 类
```typescript
class CanvasRuler {
  protected ctx: CanvasRenderingContext2D;
  public options: Required<RulerOptions>;
  public startCalibration: undefined | Point;
  private activeOn: 'down' | 'up' = 'up';
  private topOffset: number = 0;
  private objectRect: undefined | { x: HighlightRect[]; y: HighlightRect[] };
  private eventHandler: Record<string, (...args: any) => void> = {
    calcObjectRect: throttle(this.calcObjectRect.bind(this), 15),
    clearStatus: this.clearStatus.bind(this),
    canvasMouseDown: this.canvasMouseDown.bind(this),
    canvasMouseMove: throttle(this.canvasMouseMove.bind(this), 15),
    canvasMouseUp: this.canvasMouseUp.bind(this),
    render: (e: any) => {
      if (!e.ctx) return;
      this.render();
    },
  };
  private lastAttr: {
    status: 'out' | 'horizontal' | 'vertical';
    cursor: string | undefined;
    selection: boolean | undefined;
  } = {
    status: 'out',
    cursor: undefined,
    selection: undefined,
  };
  private tempGuidelLine: fabric.GuideLine | undefined;

  constructor(_options: RulerOptions) {
    this.options = Object.assign(
      {
        ruleSize: 20,
        fontSize: 10,
        enabled: false,
        backgroundColor: '#F7F7F7',
        borderColor: '#ddd',
        highlightColor: '#939393',
        textColor: '#888',
      },
      _options,
    );

    this.ctx = this.options.canvas.getContext();

    fabric.util.object.extend(this.options.canvas, {
      ruler: this,
    });

    setupGuideLine();

    if (this.options.enabled) {
      this.enable();
    }
  }
```
`CanvasRuler` 类的构造函数接收一个 `RulerOptions` 对象，并初始化一些属性。它还设置了画布的上下文，并调用 `setupGuideLine` 函数来设置辅助线。如果标尺启用，则调用 `enable` 方法。

### 5. 销毁方法
```typescript
public destroy() {
  this.disable();
}
```
`destroy` 方法用于销毁标尺，调用 `disable` 方法禁用标尺。

### 6. 清除、显示和隐藏辅助线的方法
```typescript
public clearGuideline() {
  this.options.canvas.remove(...this.options.canvas.getObjects(fabric.GuideLine.prototype.type));
}

public showGuideline() {
  this.options.canvas.getObjects(fabric.GuideLine.prototype.type).forEach((guideLine) => {
    guideLine.set('visible', true);
  });
  this.options.canvas.renderAll();
}

public hideGuideline() {
  this.options.canvas.getObjects(fabric.GuideLine.prototype.type).forEach((guideLine) => {
    guideLine.set('visible', false);
  });
  this.options.canvas.renderAll();
}
```
这些方法用于清除、显示和隐藏辅助线。

### 7. 设置起始点偏移值的方法
```typescript
public setTopOffset(value: number) {
  this.topOffset = value;
  this.render();
}
```
`setTopOffset` 方法用于设置标尺的起始点偏移值，并重新绘制标尺。

### 8. 启用和禁用标尺的方法
```typescript
public enable() {
  this.options.enabled = true;
  this.options.canvas.on('after:render', this.eventHandler.calcObjectRect);
  this.options.canvas.on('after:render', this.eventHandler.render);
  this.options.canvas.on('mouse:down', this.eventHandler.canvasMouseDown);
  this.options.canvas.on('mouse:move', this.eventHandler.canvasMouseMove);
  this.options.canvas.on('mouse:up', this.eventHandler.canvasMouseUp);
  this.options.canvas.on('selection:cleared', this.eventHandler.clearStatus);
  this.showGuideline();
  this.render();
}

public disable() {
  this.options.canvas.off('after:render', this.eventHandler.calcObjectRect);
  this.options.canvas.off('after:render', this.eventHandler.render);
  this.options.canvas.off('mouse:down', this.eventHandler.canvasMouseDown);
  this.options.canvas.off('mouse:move', this.eventHandler.canvasMouseMove);
  this.options.canvas.off('mouse:up', this.eventHandler.canvasMouseUp);
  this.options.canvas.off('selection:cleared', this.eventHandler.clearStatus);
  this.hideGuideline();
  this.options.enabled = false;
}
```
`enable` 方法用于启用标尺，绑定一些事件，并显示辅助线。`disable` 方法用于禁用标尺，解除事件绑定，并隐藏辅助线。

### 9. 绘制标尺的方法
```typescript
public render() {
  const vpt = this.options.canvas.viewportTransform;
  if (!vpt) return;
  this.draw({
    isHorizontal: true,
    rulerLength: this.getSize().width,
    startCalibration: this.startCalibration?.x ? this.startCalibration.x : -(vpt[4] / vpt[0]),
  });
  this.draw({
    isHorizontal: false,
    rulerLength: this.getSize().height,
    startCalibration: this.startCalibration?.y ? this.startCalibration.y : -(vpt[5] / vpt[3]),
  });
  drawMask(this.ctx, {
    isHorizontal: true,
    left: -10,
    top: -10,
    width: this.options.ruleSize * 2 + 10,
    height: this.options.ruleSize + 10,
    backgroundColor: this.options.backgroundColor,
  });
  drawMask(this.ctx, {
    isHorizontal: false,
    left: -10,
    top: -10,
    width: this.options.ruleSize + 10,
    height: this.options.ruleSize * 2 + 10,
    backgroundColor: this.options.backgroundColor,
  });
}
```
`render` 方法用于绘制标尺。它获取画布的视口变换，并调用 `draw` 方法绘制水平和垂直标尺。最后，绘制左上角的遮罩。

### 10. 获取画布尺寸和缩放的方法
```typescript
private getSize() {
  return {
    width: this.options.canvas.width ?? 0,
    height: this.options.canvas.height ?? 0,
  };
}

private getZoom() {
  return this.options.canvas.getZoom();
}
```
`getSize` 方法返回画布的宽高，`getZoom` 方法返回画布的缩放比例。

### 11. 绘制标尺的辅助方法
```typescript
private draw(opt: { isHorizontal: boolean; rulerLength: number; startCalibration: number }) {
  const { isHorizontal, rulerLength, startCalibration } = opt;
  const zoom = this.getZoom();
  const gap = getGap(zoom);
  const unitLength = rulerLength / zoom;
  const pixelGap = StringUtil.mmToPixel(gap, CanvasParams.canvas_dpi_def);
  const startValue = Math[startCalibration > 0 ? 'floor' : 'ceil'](startCalibration / pixelGap) * pixelGap;
  const startOffset = startValue - startCalibration;

  darwRect(this.ctx, {
    left: 0,
    top: this.topOffset,
    width: isHorizontal ? canvasSize.width : this.options.ruleSize,
    height: isHorizontal ? this.options.ruleSize : canvasSize.height,
    fill: this.options.backgroundColor,
    stroke: this.options.borderColor,
  });

  const textColor = new fabric.Color(this.options.textColor);
  for (let i = 0; i + startOffset <= Math.ceil(unitLength); i += pixelGap) {
    const position = (startOffset + i) * zoom;
    const textValue = Math.round(StringUtil.pixelToMm(startValue + i, CanvasParams.canvas_dpi_def)) + '';
    const textLength = (10 * textValue.length) / 4;
    const textX = isHorizontal
      ? position - textLength - 1
      : this.options.ruleSize / 2 - this.options.fontSize / 2 - 4;
    const textY = isHorizontal
      ? this.options.ruleSize / 2 - this.options.fontSize / 2 - 4 + this.topOffset
      : position + textLength;
    darwText(this.ctx, {
      text: textValue,
      left: textX,
      top: textY,
      fill: textColor.toRgb(),
      angle: isHorizontal ? 0 : -90,
    });
  }

  for (let j = 0; j + startOffset <= Math.ceil(unitLength); j += pixelGap) {
    const position = Math.round((startOffset + j) * zoom);
    const left = isHorizontal ? position : this.options.ruleSize - 8;
    const top = isHorizontal ? this.options.ruleSize - 8 + this.topOffset : position;
    const width = isHorizontal ? 0 : 8;
    const height = isHorizontal ? 8 : 0;
    darwLine(this.ctx, {
      left,
      top,
      width,
      height,
      stroke: textColor.toRgb(),
    });
  }

  if (this.objectRect) {
    const axis = isHorizontal ? 'x' : 'y';
    this.objectRect[axis].forEach((rect) => {
      if (rect.skip === axis) {
        return;
      }

      const roundFactor = (x: number) =>
        Math.round(StringUtil.pixelToMm(x / zoom + startCalibration, CanvasParams.canvas_dpi_def)) + '';
      const leftTextVal = roundFactor(isHorizontal ? rect.left : rect.top);
      const rightTextVal = roundFactor(isHorizontal ? rect.left + rect.width : rect.top + rect.height);

      const isSameText = leftTextVal === rightTextVal;

      const maskOpt = {
        isHorizontal,
        width: isHorizontal ? 160 : this.options.ruleSize - 8,
        height: isHorizontal ? this.options.ruleSize - 8 : 160,
        backgroundColor: this.options.backgroundColor,
      };
      drawMask(this.ctx, {
        ...maskOpt,
        left: isHorizontal ? rect.left - 80 : 0,
        top: isHorizontal ? this.topOffset : rect.top - 80,
      });
      if (!isSameText) {
        drawMask(this.ctx, {
          ...maskOpt,
          left: isHorizontal ? rect.width + rect.left - 80 : 0,
          top: isHorizontal ? this.topOffset : rect.height + rect.top - 80,
        });
      }

      const highlightColor = new fabric.Color(this.options.highlightColor);
      highlightColor.setAlpha(0.5);
      darwRect(this.ctx, {
        left: isHorizontal ? rect.left : this.options.ruleSize - 8,
        top: isHorizontal ? this.options.ruleSize - 8 + this.topOffset : rect.top,
        width: isHorizontal ? rect.width : 8,
        height: isHorizontal ? 8 : rect.height,
        fill: highlightColor.toRgba(),
      });

      const pad = this.options.ruleSize / 2 - this.options.fontSize / 2 - 4;
      const textOpt = {
        fill: highlightColor.toRgba(),
        angle: isHorizontal ? 0 : -90,
      };

      darwText(this.ctx, {
        ...textOpt,
        text: leftTextVal,
        left: isHorizontal ? rect.left - 2 : pad,
        top: isHorizontal ? pad + this.topOffset : rect.top - 2,
        align: isSameText ? 'center' : isHorizontal ? 'right' : 'left',
      });

      if (!isSameText) {
        darwText(this.ctx, {
          ...textOpt,
          text: rightTextVal,
          left: isHorizontal ? rect.left + rect.width + 2 : pad,
          top: isHorizontal ? pad + this.topOffset : rect.top + rect.height + 2,
          align: isHorizontal ? 'left' : 'right',
        });
      }

      const lineSize = isSameText ? 8 : 14;
      highlightColor.setAlpha(1);
      const lineOpt = {
        width: isHorizontal ? 0 : lineSize,
        height: isHorizontal ? lineSize : 0,
        stroke: highlightColor.toRgba(),
      };

      darwLine(this.ctx, {
        ...lineOpt,
        left: isHorizontal ? rect.left : this.options.ruleSize - lineSize,
        top: isHorizontal ? this.options.ruleSize - lineSize : rect.top,
      });

      if (!isSameText) {
        darwLine(this.ctx, {
          ...lineOpt,
          left: isHorizontal ? rect.left + rect.width : this.options.ruleSize - lineSize,
          top: isHorizontal ? this.options.ruleSize - lineSize : rect.top + rect.height,
        });
      }
    });
  }
}
```
`draw` 方法用于绘制标尺。它接收一个包含 `isHorizontal`、`rulerLength` 和 `startCalibration` 的对象作为参数。方法内部计算标尺的单位间隔和起始值，并绘制标尺的背景、文字和刻度线。如果有选中的对象，还会绘制高亮遮罩和辅助线。

### 12. 计算选中对象的矩形坐标
```typescript
private calcObjectRect() {
  const activeObjects = this.options.canvas.getActiveObjects();
  if (activeObjects.length === 0) return;
  const allRect = activeObjects.reduce((rects, obj: any) => {
    let left, top;
    if (obj.originX === 'center') {
      left = obj.left;
      top = obj.top;
      obj.set({
        originX: 'left',
        originY: 'top',
        left: obj.left - (obj.width / 2) * obj.scaleX,
        top: obj.top - (obj.height / 2) * obj.scaleY,
      });
    }
    const rect: HighlightRect = obj.getBoundingRect(false, true);
    if (obj.group) {
      const group = {
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        scaleX: 1,
        scaleY: 1,
        originX: 'left',
        originY: 'top',
        ...obj.group,
      };
      rect.width *= group.scaleX;
      rect.height *= group.scaleY;
      const groupCenterX = group.width / 2 + group.left;
      const objectOffsetFromCenterX = (group.width / 2 + (obj.left ?? 0)) * (1 - group.scaleX);
      rect.left += (groupCenterX - objectOffsetFromCenterX) * this.getZoom();
      const groupCenterY = group.height / 2 + group.top;
      const objectOffsetFromCenterY = (group.height / 2 + (obj.top ?? 0)) * (1 - group.scaleY);
      rect.top += (groupCenterY - objectOffsetFromCenterY) * this.getZoom();
    }
    if (obj instanceof fabric.GuideLine) {
      rect.skip = obj.isHorizontal() ? 'x' : 'y';
    }

    rects.push(rect);

    if (left || left == 0) {
      obj.set({
        originX: 'center',
        originY: 'center',
        left,
        top,
      });
    }
    return rects;
  }, [] as HighlightRect[]);
  if (allRect.length === 0) return;
  this.objectRect = {
    x: mergeLines(allRect, true),
    y: mergeLines(allRect, false),
  };
}
```
`calcObjectRect` 方法用于计算选中对象的矩形坐标。它遍历所有选中的对象，计算每个对象的边界矩形，并处理对象的分组和辅助线。最后，将所有矩形合并并存储在 `objectRect` 属性中。

### 13. 清除状态的方法
```typescript
private clearStatus() {
  this.objectRect = undefined;
}
```
`clearStatus` 方法用于清除选中对象的矩形坐标。

### 14. 判断鼠标是否在标尺上的方法
```typescript
public isPointOnRuler(point: Point) {
  if (
    new fabric.Rect({
      left: 0,
      top: 0,
      width: this.options.ruleSize,
      height: this.options.canvas.height,
    }).containsPoint(point)
  ) {
    return 'vertical';
  } else if (
    new fabric.Rect({
      left: 0,
      top: 0,
      width: this.options.canvas.width,
      height: this.options.ruleSize,
    }).containsPoint(point)
  ) {
    return 'horizontal';
  }
  return false;
}
```
`is
