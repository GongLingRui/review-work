**总结**

`LightMapManager` 类通过一系列的图像处理步骤，将普通图片转换为适合光绘机使用的图像，主要流程如下：

1.  **输入图像:**  用户提供的图片 (base64 或 Blob)。
2.  **饱和度调整:**  `adjustColorSaturation()` 增强图像的色彩。
3.  **线稿提取:**  `colorToSketch()` 将图像转换为线稿图。
4.  **背景移除 (可选):** `getRemoveBgImage()` 使用外部服务移除背景，生成剪影图。
5.  **背景效果 (可选):** `detectHighlightAreas()` 和 `highlightBGBlender()` 创建背景效果, `setBGValue`设置参数.
6.  **图像混合:**  `sketchBlender()` 或 `silhouetteBlender()` 将彩色图像、线稿图/剪影图、背景效果图混合。
7.  **输出图像:**  生成最终的“开灯图”效果 (Blob)。
8. **打印**: `printClick()`将图片和其他信息打包为.tar, 并上传/发送给pc

这个类很好地封装了光绘图效果的实现细节，提供了清晰的 API 供外部调用。


总的来说,`LightMapManager` 类主要负责管理和处理 2D 编辑器中的光效映射相关操作,包括导入和导出图像数据、调整颜色饱和度、生成线稿图像、检测高亮区域、混合前景和背景等一系列图像处理操作。它使用了 OpenCV 库来执行这些操作,并提供了一些方法供其他模块调用,以实现光效映射的功能。
