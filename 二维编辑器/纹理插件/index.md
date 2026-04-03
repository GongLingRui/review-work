### **`TextureImage` 插件的详细讲解**

`TextureImage` 是一个基于 `fabric.js` 的扩展类，用于处理 **纹理图片** 的操作。它继承自 `Image` 类，并添加了许多与纹理相关的功能，比如 **纹理类型**、**灰度图**、**厚度**、**对比度**、**反转** 等属性，以及对纹理的裁剪、移动限制、双击处理等操作。

以下是对 `TextureImage` 插件的详细讲解，包括其功能、实现逻辑和代码注释。

---

### **1. 功能概述**

#### **1.1 主要功能**
1. **纹理属性管理**：
   - 支持设置纹理的类型（如浮雕纹理、光泽纹理等）。
   - 支持设置纹理的灰度图、厚度、对比度和反转属性。

2. **裁剪路径（ClipPath）管理**：
   - 支持对纹理图片设置裁剪路径。
   - 支持缓存和恢复裁剪路径。

3. **移动限制**：
   - 限制纹理图片的移动范围，确保其不会超出工作区或原始图片的范围。

4. **双击和取消选中事件**：
   - 支持双击纹理图片时移除裁剪路径。
   - 支持取消选中时恢复裁剪路径。

5. **纹理分组**：
   - 支持将纹理图片与原始图片分组，便于统一管理。

---

### **2. 代码逻辑详解**

#### **2.1 构造函数**

##### **代码片段**
```typescript
constructor(element: any, options?: any) {
  super(element, options);
  this.textureType = options.textureType;
  this.grayscale = options.grayscale;
  this.thickness = options.thickness || (this.textureType === TextureType.RELIEF ? 5 : 1);
  this.contrast = options.contrast || (this.textureType === TextureType.RELIEF ? 0.7 : 1);
  this.invert = options.invert;
  this.isPublish = options.isPublish;
}
```

##### **逻辑**
1. **继承 `Image` 类**：
   - 调用父类 `Image` 的构造函数，初始化基础属性。

2. **初始化纹理属性**：
   - `textureType`：纹理类型（如浮雕纹理、光泽纹理等）。
   - `grayscale`：纹理的灰度图。
   - `thickness`：纹理的厚度，默认为 5（浮雕纹理）或 1。
   - `contrast`：纹理的对比度，默认为 0.7（浮雕纹理）或 1。
   - `invert`：是否反转纹理。
   - `isPublish`：是否已发布。

---

#### **2.2 移动限制**

##### **代码片段**
```typescript
setMoveLimit() {
  this.on('moving', (e) => {
    if (this.isCanvasTexture) {
      if (!this.isPublish || this.textureType === TextureType.RELIEF) return;
      const workspace = this.canvas?.getObjects().find((item) => item.id?.includes(WorkspaceID.WorkspaceCavas));
      const workspaceWidth = workspace?.width * workspace?.scaleX;
      const workspaceHeight = workspace?.height * workspace?.scaleY;

      if (this.left - (this.width * this.scaleX) / 2 > 0) {
        this.left = (this.width * this.scaleX) / 2;
      } else if (this.left + (this.width * this.scaleX) / 2 < workspaceWidth) {
        this.left = workspaceWidth - (this.width * this.scaleX) / 2;
      }

      if (this.top - (this.height * this.scaleY) / 2 > 0) {
        this.top = (this.height * this.scaleY) / 2;
      } else if (this.top + (this.height * this.scaleX) / 2 < workspaceHeight) {
        this.top = workspaceHeight - (this.height * this.scaleX) / 2;
      }
    } else {
      if (!this._original) return;
      const originalWidth = this._original.left + (this._original.width * this._original?.scaleX) / 2;
      const originalHeight = this._original.top + (this._original.height * this._original?.scaleY) / 2;
      const originalLeft = this._original.left - (this._original.width * this._original?.scaleX) / 2;
      const originalTop = this._original.top - (this._original.height * this._original?.scaleY) / 2;

      if (this.left - (this.width * this.scaleX) / 2 > originalLeft) {
        this.left = originalLeft + (this.width * this.scaleX) / 2;
      } else if (this.left + (this.width * this.scaleX) / 2 < originalWidth) {
        this.left = originalWidth - (this.width * this.scaleX) / 2;
      }

      if (this.top - (this.height * this.scaleY) / 2 > originalTop) {
        this.top = originalTop + (this.height * this.scaleX) / 2;
      } else if (this.top + (this.height * this.scaleX) / 2 < originalHeight) {
        this.top = originalHeight - (this.height * this.scaleX) / 2;
      }
    }
  });
}
```

##### **逻辑**
1. **监听移动事件**：
   - 使用 `this.on('moving', ...)` 监听纹理图片的移动事件。

2. **限制移动范围**：
   - 如果纹理是画布纹理（`isCanvasTexture`），限制其移动范围在工作区内。
   - 如果纹理是普通纹理，限制其移动范围在原始图片的范围内。

3. **计算边界**：
   - 根据纹理的宽度、高度和缩放比例，计算其边界。
   - 如果纹理超出边界，调整其位置。

---

#### **2.3 裁剪路径管理**

##### **移除裁剪路径**
```typescript
protected async removeClipPathAndCache() {
  if (this._original) {
    this._original.set({ opacity: 1 });
  }

  const scaleX = this.scaleX;
  const scaleY = this.scaleY;
  const left = this.left;
  const top = this.top;

  return new Promise((resolve) => {
    this.clipPath?.clone((cloned) => {
      this.set({
        _isControls: true,
        clipPath: undefined,
        _clipPath: cloned,
        _scaleX: scaleX,
        _scaleY: scaleY,
        _left: left,
        _top: top,
        opacity: 0.5,
      });
      this.canvas?.setActiveObject(this);
      this.canvas?.renderAll();
      resolve(null);
    });
  });
}
```

##### **恢复裁剪路径**
```typescript
public async restoreClipPath() {
  if (this._isControls) {
    const clipPath = this._clipPath;
    const scaleX = this._scaleX / this.scaleX;
    const scaleY = this._scaleY / this.scaleY;
    const left = this._left - this.left;
    const top = this._top - this.top;

    clipPath?.set({
      left: clipPath.left + left / this.scaleX,
      top: clipPath.top + top / this.scaleY,
      scaleX: clipPath.scaleX * scaleX,
      scaleY: clipPath.scaleY * scaleY,
    });

    this.set({
      clipPath: clipPath,
      opacity: this.textureType === TextureType.GLOSS ? 0.5 : 1,
    });

    this.canvas?.renderAll();
  }
}
```

##### **逻辑**
1. **移除裁剪路径**：
   - 缓存当前的裁剪路径和纹理的缩放、位置等信息。
   - 将裁剪路径设置为 `undefined`，并将纹理的透明度设置为 0.5。

2. **恢复裁剪路径**：
   - 根据缓存的信息恢复裁剪路径。
   - 调整裁剪路径的位置和缩放比例，使其与纹理匹配。

---

#### **2.4 双击和取消选中事件**

##### **代码片段**
```typescript
doubleClickHandler() {
  this.removeClipPathAndCache();
}

deselectedHandler() {
  this.restoreClipPath();
}
```

##### **逻辑**
1. **双击事件**：
   - 当用户双击纹理图片时，移除裁剪路径。

2. **取消选中事件**：
   - 当用户取消选中纹理图片时，恢复裁剪路径。

---

### **3. 为什么需要这个插件？**

#### **3.1 纹理图片的特殊需求**
- 纹理图片需要支持更多的属性（如灰度图、厚度、对比度等）和操作（如裁剪路径、移动限制等）。
- `TextureImage` 插件扩展了 `fabric.Image` 的功能，满足了纹理图片的特殊需求。

#### **3.2 提升用户体验**
- 通过裁剪路径管理、移动限制等功能，用户可以更方便地操作纹理图片。
- 支持双击和取消选中事件，提供了更直观的交互方式。

#### **3.3 提高代码复用性**
- 将纹理图片的处理逻辑封装到 `TextureImage` 插件中，便于在不同场景下复用。

---

### **4. 总结**

`TextureImage` 是一个功能强大的插件，用于处理纹理图片的操作。它通过扩展 `fabric.Image`，实现了以下功能：
1. **纹理属性管理**：支持设置灰度图、厚度、对比度等属性。
2. **裁剪路径管理**：支持移除和恢复裁剪路径。
3. **移动限制**：限制纹理图片的移动范围。
4. **双击和取消选中事件**：提供更直观的交互方式。

通过这些功能，`TextureImage` 提升了纹理图片的操作体验，适用于生成浮雕纹理、光泽纹理等场景。如果你对某些部分仍有疑问，可以告诉我，我会进一步解释！
