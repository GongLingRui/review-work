### **Fabric.js 中的 `Text` 和 `Textbox` 相关原生 API 详解**

---

### **1. Fabric.js 简介**
Fabric.js 是一个强大的 HTML5 Canvas 库，用于在画布上绘制和操作图形、文本、图像等。它提供了丰富的 API，支持交互、动画、事件处理等功能。

在 Fabric.js 中，`Text` 和 `Textbox` 是两个用于处理文本的核心类：
- **`Text`**：用于绘制单行或多行的静态文本。
- **`Textbox`**：继承自 `Text`，支持多行文本编辑和自动换行。

---

### **2. `Text` 和 `Textbox` 的区别**

| **特性**               | **Text**                                   | **Textbox**                                |
|------------------------|--------------------------------------------|-------------------------------------------|
| **多行支持**            | 支持多行，但需要手动插入换行符 `\n`         | 自动换行，支持多行文本                     |
| **文本编辑**            | 不支持直接编辑                             | 支持直接编辑                               |
| **宽度限制**            | 文本宽度由内容决定，不支持宽度限制          | 支持设置宽度，超出宽度时自动换行           |
| **文本对齐**            | 支持左对齐、右对齐、居中对齐               | 支持左对齐、右对齐、居中对齐               |
| **适用场景**            | 静态文本显示                               | 动态文本编辑                               |

---

### **3. `Text` 类的原生 API**

#### **3.1 创建 `Text` 对象**
```javascript
const text = new fabric.Text('Hello, Fabric.js!', {
  left: 100, // x 坐标
  top: 100, // y 坐标
  fontSize: 30, // 字体大小
  fill: 'red', // 文本颜色
  fontFamily: 'Arial', // 字体
});
canvas.add(text); // 将文本添加到画布
```

#### **3.2 常用属性**
- **`text`**：文本内容。
- **`fontSize`**：字体大小（默认值：40）。
- **`fontFamily`**：字体（如 `'Arial'`、`'Times New Roman'`）。
- **`fill`**：文本颜色。
- **`textAlign`**：文本对齐方式（`'left'`、`'center'`、`'right'`）。
- **`fontWeight`**：字体粗细（`'normal'`、`'bold'`）。
- **`fontStyle`**：字体样式（`'normal'`、`'italic'`）。
- **`lineHeight`**：行高（默认值：1.16）。
- **`underline`**：是否显示下划线（布尔值）。
- **`overline`**：是否显示上划线（布尔值）。
- **`linethrough`**：是否显示删除线（布尔值）。

#### **3.3 常用方法**
- **`setText(text: string)`**：设置文本内容。
  ```javascript
  text.setText('New Text');
  canvas.renderAll(); // 重新渲染画布
  ```

- **`setFontSize(size: number)`**：设置字体大小。
  ```javascript
  text.set('fontSize', 50);
  canvas.renderAll();
  ```

- **`setColor(color: string)`**：设置文本颜色。
  ```javascript
  text.set('fill', 'blue');
  canvas.renderAll();
  ```

- **`toObject()`**：将文本对象转换为 JSON 格式。
  ```javascript
  console.log(text.toObject());
  ```

- **`clone()`**：克隆文本对象。
  ```javascript
  text.clone((clonedText) => {
    clonedText.set({ left: 200, top: 200 });
    canvas.add(clonedText);
  });
  ```

---

### **4. `Textbox` 类的原生 API**

#### **4.1 创建 `Textbox` 对象**
```javascript
const textbox = new fabric.Textbox('Hello, Fabric.js!', {
  left: 100, // x 坐标
  top: 100, // y 坐标
  width: 200, // 文本框宽度
  fontSize: 20, // 字体大小
  fill: 'blue', // 文本颜色
  fontFamily: 'Arial', // 字体
});
canvas.add(textbox); // 将文本框添加到画布
```

#### **4.2 常用属性**
- **继承自 `Text` 的属性**：
  - `text`、`fontSize`、`fontFamily`、`fill`、`textAlign`、`fontWeight`、`fontStyle`、`lineHeight` 等。
- **特有属性**：
  - **`width`**：文本框的宽度，超出宽度时自动换行。
  - **`minWidth`**：文本框的最小宽度。
  - **`maxWidth`**：文本框的最大宽度。
  - **`editable`**：是否允许用户直接编辑文本（布尔值，默认值：`true`）。
  - **`splitByGrapheme`**：是否按字形拆分文本（布尔值，默认值：`false`）。

#### **4.3 常用方法**
- **`setWidth(width: number)`**：设置文本框的宽度。
  ```javascript
  textbox.set('width', 300);
  canvas.renderAll();
  ```

- **`setEditable(editable: boolean)`**：设置文本框是否可编辑。
  ```javascript
  textbox.set('editable', false);
  ```

- **`setText(text: string)`**：设置文本内容。
  ```javascript
  textbox.setText('New Text for Textbox');
  canvas.renderAll();
  ```

- **`toObject()`**：将文本框对象转换为 JSON 格式。
  ```javascript
  console.log(textbox.toObject());
  ```

- **`clone()`**：克隆文本框对象。
  ```javascript
  textbox.clone((clonedTextbox) => {
    clonedTextbox.set({ left: 300, top: 300 });
    canvas.add(clonedTextbox);
  });
  ```

---

### **5. 事件处理**

#### **常用事件**
- **`"editing:entered"`**：用户开始编辑文本。
- **`"editing:exited"`**：用户结束编辑文本。
- **`"changed"`**：文本内容发生变化。

#### **示例**
```javascript
textbox.on('editing:entered', () => {
  console.log('Editing started');
});

textbox.on('editing:exited', () => {
  console.log('Editing ended');
});

textbox.on('changed', () => {
  console.log('Text changed:', textbox.text);
});
```

---

### **6. 组合使用示例**

#### **创建一个可编辑的多行文本框**
```javascript
const canvas = new fabric.Canvas('canvas');

const textbox = new fabric.Textbox('Edit me!\nYou can type here.', {
  left: 50,
  top: 50,
  width: 300,
  fontSize: 20,
  fill: 'black',
  textAlign: 'center',
  fontFamily: 'Arial',
});

canvas.add(textbox);

// 监听文本框的事件
textbox.on('changed', () => {
  console.log('Text changed:', textbox.text);
});
```

#### **动态调整文本框宽度**
```javascript
textbox.on('changed', () => {
  const textWidth = textbox.getScaledWidth();
  if (textWidth > 400) {
    textbox.set('width', 400); // 限制最大宽度
  }
  canvas.renderAll();
});
```

---

### **7. `Text` 和 `Textbox` 的 JSON 序列化**

#### **将对象转换为 JSON**
```javascript
const json = canvas.toJSON();
console.log(json);
```

#### **从 JSON 恢复对象**
```javascript
canvas.loadFromJSON(json, () => {
  canvas.renderAll();
});
```

---

### **8. 总结**

#### **`Text` 的特点**
- 用于显示静态文本。
- 支持多行，但需要手动插入换行符。
- 不支持直接编辑。

#### **`Textbox` 的特点**
- 继承自 `Text`，支持多行文本。
- 支持自动换行和宽度限制。
- 支持直接编辑，适合动态文本场景。

#### **适用场景**
- **`Text`**：适用于静态文本显示，如标题、标签等。
- **`Textbox`**：适用于需要用户交互的场景，如表单输入、动态文本编辑等。

通过 Fabric.js 提供的 `Text` 和 `Textbox` API，可以轻松实现文本的绘制、编辑和交互功能，满足各种文本处理需求。
