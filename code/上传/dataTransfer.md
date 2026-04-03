<img width="1306" alt="image" src="https://github.com/user-attachments/assets/a13256ad-912d-4f9a-8945-3e18e16f5764" />

<img width="444" alt="image" src="https://github.com/user-attachments/assets/9803346b-286e-468e-918c-2a455901560f" />


<img width="447" alt="image" src="https://github.com/user-attachments/assets/2424ec15-ba61-4498-a5ab-52f1a475f70e" />


- 上传文件部分拖拽调用handledrop函数
当然可以，详细讲解 `action` 和 `action.dataTransfer` 这两个对象。

### `action` 对象

`action` 是一个事件对象，通常在事件处理函数中作为参数传递。它包含了与事件相关的所有信息和方法。事件对象在不同的事件类型中有不同的属性和方法，但所有事件对象都继承自 `Event` 接口。

在拖放操作中，`action` 通常是一个 `DragEvent` 对象。`DragEvent` 是一个继承自 `MouseEvent` 的接口，表示用户在拖动元素时触发的事件。

#### 常见的 `DragEvent` 事件

- `dragstart`：当用户开始拖动元素时触发。
- `drag`：当用户拖动元素时触发。
- `dragenter`：当拖动的元素进入一个有效的放置目标时触发。
- `dragover`：当拖动的元素在一个有效的放置目标上方时触发。
- `dragleave`：当拖动的元素离开一个有效的放置目标时触发。
- `drop`：当拖动的元素被放置在一个有效的放置目标上时触发。
- `dragend`：当拖动操作结束时触发。

### `action.dataTransfer` 对象

`action.dataTransfer` 是 `DragEvent` 对象的一个属性，表示拖放操作中传输的数据。`DataTransfer` 对象包含了拖放操作中传输的数据和相关的操作方法。

#### `DataTransfer` 属性

1. **`dropEffect`**：一个字符串，表示拖放操作的效果。可能的值有：
   - `"none"`：没有拖放操作。
   - `"copy"`：表示将数据复制到目标位置。
   - `"move"`：表示将数据移动到目标位置。
   - `"link"`：表示创建一个链接到目标位置。

2. **`effectAllowed`**：一个字符串，表示允许的拖放操作效果。可能的值有：
   - `"none"`：不允许任何拖放操作。
   - `"copy"`：只允许复制操作。
   - `"copyLink"`：允许复制和链接操作。
   - `"copyMove"`：允许复制和移动操作。
   - `"link"`：只允许链接操作。
   - `"linkMove"`：允许链接和移动操作。
   - `"move"`：只允许移动操作。
   - `"all"`：允许所有操作。

3. **`files`**：一个 `FileList` 对象，包含拖放操作中传输的文件。每个文件都是一个 `File` 对象。

4. **`items`**：一个 `DataTransferItemList` 对象，包含拖放操作中传输的所有数据项。每个数据项都是一个 `DataTransferItem` 对象。

5. **`types`**：一个字符串数组，表示拖放操作中传输的数据类型。

#### `DataTransfer` 方法

1. **`clearData([format])`**：清除指定格式的数据。如果没有指定格式，则清除所有数据。

2. **`getData(format)`**：获取指定格式的数据。

3. **`setData(format, data)`**：设置指定格式的数据。

4. **`setDragImage(image, x, y)`**：设置拖动过程中显示的图像及其位置。

### 示例代码

以下是一个示例代码，展示了如何使用 `action` 和 `action.dataTransfer` 对象：

```javascript
const handleDrop = (event) => {
  event.preventDefault();

  // 获取拖放的文件列表
  const files = event.dataTransfer.files;

  // 获取拖放的数据类型
  const types = event.dataTransfer.types;

  // 获取拖放的效果
  const dropEffect = event.dataTransfer.dropEffect;

  // 获取允许的拖放效果
  const effectAllowed = event.dataTransfer.effectAllowed;

  console.log('Files:', files);
  console.log('Types:', types);
  console.log('Drop Effect:', dropEffect);
  console.log('Effect Allowed:', effectAllowed);

  // 处理文件
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    console.log('File:', file.name);
  }
};

const handleDragOver = (event) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'copy'; // 设置拖放效果为复制
};

document.addEventListener('drop', handleDrop);
document.addEventListener('dragover', handleDragOver);
```

### 详细解释

1. **获取拖放的文件列表**

```javascript
const files = event.dataTransfer.files;
```

- `files` 是一个 `FileList` 对象，包含拖放操作中传输的文件。

2. **获取拖放的数据类型**

```javascript
const types = event.dataTransfer.types;
```

- `types` 是一个字符串数组，表示拖放操作中传输的数据类型。

3. **获取拖放的效果**

```javascript
const dropEffect = event.dataTransfer.dropEffect;
```

- `dropEffect` 是一个字符串，表示拖放操作的效果。

4. **获取允许的拖放效果**

```javascript
const effectAllowed = event.dataTransfer.effectAllowed;
```

- `effectAllowed` 是一个字符串，表示允许的拖放操作效果。

5. **处理文件**

```javascript
for (let i = 0; i < files.length; i++) {
  const file = files[i];
  console.log('File:', file.name);
}
```

- 遍历 `files` 列表，处理每个文件。

6. **设置拖放效果**

```javascript
const handleDragOver = (event) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'copy'; // 设置拖放效果为复制
};
```

- 在 `dragover` 事件中，设置 `dropEffect` 为 `copy`，表示拖放操作的效果为复制。

### 总结

- `action` 是一个事件对象，通常在事件处理函数中作为参数传递。它包含了与事件相关的所有信息和方法。在拖放操作中，`action` 通常是一个 `DragEvent` 对象。
- `action.dataTransfer` 是 `DragEvent` 对象的一个属性，表示拖放操作中传输的数据。`DataTransfer` 对象包含了拖放操作中传输的数据和相关的操作方法。

通过使用 `action` 和 `action.dataTransfer` 对象，可以获取拖放操作中的文件列表、数据类型、拖放效果等信息，并进行相应的处理。
