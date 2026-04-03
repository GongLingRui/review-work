以下是代码中涉及的主要 Fabric.js API 及其详解，按功能分类说明：

---

### 一、核心对象类

#### 1. `fabric.Canvas`
```typescript
// 创建画布实例
this.canvas = new fabric.Canvas('canvasId');

// 主要方法：
.add(object)        // 添加对象到画布
.remove(object)     // 移除对象
.renderAll()        // 强制重绘画布
.getActiveObject()  // 获取当前选中对象
.setActiveObject()  // 设置选中对象
.insertAt(object, index) // 指定层级插入对象
```

**应用场景**：所有画布元素管理、交互控制

---

#### 2. `fabric.Image`
```typescript
// 从URL创建图像
const img = await fabric.Image.fromURL(url, options);

// 主要方法：
.scaleToWidth()  // 按比例缩放到指定宽度
.scaleToHeight() // 按比例缩放到指定高度
.set({ key: value }) // 批量设置属性
.clone(callback) // 克隆对象
```

**代码示例**：
```typescript
const imageElement = await Image.fromURL(url, options);
imageElement.scaleToWidth(100);
```

---

#### 3. `fabric.Group`
```typescript
// 创建对象组
const group = new fabric.Group([obj1, obj2], {
  originX: 'center',
  originY: 'center'
});

// 属性：
._objects // 包含的子对象数组
```

**应用场景**：纹理与原图的组合管理

---

### 二、图形操作 API

#### 1. 变换控制
```typescript
.rotate(angle)       // 设置旋转角度
.scaleX / .scaleY   // 缩放比例
.flipX / .flipY     // 水平/垂直翻转
.setCoords()        // 更新对象坐标
```

**代码示例**：
```typescript
originalImage.rotate(0); // 重置旋转
imageElement.set({ flipX: true });
```

---

#### 2. 坐标转换
```typescript
// 获取对象包围盒
const { newWidth, newHeight } = getAABBSizeAfterRotation(obj);

// 坐标转换工具
fabric.util.transformPoint(point, transformMatrix)
```

**实现原理**：计算旋转后的实际显示尺寸

---

### 三、SVG 处理 API

#### 1. SVG 解析
```typescript
fabric.loadSVGFromURL(url, (objects, options) => {
  const group = fabric.util.groupSVGElements(objects);
});
```

**参数说明**：
- `objects`: 解析后的SVG元素数组
- `options`: 包含SVG元数据的配置对象

---

#### 2. SVG 优化
```typescript
// 设置SVG标识
group.set({ isSVG: true });
```

**作用**：标记SVG对象用于后续特殊处理

---

### 四、事件系统

#### 1. 对象事件
```typescript
// 事件绑定
imageElement.on('selected', handler);
canvas.on('object:modified', handler);

// 常用事件：
'selected'        // 选中对象
'deselected'      // 取消选中
'mousedblclick'   // 双击事件
```

**应用场景**：实现裁剪模式切换

---

#### 2. 自定义事件
```typescript
eventBus.emit(ImageStatus.Editing, { value: true });
```

**说明**：通过事件总线扩展原生事件系统

---

### 五、实用工具类

#### 1. `fabric.util`
```typescript
// 图像加载
fabric.util.loadImage(url, img => {});

// 矩阵运算
fabric.util.multiplyTransformMatrices(m1, m2) // 矩阵相乘
fabric.util.invertTransform(matrix)           // 矩阵求逆
```

**典型应用**：
```typescript
// 计算组合变换矩阵
const totalM = fabric.util.multiplyTransformMatrices(
  canvas.viewportTransform,
  obj.calcTransformMatrix()
);
```

---

#### 2. 序列化方法
```typescript
// 对象转JSON
const json = imageElement.toJSON();

// 属性过滤
const cloned = original.toObject(['width', 'height']);
```

**使用场景**：保存/恢复画布状态

---

### 六、扩展 API

#### 1. 自定义属性
```typescript
// 扩展Image类
class TextureImage extends fabric.Image {
  public textureType: TextureType;
}

// 添加自定义标识
obj.set({ _isTextureGroup: true });
```

**作用**：实现业务特定逻辑

---

#### 2. 裁剪控制
```typescript
// 设置裁剪路径
image.set({ clipPath: new fabric.Path(pathData) });

// 裁剪坐标
.cropX / .cropY // 裁剪偏移量
```

**实现效果**：创建非矩形裁剪区域

---

### 七、性能相关 API

#### 1. 渲染控制
```typescript
canvas.renderOnAddRemove = false; // 批量操作时关闭自动渲染
requestAnimationFrame(() => canvas.renderAll());
```

**优化策略**：减少不必要的重绘

---

#### 2. 缓存机制
```typescript
object.objectCaching = true; // 启用对象缓存
canvas.clearContext(canvas.contextContainer); // 清除缓存
```

**应用场景**：处理复杂图形时提升性能

---

### 八、坐标系统

#### 1. 原点控制
```typescript
// 设置变换原点
obj.originX = 'center'; 
obj.originY = 'center';

// 坐标转换
obj.translateToOriginPoint(point, originX, originY)
```

**重要性**：正确计算旋转/缩放后的位置

---

#### 2. 视口变换
```typescript
// 获取画布变换矩阵
const vpt = canvas.viewportTransform;

// 应用变换
canvas.setViewportTransform(newMatrix);
```

**典型应用**：实现画布平移缩放

---

通过上述 API 的组合使用，该代码实现了：
- 动态图像加载与变换
- 复杂纹理合成
- SVG矢量图形处理
- 精细的交互控制
- 性能优化渲染

掌握这些 API 的使用是开发专业级 Canvas 编辑器的基础，建议结合 Fabric.js 官方文档进行更深入的参数学习。
