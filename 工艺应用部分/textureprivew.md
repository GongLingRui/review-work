### **`TexturePreview` 组件的逻辑详解**

`TexturePreview` 是一个用于 **3D纹理预览和编辑** 的 React 组件。它的主要功能是：
1. **加载和渲染3D纹理**：将灰度图和法线图应用到3D模型上，生成纹理效果。
2. **支持参数调节**：用户可以通过滑块和开关调整纹理的厚度（`thickness`）、平滑度（`smoothness`/对比度）和反转（`invert`）。
3. **支持多层纹理管理**：可以切换和编辑不同的纹理层。
4. **支持2D/3D切换**：用户可以在2D和3D视图之间切换。

以下是对代码逻辑的详细分析，包括每个部分的功能、实现方式以及为什么这么做。

---

### **1. 组件的核心功能**

#### **1.1 初始化场景**
- **功能**：初始化3D场景，加载纹理数据，并渲染到画布中。
- **实现方式**：
  - 使用 `three.js` 创建一个3D场景（`TextureScene` 或 `RotatingBodyScene`）。
  - 加载灰度图和法线图，生成纹理几何体。
  - 将纹理几何体添加到3D场景中，并设置光照、相机等。

#### **1.2 参数调节**
- **功能**：支持用户通过滑块和开关调整纹理的厚度、平滑度和反转。
- **实现方式**：
  - 使用 `Slider` 和 `Switch` 组件，监听用户的输入。
  - 调用对应的处理函数（如 `hanlderThickness`、`hanlderContrast`、`hanlderInvert`），更新纹理数据并重新渲染。

#### **1.3 多层纹理管理**
- **功能**：支持切换和编辑不同的纹理层。
- **实现方式**：
  - 获取画布中的所有纹理对象，并生成一个纹理层列表。
  - 用户点击某一层时，设置为当前激活的纹理层（`activeData`）。

#### **1.4 2D/3D切换**
- **功能**：支持在2D和3D视图之间切换。
- **实现方式**：
  - 在切换到2D视图时，调用 `updateTexture` 方法，将3D纹理的参数（如厚度、平滑度）应用到2D画布中。

---

### **2. 代码逻辑详解**

#### **2.1 初始化场景**

##### **代码片段**
```typescript
useEffect(() => {
  if (canvasEditor?.getLoadingElements().length === 0) {
    initScene();
  } else {
    timer.current = setInterval(() => {
      if (canvasEditor?.getLoadingElements().length === 0) {
        clearInterval(timer.current);
        initScene();
      }
    }, 500);
  }
  return () => {
    clearInterval(timer.current);
    timer.current = null;
    textureScene.current?.removeScene();
    textureScene.current = null;
    temGrayData.current = null;
    textureCanvas.current = null;
    rotary_params.current = null;
    setGrayData([]);
    setActiveData(undefined);
  };
}, []);
```

##### **逻辑**
1. **等待画布加载完成**：
   - 如果画布中有正在加载的元素（`getLoadingElements`），则每隔500ms检查一次，直到加载完成。
   - 这样可以确保在画布加载完成后再初始化3D场景，避免数据不完整。

2. **初始化场景**：
   - 调用 `initScene` 方法，创建3D场景并加载纹理数据。

3. **清理资源**：
   - 在组件卸载时，清理定时器和3D场景，释放内存。

---

#### **2.2 初始化3D场景**

##### **代码片段**
```typescript
function initScene() {
  const isCylindrical =
    projectModel.canvases[projectModel.canvasesIndex].category === CanvasCategory.CANVAS_CATEGORY_CYLINDRICAL;
  const print_param = JSON.parse(projectModel.canvases[projectModel.canvasesIndex].print_param);

  const widthMM = print_param.format_size_w_non;

  if (isCylindrical) {
    textureScene.current = new RotatingBodyScene(textureCanvas.current);
    rotary_params.current = print_param.rotary_params;
  } else {
    textureScene.current = new TextureScene(textureCanvas.current);
  }

  hanlderGlossTexture(true);

  const grayPromise = textureEffect2dManager.getCanvasGrayImgOf3dRelief(canvasEditor, true, projectData);

  grayPromise.then((res) => {
    const compressGrayPromise = isUseGray ? getCompressionImage(res.grayImgs) : new Promise((resolve) => resolve([]));
    const colorData = res.canvasPreviewData.dataUrl;

    Promise.all([compressGrayPromise, hanlderColorImg(colorData)]).then((res) => {
      const colorData = res[1];
      const compressGrayData = res[0];
      getNormalMap(compressGrayData).then((grayData: any) => {
        const data = {
          grayData: grayData,
          widthMM,
          colorBase64: colorData,
          hasBaseMap,
        };

        setGrayData(grayData);

        grayData.forEach((data: Texture3dGrayImageItem) => {
          temGrayData.current[data.id] = data.grayImg;
          if (data.grayType === TextureType.GLOSS) {
            data.material_params = glossMaterialParams;
          } else {
            data.material_params = cmykMaterialParams;
          }
        });

        setLoading(false);
        if (isCylindrical) {
          textureScene.current.init(data, rotary_params.current);
        } else {
          textureScene.current.init(data);
        }
        setActiveData(grayData[0] || null);
        if (grayData[0]) {
          setThickness(grayData[0].thickness || (grayData[0].grayType === TextureType.RELIEF ? 5 : 1));
          setContrast(grayData[0].contrast || (grayData[0].grayType === TextureType.RELIEF ? 0.7 : 1));
          setShowInvert(grayData[0].grayType === TextureType.RELIEF ? false : true);
        }
      });
    });
  });
}
```

##### **逻辑**
1. **判断是否为旋转体**：
   - 如果当前画布是旋转体（如圆柱体），使用 `RotatingBodyScene` 创建场景。
   - 否则，使用 `TextureScene` 创建场景。

2. **加载灰度图和法线图**：
   - 调用 `getCanvasGrayImgOf3dRelief` 方法，从画布中提取灰度图。
   - 调用 `getNormalMap` 方法，从灰度图生成法线图。

3. **初始化纹理数据**：
   - 将灰度图和法线图存储到 `grayData` 中。
   - 设置材质参数（如 `glossMaterialParams` 和 `cmykMaterialParams`）。

4. **渲染场景**：
   - 调用 `textureScene.current.init` 方法，将纹理数据加载到3D场景中。

---

#### **2.3 参数调节**

##### **厚度调节**
```typescript
function hanlderThickness(thickness: number) {
  if (activeData?.grayType === TextureType.RELIEF) {
    grayData.forEach((data) => {
      if (data.id === activeData?.id) {
        data.thickness = thickness;
        textureScene.current.update(data, rotary_params.current);
      }
    });
  } else {
    grayData.forEach((data) => {
      if (data.grayType !== TextureType.RELIEF) {
        data.thickness = thickness;
        textureScene.current.update(data, rotary_params.current);
      }
    });
  }
}
```

- **逻辑**：
  - 遍历 `grayData`，找到当前激活的纹理层（`activeData`）。
  - 更新其厚度（`thickness`），并调用 `textureScene.current.update` 方法重新渲染。

##### **平滑度调节**
```typescript
async function hanlderContrast(contrast: number) {
  grayData.forEach(async (data) => {
    if (data.id === activeData?.id) {
      let img = temGrayData.current[data.id];
      let res = await textureEffect2dManager.hanlderContrast(img, contrast, invert);
      data.grayImg = res;
      data.contrast = contrast;
      textureScene.current.update(data, rotary_params.current);
    }
  });
}
```

- **逻辑**：
  - 调用 `textureEffect2dManager.hanlderContrast` 方法调整灰度图的对比度。
  - 更新纹理数据，并重新渲染。

##### **反转调节**
```typescript
async function hanlderInvert(invert: boolean) {
  grayData.forEach(async (data) => {
    if (data.id === activeData?.id) {
      let img = temGrayData.current[data.id];
      const res = await textureEffect2dManager.hanlderContrast(img, contrast, invert);
      const normal = await textureEffect2dManager.grayToNormalMap(res);
      data.grayImg = res;
      data.normal = normal;
      data.invert = invert;
      textureScene.current.update(data, rotary_params.current);
    }
  });
}
```

- **逻辑**：
  - 调用 `textureEffect2dManager.hanlderContrast` 方法调整灰度图的对比度，并反转亮暗关系。
  - 调用 `grayToNormalMap` 方法重新生成法线图。
  - 更新纹理数据，并重新渲染。

---

#### **2.4 多层纹理管理**

##### **代码片段**
```typescript
function getTextureLayersList() {
  const otherObjects = canvasEditor?.canvas
    .getObjects()
    .filter((obj) => !(obj as any).id.includes(WorkspaceID.WorkspaceCavas));
  otherObjects.reverse();
  if (otherObjects.length > 0) {
    return (
      <div className={classs.layersBox}>
        {otherObjects?.map((data: any) => {
          if (data.textureType || data._isTextureGroup) {
            const id = data.textureType ? data.id : data._objects[1].id;
            const _grayData = getGrayData(id);
            return (
              <div
                className={classs.texturelayerItem}
                style={id === activeData?.id ? { background: '#F2F2F2' } : { background: '#fff' }}
                onClick={() => {
                  if (id === activeData?.id) {
                    setActiveData(undefined);
                  } else {
                    setActiveData(_grayData);
                    setContrast(_grayData.contrast || (_grayData.grayType === TextureType.RELIEF ? 0.7 : 1));
                    setThickness(_grayData.thickness || (_grayData.grayType === TextureType.RELIEF ? 5 : 1));
                    setInvert(_grayData.invert || false);
                    setShowInvert(_grayData.grayType === TextureType.RELIEF ? false : true);
                  }
                }}
              >
                <span className={classs.textureName}>
                  <img src={textureIcon} />
                  {data._layerNameCus || data._layerName}
                </span>
                <span className={classs.textureTab}>3D</span>
              </div>
            );
          }
        })}
      </div>
    );
  }
}
```

- **逻辑**：
  - 遍历画布中的所有纹理对象，生成一个纹理层列表。
  - 用户点击某一层时，设置为当前激活的纹理层（`activeData`）。

---

### **3. 为什么这么做？**

1. **提升用户体验**：
   - 支持实时预览和参数调节，用户可以直观地看到调整效果。
   - 支持多层纹理管理，方便用户编辑复杂的纹理。

2. **性能优化**：
   - 使用 `three.js` 渲染3D场景，性能高效。
   - 通过缓存灰度图（`temGrayData`），避免重复计算。

3. **代码复用**：
   - 将纹理处理逻辑封装到 `TextureEffect2dManager` 中，便于复用和维护。

---

### **4. 总结**

`TexturePreview` 是一个功能强大的 3D 纹理预览和编辑组件。它通过结合 `three.js` 和 `OpenCV`，实现了纹理的加载、渲染和参数调节。代码设计清晰，模块化程度高，既提升了用户体验，又保证了性能。
