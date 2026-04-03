在 `ElementMenus` 模块中，`loading` 状态被用来管理不同场景下的加载状态。由于该模块涉及到多种数据加载场景（如初始加载、分页加载、筛选加载等），因此需要多个 `loading` 状态来分别管理这些场景。

以下是对代码中不同 `loading` 状态的详细讲解，包括它们的用途、触发条件以及如何与 UI 交互。

---

## **1. 不同的 `loading` 状态**

### **1.1 `isNetLoading`**
```typescript
const [isNetLoading, setNetLoading] = useState(false);
```

#### **用途**
- 用于管理与网络请求相关的全局加载状态。
- 通常在需要显示全局加载动画（如遮罩层）时使用。

#### **触发条件**
- 在与画布交互时（如将元素添加到画布）触发。
- 例如，加载图片或 SVG 文件时：
  ```typescript
  const addSvgToCanvas = async (data: any) => {
    setNetLoading(true); // 开始加载
    const response = await fetch(data?.canvas_image);
    const blob = await response.blob();
    getImgStr(blob).then((file) => {
      canvasEditor?.addSvgFile(file as string);
      setNetLoading(false); // 加载完成
    });
  };
  ```

#### **UI 交互**
- 通过 `Loading` 组件显示全局加载动画：
  ```tsx
  <Loading loading={isNetLoading} />
  ```

---

### **1.2 `isLoading`**
```typescript
const [isLoading, setLoading] = useState(false);
```

#### **用途**
- 用于管理初始数据加载的状态。
- 通常在组件加载时或切换 Tab 时触发。

#### **触发条件**
- 在初始加载数据时触发：
  ```typescript
  const fetchData = async (datas: any, pramasActive?: string) => {
    setLoading(true); // 开始加载
    const results = await Promise.all(promises); // 加载数据
    setLoading(false); // 加载完成
  };
  ```

#### **UI 交互**
- 在 `SideTable` 组件中显示加载状态：
  ```tsx
  <SideTable
    data={sideData}
    isLoading={isLoading} // 传递加载状态
  />
  ```

---

### **1.3 `hasLoading`**
```typescript
const [hasLoading, setHasLoading] = useState(false);
```

#### **用途**
- 用于管理分页加载的状态。
- 通常在用户滚动到底部时触发。

#### **触发条件**
- 在分页加载数据时触发：
  ```typescript
  const fetchDataMore = async (nowItemClass: any, clear: string, NewPage: number) => {
    setHasLoading(true); // 开始加载更多
    const result = await get(...); // 加载更多数据
    setHasLoading(false); // 加载完成
  };
  ```

#### **UI 交互**
- 在 `SideTable` 组件中显示加载更多的状态：
  ```tsx
  <SideTable
    hasLoading={hasLoading} // 传递加载更多状态
  />
  ```

---

### **1.4 `ListLoading`**
```typescript
const [ListLoading, setListLoading] = useState(false);
```

#### **用途**
- 用于管理 Tab 切换时的加载状态。
- 通常在切换 Tab 或筛选条件时触发。

#### **触发条件**
- 在切换 Tab 或筛选条件时触发：
  ```typescript
  const handleTabChange = (tab: any) => {
    setListLoading(true); // 开始加载
    requestData(tab.tabName); // 加载新数据
    setListLoading(false); // 加载完成
  };
  ```

#### **UI 交互**
- 在 Tab 切换时显示加载状态，通常通过禁用交互或显示加载动画实现。

---

### **1.5 `RefreshLoading`**
```typescript
const [RefreshLoading, setRefreshLoading] = useState<any>([]);
```

#### **用途**
- 用于管理刷新操作的加载状态。
- 通常在用户手动刷新某一项数据时触发。

#### **触发条件**
- 在刷新某一项数据时触发：
  ```typescript
  const item_refresh = (item: any) => {
    setRefreshLoading((oldData: any) => [...oldData, item.id]); // 标记为加载中
    fetchData([{ label: item.label, id: item?.id }]); // 刷新数据
    setRefreshLoading((prevIds: any) => prevIds.filter((id: string) => id !== item.id)); // 加载完成
  };
  ```

#### **UI 交互**
- 在刷新某一项数据时显示加载状态，例如显示加载图标或禁用刷新按钮。

---

### **1.6 `ListMore`**
```typescript
const [ListMore, setListMore] = useState(false);
```

#### **用途**
- 用于管理是否有更多数据可加载的状态。
- 通常在分页加载完成后更新。

#### **触发条件**
- 在分页加载完成后更新：
  ```typescript
  const fetchDataMore = async (nowItemClass: any, clear: string, NewPage: number) => {
    const result = await get(...); // 加载更多数据
    setListMore(result.length >= PAGE_SIZE); // 判断是否还有更多数据
  };
  ```

#### **UI 交互**
- 在 `SideTable` 组件中显示 "加载更多" 按钮或提示：
  ```tsx
  <SideTable
    ListMore={ListMore} // 传递是否有更多数据的状态
  />
  ```

---

## **2. 不同 `loading` 状态的对比**

| **状态变量**      | **用途**                          | **触发条件**                     | **UI 交互**                          |
|-------------------|-----------------------------------|-----------------------------------|---------------------------------------|
| `isNetLoading`    | 全局网络请求的加载状态            | 加载图片、SVG 等资源              | 显示全局加载动画                     |
| `isLoading`       | 初始数据加载状态                  | 组件加载或切换 Tab                | 在 `SideTable` 中显示加载状态         |
| `hasLoading`      | 分页加载状态                      | 滚动到底部加载更多数据            | 在 `SideTable` 中显示加载更多状态     |
| `ListLoading`     | Tab 切换时的加载状态              | 切换 Tab 或筛选条件              | 禁用交互或显示加载动画               |
| `RefreshLoading`  | 刷新操作的加载状态                | 手动刷新某一项数据                | 显示加载图标或禁用刷新按钮           |
| `ListMore`        | 是否有更多数据可加载的状态        | 分页加载完成后更新                | 显示 "加载更多" 按钮或提示           |

---

## **3. 不同 `loading` 状态的使用场景**

### **3.1 全局加载状态**
- **`isNetLoading`**：
  - 用于处理全局的网络请求加载状态，例如加载图片或 SVG 文件。
  - 通过 `Loading` 组件显示全局加载动画，阻止用户交互。

### **3.2 数据加载状态**
- **`isLoading`**：
  - 用于处理初始数据加载的状态，例如组件加载或切换 Tab 时。
  - 在 `SideTable` 中显示加载状态，提示用户正在加载数据。

### **3.3 分页加载状态**
- **`hasLoading`**：
  - 用于处理分页加载的状态，例如滚动到底部加载更多数据。
  - 在 `SideTable` 中显示加载更多的状态，提示用户正在加载更多数据。

### **3.4 Tab 切换状态**
- **`ListLoading`**：
  - 用于处理 Tab 切换时的加载状态。
  - 禁用交互或显示加载动画，避免用户在加载过程中进行其他操作。

### **3.5 刷新状态**
- **`RefreshLoading`**：
  - 用于处理刷新操作的加载状态，例如手动刷新某一项数据。
  - 显示加载图标或禁用刷新按钮，提示用户正在刷新数据。

### **3.6 是否有更多数据**
- **`ListMore`**：
  - 用于判断是否还有更多数据可加载。
  - 在 `SideTable` 中显示 "加载更多" 按钮或提示，提示用户是否可以加载更多数据。

---

## **4. 总结**

### **为什么需要多个 `loading` 状态？**
1. **不同场景的独立性**：
   - 每个 `loading` 状态对应一个特定的场景（如初始加载、分页加载、刷新等），互不干扰。
2. **更精细的控制**：
   - 通过多个 `loading` 状态，可以精确控制每个场景的加载逻辑和 UI 表现。
3. **提升用户体验**：
   - 不同的加载状态可以提供更清晰的反馈，避免用户混淆。

### **如何管理多个 `loading` 状态？**
1. **状态命名清晰**：
   - 每个 `loading` 状态的命名应能清晰表达其用途。
2. **状态更新及时**：
   - 在加载开始和结束时及时更新状态，确保 UI 与数据同步。
3. **与 UI 组件结合**：
   - 将 `loading` 状态传递给相关组件（如 `SideTable`），通过组件的属性控制加载动画或提示。

通过合理管理多个 `loading` 状态，`ElementMenus` 模块能够在复杂的交互场景中提供流畅的用户体验。
