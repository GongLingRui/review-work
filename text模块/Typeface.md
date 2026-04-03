### **Typeface 组件详解**

`Typeface` 是一个用于字体选择和管理的 React 组件。它提供了字体的加载、筛选、搜索、分类、应用等功能，允许用户在画布中选择和应用不同的字体。

以下是对 `Typeface` 组件的详细讲解，包括其功能、实现逻辑和关键代码的解析。

---

### **1. 组件的主要功能**

#### **1.1 字体加载**
- 从 CMS 接口动态加载字体数据。
- 支持分页加载，每次加载 20 个字体。

#### **1.2 字体分类**
- 提供多种字体分类（如 Serif、Sans Serif、Script 等）。
- 用户可以点击分类标签，筛选对应类型的字体。

#### **1.3 字体搜索**
- 提供搜索框，用户可以输入字体名称进行搜索。
- 使用 `debounce` 优化搜索请求，减少频繁的接口调用。

#### **1.4 字体筛选**
- 提供筛选功能，用户可以根据语言等条件筛选字体。
- 支持多选筛选条件，并动态更新字体列表。

#### **1.5 字体应用**
- 用户点击某个字体后，将该字体应用到选中的文字对象。
- 支持多选文字对象，批量应用字体。

#### **1.6 字体缓存**
- 使用 `fontFamiliesCache` 缓存字体数据，减少重复请求。
- 缓存按分类存储，支持快速切换分类。

#### **1.7 最近使用**
- 显示最近使用的字体，方便用户快速选择。

---

### **2. 组件的实现逻辑**

#### **2.1 字体加载逻辑**

##### **核心函数：`getFonts`**
- **功能**：从 CMS 接口加载字体数据。
- **实现逻辑**：
  1. 根据分类和筛选条件，构造请求参数。
  2. 调用 CMS 接口，获取字体数据。
  3. 将返回的数据格式化为 `FontFamily` 类型，并更新组件状态。

```typescript
const getFonts = debounce(async (type?: string[], countries?: string[]) => {
  const searchType = !!type && type.length > 0 && type[0] !== TypefaceTypes.All
    ? { $eq: type } : {};
  const searchCountry = !!countries && countries.length > 0
    ? { $in: countries } : {};
  setLoading(true);
  const json = await get<{ data: any }>('/web/cms-proxy/common/content', {
    content_type: 'make-2d-element-shapes',
    populate: ['font_file'],
    filters: {
      type: { ...searchType },
      language: { language: { ...searchCountry } },
      font_name: { $contains: searchFontName.current },
    },
    pagination: {
      page: getFontsPage.current || 1,
      pageSize: pageSize,
    },
  });
  setLoading(false);
  if (!json || !json.data || !json.data.data) return;
  const data = json.data.data;
  const temFontFamilies: FontFamily[] = [];
  data.forEach((item: any) => {
    temFontFamilies.push({
      type: item.attributes.type,
      font_name: item.attributes.font_name,
      url: item.attributes.font_file.data.attributes.url,
    });
  });
  setFontFamilies((prev) => [...prev, ...temFontFamilies]);
});
```

---

#### **2.2 字体分类逻辑**

##### **核心变量：`TypefaceTypes`**
- 使用枚举 `TypefaceTypes` 定义字体分类。

```typescript
enum TypefaceTypes {
  All = "",
  Serif = "Serif",
  SansSerif = "Sans Serif",
  Script = "Script",
  Other = "Other",
}
```

##### **分类点击事件：`handleTypefaceTypeClick`**
- **功能**：切换字体分类，并重新加载字体数据。
- **实现逻辑**：
  1. 重置滚动位置和分页信息。
  2. 更新分类状态。
  3. 调用 `getFonts` 函数加载对应分类的字体。

```typescript
const handleTypefaceTypeClick = (id: TypefaceTypes) => {
  typefaceUlRef.current.scrollTop = 0;
  getFontsPage.current = 1;
  setFilters([id]);
};
```

---

#### **2.3 字体搜索逻辑**

##### **核心函数：`handleSearchInput`**
- **功能**：处理用户输入的搜索关键字，并触发字体加载。
- **实现逻辑**：
  1. 更新搜索关键字。
  2. 调用 `getFonts` 函数加载匹配的字体。

```typescript
const handleSearchInput = (e: any) => {
  searchFontName.current = e;
  if (!e) {
    fontFamiliesCache.current = initialCache;
  }
  if (!!filters && filters.length > 0) {
    getFonts(filters);
  } else {
    getFonts();
  }
};
```

---

#### **2.4 字体筛选逻辑**

##### **核心函数：`filterItemClick`**
- **功能**：处理筛选条件的点击事件。
- **实现逻辑**：
  1. 更新筛选条件状态。
  2. 调用 `getFonts` 函数加载匹配的字体。

```typescript
const filterItemClick = (id: string) => {
  typefaceUlRef.current.scrollTop = 0;
  getFontsPage.current = 1;
  const tmpCountryFilters = [...countryFilters];
  if (tmpCountryFilters.includes(id)) {
    const index = tmpCountryFilters?.indexOf(id);
    tmpCountryFilters.splice(index, 1);
  } else {
    tmpCountryFilters.push(id);
  }
  setCountryFilters(tmpCountryFilters);
};
```

---

#### **2.5 字体应用逻辑**

##### **核心函数：`handleTypefaceClick`**
- **功能**：将选中的字体应用到画布中的文字对象。
- **实现逻辑**：
  1. 获取画布中选中的文字对象。
  2. 如果字体是默认字体，直接应用。
  3. 如果字体是自定义字体，先加载字体文件，再应用。

```typescript
const handleTypefaceClick = async (fontFamily: any) => {
  const activeObjects = canvasEditor!.canvas.getActiveObjects();
  activeObjects.forEach(async (activeObject) => {
    if (fontFamily?.font_name === defaultFontFamily) {
      activeObject.set("fontFamily", fontFamily.font_name);
      requestAnimationFrame(() => canvasEditor?.canvas.requestRenderAll());
      canvasEditor?.historySave();
    } else {
      if (await loadFont(fontFamily.font_name)) {
        activeObject.set({
          fontFamily: fontFamily.font_name,
          [CustomKey.FontUrl]: fontFamily.url,
        });
        requestAnimationFrame(() => canvasEditor?.canvas.requestRenderAll());
        canvasEditor?.historySave();
      }
    }
  });
};
```

---

#### **2.6 字体缓存逻辑**

##### **核心变量：`fontFamiliesCache`**
- **功能**：缓存字体数据，减少重复请求。
- **实现逻辑**：
  1. 按分类存储字体数据。
  2. 在加载字体时，优先从缓存中获取数据。

```typescript
const initialCache = {
  [TypefaceTypes.All]: [],
  [TypefaceTypes.Serif]: [],
  [TypefaceTypes.SansSerif]: [],
  [TypefaceTypes.Script]: [],
  [TypefaceTypes.Other]: [],
};
const fontFamiliesCache = useRef(initialCache);
```

---

### **3. 组件的渲染逻辑**

#### **3.1 搜索框**
- 提供输入框和筛选按钮，用户可以输入字体名称或选择筛选条件。

```jsx
<div className={classes.input_div}>
  <img className={classes.search_img} src={search} />
  <input type="text" placeholder='Search' onInput={(e) => { handleSearchInput(DOMPurify.sanitize(e.target.value)) }} />
  <img className={classes.sliders_img} src={sliders} onClick={(e) => { handleSearchInputSliderClick() }} />
</div>
```

---

#### **3.2 字体分类**
- 使用 `TypefaceTypes` 枚举生成分类选项。

```jsx
<ul className={classes.typeface_type_ul}>
  {typefaceTypeOptions.map((item) => (
    <li
      key={item.id}
      onClick={() => { handleTypefaceTypeClick(item.id) }}
      style={{ color: filters.includes(item.id) ? '#60ce75' : '#9b9b9b' }}
    >
      {item.label}
    </li>
  ))}
</ul>
```

---

#### **3.3 字体列表**
- 使用 `fontFamilies` 数据生成字体列表。

```jsx
<ul ref={typefaceUlRef} className={classes.typeface_ul}>
  <div ref={typefaceDivRef}>
    {fontFamilies.map((item, index) => (
      <li className={classes.typeface_li} key={index} onClick={() => { handleTypefaceClick(item) }}>
        <span style={{ fontFamily: item.font_name }}> {item.font_name} </span>
      </li>
    ))}
  </div>
</ul>
```

---

### **4. 总结**

#### **Typeface 组件的功能**
1. 动态加载字体数据。
2. 提供字体分类、搜索和筛选功能。
3. 支持将字体应用到画布中的文字对象。
4. 缓存字体数据，提升性能。

#### **实现逻辑**
- 使用 `getFonts` 函数加载字体数据。
- 使用 `TypefaceTypes` 枚举实现字体分类。
- 使用 `handleTypefaceClick` 函数将字体应用到画布。

#### **用户体验**
- 提供直观的 UI，用户可以快速选择和应用字体。
- 支持搜索和筛选，方便用户查找特定字体。
- 显示最近使用的字体，提升操作效率。

通过这些功能，`Typeface` 组件为用户提供了强大的字体管理能力，适用于各种设计场景。
