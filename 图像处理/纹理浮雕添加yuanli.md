在这段代码中，普通纹理（Color Texture）、光泽纹理（Gloss Texture）和浮雕（Relief）的添加是通过 `TextureEffect2dManager` 和 `OpenCvImgToolMangager` 的方法实现的。以下是详细的讲解，包括每种纹理的生成过程、操作步骤、以及为什么要这样做。

---

## **1. 普通纹理（Color Texture）**

### **1.1 功能**
普通纹理是最基础的纹理类型，主要用于为 3D 模型提供颜色信息。它不包含深度或光泽信息。

### **1.2 添加过程**

#### **步骤：**
1. **上传图片：**
   - 用户上传一张图片作为普通纹理的基础。
   - 图片可以是 `.jpeg`、`.png`、`.webp` 等格式。

2. **压缩图片：**
   - 使用 `compressionImage` 方法对图片进行压缩，降低分辨率，减少文件大小。
   - 压缩比例根据图片的分辨率动态调整。

   **代码：**
   ```typescript
   const compressGray = await manager.compressionImage(grayBase64);
   ```

3. **生成灰度图：**
   - 使用 `convertToGrayscale` 方法将图片转换为灰度图。
   - 灰度图的亮度值表示纹理的深浅。

   **代码：**
   ```typescript
   const res1 = await manager.base64ToGrayscaleKeepAlpha(sourceImg);
   grayImgRef.current = res1.grayscaleImage;
   ```

4. **上传纹理：**
   - 将生成的灰度图和原始图片上传到服务器。
   - 使用 `upload2dEditFile` 方法上传文件。

   **代码：**
   ```typescript
   const [res1, res2] = await Promise.all([
       upload2dEditFile(thumbnailFile, GetUpTokenFileTypeEnum.Edit2dLocal),
       upload2dEditFile(origin, GetUpTokenFileTypeEnum.Edit2dLocal),
   ]);
   ```

5. **创建纹理：**
   - 调用 `createTexture` 方法，在服务器端创建普通纹理。
   - 提供灰度图、原始图片和其他参数（如对比度、厚度等）。

   **代码：**
   ```typescript
   const res3 = await createTexture({
       category: TextureType.CMYK,
       thumb_key: res1.thumb_key,
       org_img_key: res2.org_img_key,
       gray_img_key: res2.gray_img_key,
       param: `{thickness:${thicknessValue},contrast:${contrastValue},invert:${isInvert}}`,
   });
   ```

6. **渲染纹理：**
   - 使用 `textureScene.create` 方法将纹理渲染到 3D 模型上。

   **代码：**
   ```typescript
   textureScene.create({
       grayData: [data],
       colorBase64: downUpload[0].download_url,
   });
   ```

---

## **2. 光泽纹理（Gloss Texture）**

### **2.1 功能**
光泽纹理用于模拟物体表面的光泽效果。它通过灰度图的亮度值来控制光泽的强弱。

### **2.2 添加过程**

#### **步骤：**
1. **上传图片：**
   - 用户上传一张图片作为光泽纹理的基础。

2. **生成灰度图：**
   - 使用 `convertToGrayscale` 方法将图片转换为灰度图。
   - 灰度图的亮度值表示光泽的强弱。

   **代码：**
   ```typescript
   const res1 = await manager.base64ToGrayscaleKeepAlpha(sourceImg);
   grayImgRef.current = res1.grayscaleImage;
   ```

3. **生成法线贴图：**
   - 使用 `grayToNormalMap` 方法将灰度图转换为法线贴图。
   - 法线贴图用于模拟光照效果，使得光泽更加真实。

   **代码：**
   ```typescript
   const normalMap = await manager.grayToNormalMap(grayBase64);
   ```

4. **上传纹理：**
   - 将生成的灰度图和法线贴图上传到服务器。

5. **创建纹理：**
   - 调用 `createTexture` 方法，在服务器端创建光泽纹理。
   - 提供灰度图、法线贴图和其他参数。

   **代码：**
   ```typescript
   const res3 = await createTexture({
       category: TextureType.GLOSS,
       thumb_key: res1.thumb_key,
       org_img_key: res2.org_img_key,
       gray_img_key: res2.gray_img_key,
       param: `{thickness:${thicknessValue},contrast:${contrastValue},invert:${isInvert}}`,
   });
   ```

6. **渲染纹理：**
   - 使用 `textureScene.create` 方法将光泽纹理渲染到 3D 模型上。

---

## **3. 浮雕（Relief）**

### **3.1 功能**
浮雕是一种特殊的纹理类型，用于模拟物体表面的凹凸效果。它通过灰度图的亮度值来表示深度信息。

### **3.2 添加过程**

#### **步骤：**
1. **上传图片：**
   - 用户上传一张图片作为浮雕的基础。

2. **去背景（可选）：**
   - 如果用户选择去背景，调用 `removebgTask` 方法去除图片的背景。
   - 使用 Alpha 通道生成掩码，将背景区域设置为透明。

   **代码：**
   ```typescript
   const removeBgDate = {
       no_display_flag: true,
       src_image: res2.org_img_key,
   };
   const removeId = await removebgTask(removeBgDate);
   ```

3. **生成深度图：**
   - 调用 `createTask` 方法生成深度图。
   - 深度图的亮度值表示浮雕的深度。

   **代码：**
   ```typescript
   const test = await createTask({
       no_display_flag: true,
       src_image: ref_images,
       model_type: 0,
   });
   ```

4. **生成风格化图像（可选）：**
   - 如果用户选择应用风格化效果，调用 `createStyleTask` 方法生成风格化图像。

   **代码：**
   ```typescript
   const getTaskId = await createStyleTask({
       no_display_flag: true,
       src_image: test2.data.result_list[0].file_name,
       ref_images: [ref_images],
       template_id: TemplateId,
   });
   ```

5. **灰度图后处理：**
   - 使用 `GrayPostProcessing` 方法对灰度图进行后处理。
   - 将去背景图范围之外的色值变为黑色。

   **代码：**
   ```typescript
   const grayImgBase = await openCvImgToolMangager.GrayPostProcessing(
       removeImgBase,
       grayImgBase64,
   );
   ```

6. **上传纹理：**
   - 将生成的灰度图和深度图上传到服务器。

7. **创建浮雕：**
   - 调用 `createRelief` 方法，在服务器端创建浮雕。
   - 提供灰度图、深度图和其他参数。

   **代码：**
   ```typescript
   const res3 = await createRelief({
       category: TextureType.RELIEF,
       thumb_key: res2.thumb_key,
       org_img_key: res2.org_img_key,
       depth_img_key: endData.data.result_list[0].file_name,
       param: `{thickness:${thicknessValue},contrast:${contrastValue},invert:${isInvert}}`,
   });
   ```

8. **渲染浮雕：**
   - 使用 `textureScene.create` 方法将浮雕渲染到 3D 模型上。

---

## **4. 为什么这么做？**

### **4.1 提高模型的真实感**
- 普通纹理提供颜色信息，使得模型看起来更加丰富。
- 光泽纹理模拟光照效果，使得模型表面更加真实。
- 浮雕通过深度信息模拟凹凸效果，使得模型具有立体感。

### **4.2 提升用户体验**
- 自动生成灰度图、法线贴图和深度图，简化了用户操作。
- 提供去背景和风格化选项，满足用户的个性化需求。

### **4.3 优化性能**
- 压缩图片和合成纹理可以减少文件大小，提高传输和处理效率。
- 通过工具类封装复杂的图像处理逻辑，提高代码的可读性和可维护性。

---

## **5. 图形学知识补充**

### **5.1 灰度图**
- 灰度图是只有亮度信息的图像，每个像素的值表示亮度，范围通常是 0（黑）到 255（白）。
- 在 3D 渲染中，灰度图可以用来表示深度信息（亮的地方高，暗的地方低）。

### **5.2 法线贴图**
- 法线贴图是一种特殊的纹理，用于模拟 3D 模型表面的细节。
- 它通过颜色值表示表面的法线方向，用于光照计算，使得模型表面看起来更加真实。

### **5.3 深度图**
- 深度图是用灰度值表示深度信息的图像。
- 在浮雕中，深度图的亮度值表示浮雕的深度。

### **5.4 Alpha 通道**
- Alpha 通道表示图片的透明度，每个像素的值范围是 0（完全透明）到 255（完全不透明）。
- 在图像处理任务中，Alpha 通道可以用来生成掩码。

---

通过这些详细的讲解，相信你对普通纹理、光泽纹理和浮雕的添加过程有了更深入的理解！
