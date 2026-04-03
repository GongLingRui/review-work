

### **代码功能概述**
`createProjectRequest` 函数用于整理创建项目所需的数据，并调用创建项目的接口。它根据传入的 `canvasData`（画布数据）生成项目和画布的相关信息，并返回一个项目创建请求模型。如果 `isReplace` 为 `true`，则返回整理好的请求模型；否则，调用创建项目的接口。

---

### **代码详细注释**

```typescript
const createProjectRequest = (canvasData: any, isReplace?: boolean) => {
```

#### **参数说明**
- `canvasData`: 画布数据，包含画布的各种属性（如宽高、背景图、场景等）。
- `isReplace`: 可选参数，表示是否是替换项目。如果为 `true`，则返回整理好的请求模型，而不调用创建项目的接口。

---

#### **1. 整理场景数据**
```typescript
  let newScenes =
    canvasData?.scenes && Array.isArray(canvasData?.scenes) && canvasData?.scenes?.length
      ? canvasData?.scenes.map((item: any) => {
        let scenesImgs: string[] = [];
        item.scenesImg?.data?.forEach((element: any) => {
          scenesImgs.push(element?.attributes?.url);
        });
        return scenesImgs;
      })
      : [];
```

- **功能**：
  - 提取场景数据中的图片 URL，并将其整理为一个数组。
  - 如果 `canvasData.scenes` 存在且是一个非空数组，则遍历每个场景，提取 `scenesImg` 中的图片 URL。
  - 如果 `canvasData.scenes` 不存在或为空，则返回空数组。

- **场景**：
  - 用于支持多场景的项目（如多页面设计）。

---

#### **2. 初始化打印图层模型**
```typescript
  let canvasInfo: CanvasesInfo;
  const printLayerModel: PrintLayerModel = {
    printModel: PrintModel.printModel1, // 默认打印模式
    imgQuality: CanvasParams.canvas_quality_def, // 默认打印质量
    printLayerData: [], // 打印图层数据
  };
  
  printLayerModel.format_size_w = canvasData?.baseMapWidth || 0;
  printLayerModel.format_size_h = canvasData?.baseMapHeight || 0;
  printLayerModel.cavas_map = canvasData?.baseMapCavas?.data?.attributes?.url || '';
  let modelPath: string = canvasData?.modelUrl?.data?.attributes?.url || '';
```

- **功能**：
  - 初始化打印图层模型（`printLayerModel`），包括：
    - 打印模式（`printModel`）。
    - 打印质量（`imgQuality`）。
    - 打印图层数据（`printLayerData`）。
    - 画布尺寸（`format_size_w` 和 `format_size_h`）。
    - 画布背景图 URL（`cavas_map`）。
  - 提取模型路径（`modelPath`）。

- **场景**：
  - 用于设置打印相关的参数。

---

#### **3. 整理裁剪数据**
```typescript
  let cutData = {
    cutX: canvasData?.cutX || 0,
    cutY: canvasData?.cutY || 0,
    cutWidth: canvasData?.cutWidth || 0,
    cutHeight: canvasData?.cutHeight || 0,
  };
  if (canvasData.rotary_params) {
    printLayerModel.rotary_params = canvasData.rotary_params; // 如果是旋转体，设置旋转参数
  }
```

- **功能**：
  - 整理裁剪数据（`cutData`），包括裁剪的起点坐标（`cutX` 和 `cutY`）和裁剪的宽高（`cutWidth` 和 `cutHeight`）。
  - 如果画布是旋转体（如圆柱体），设置旋转参数（`rotary_params`）。

- **场景**：
  - 用于支持裁剪功能和旋转体画布。

---

#### **4. 整理额外数据**
```typescript
  let extraData = {
    cutData: modelPath.length > 0 ? JSON.stringify(cutData) : '', // 如果有模型路径，保存裁剪数据
    appCavas: canvasData?.appCavas?.data?.attributes?.url || '', // App 端画布 URL
    pcCavas: canvasData?.pcCavas?.data?.attributes?.url || '', // PC 端画布 URL
    canvasShape: canvasData?.canvasShape, // 画布形状
    bleedingLine: canvasData?.bleedingLine, // 出血线
  };
```

- **功能**：
  - 整理额外数据（`extraData`），包括：
    - 裁剪数据（`cutData`）。
    - App 和 PC 端的画布 URL。
    - 画布形状（`canvasShape`）。
    - 出血线（`bleedingLine`）。

- **场景**：
  - 用于保存与画布相关的额外信息。

---

#### **5. 整理画布信息**
```typescript
  const params: CanvasesInfo = {
    canvas_name: canvasData?.title || '', // 画布名称
    is_standard_product: canvasData?.isEditCanvas ? 2 : 1, // 是否是标准产品
    category: canvasData?.categoryType?.data?.attributes?.categoryKey, // 画布分类
    sub_category: canvasData?.categorySubType?.data?.attributes?.categorySubKey, // 画布子分类
    scenes: JSON.stringify(newScenes), // 场景数据
    base_map: canvasData?.baseMapBg?.data?.attributes?.url || '', // 画布背景图 URL
    base_map_width: canvasData?.width || 0, // 画布宽度
    base_map_height: canvasData?.height || 0, // 画布高度
    model_link: modelPath, // 模型路径
    print_param: JSON.stringify(printLayerModel), // 打印参数
    extra: JSON.stringify(extraData), // 额外数据
  };
```

- **功能**：
  - 整理画布信息（`params`），包括：
    - 画布名称、分类、子分类。
    - 场景数据、背景图 URL、宽高。
    - 模型路径、打印参数、额外数据。

- **场景**：
  - 用于保存画布的基本信息。

---

#### **6. 整理项目信息**
```typescript
  const projectInfo: ProjectInfo = {
    project_name: canvasData?.title || '', // 项目名称
    category: canvasData?.categoryType?.data?.attributes?.categoryKey, // 项目分类
    sub_category: canvasData?.categorySubType?.data?.attributes?.categorySubKey, // 项目子分类
    is_standard_product: canvasData?.isEditCanvas ? 2 : 1, // 是否是标准产品
  };
```

- **功能**：
  - 整理项目信息（`projectInfo`），包括项目名称、分类、子分类和是否是标准产品。

- **场景**：
  - 用于保存项目的基本信息。

---

#### **7. 创建项目请求模型**
```typescript
  const projectCreateRequestModel: ProjectCreateRequestModel = {
    project_info: projectInfo, // 项目信息
    canvases: canvasesInfo, // 画布信息
  };
```

- **功能**：
  - 将项目信息和画布信息组合成创建项目的请求模型。

---

#### **8. 返回或调用创建接口**
```typescript
  if (isReplace) {
    projectCreateRequestModel.canvasesIndex = 0; // 如果是替换项目，设置画布索引为 0
    return projectCreateRequestModel;
  } else {
    return createProject(projectCreateRequestModel).then((resp) => {
      return resp; // 调用创建项目接口
    });
  }
};
```

- **逻辑**：
  - 如果 `isReplace` 为 `true`，直接返回整理好的请求模型。
  - 如果 `isReplace` 为 `false`，调用 `createProject` 接口创建项目，并返回接口响应。

---

### **总结**

#### **功能概述**
1. 整理场景数据、打印参数、裁剪数据、额外数据等。
2. 生成画布信息和项目信息。
3. 根据 `isReplace` 参数决定是返回请求模型还是调用创建项目的接口。

#### **适用场景**
- 用于创建新项目或替换现有项目。
- 支持多场景、裁剪、旋转体等复杂画布类型。

#### **逻辑流程**
1. 提取并整理画布和项目的相关数据。
2. 生成请求模型。
3. 根据 `isReplace` 参数执行不同的逻辑：
   - 替换项目：返回请求模型。
   - 新建项目：调用创建项目的接口。
