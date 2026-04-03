以下是 `Typeface` 组件代码逻辑的详细梳理：

---

### **一、组件结构**
1. **功能定位**：
   - 2D 编辑器的字体选择面板
   - 支持字体搜索、分类筛选、语言筛选、滚动加载、字体预览和应用

2. **主要模块**：
   - 标题栏（含关闭按钮）
   - 搜索框 + 筛选按钮
   - 字体分类标签（All/Serif/Sans Serif 等）
   - 字体列表（含滚动加载）
   - 筛选弹窗（语言筛选）

---

### **二、核心逻辑**
#### **1. 数据获取与缓存**
- **数据源**：
  - 通过 CMS 接口 `/web/cms-proxy/common/content` 获取字体数据
  - 请求参数包含分页、分类筛选、语言筛选、搜索关键词

- **缓存策略**：
  - 使用 `fontFamiliesCache` 按分类缓存已加载的字体数据
  - 避免重复请求相同分类的数据
  - 缓存结构：
    ```ts
    {
      "All": FontFamily[],
      "Serif": FontFamily[],
      "Sans Serif": FontFamily[],
      // ...
    }
    ```

- **分页加载**：
  - 初始页码 `page=1`，每页 20 条
  - 滚动到底部时触发加载下一页（通过 `scroll` 事件监听）

---

#### **2. 字体渲染**
- **动态注入字体**：
  - 通过 `@font-face` 动态创建 `<style>` 标签
  - 确保自定义字体能在画布中正确预览
  ```ts
  const setCssFontface = () => {
    fontFamilies.forEach((item) => {
      const style = document.createElement('style');
      style.innerHTML = `@font-face { font-family: '${item.font_name}'; src: url('${item.url}'); }`;
      document.head.appendChild(style);
    });
  }
  ```

- **字体应用**：
  - 点击字体时，通过 `loadFont` 确保字体加载完成
  - 更新 Fabric.js 画布中选中文本的 `fontFamily` 属性
  ```ts
  const handleTypefaceClick = async (fontFamily) => {
    if (await loadFont(fontFamily.font_name)) {
      activeObject.set({ fontFamily: fontFamily.font_name });
      canvasEditor?.canvas.requestRenderAll();
    }
  };
  ```

---

#### **3. 筛选功能**
- **分类筛选**：
  - 通过 `TypefaceTypes` 枚举切换分类
  - 触发时重置滚动位置和页码，重新请求数据

- **语言筛选**：
  - 从 CMS 获取语言选项（`make-2d-text-languages`）
  - 通过弹窗多选语言，支持 `Clear All` 和 `Confirm`
  - 筛选条件存储在 `countryFilters` 状态中

- **搜索功能**：
  - 输入框使用 `lodash.debounce` 防抖
  - 搜索关键词存储在 `searchFontName.current`

---

#### **4. 性能优化**
- **滚动加载**：
  - 监听 `ul` 的滚动事件，计算触底条件：
    ```ts
    if (ulHeight + scrollTop >= divHeight) {
      getFontsPage.current++;
      getFonts(...);
    }
    ```

- **条件请求**：
  - 当存在缓存且无搜索关键词时，直接使用缓存数据
  - 避免不必要的网络请求

---

### **三、状态管理**
| 状态 | 类型 | 用途 |
|------|------|------|
| `fontFamilies` | `FontFamily[]` | 当前显示的字体列表 |
| `loading` | `boolean` | 数据加载中的状态 |
| `filters` | `TypefaceTypes[]` | 当前选中的字体分类 |
| `countryFilters` | `string[]` | 当前选中的语言筛选条件 |
| `isShowFilter` | `boolean` | 控制筛选弹窗的显示 |

---

### **四、关键函数**
| 函数 | 功能 |
|------|------|
| `getFonts()` | 获取字体数据（含缓存逻辑） |
| `handleTypefaceUlScroll()` | 处理滚动加载 |
| `handleTypefaceClick()` | 应用选中字体到画布 |
| `handleSearchInput()` | 处理搜索输入（含防抖） |
| `filterItemClick()` | 处理语言筛选的选中/取消 |

---

### **五、UI 交互**
- **搜索框**：
  - 左侧搜索图标
  - 右侧筛选按钮（打开语言筛选弹窗）

- **分类标签**：
  - 高亮当前选中分类
  - 底部线条指示激活状态

- **字体列表**：
  - 使用 `font-family` 实时预览字体样式
  - 支持无限滚动

- **筛选弹窗**：
  - 绝对定位在搜索框下方
  - 多选语言 + 操作按钮（Clear/Confirm）

---

### **六、注意事项**
1. **缓存更新**：
   - 分类切换或搜索时需重置缓存
   - 当前实现可能存在缓存更新不完全的风险

2. **错误处理**：
   - 网络请求缺乏错误处理（如 `try/catch`）
   - 字体加载失败时无反馈

3. **性能**：
   - 动态注入大量 `@font-face` 可能导致性能问题
   - 可考虑按需加载字体样式

4. **代码优化**：
   - 部分 `any` 类型需替换为具体类型
   - 条件判断可提取为工具函数（如 `isScrollBottom`）

---

### **七、扩展建议**
- **本地存储**：
  - 缓存字体数据到 `localStorage` 减少重复请求
- **搜索优化**：
  - 支持拼音/首字母搜索
- **字体收藏**：
  - 添加收藏功能，持久化常用字体
