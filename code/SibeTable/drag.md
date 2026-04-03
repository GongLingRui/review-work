`draggable` 属性是 HTML5 中的一部分，用于使元素可以被拖动。它是一个布尔属性，当设置为 `true` 时，表示该元素是可拖动的。React 允许我们在 JSX 中直接使用这个属性。

在你的代码中，`draggable` 属性被应用在 `SideCard` 组件的容器上，使得这些卡片可以被拖动。让我们详细讲解一下 `draggable` 属性的用法以及如何处理拖动事件。

### `draggable` 属性的基本用法

在 HTML 中，你可以通过设置 `draggable` 属性来使元素可拖动：

```html
<div draggable="true">Drag me!</div>
```

在 React 中，你可以在 JSX 中使用相同的方式：

```jsx
<div draggable={true}>Drag me!</div>
```

### 处理拖动事件

当一个元素被设置为可拖动时，你可以监听一系列的拖动事件来处理拖动行为。这些事件包括：

- `onDragStart`：当拖动操作开始时触发。
- `onDrag`：当元素正在被拖动时触发。
- `onDragEnd`：当拖动操作结束时触发。
- `onDragEnter`：当拖动的元素进入一个有效的放置目标时触发。
- `onDragLeave`：当拖动的元素离开一个有效的放置目标时触发。
- `onDragOver`：当拖动的元素在一个有效的放置目标上方时触发。
- `onDrop`：当拖动的元素被放置在一个有效的放置目标上时触发。

### 在你的代码中的用法

在你的代码中，`draggable` 属性被应用在 `SideCard` 组件的容器上，并且监听了 `onDragEnd` 事件：

```jsx
<div
  style={{
    'marginRight': index < item?.list.length - 1 ? '8px' : '0px',
  }}
  className={clsx('SideCard_box', {
    'SideCard_box_few': false,
  })}
  draggable={true}
  onDragEnd={(e) => handleOnDrap(e, res)}
>
  <SideCard
    CardData={res}
    CardStyle={{ 'width': '110px', 'height': '110px' }}
    isCollectClick={() => { }}
    CardClick={CardClick}
    type={type}
    isDetailsIcon={isDetailsIcon}
  />
</div>
```

#### `draggable` 属性

- `draggable={true}`：使得这个 `div` 元素可以被拖动。

#### `onDragEnd` 事件

- `onDragEnd={(e) => handleOnDrap(e, res)}`：当拖动操作结束时，调用 `handleOnDrap` 函数，并传递事件对象 `e` 和当前项的数据 `res`。

### `handleOnDrap` 函数

`handleOnDrap` 函数用于处理拖动结束事件：

```javascript
const handleOnDrap = (e: any, data: any) => {
  e.preventDefault();
  CardClick(data);
}
```

#### 参数

- `e`：事件对象。
- `data`：当前项的数据。

#### 逻辑

1. `e.preventDefault();`：阻止默认的拖动行为。
2. `CardClick(data);`：调用 `CardClick` 函数，并传递当前项的数据。`CardClick` 函数可能是一个用于处理卡片点击或拖动的回调函数。

### 总结

`draggable` 属性使得元素可以被拖动，并且通过监听拖动事件，你可以自定义拖动行为。在你的代码中，`draggable` 属性被应用在 `SideCard` 组件的容器上，使得这些卡片可以被拖动，并且通过 `onDragEnd` 事件处理拖动结束时的逻辑。

这种方式可以用于实现拖放排序、拖放到其他区域等交互功能，为用户提供更灵活和直观的操作体验。、
好的，让我们详细讲解一下你提供的代码中拖拽逻辑是如何实现的。我们将重点关注 `draggable` 属性和相关的事件处理函数。

### 代码中的拖拽逻辑

在你的代码中，拖拽逻辑主要通过以下部分实现：

1. 在 `SideCard` 组件的容器上设置 `draggable` 属性。
2. 监听 `onDragEnd` 事件，并在事件处理函数中执行相应的逻辑。

### 代码片段

```jsx
<div
  style={{
    'marginRight': index < item?.list.length - 1 ? '8px' : '0px',
  }}
  className={clsx('SideCard_box', {
    'SideCard_box_few': false,
  })}
  draggable={true}
  onDragEnd={(e) => handleOnDrap(e, res)}
>
  <SideCard
    CardData={res}
    CardStyle={{ 'width': '110px', 'height': '110px' }}
    isCollectClick={() => { }}
    CardClick={CardClick}
    type={type}
    isDetailsIcon={isDetailsIcon}
  />
</div>
```

### `draggable` 属性

- `draggable={true}`：使得这个 `div` 元素可以被拖动。

### `onDragEnd` 事件

- `onDragEnd={(e) => handleOnDrap(e, res)}`：当拖动操作结束时，调用 `handleOnDrap` 函数，并传递事件对象 `e` 和当前项的数据 `res`。

### `handleOnDrap` 函数

```javascript
const handleOnDrap = (e: any, data: any) => {
  e.preventDefault();
  CardClick(data);
}
```

#### 参数

- `e`：事件对象。
- `data`：当前项的数据。

#### 逻辑

1. `e.preventDefault();`：阻止默认的拖动行为。
2. `CardClick(data);`：调用 `CardClick` 函数，并传递当前项的数据。`CardClick` 函数可能是一个用于处理卡片点击或拖动的回调函数。

### 拖拽逻辑的实现步骤

1. **设置 `draggable` 属性**：在 `SideCard` 组件的容器上设置 `draggable={true}`，使得这个元素可以被拖动。
2. **监听 `onDragEnd` 事件**：当拖动操作结束时，触发 `onDragEnd` 事件，并调用 `handleOnDrap` 函数。
3. **处理拖动结束事件**：在 `handleOnDrap` 函数中，首先调用 `e.preventDefault()` 阻止默认的拖动行为，然后调用 `CardClick(data)` 函数，并传递当前项的数据。

### 详细解释

- **设置 `draggable` 属性**：通过设置 `draggable={true}`，使得 `div` 元素可以被拖动。这是 HTML5 的一个特性，允许用户通过鼠标拖动元素。
- **监听 `onDragEnd` 事件**：当用户完成拖动操作并释放鼠标按钮时，`onDragEnd` 事件被触发。你在这个事件上绑定了 `handleOnDrap` 函数。
- **处理拖动结束事件**：在 `handleOnDrap` 函数中，你首先调用 `e.preventDefault()` 阻止默认的拖动行为。这是为了确保浏览器不会执行任何默认的拖动操作。然后，你调用 `CardClick(data)` 函数，并传递当前项的数据。`CardClick` 函数是一个回调函数，可能用于处理卡片的点击或拖动操作。

### 总结

通过设置 `draggable` 属性和监听 `onDragEnd` 事件，你的代码实现了基本的拖拽逻辑。当用户拖动 `SideCard` 组件并释放鼠标按钮时，`handleOnDrap` 函数被调用，处理拖动结束事件。这个函数阻止默认的拖动行为，并调用 `CardClick` 函数，传递当前项的数据。

这种方式可以用于实现拖放排序、拖放到其他区域等交互功能，为用户提供更灵活和直观的操作体验。
