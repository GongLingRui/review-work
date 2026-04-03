`react-lazy-load-image-component` 是一个用于 React 应用的插件，专门用于实现图片的懒加载（Lazy Load）。懒加载是一种优化网页性能的技术，只有当图片进入视口（viewport）时才进行加载，从而减少初始页面加载时间和带宽消耗。以下是对这个插件的详细介绍和使用方法：

### 主要功能
1. **懒加载图片**：
   - 只有当图片进入视口时才进行加载，减少初始页面加载时间。
   
2. **占位图**：
   - 在图片加载之前，可以显示一个占位图（placeholder），提升用户体验。

3. **渐进式加载**：
   - 支持渐进式图片加载效果，图片加载完成后逐渐显示。

4. **错误处理**：
   - 支持加载失败时显示备用图片或执行其他操作。

5. **自定义效果**：
   - 可以自定义图片加载和显示的效果，如淡入淡出等。

### 安装
使用 npm 或 yarn 安装插件：
```bash
npm install react-lazy-load-image-component
# 或者
yarn add react-lazy-load-image-component
```

### 基本使用
以下是一个基本的使用示例：

```javascript
import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

const MyComponent = () => (
  <div>
    <LazyLoadImage
      alt="Example Image"
      height={200}
      src="https://example.com/image.jpg" // 图片的 URL
      width={200}
      effect="blur" // 图片加载效果
    />
  </div>
);

export default MyComponent;
```

### 主要属性
- `alt`：图片的替代文本。
- `height`：图片的高度。
- `src`：图片的 URL。
- `width`：图片的宽度。
- `effect`：图片加载效果，如 `blur`（模糊）、`opacity`（透明度）等。
- `placeholderSrc`：占位图的 URL，在图片加载之前显示。
- `onError`：图片加载失败时的回调函数。
- `onLoad`：图片加载成功时的回调函数。

### 高级使用
以下是一些高级使用示例，包括占位图和错误处理：

#### 使用占位图
```javascript
import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

const MyComponent = () => (
  <div>
    <LazyLoadImage
      alt="Example Image"
      height={200}
      src="https://example.com/image.jpg"
      width={200}
      effect="blur"
      placeholderSrc="https://example.com/placeholder.jpg" // 占位图的 URL
    />
  </div>
);

export default MyComponent;
```

#### 错误处理
```javascript
import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

const MyComponent = () => (
  <div>
    <LazyLoadImage
      alt="Example Image"
      height={200}
      src="https://example.com/image.jpg"
      width={200}
      effect="blur"
      onError={(e) => {
        e.target.src = 'https://example.com/backup.jpg'; // 加载失败时显示备用图片
      }}
    />
  </div>
);

export default MyComponent;
```

### 自定义效果
你可以使用 CSS 自定义图片加载和显示的效果：

```css
/* 自定义淡入效果 */
.fade-in {
  opacity: 0;
  transition: opacity 0.5s ease-in;
}

.fade-in.lazy-load-image-loaded {
  opacity: 1;
}
```

```javascript
import React from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import './custom.css'; // 引入自定义 CSS

const MyComponent = () => (
  <div>
    <LazyLoadImage
      alt="Example Image"
      height={200}
      src="https://example.com/image.jpg"
      width={200}
      className="fade-in" // 使用自定义的淡入效果
    />
  </div>
);

export default MyComponent;
```

### 总结
`react-lazy-load-image-component` 是一个功能强大且易于使用的 React 插件，用于实现图片的懒加载。通过使用这个插件，你可以显著提升网页的加载性能和用户体验。它提供了多种配置选项和自定义效果，满足不同场景下的需求。
<img width="887" alt="image" src="https://github.com/user-attachments/assets/df403629-a167-47ef-901c-8d4196ed6ff8" />
### 查看未使用的 CSS 和 JS 文件

#### 步骤：
1. **点击重新运行**：
   - 在浏览器开发者工具中，点击“重新运行”按钮，可以看到哪些 CSS 文件或者 JS 文件在当前页面中用到的情况。

2. **查看覆盖率**：
   - 在开发者工具中，点击右上角的菜单图标，选择“运行命令”。
   - 输入 `coverage` 并选择“显示覆盖范围”。

3. **查看使用情况**：
   - 点击“重新运行”按钮，可以看到哪些 CSS 文件或者 JS 文件在当前页面中用到的情况。
   - 面板会显示每个文件的详细信息，红色区域表示当前加载界面没有用到的样式或代码。

#### 示例：
- **查看 CSS 的使用情况**：
  - 具体点击加载的文件，面板会显示该文件，红色区域表示当前加载界面没有用到的样式。
  - 如下图所示，红色部分表示未使用的 CSS 规则。

通过这些步骤，可以有效地识别和移除未使用的 CSS 和 JS 文件，从而优化网页的加载性能。

### 启用压缩文本问题：
- **问题**：启用文本压缩 - 有望节省 130 KiB
- **处理方案**：接口请求的响应头添加 `content-encoding` 字段，以压缩的形式接收数据返回。
  ```plaintext
  content-encoding: gzip
  ```

### 优化加载图片问题：
- **问题**：采用新一代格式提供图片 - 有望节省 527 KiB
- **处理方法一**：图片推荐使用 webp 格式。
- **处理方法二**：使用 `react-lazy-load-image-component` 插件加载图片。
- **处理方法三**：使用 `gatsby-plugin-image` 组件加载图片，该插件会自动优化图片格式，而非用 `<img>` 标签加载（2d 编辑器已经有该插件）。关于该组件的使用情况，具体查阅文档：[Gatsby Plugin Image](https://www.gatsbyjs.com/docs/how-to/images-and-media/using-gatsby-plugin-image/?utm_source=lighthouse&utm_medium=devtools)

### 加载本地静态图片的使用方法：
1. **StaticImage**：
   ```javascript
   import { StaticImage } from 'gatsby-plugin-image';

   <StaticImage src="../images/test.png" alt="test" />
   ```
   - 注意：如果使用 StaticImage 来加载图片的话，图片路径只支持相对路径，并且不支持以二次赋值的形式添加到 src 地址中，比如通过组件传值，用 props 接收，该组件是不识别传参路径的。

2. **GatsbyImage**：
   ```javascript
   import { GatsbyImage, getImage } from 'gatsby-plugin-image';
   import { graphql, useStaticQuery } from 'gatsby';

   export default function MyGatsbyImage(props) {
     const { imageName, width, height, alt = '', style } = props;
     const data = useStaticQuery(graphql`
       query {
         allFile(filter: { extension: { regex: "/(jpg|jpeg|png|gif)/" } }) {
           nodes {
             relativePath
             childImageSharp {
               gatsbyImageData(layout: CONSTRAINED)
             }
           }
         }
       }
     `);

     const imageNode = data.allFile.nodes.find(node => node.relativePath === imageName);
     const image = getImage(imageNode.childImageSharp.gatsbyImageData);

     return (
       <GatsbyImage
         image={image}
         alt={alt}
         style={{ borderRadius: '8px', width, height, ...style }}
       />
     );
   }
   ```

### 加载请求接口动态渲染图片：
```javascript
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

<LazyLoadImage
  src={src} // 图片地址
  alt={alt} // 描述图片的内容
  crossOrigin="anonymous" // 设置跨域属性
  effect="blur" // 加载效果
  style={{ objectFit: 'contain', width: '100%', height: '100%', ...style }}
  onClick={handleClick} // 点击图片
  onError={(e) => { e.currentTarget.src = img_error }} // 图片加载失败后的展示图
  placeholderSrc={placeholderImage} // 图片加载完成之前显示的占位符
  beforeLoad={handleBeforeLoad} // 图片开始加载之前调用
  afterLoad={handleAfterLoad} // 图片加载完成之后调用
  {...reset}
/>
```

### 其他建议：
1. 可以从项目的打包配置入手，使用相关插件优化项目工程。
2. 加载涉及很多图片的界面，图片来源是用户自己导入的，像 png 格式，可以由后台端转换为 webp 格式返回；如果图片来源是运营或者开发写死的，比如官网页面，也建议使用 webp 格式的图片。因为 webp 格式图片体积比较小，png 比 webp 大很多，一次性加载很多 png 图片的话容易消耗带宽，所以呈现出来的响应也会慢一些。用 png 的话先经过压缩再上传，压缩可以用 tinypng 工具。

### 相关问题处理动作和
1. **减少未使用的 CSS 和 JS 加载**：
   - 处理动作：在控制台上执行命令查找覆盖率，根据面板提示，去除没用的代码。


2. **优化图片加载**：
   - 处理动作：使用统一组件 `gatsby-plugin-image` 加载


3. **缩短 JS 执行**：
   - 排查动作：通过控制面板跟踪排查


4. **减少主线程加载消耗**：
   - 排查动作：通过控制面板跟踪排查

