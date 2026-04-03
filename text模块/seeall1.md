点击 **"See All"** 按钮时，`TextMenus` 组件会进入全屏展示模式，显示某个分类的完整数据列表。以下是对 **"See All"** 数据展示的状态逻辑的详细讲解，包括其功能、状态管理、关键代码解析以及设计思路。

---

## **1. 功能概述**

点击 **"See All"** 按钮时，组件需要完成以下功能：
1. **切换到全屏模式**：
   - 将当前分类的数据切换到全屏展示状态。
   - 隐藏其他分类的数据。

2. **加载更多数据**：
   - 如果当前分类的数据量较大，需要支持分页加载，动态获取更多数据。

3. **状态管理**：
   - 记录当前是否处于全屏模式。
   - 记录当前分类的分页数据。
   - 更新缓存，确保数据的持久性。

4. **退出全屏模式**：
   - 点击 **"Go Back"** 按钮时，退出全屏模式，恢复到普通模式。

---

## **2. 状态管理**

以下是与 **"See All"** 相关的状态变量及其作用：

| 状态变量名       | 类型                     | 作用                                                                 |
|------------------|--------------------------|----------------------------------------------------------------------|
| `isSeeAll`       | `boolean`                | 是否处于全屏模式。                                                   |
| `seeAllData`     | `any[]`                  | 当前全屏模式下的数据列表。                                           |
| `pageIndex`      | `useRef<number>`         | 当前全屏模式下的分页页码。                                           |
| `hasMore`        | `boolean`                | 是否还有更多数据可以加载。                                           |
| `hasLoading`     | `boolean`                | 是否正在加载更多数据。                                               |
| `SeeAllref`      | `useRef<boolean>`        | 用于记录是否处于全屏模式（类似于 `isSeeAll` 的副本）。               |

---

## **3. 关键代码解析**

以下是与 **"See All"** 数据展示相关的关键代码及其详细解析。

---

### **3.1 点击 "See All" 的逻辑**

#### **代码**
```tsx
const IsSeeAll = (seeAllState: any) => {
  SeeAllref.current = seeAllState; // 更新全屏模式的引用状态
  setIsSeeAll(seeAllState); // 更新全屏模式的状态
};
```

#### **解析**
- **作用**：
  - 切换全屏模式的状态。
  - 当 `seeAllState` 为 `true` 时，进入全屏模式。
  - 当 `seeAllState` 为 `false` 时，退出全屏模式。
- **为什么这样做**：
  - 使用 `useRef`（`SeeAllref`）记录全屏模式的状态，避免频繁触发重新渲染。
  - 使用 `setIsSeeAll` 更新 React 状态，触发组件重新渲染。

---

### **3.2 加载更多数据的逻辑**

#### **代码**
```tsx
const getMoreValue = async (nowItemClass: any, clear: string, NewPage: number) => {
  if (NewPage) {
    pageIndex.current = NewPage; // 更新当前页码
  }

  // 如果当前数据量已经大于等于总数据量，则不再加载更多数据
  if (nowItemClass?.list?.length >= nowItemClass?.total) {
    setHasLoading(false);
    setHasMore(false);
    return;
  }

  if (clear === 'clear') {
    setSeeAllData([]); // 清空全屏展示的数据
    pageIndex.current = 2; // 重置页码为 2
  }

  const result: any = await get<{ data: any }>(
    '/web/cms-proxy/common/content',
    {
      content_type: 'make-2d-text-groups',
      populate: ['font_file', 'font_image', 'tags'],
      filters: {
        group_class: {
          text_group_class: {
            $eq: nowItemClass?.label, // 根据分类名称过滤数据
          },
        },
      },
      pagination: {
        page: pageIndex.current, // 当前页码
        pageSize: PAGE_SIZE, // 每页数据量
      },
    },
  );

  const AllData = { [nowItemClass?.class_name]: result.data || [] };

  DataChange(AllData, [nowItemClass]).then(result => {
    if (result[0] && result[0]?.list?.length > 0) {
      pageIndex.current++; // 页码加 1
    }

    setSeeAllData((oldData: any) => {
      const newData = [...oldData];
      const newItem = result[0];
      const existingItem = newData.find((data: any) => data.id === newItem.id);

      if (existingItem) {
        existingItem.list = [...existingItem.list, ...newItem.list];
      } else {
        newData.push({ ...nowItemClass, list: [...nowItemClass?.list, ...newItem.list] });
      }

      if (SeeAllref.current) {
        setSideData(newData); // 更新状态中的数据
        setCacheItem('textMenu', replaceGraphicData(newData, getCacheItem('textMenu'))); // 更新缓存
      }

      return newData;
    });

    setHasLoading(false); // 停止加载动画
    setHasMore(result[0]?.list?.length >= PAGE_SIZE); // 判断是否还有更多数据
  });
};
```

#### **解析**
- **作用**：
  1. 检查是否还有更多数据需要加载。
  2. 发起网络请求，获取当前分类的下一页数据。
  3. 将新加载的数据与现有数据合并，并更新到状态中。
  4. 更新缓存，确保数据的持久性。
- **关键点**：
  - **分页加载**：通过 `pageIndex.current` 控制分页逻辑。
  - **数据合并**：将新加载的数据与现有数据合并，避免覆盖。
  - **缓存更新**：通过 `setCacheItem` 更新缓存，减少重复请求。

---

### **3.3 退出全屏模式的逻辑**

#### **代码**
```tsx
const SeeAllClick = (shouldExpand: boolean, id: string, item?: any) => {
  setExpandedStates(prevStates => ({
    [id]: shouldExpand, // 更新指定项的展开状态
  }));

  if (shouldExpand) {
    // 如果进入全屏模式，加载更多数据
    if (item?.list?.length >= 20 && item?.list.length < item?.total) {
      const NewPage = Math.ceil(item?.list.length / PAGE_SIZE) + 1;
      getMoreValue(item, '', NewPage);
    }
    IsSeeAll(true); // 设置全屏模式为 true
  } else {
    // 如果退出全屏模式，恢复到普通模式
    IsSeeAll(false);
    const element = document.querySelector('.SideTable_box');
    if (element) {
      element.scrollTop = 0; // 滚动到顶部
    }
  }
};
```

#### **解析**
- **作用**：
  1. 切换全屏模式的状态。
  2. 如果进入全屏模式，加载更多数据。
  3. 如果退出全屏模式，恢复到普通模式，并滚动到顶部。
- **关键点**：
  - **状态切换**：通过 `IsSeeAll` 和 `setExpandedStates` 切换全屏模式的状态。
  - **滚动恢复**：退出全屏模式时，将滚动位置重置为顶部，确保用户看到的是初始状态。

---

## **4. 状态逻辑的流程图**

以下是点击 **"See All"** 后的状态逻辑流程：

1. 用户点击 **"See All"** 按钮。
2. 调用 `SeeAllClick` 函数：
   - 更新全屏模式的状态（`isSeeAll`）。
   - 如果需要，加载更多数据（调用 `getMoreValue`）。
3. 进入全屏模式：
   - 显示当前分类的完整数据列表。
   - 隐藏其他分类的数据。
4. 用户点击 **"Go Back"** 按钮：
   - 调用 `SeeAllClick` 函数，退出全屏模式。
   - 恢复到普通模式，显示所有分类的数据。

---

## **5. 为什么这样设计？**

1. **性能优化**：
   - 使用分页加载，避免一次性加载大量数据，减少性能开销。
   - 使用缓存机制，避免重复请求，提高加载效率。

2. **用户体验**：
   - 提供全屏模式，方便用户查看某个分类的完整数据。
   - 退出全屏模式时，恢复到普通模式，并滚动到顶部，确保用户体验一致。

3. **状态管理**：
   - 使用 `isSeeAll` 和 `SeeAllref` 管理全屏模式的状态，确保状态切换的准确性。
   - 使用 `setSeeAllData` 和 `setSideData` 管理数据状态，确保组件状态与数据同步。

---

## **6. 总结**

点击 **"See All"** 按钮时，组件通过以下逻辑实现全屏模式的数据展示：
1. **状态切换**：通过 `isSeeAll` 和 `SeeAllref` 切换全屏模式的状态。
2. **分页加载**：通过 `getMoreValue` 实现分页加载，动态获取更多数据。
3. **数据合并**：将新加载的数据与现有数据合并，避免覆盖。
4. **缓存更新**：通过 `setCacheItem` 更新缓存，减少重复请求。
5. **滚动恢复**：退出全屏模式时，将滚动位置重置为顶部，确保用户体验一致。

这种设计既保证了性能，又提升了用户体验，是一种高效的数据展示逻辑。
