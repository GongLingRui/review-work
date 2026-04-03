`DOMPurify.sanitize` 是 [DOMPurify](https://github.com/cure53/DOMPurify) 库的一个核心方法，用于清理和消毒 HTML 或字符串内容，以防止跨站脚本攻击（XSS）等安全问题。

### 什么是 DOMPurify？
DOMPurify 是一个快速、强大且安全的库，用于清理用户输入的 HTML 或字符串内容。它的主要目的是防止恶意代码注入，例如 XSS 攻击。DOMPurify 可以在浏览器和 Node.js 环境中使用。

---

### `DOMPurify.sanitize` 方法

#### 语法
```javascript
DOMPurify.sanitize(dirty, config);
```

#### 参数
1. **`dirty`**:
   - 需要清理的 HTML 字符串或 DOM 节点。
   - 例如，用户输入的 HTML 内容。

2. **`config`** (可选):
   - 一个配置对象，用于自定义清理行为。
   - 例如，可以指定允许的标签、属性、样式等。

#### 返回值
- 返回清理后的安全 HTML 字符串或 DOM 节点（取决于输入类型）。

---

### 使用示例

#### 基本用法
```javascript
import DOMPurify from 'dompurify';

const dirtyHTML = '<img src=x onerror=alert(1)><p>Hello World!</p>';
const cleanHTML = DOMPurify.sanitize(dirtyHTML);

console.log(cleanHTML);
// 输出: <p>Hello World!</p>
```

#### 配置自定义规则
```javascript
const dirtyHTML = '<a href="javascript:alert(1)">Click me</a>';
const cleanHTML = DOMPurify.sanitize(dirtyHTML, { ALLOWED_TAGS: ['a'], ALLOWED_ATTR: ['href'] });

console.log(cleanHTML);
// 输出: <a>Click me</a>
```

#### 清理 DOM 节点
```javascript
const dirtyNode = document.createElement('div');
dirtyNode.innerHTML = '<script>alert(1)</script><p>Safe content</p>';

const cleanNode = DOMPurify.sanitize(dirtyNode);

console.log(cleanNode.innerHTML);
// 输出: <p>Safe content</p>
```

---

### 常见配置选项

1. **`ALLOWED_TAGS`**:
   - 指定允许的 HTML 标签。
   - 默认允许常见的安全标签（如 `<p>`, `<a>`, `<b>` 等）。

   ```javascript
   { ALLOWED_TAGS: ['b', 'i', 'em'] }
   ```

2. **`ALLOWED_ATTR`**:
   - 指定允许的 HTML 属性。
   - 默认允许常见的安全属性（如 `href`, `src`, `alt` 等）。

   ```javascript
   { ALLOWED_ATTR: ['href', 'title'] }
   ```

3. **`FORBID_TAGS`**:
   - 指定禁止的 HTML 标签。
   - 这些标签会被移除，即使它们在 `ALLOWED_TAGS` 中。

   ```javascript
   { FORBID_TAGS: ['script', 'style'] }
   ```

4. **`FORBID_ATTR`**:
   - 指定禁止的 HTML 属性。
   - 这些属性会被移除，即使它们在 `ALLOWED_ATTR` 中。

   ```javascript
   { FORBID_ATTR: ['onclick', 'onerror'] }
   ```

5. **`RETURN_DOM`**:
   - 如果设置为 `true`，`sanitize` 方法会返回一个安全的 DOM 节点，而不是字符串。

   ```javascript
   { RETURN_DOM: true }
   ```

6. **`RETURN_DOM_FRAGMENT`**:
   - 如果设置为 `true`，`sanitize` 方法会返回一个安全的 DOM 文档片段。

   ```javascript
   { RETURN_DOM_FRAGMENT: true }
   ```

---

### 为什么使用 DOMPurify？

1. **防止 XSS 攻击**:
   - 用户输入的 HTML 可能包含恶意代码，例如 `<script>` 标签或事件处理程序（如 `onclick`）。
   - DOMPurify 会移除这些不安全的内容。

2. **简单易用**:
   - 提供了简单的 API 和灵活的配置选项。

3. **高性能**:
   - DOMPurify 是一个轻量级且高效的库，适合在高性能需求的场景中使用。

4. **跨平台支持**:
   - 支持浏览器和 Node.js 环境。

---

### 总结
`DOMPurify.sanitize` 是一个强大的工具，用于清理和消毒 HTML 内容，确保其安全性。它在处理用户输入、富文本编辑器内容或动态生成的 HTML 时非常有用。通过灵活的配置选项，开发者可以根据需求自定义清理规则，从而在安全性和功能性之间取得平衡。
