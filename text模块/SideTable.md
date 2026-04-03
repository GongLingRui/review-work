`SideTable` 是一个复杂的 React 组件，主要用于展示一个侧边栏表格，支持分页加载、全屏展示、滚动加载、刷新等功能。以下是对 `SideTable` 组件逻辑的详细分析，包括其核心功能、状态管理、事件处理、性能优化等。

---

## **1. 组件的核心功能**
`SideTable` 组件的主要功能包括：
1. **分页加载**：通过滚动加载更多数据。
2. **全屏展示**：支持点击 "See All" 展开某一项的全部内容。
3. **滚动控制**：支持左右滚动，并动态显示滚动按钮。
4. **刷新功能**：当数据为空时，提供刷新按钮，支持单项刷新和全局刷新。
5. **拖拽支持**：支持拖拽操作。
6. **动态样式**：根据不同的状态（如全屏、非全屏）动态调整样式。

---

## **2. 状态管理**
组件使用了多个 `useState` 钩子来管理状态：

### **2.1 状态变量**
| 状态变量名         | 类型                     | 作用                                                                 |
|--------------------|--------------------------|----------------------------------------------------------------------|
| `expandedStates`   | `{ [key: string]: boolean }` | 记录每一项是否处于展开状态（点击 "See All" 后）。                     |
| `canScrollLeft`    | `{ [key: string]: boolean }` | 记录每一项是否可以向左滚动。                                         |
| `canScrollRight`   | `{ [key: string]: boolean }` | 记录每一项是否可以向右滚动。                                         |
| `nowItemClass`     | `any`                    | 当前展开的项的类信息，用于全屏展示时的样式控制。                      |

### **2.2 状态初始化**
- 当 `active` 属性变化时，重置所有状态：
  ```tsx
  useEffect(() => {
    setExpandedStates({});
    setCanScrollLeft({});
    setCanScrollRight({});
    setNowItemClass(undefined);
    IsSeeAll(false);
  }, [active]);
  ```

---

## **3. 事件处理逻辑**

### **3.1 全屏展示逻辑**
- 点击 "See All" 按钮时，更新 `expandedStates` 和 `nowItemClass`，并触发加载更多数据（如果需要）。
- 退出全屏时，重置状态并滚动到顶部。

```tsx
const SeeAllClick = (shouldExpand: boolean, id: string, item?: any) => {
  setExpandedStates(prevStates => ({
    [id]: shouldExpand
  }));
  setNowItemClass(item);

  if (shouldExpand) {
    if (item?.list?.length >= 20 && item?.list.length < item?.total) {
      const NewPage = Math.ceil(item?.list.length / PAGE_SIZE) + 1;
      fetchDataMore(item, '', NewPage);
    }
    IsSeeAll(true);
  } else {
    IsSeeAll(false);
    const element = document.querySelector('.SideTable_box');
    if (element) {
      element.scrollTop = 0;
    }
  }
};
```

---

### **3.2 滚动控制逻辑**
- **左右滚动**：通过 `handleScroll` 方法实现，点击左右滚动按钮时，调整滚动位置。
- **动态显示滚动按钮**：通过 `handleScrollEvent` 方法监听滚动事件，动态更新 `canScrollLeft` 和 `canScrollRight` 状态。

```tsx
const handleScroll = (direction: string, id: string) => {
  const element = document.getElementById(id);
  if (element) {
    const newScrollPosition = direction === 'left' ? element.scrollLeft - 100 : element.scrollLeft + 100;
    element.scrollTo({
      left: newScrollPosition,
      behavior: 'smooth'
    });
  }
};

const handleScrollEvent = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    setCanScrollLeft({
      ...canScrollLeft,
      [id]: element.scrollLeft > 0
    });
    setCanScrollRight({
      ...canScrollRight,
      [id]: Math.ceil(element.scrollLeft) + element.clientWidth < element.scrollWidth
    });
  }
};
```

---

### **3.3 滚动加载更多数据**
- 当用户滚动到右侧时，触发 `RightMoreData` 方法加载更多数据。
- 使用 `isScrolledToRight` 方法判断是否滚动到右侧。

```tsx
const moreRightData = async (item: any, all: any) => {
  if (isScrolledToRight(item)) {
    try {
      const res = await RightMoreData(all);
      if (res === 'success') {
        handleScrollEvent(item.id);
      }
    } catch (error) {
      ConsoleUtil.error("加载更多数据时发生错误:", error);
    }
  }
};
```

---

### **3.4 刷新逻辑**
- 当数据为空时，显示刷新按钮。
- 支持单项刷新和全局刷新。

```tsx
<div className="item_refresh"
  onClick={() => {
    item?.id == 9999 ? All_refresh() : item_refresh(item);
  }}>
  {getTranslation(TranslationsKeys.Refresh)}
</div>
```

---

### **3.5 拖拽逻辑**
- 支持拖拽操作，通过 `onDragEnd` 事件处理。

```tsx
const handleOnDrap = (e: any, data: any) => {
  e.preventDefault();
  CardClick(data);
};
```

---

## **4. 性能优化**

### **4.1 使用 `useMemo` 优化计算**
- 使用 `useMemo` 缓存 `isAll` 的计算结果，避免不必要的重新计算。

```tsx
const isAll = useMemo(() => {
  return data?.find((it: any) => expandedStates[it.id]);
}, [data, expandedStates]);
```

### **4.2 滚动事件的绑定和解绑**
- 在 `useEffect` 中为每个项绑定滚动事件，并在组件卸载时移除事件监听器。

```tsx
useEffect(() => {
  const cleanupFns: any = [];
  data?.forEach((item: any) => {
    const userContainer = document.getElementById(item?.id);
    if (userContainer) {
      const scrollHandler = () => {
        moreRightData(userContainer, item);
      };
      userContainer.addEventListener('scroll', scrollHandler);
      cleanupFns.push(() => userContainer.removeEventListener('scroll', scrollHandler));
    }
  });

  return () => {
    cleanupFns.forEach((cleanup: any) => cleanup());
  };
}, [data]);
```

---

## **5. 动态样式控制**
- 使用 `clsx` 动态控制样式，根据不同状态（如全屏、非全屏）应用不同的样式。

```tsx
<div
  className={clsx('item_down', {
    'item_down_many': !useAllRight().state,
    "item_down_fullScreen": useAllRight().state
  })}
>
```

---

## **6. 组件的结构和渲染逻辑**

### **6.1 全屏展示的内容**
- 当某一项处于全屏状态时，渲染其完整内容。

```tsx
{isAll && (
  <div className="SideTable_box">
    <ScrollMoreView
      onLoadMore={() => { fetchDataMore(isAll); }}
      hasMore={hasMore}
      isLoading={hasLoading}
    >
      {isAll?.list?.map((res: any) => (
        <SideCard
          CardData={res}
          CardStyle={useAllRight().state ? { 'width': '100%', 'height': '100%' } : { 'width': '110px', 'height': '110px' }}
          CardClick={CardClick}
          type={type}
          isDetailsIcon={isDetailsIcon}
        />
      ))}
    </ScrollMoreView>
  </div>
)}
```

### **6.2 非全屏展示的内容**
- 当没有项处于全屏状态时，渲染每一项的部分内容。

```tsx
{!isAll && data?.map((item: any) => (
  <div className="SideTable_item" key={item?.id}>
    <div className="item_top">
      <div className="item_title">{item.label} {item?.total ? `(${item.total})` : ''}</div>
      {item?.list?.length >= 4 && (
        <div className="item_SeeAll" onClick={() => { SeeAllClick(true, item?.id, item); }}>
          {getTranslation(TranslationsKeys.SeeAll)}
        </div>
      )}
    </div>
    <div className="item_fixed">
      <div id={item.id} className="item_down" onScroll={() => { handleScrollEvent(item.id); }}>
        {item?.list?.map((res: any) => (
          <SideCard
            CardData={res}
            CardStyle={{ 'width': '110px', 'height': '110px' }}
            CardClick={CardClick}
            type={type}
            isDetailsIcon={isDetailsIcon}
          />
        ))}
      </div>
    </div>
  </div>
))}
```

---

## **7. 总结**
`SideTable` 是一个功能丰富的组件，主要逻辑包括：
1. **状态管理**：通过多个状态变量管理全屏展示、滚动控制、加载状态等。
2. **事件处理**：处理全屏切换、滚动加载、刷新、拖拽等事件。
3. **性能优化**：使用 `useMemo` 缓存计算结果，优化滚动事件的绑定和解绑。
4. **动态样式**：根据状态动态调整样式，提升用户体验。

尽管功能强大，但组件的逻辑较为复杂，可以通过拆分子组件（如 `SideTableItem`、`SideTableHeader`）来降低复杂度，提升可维护性。
