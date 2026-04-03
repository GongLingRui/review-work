- useInView 是一个来自 react-intersection-observer 库的钩子，用于检测元素是否在视口中。这个钩子基于 Intersection Observer API 实现，提供了一种简便的方法来监听元素是否进入或离开视口。
- 使用 useInView 钩子：
- 在你的组件中使用 useInView 钩子来检测元素是否在视口中。以下是一个简单的示例：
```
import React from 'react';
import { useInView } from 'react-intersection-observer';

const MyComponent = () => {
  const { ref, inView, entry } = useInView({
    /* 可选参数 */
    threshold: 0.5, // 触发 inView 的阈值
    triggerOnce: true, // 只触发一次
  });

  return (
    <div>
      <h1>Scroll down to see the magic!</h1>
      <div style={{ height: '100vh' }}></div>
      <div ref={ref}>
        {inView ? 'Element is in view!' : 'Scroll more...'}
      </div>
    </div>
  );
};

export default MyComponent;
```

- 参数和返回值
- useInView 钩子支持多个参数和返回值：

- 参数
- threshold：一个数值或数值数组，表示触发 inView 的阈值。默认值为 0。
- root：用作视口的元素。默认值为 null，表示浏览器视口。
- rootMargin：根元素的外边距，类似于 CSS 中的 margin 属性。默认值为 '0px'。
- triggerOnce：布尔值，表示是否只触发一次 inView。默认值为 false。
- 返回值
- ref：一个回调 ref，需要绑定到你想要检测的元素上。
- inView：布尔值，表示元素是否在视口中。
- entry：IntersectionObserverEntry 对象，包含关于元素和视口的信息。
- 示例解释
- 在上面的示例中：

- useInView 钩子被调用，并传入了一个配置对象 { threshold: 0.5, triggerOnce: true }。
- ref 被绑定到需要检测的 div 元素上。
- inView 是一个布尔值，当 div 元素进入视口时变为 true，离开视口时变为 false。
- entry 是 IntersectionObserverEntry 对象，包含关于 div 元素和视口的信息。
- 当用户滚动页面时，div 元素进入视口，inView 变为 true，显示 “Element is in view!”。否则，显示 “Scroll more…”。
