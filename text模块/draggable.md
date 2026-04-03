### **`draggable` 属性详解**

`draggable` 是 HTML5 中的一个属性，用于指定一个元素是否可以被拖动。它是实现 **拖放（Drag and Drop）** 功能的核心属性之一。通过设置 `draggable` 属性为 `true`，可以让元素变得可拖动。

在 React 中，`draggable` 属性可以直接添加到 JSX 元素中，并结合事件处理函数（如 `onDragStart`、`onDragOver`、`onDrop` 等）实现拖放功能。

---

## **1. `draggable` 属性的基本用法**

### **HTML 示例**
```html
<div draggable="true">Drag me!</div>
```

- **默认值**：`false`（元素不可拖动）。
- **设置为 `true`**：元素可以被拖动。

---

### **React 示例**
```tsx
import React from 'react';

const DraggableExample = () => {
  const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    console.log('Drag started');
    event.dataTransfer.setData('text/plain', 'This is a draggable element');
  };

  return (
    <div
      draggable="true"
      onDragStart={handleDragStart}
      style={{ width: '200px', height: '100px', backgroundColor: 'lightblue', textAlign: 'center', lineHeight: '100px' }}
    >
      Drag me!
    </div>
  );
};

export default DraggableExample;
```

---

## **2. 拖放事件的生命周期**

HTML5 的拖放功能由一系列事件组成，以下是拖放事件的完整生命周期：

| 事件名             | 触发时机                                                                 |
|--------------------|--------------------------------------------------------------------------|
| `onDragStart`      | 拖动开始时触发（拖动的源元素）。                                         |
| `onDrag`           | 拖动过程中持续触发（拖动的源元素）。                                     |
| `onDragEnd`        | 拖动结束时触发（拖动的源元素）。                                         |
| `onDragEnter`      | 拖动元素进入目标区域时触发（目标元素）。                                 |
| `onDragOver`       | 拖动元素在目标区域上方移动时持续触发（目标元素）。                       |
| `onDragLeave`      | 拖动元素离开目标区域时触发（目标元素）。                                 |
| `onDrop`           | 拖动元素在目标区域释放时触发（目标元素）。                               |

---

## **3. 拖放事件的详细用法**

### **3.1 `onDragStart`**
- **触发时机**：当用户开始拖动一个元素时触发。
- **常用操作**：
  - 设置拖动的数据（通过 `event.dataTransfer.setData`）。
  - 修改拖动元素的外观（如透明度）。

#### **示例**
```tsx
const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
  console.log('Drag started');
  event.dataTransfer.setData('text/plain', 'This is a draggable element'); // 设置拖动的数据
  event.currentTarget.style.opacity = '0.5'; // 修改拖动元素的透明度
};
```

---

### **3.2 `onDrag`**
- **触发时机**：拖动过程中持续触发。
- **常用操作**：
  - 实时更新拖动状态（如显示拖动位置）。

#### **示例**
```tsx
const handleDrag = (event: React.DragEvent<HTMLDivElement>) => {
  console.log(`Dragging at position (${event.clientX}, ${event.clientY})`);
};
```

---

### **3.3 `onDragEnd`**
- **触发时机**：拖动结束时触发（无论是否成功释放到目标区域）。
- **常用操作**：
  - 恢复拖动元素的外观。
  - 清理拖动状态。

#### **示例**
```tsx
const handleDragEnd = (event: React.DragEvent<HTMLDivElement>) => {
  console.log('Drag ended');
  event.currentTarget.style.opacity = '1'; // 恢复透明度
};
```

---

### **3.4 `onDragEnter`**
- **触发时机**：拖动元素进入目标区域时触发。
- **常用操作**：
  - 高亮目标区域。

#### **示例**
```tsx
const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
  console.log('Drag entered target');
  event.currentTarget.style.backgroundColor = 'lightgreen'; // 高亮目标区域
};
```

---

### **3.5 `onDragOver`**
- **触发时机**：拖动元素在目标区域上方移动时持续触发。
- **常用操作**：
  - 阻止默认行为（默认情况下，目标区域不接受拖动）。
  - 更新目标区域的状态。

#### **示例**
```tsx
const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
  event.preventDefault(); // 必须调用 preventDefault，否则无法触发 onDrop
  console.log('Dragging over target');
};
```

---

### **3.6 `onDragLeave`**
- **触发时机**：拖动元素离开目标区域时触发。
- **常用操作**：
  - 恢复目标区域的外观。

#### **示例**
```tsx
const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
  console.log('Drag left target');
  event.currentTarget.style.backgroundColor = ''; // 恢复背景颜色
};
```

---

### **3.7 `onDrop`**
- **触发时机**：拖动元素在目标区域释放时触发。
- **常用操作**：
  - 获取拖动的数据。
  - 执行放置操作（如更新状态、移动元素）。

#### **示例**
```tsx
const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
  event.preventDefault(); // 阻止默认行为
  const data = event.dataTransfer.getData('text/plain'); // 获取拖动的数据
  console.log(`Dropped data: ${data}`);
  event.currentTarget.style.backgroundColor = ''; // 恢复背景颜色
};
```

---

## **4. 完整示例：实现拖放功能**

以下是一个完整的拖放示例，展示如何将一个可拖动的元素拖放到目标区域：

### **代码示例**
```tsx
import React, { useState } from 'react';

const DragAndDropExample = () => {
  const [droppedData, setDroppedData] = useState<string | null>(null);

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData('text/plain', 'This is a draggable element');
    event.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (event: React.DragEvent<HTMLDivElement>) => {
    event.currentTarget.style.opacity = '1';
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); // 必须调用 preventDefault，否则无法触发 onDrop
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const data = event.dataTransfer.getData('text/plain');
    setDroppedData(data); // 更新状态
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-around', padding: '50px' }}>
      {/* 可拖动的元素 */}
      <div
        draggable="true"
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        style={{
          width: '150px',
          height: '150px',
          backgroundColor: 'lightblue',
          textAlign: 'center',
          lineHeight: '150px',
          cursor: 'grab',
        }}
      >
        Drag me!
      </div>

      {/* 目标区域 */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{
          width: '150px',
          height: '150px',
          backgroundColor: 'lightgray',
          textAlign: 'center',
          lineHeight: '150px',
          border: '2px dashed black',
        }}
      >
        {droppedData ? `Dropped: ${droppedData}` : 'Drop here'}
      </div>
    </div>
  );
};

export default DragAndDropExample;
```

---

### **功能说明**
1. **拖动元素**：
   - 设置 `draggable="true"`，使元素可拖动。
   - 在 `onDragStart` 中设置拖动的数据。
   - 在 `onDragEnd` 中恢复元素的外观。

2. **目标区域**：
   - 在 `onDragOver` 中调用 `event.preventDefault()`，允许放置操作。
   - 在 `onDrop` 中获取拖动的数据，并更新状态。

3. **视觉反馈**：
   - 拖动时改变元素的透明度。
   - 拖动到目标区域时高亮显示。

---

## **5. 总结**

- **`draggable` 属性**：使元素可拖动，设置为 `true` 即可启用拖动功能。
- **拖放事件**：通过一系列事件（如 `onDragStart`、`onDrop`）实现拖放功能。
- **核心方法**：
  - `event.dataTransfer.setData`：设置拖动的数据。
  - `event.dataTransfer.getData`：获取拖动的数据。
  - `event.preventDefault`：允许放置操作。
- **应用场景**：
  - 拖放文件上传。
  - 拖放排序。
  - 拖放组件布局。

通过结合 `draggable` 属性和拖放事件，可以轻松实现强大的拖放交互功能。
