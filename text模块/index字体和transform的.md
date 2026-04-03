### **代码详解：`MainUiLeftTextTool` 组件**

`MainUiLeftTextTool` 是一个 React 组件，用于在 2D 编辑器中管理文字工具的左侧工具栏。它根据用户的选择（如字体选择或文字变形）动态显示不同的子组件（`Typeface` 或 `Transform`）。

以下是对这段代码的详细讲解，包括其功能、实现逻辑和关键代码的解析。

---

### **1. 组件的主要功能**

#### **1.1 动态显示工具栏**
- 根据 `selectNum` 的值，动态显示字体选择工具（`Typeface`）或文字变形工具（`Transform`）。

#### **1.2 监听画布事件**
- 监听画布中文字对象的选中状态。
- 当文字对象被取消选中时，自动关闭左侧工具栏。

#### **1.3 关闭工具栏**
- 提供关闭工具栏的功能，允许用户手动或通过事件关闭工具栏。

---

### **2. 组件的实现逻辑**

#### **2.1 接收 `props` 参数**
- `selectNum`：决定显示哪个子工具组件。
  - `0`：显示字体选择工具（`Typeface`）。
  - `1`：显示文字变形工具（`Transform`）。

```typescript
const { selectNum } = props;
```

---

#### **2.2 获取上下文和事件总线**
- 使用自定义的 `useCanvasEditor`、`useEvent` 和 `useTranslation` 钩子获取上下文和事件总线。
  - `useCanvasEditor`：获取画布编辑器实例。
  - `useEvent`：获取事件总线实例，用于触发和监听事件。
  - `useTranslation`：获取国际化翻译函数。

```typescript
const canvasEditor = useCanvasEditor();
const { t } = useTranslation();
const event = useEvent();
```

---

#### **2.3 获取当前选中的文字对象**
- 使用 `canvasEditor.canvas.getActiveObject()` 获取画布中当前选中的文字对象。
- 如果没有选中任何对象，则返回 `null`。

```typescript
const activeObject = canvasEditor?.canvas.getActiveObject();
```

---

#### **2.4 监听文字对象的取消选中事件**

##### **核心逻辑**
1. **监听事件**
   - 使用 `eventBus.on` 监听 `EventCanvasTextDeSelect` 事件。
   - 当文字对象被取消选中时，调用 `closeLeftbar` 方法关闭工具栏。

2. **移除事件监听**
   - 在组件卸载时，使用 `eventBus.off` 移除事件监听，避免内存泄漏。

```typescript
useEffect(() => {
  eventBus?.on(EventNameCons.EventCanvasTextDeSelect, closeLeftbar);
  return () => {
    eventBus?.off(EventNameCons.EventCanvasTextDeSelect, closeLeftbar);
  };
}, [activeObject]);
```

---

#### **2.5 关闭工具栏**

##### **核心逻辑**
- 使用 `event.emitEvent` 触发 `OpenTextTool` 事件，将工具栏的显示状态设置为 `false`。

```typescript
const closeLeftbar = () => {
  event?.emitEvent(EventNameCons.OpenTextTool, false);
};
```

---

#### **2.6 渲染子组件**

##### **核心逻辑**
- 根据 `selectNum` 的值，动态渲染 `Typeface` 或 `Transform` 子组件。
- 将 `closeLeftbar` 方法作为 `props` 传递给子组件，允许子组件关闭工具栏。

```typescript
return (
  <div className={classes.bar_container}>
    {selectNum === 0 && <Typeface closeLeftbar={closeLeftbar} />}
    {selectNum === 1 && <Transform closeLeftbar={closeLeftbar} />}
  </div>
);
```

---

### **3. 子组件的功能**

#### **3.1 `Typeface` 子组件**
- 用于字体选择和管理。
- 提供字体的加载、筛选、搜索、分类、应用等功能。

#### **3.2 `Transform` 子组件**
- 用于文字变形。
- 提供多种文字变形类型（如圆形、角度、贝塞尔曲线等）的选择和应用功能。

---

### **4. 事件总线的作用**

#### **4.1 事件监听**
- 监听 `EventCanvasTextDeSelect` 事件，当文字对象被取消选中时，关闭工具栏。

```typescript
eventBus?.on(EventNameCons.EventCanvasTextDeSelect, closeLeftbar);
```

#### **4.2 事件触发**
- 触发 `OpenTextTool` 事件，控制工具栏的显示状态。

```typescript
event?.emitEvent(EventNameCons.OpenTextTool, false);
```

---

### **5. 组件的渲染逻辑**

#### **5.1 工具栏容器**
- 使用 `div` 容器包裹工具栏内容。
- 样式类名为 `bar_container`，定义在 `index.module.scss` 文件中。

```jsx
<div className={classes.bar_container}>
  ...
</div>
```

#### **5.2 动态渲染子组件**
- 根据 `selectNum` 的值，动态渲染 `Typeface` 或 `Transform` 子组件。

```jsx
{selectNum === 0 && <Typeface closeLeftbar={closeLeftbar} />}
{selectNum === 1 && <Transform closeLeftbar={closeLeftbar} />}
```

---

### **6. 代码的核心技术点**

#### **6.1 动态渲染**
- 使用 `selectNum` 动态渲染不同的子组件。

#### **6.2 事件总线**
- 使用 `eventBus` 监听和触发事件，实现组件之间的通信。

#### **6.3 状态管理**
- 使用 `useEffect` 监听画布中文字对象的选中状态。

#### **6.4 子组件通信**
- 将 `closeLeftbar` 方法作为 `props` 传递给子组件，允许子组件关闭工具栏。

---

### **7. 代码的完整流程**

1. **初始化**
   - 获取画布编辑器实例、事件总线和翻译函数。
   - 获取当前选中的文字对象。

2. **监听事件**
   - 监听 `EventCanvasTextDeSelect` 事件，当文字对象被取消选中时，关闭工具栏。

3. **渲染子组件**
   - 根据 `selectNum` 的值，动态渲染 `Typeface` 或 `Transform` 子组件。

4. **关闭工具栏**
   - 提供 `closeLeftbar` 方法，允许手动或通过事件关闭工具栏。

---

### **8. 总结**

#### **功能**
- 动态显示字体选择工具或文字变形工具。
- 监听画布事件，自动关闭工具栏。
- 提供关闭工具栏的功能。

#### **技术点**
- 动态渲染子组件。
- 使用事件总线实现组件通信。
- 使用 `useEffect` 监听状态变化。

#### **用户体验**
- 根据用户的选择动态显示工具栏内容。
- 当文字对象被取消选中时，自动关闭工具栏。
- 提供直观的字体选择和文字变形功能。

通过这些实现，`MainUiLeftTextTool` 组件为用户提供了强大的文字工具管理能力，适用于各种设计场景。
