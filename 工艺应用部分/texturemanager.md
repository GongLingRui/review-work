这段代码实现了一个复杂的 **2D/3D 纹理处理与打印管理系统**，其中包含多个函数，每个函数的逻辑都较为复杂。为了帮助您理解，我将逐步讲解每个函数的逻辑，并尽量用流程图的方式表示。

---

## **1. `compressionImage`**
### **功能**：
将图片进行压缩，降低分辨率以减少文件大小。

### **逻辑**：
1. 创建一个 `Image` 对象并加载传入的 Base64 图片。
2. 根据图片的最大尺寸（宽或高）计算缩放比例：
   - 如果图片尺寸大于 6000，缩放比例为 0.3。
   - 如果图片尺寸大于 4000，缩放比例为 0.4。
   - 如果图片尺寸大于 1000，缩放比例为 0.5。
   - 默认缩放比例为 0.8。
3. 创建一个 `canvas`，将图片绘制到 `canvas` 上，并按缩放比例调整大小。
4. 将 `canvas` 转换为新的 Base64 图片。
5. 返回压缩后的 Base64 图片。

### **流程图**：
```plaintext
[Start] --> [Load Base64 Image] --> [Calculate Scale]
    --> [Create Canvas] --> [Draw Image on Canvas]
    --> [Resize Image] --> [Convert Canvas to Base64]
    --> [Return Compressed Image]
```

---

## **2. `getCanvasGrayImgOf3dRelief`**
### **功能**：
生成 3D 浮雕的灰度图。

### **逻辑**：
1. 获取当前画布的所有对象，并找到工作区对象。
2. 根据项目模型调整画布的尺寸和缩放比例。
3. 克隆当前画布，并将其对象按缩放比例调整。
4. 遍历画布中的每个对象：
   - 如果对象是图片且有纹理类型：
     - 生成彩色图像（`get3dReliefColorImg`）。
     - 生成灰度图像（`get3dReliefGrayImg`）。
     - 如果需要，将透明区域替换为黑色。
5. 返回生成的灰度图数组和画布预览数据。

### **流程图**：
```plaintext
[Start] --> [Get Canvas Objects] --> [Adjust Canvas Size]
    --> [Clone Canvas] --> [Scale Objects]
    --> [For Each Object]
        --> [Is Image with Texture?]
            --> [Generate Color Image]
            --> [Generate Gray Image]
            --> [Replace Transparent with Black]
    --> [Return Gray Images and Preview Data]
```

---

## **3. `get3dReliefColorImg`**
### **功能**：
生成 3D 浮雕的彩色图像。

### **逻辑**：
1. 创建一个临时 `canvas`，用于渲染工作区。
2. 创建另一个临时 `canvas`，用于渲染当前图片。
3. 如果有其他对象：
   - 遍历这些对象，将它们叠加到当前图片的 `canvas` 上。
4. 将当前图片的 `canvas` 绘制到工作区的 `canvas` 上。
5. 返回最终的彩色图像（Base64 格式）。

### **流程图**：
```plaintext
[Start] --> [Create Workspace Canvas] --> [Create Image Canvas]
    --> [For Each Remaining Object]
        --> [Render Object on Image Canvas]
        --> [Blend Image Canvas with Workspace Canvas]
    --> [Return Color Image]
```

---

## **4. `get3dReliefGrayImg`**
### **功能**：
生成 3D 浮雕的灰度图。

### **逻辑**：
1. 创建一个临时 `canvas`，用于渲染工作区。
2. 创建另一个临时 `canvas`，用于渲染当前图片。
3. 如果有其他对象：
   - 遍历这些对象，将它们叠加到当前图片的 `canvas` 上。
4. 将当前图片的 `canvas` 绘制到工作区的 `canvas` 上。
5. 返回最终的灰度图（Base64 格式）。

### **流程图**：
```plaintext
[Start] --> [Create Workspace Canvas] --> [Create Image Canvas]
    --> [For Each Remaining Object]
        --> [Render Object on Image Canvas]
        --> [Blend Image Canvas with Workspace Canvas]
    --> [Return Gray Image]
```

---

## **5. `combineImages`**
### **功能**：
将两张图片合并为一张。

### **逻辑**：
1. 创建一个新的 `canvas`。
2. 将基础图片绘制到 `canvas` 上。
3. 设置合成模式为 `source-atop`。
4. 将覆盖图片绘制到 `canvas` 上。
5. 返回合成后的图片（Base64 格式）。

### **流程图**：
```plaintext
[Start] --> [Create Canvas] --> [Draw Base Image]
    --> [Set Blend Mode] --> [Draw Overlay Image]
    --> [Return Combined Image]
```

---

## **6. `getCanvasGrayImgOfPrint`**
### **功能**：
生成打印用的灰度图。

### **逻辑**：
1. 调用 `getCanvasGrayImgOf3dRelief` 获取灰度图数组。
2. 如果包含光泽图：
   - 合并光泽图。
3. 如果包含浮雕图：
   - 归一化浮雕图的高度。
   - 合并所有灰度图。
4. 返回最终的灰度图和厚度信息。

### **流程图**：
```plaintext
[Start] --> [Get Gray Images] --> [Has Gloss Images?]
    --> [Merge Gloss Images]
    --> [Has Relief Images?]
        --> [Normalize Relief Heights]
        --> [Merge All Gray Images]
    --> [Return Final Gray Image and Thickness]
```

---

## **7. `replaceBlackWithTransparent`**
### **功能**：
将图片中的黑色区域替换为透明。

### **逻辑**：
1. 创建一个掩码，标记图片中的黑色像素。
2. 反转掩码，标记非黑色像素。
3. 使用掩码将非黑色像素复制到目标图像。
4. 返回处理后的图片。

### **流程图**：
```plaintext
[Start] --> [Create Mask for Black Pixels]
    --> [Invert Mask] --> [Copy Non-Black Pixels]
    --> [Return Processed Image]
```

---

## **8. `hanlderContrast`**
### **功能**：
调整图片的对比度。

### **逻辑**：
1. 加载图片并绘制到 `canvas` 上。
2. 遍历图片的像素，应用对比度公式。
3. 如果需要，反转图片颜色。
4. 返回处理后的图片（Base64 格式）。

### **流程图**：
```plaintext
[Start] --> [Load Image] --> [Draw Image on Canvas]
    --> [For Each Pixel]
        --> [Apply Contrast Formula]
        --> [Invert Colors (Optional)]
    --> [Return Processed Image]
```

---

## **9. `grayToNormalMap`**
### **功能**：
将灰度图转换为法线贴图。

### **逻辑**：
1. 加载灰度图并计算 X 和 Y 方向的梯度。
2. 计算法线向量并归一化。
3. 将法线向量转换为 0-1 范围。
4. 返回法线贴图（Base64 格式）。

### **流程图**：
```plaintext
[Start] --> [Load Gray Image] --> [Calculate Gradients]
    --> [Compute Normal Vectors] --> [Normalize Vectors]
    --> [Return Normal Map]
```

---

## **10. `printClick`**
### **功能**：
生成打印文件并上传。

### **逻辑**：
1. 将图片和灰度图转换为 Base64 格式。
2. 创建打印层数据并打包为 `.tar` 文件。
3. 如果是 PC 端：
   - 上传文件并发送打印命令。
4. 如果是非 PC 端：
   - 上传文件并生成打印链接。

### **流程图**：
```plaintext
[Start] --> [Convert Images to Base64] --> [Create Print Layers]
    --> [Package as .tar File]
    --> [Is PC?]
        --> [Upload and Send Print Command]
    --> [Else]
        --> [Upload and Generate Print Link]
```

---

## **总结**

这些函数的主要功能是处理 2D/3D 纹理和打印相关的任务，包括图片压缩、灰度图生成、法线贴图生成、对比度调整、图片合并以及打印文件的生成与上传。通过这些函数，可以实现从纹理生成到打印的完整流程。

如果您需要更详细的解释或具体的代码实现，请随时告诉我！
