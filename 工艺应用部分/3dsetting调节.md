在3D纹理的实现中，`thickness`（厚度）、`smoothness`（平滑度/对比度）和 `invert`（反转）是三个关键的调节参数，它们直接影响纹理的视觉效果和3D渲染的表现。这些参数的调节主要通过对 **灰度图** 和 **法线图** 的处理来实现。以下是对这三个参数的详细讲解，包括它们的作用、实现原理和代码逻辑。

---

### **1. 参数概述**

#### **1.1 Thickness（厚度）**
- **作用**：
  - 控制纹理的高度范围（即凹凸的深度）。
  - 在 3D 渲染中，厚度决定了表面凹凸的强度。
- **实现原理**：
  - 厚度通过调整灰度图的值范围来实现。
  - 灰度图的值（0-255）表示表面的高度，厚度参数会对这些值进行缩放，从而改变表面的凹凸程度。

#### **1.2 Smoothness（平滑度/对比度）**
- **作用**：
  - 控制纹理的对比度，影响表面细节的清晰度。
  - 对比度越高，纹理的明暗对比越强，细节越清晰。
- **实现原理**：
  - 平滑度通过调整灰度图的对比度来实现。
  - 对比度的调整会改变灰度图中像素值的分布，使得亮的部分更亮，暗的部分更暗。

#### **1.3 Invert（反转）**
- **作用**：
  - 反转灰度图的明暗关系。
  - 例如，原本亮的部分变暗，暗的部分变亮。
- **实现原理**：
  - 反转通过对灰度图的像素值进行取反操作实现。
  - 公式：`newValue = 255 - oldValue`。

---

### **2. 实现原理和代码逻辑**

#### **2.1 Thickness（厚度）**

##### **实现原理**
- 厚度通过对灰度图的值进行缩放来实现。
- 假设灰度图的值范围是 `[0, 255]`，厚度参数会将其缩放到 `[0, thickness]`。
- 例如：
  - 如果厚度为 5，则灰度值范围变为 `[0, 5]`。
  - 如果厚度为 10，则灰度值范围变为 `[0, 10]`。

##### **代码实现**
在代码中，厚度的调节通过以下逻辑实现：
```typescript
function hanlderThickness(thickness: number) {
  grayData.forEach((data) => {
    if (data.id === activeData?.id) {
      data.thickness = thickness;
      textureScene.current.update(data, rotary_params.current);
    }
  });
}
```

- **关键点**：
  - `grayData` 是存储灰度图数据的数组。
  - `data.thickness` 是当前纹理的厚度值。
  - 调用 `textureScene.current.update` 方法更新纹理的几何体（`geometry`），重新渲染纹理。

---

#### **2.2 Smoothness（平滑度/对比度）**

##### **实现原理**
- 平滑度通过调整灰度图的对比度来实现。
- 对比度的调整公式：
  ```plaintext
  newValue = (oldValue - 128) * contrast + 128
  ```
  - `contrast` 是对比度参数，值越大，对比越强。
  - `128` 是灰度图的中间值，用于保持亮度的平衡。

##### **代码实现**
在代码中，平滑度的调节通过以下逻辑实现：
```typescript
async function hanlderContrast(contrast: number) {
  grayData.forEach(async (data) => {
    if (data.id === activeData?.id) {
      let img = temGrayData.current[data.id];
      const res = await textureEffect2dManager.hanlderContrast(img, contrast, invert);
      data.grayImg = res;
      textureScene.current.update(data, rotary_params.current);
    }
  });
}
```

- **关键点**：
  - `temGrayData.current[data.id]` 是原始的灰度图数据。
  - 调用 `textureEffect2dManager.hanlderContrast` 方法调整灰度图的对比度。
  - 调用 `textureScene.current.update` 方法更新纹理的几何体，重新渲染纹理。

##### **对比度调整的具体实现**
`hanlderContrast` 方法的实现如下：
```typescript
public async hanlderContrast(grayBase64: string, contrast: number, invert?: boolean): Promise<string> {
  const image = new Image();
  image.src = grayBase64;
  return new Promise((resolve, reject) => {
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.width = image.width;
      canvas.height = image.height;
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        let grayValue = data[i];
        grayValue = (grayValue - 128) * contrast + 128;
        grayValue = Math.min(Math.max(grayValue, 0), 255);
        data[i] = data[i + 1] = data[i + 2] = grayValue;

        if (invert) {
          data[i] = data[i + 1] = data[i + 2] = 255 - grayValue;
        }
      }

      context.putImageData(imageData, 0, 0);
      resolve(canvas.toDataURL('image/png'));
    };
  });
}
```

- **逻辑**：
  1. 将灰度图加载到 `canvas` 上。
  2. 遍历每个像素点，调整其灰度值。
  3. 如果 `invert` 为 `true`，对灰度值进行取反。
  4. 返回调整后的灰度图。

---

#### **2.3 Invert（反转）**

##### **实现原理**
- 反转通过对灰度图的像素值进行取反操作实现。
- 公式：`newValue = 255 - oldValue`
  - 如果原始值是 0（黑色），反转后变为 255（白色）。
  - 如果原始值是 255（白色），反转后变为 0（黑色）。

##### **代码实现**
在代码中，反转的调节通过以下逻辑实现：
```typescript
async function hanlderInvert(invert: boolean) {
  grayData.forEach(async (data) => {
    if (data.id === activeData?.id) {
      let img = temGrayData.current[data.id];
      const res = await textureEffect2dManager.hanlderContrast(img, contrast, invert);
      data.grayImg = res;
      textureScene.current.update(data, rotary_params.current);
    }
  });
}
```

- **关键点**：
  - `invert` 参数决定是否对灰度图进行反转。
  - 调用 `textureEffect2dManager.hanlderContrast` 方法时，将 `invert` 参数传入。
  - 调用 `textureScene.current.update` 方法更新纹理的几何体，重新渲染纹理。

---

### **3. 3D 渲染中的实现**

#### **3.1 灰度图到几何体的转换**
- 灰度图的值被用作几何体的高度信息。
- 在 `getTextureGeometry` 方法中，根据灰度图生成 3D 几何体：
  ```typescript
  getTextureGeometry(image: any, thickness = 1, upperRadius: number, lowerRadius: number, height: number) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.width = image.width;
    canvas.height = image.height;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    const cylinderGeometry = new THREE.CylinderGeometry(
      upperRadius,
      lowerRadius,
      height,
      canvas.width - 1,
      canvas.height - 1,
      true,
    );

    const vertices = cylinderGeometry.attributes.position.array;

    for (let i = 0; i < vertices.length; i += 3) {
      const grayValue = pixels[i / 3 * 4] / 255; // 灰度值归一化
      vertices[i + 2] += grayValue * thickness; // 根据厚度调整高度
    }

    cylinderGeometry.attributes.position.needsUpdate = true;
    return cylinderGeometry;
  }
  ```

#### **3.2 法线图的生成**
- 调整后的灰度图会被用来生成法线图，用于光照计算。
- 法线图的生成逻辑在 `grayToNormalMap` 方法中实现。

---

### **4. 总结**

- **`thickness`（厚度）**：
  - 通过缩放灰度图的值范围来实现，控制纹理的凹凸深度。
- **`smoothness`（平滑度/对比度）**：
  - 通过调整灰度图的对比度来实现，控制纹理的细节清晰度。
- **`invert`（反转）**：
  - 通过对灰度图的像素值取反来实现，反转纹理的明暗关系。

这些参数的调节通过对灰度图的处理实现，并最终影响 3D 几何体的生成和渲染效果。
