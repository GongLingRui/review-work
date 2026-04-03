### **`replaceThumbnailWithOriginal` 方法的使用场景**

#### **1. 什么时候用到这个函数？**
`replaceThumbnailWithOriginal` 方法在 **纹理图片加载到画布后** 被调用，用于将初始加载的 **缩略图** 替换为 **高清原图**。具体来说，它在以下场景中被使用：

1. **添加纹理到画布时**：
   - 在 `addToCavas` 方法中，当用户选择一个纹理图片并将其添加到画布时，初始加载的是缩略图（低分辨率图片）。
   - 在缩略图加载完成后，后台会异步加载高清原图，并调用 `replaceThumbnailWithOriginal` 方法将缩略图替换为高清原图。

2. **纹理类型为浮雕（Relief Texture）时**：
   - 如果纹理类型是浮雕（`TextureType.RELIEF`），在加载高清原图的同时，还会对灰度图进行处理（如调整对比度），然后替换缩略图。

---

#### **2. 为什么需要这么做？**

##### **2.1 提升用户体验**
- **快速显示预览**：
  - 高清图片通常体积较大，加载时间较长。如果直接加载高清图片，用户可能会看到空白画布，体验较差。
  - 使用缩略图可以快速显示图片的预览效果，用户无需等待高清图片加载完成。

- **无缝替换**：
  - 在后台加载高清图片的同时，用户可以继续操作画布。当高清图片加载完成后，自动替换缩略图，用户几乎感觉不到延迟。

##### **2.2 优化性能**
- **减少初始加载的资源占用**：
  - 缩略图的文件体积较小，加载速度快，占用的内存和计算资源也更少。
  - 在初始加载时使用缩略图，可以显著减少对系统资源的消耗。

- **分步加载**：
  - 通过分步加载（先加载缩略图，再加载高清图），可以避免一次性加载大量高清图片导致的性能问题。

##### **2.3 支持复杂场景**
- **分组处理**：
  - 如果图片属于某个分组（如纹理分组），`replaceThumbnailWithOriginal` 方法会解组、替换图片后再重新分组，确保分组的完整性。
- **裁剪路径**：
  - 如果图片有裁剪路径（`clipPath`），方法会在替换图片时恢复裁剪路径，确保图片的显示效果一致。

---

#### **3. 方法的调用流程**

以下是 `replaceThumbnailWithOriginal` 方法的调用流程：

1. **用户选择纹理图片**：
   - 用户在纹理库中选择一张图片，并将其添加到画布中。
   - 调用 `addToCavas` 方法。

2. **加载缩略图**：
   - 在 `addToCavas` 方法中，初始加载的是缩略图（低分辨率图片）。
   - 缩略图加载完成后，图片会被添加到画布中。

3. **后台加载高清原图**：
   - 在缩略图加载完成后，后台会异步加载高清原图。
   - 调用 `replaceThumbnailWithOriginal` 方法，将缩略图替换为高清原图。

4. **替换缩略图**：
   - 在 `replaceThumbnailWithOriginal` 方法中：
     - 如果图片属于某个分组，先解组，再替换图片，最后重新分组。
     - 如果图片有裁剪路径，替换图片后恢复裁剪路径。
     - 更新图片的缩放比例和位置，使其与缩略图一致。
     - 通知其他组件更新状态（如滑块的最大值）。

---

#### **4. 代码中的具体调用**

以下是 `replaceThumbnailWithOriginal` 方法的具体调用代码：

##### **在 `addToCavas` 方法中**
```typescript
const addToCavas = async (data: any, activeObject?: any) => {
  const fileExtension =
    data?.attributes?.texture_img?.data?.attributes?.url?.split('.').pop() ||
    data?.attributes?.org_img.split('?')[0]?.split('.')?.pop();
  const textureType = TextureTypeMap[tabKey[activeKey]] || TextureType.CMYK;
  const base64 = await convertToBase64(data?.img);

  canvasEditor?.addTextureImage(
    base64,
    {
      importSource: ImportSource.Cloud,
      fileType: fileExtension,
      textureType,
      isPublish: !!data?.attributes?.publishedAt,
      [CustomKey.skip_upload]: true,
    },
    activeObject,
    async (object: any, g) => {
      if (object) {
        const attributes = data?.attributes;

        const grayUrl = decodeURIComponent(
          attributes.depth_img || attributes.texture_gray_img?.data?.attributes?.url || attributes?.gray_img,
        );

        let textureUrl = decodeURIComponent(attributes?.texture_img?.data?.attributes?.url || attributes?.org_img);

        if (!grayUrl || !textureUrl) {
          return;
        }

        canvasEditor?.addLoadingElement(object);

        Promise.all([convertToBase64(grayUrl), convertToBase64(textureUrl)]).then(async (res) => {
          let gray = res[0];
          if (object.textureType === TextureType.RELIEF) {
            gray = await textureEffect2dManager.hanlderContrast1(gray, 0.7);
          }
          object.set({
            grayscale: gray,
          });
          replaceThumbnailWithOriginal(res[1], object); // 调用替换方法
        });
      }
    },
  );
};
```

---

#### **5. 方法的逻辑详解**

以下是 `replaceThumbnailWithOriginal` 方法的逻辑分步解析：

##### **5.1 检查是否有高清图**
- 如果 `base64Original` 存在，说明高清图已经加载完成，可以进行替换。
- 如果 `base64Original` 不存在，直接结束编辑状态。

##### **5.2 计算原始尺寸**
- 获取当前图片的宽度、高度和缩放比例。
- 考虑画布的缩放因子（`zoom`），计算高清图的实际显示尺寸。

##### **5.3 替换图片源**
- 调用 `imageElement.setSrc` 方法，将图片的源替换为高清图的 Base64 数据。
- 替换完成后，执行回调函数，更新图片的属性。

##### **5.4 处理分组**
- 如果图片在一个分组中：
  1. 解组分组。
  2. 更新图片的缩放比例和位置。
  3. 恢复分组。
- 如果图片不在分组中，直接更新图片的缩放比例和位置。

##### **5.5 通知其他组件**
- 通过 `eventBus` 通知其他组件，图片的编辑状态已经结束。
- 通知滑块组件更新最大值（可能用于调整图片的缩放或其他参数）。

##### **5.6 保存历史记录**
- 调用 `canvasEditor.startSaveHistory` 方法，开始保存用户的操作历史。

---

#### **6. 总结**

`replaceThumbnailWithOriginal` 方法的设计是为了 **提升用户体验** 和 **优化性能**：
1. **先加载缩略图**：快速显示预览效果。
2. **后台加载高清图**：在用户操作的同时加载高清图。
3. **替换为高清图**：高清图加载完成后，自动替换缩略图，保证最终的显示效果。
4. **支持复杂场景**：处理了分组、缩放、裁剪等复杂场景，保证功能的灵活性和稳定性。

这种设计在需要加载大图片的场景中非常常见，是一种性能优化和用户体验提升的最佳实践。
