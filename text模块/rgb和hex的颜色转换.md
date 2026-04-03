这段代码实现了两种颜色格式之间的转换：**RGB 到 HEX** 和 **HEX 到 RGB**。以下是对这两种转换的详细分析：

---

### 1. **RGB 到 HEX 转换**

#### 函数定义
```typescript
export const rgbToHex = (r: number, g: number, b: number): string => {
  const convert = (num: number) => {
    const n = num.toString(16)
    return n.length === 1 ? `0${n}` : n
  }
  return `#${convert(r)}${convert(g)}${convert(b)}`
}
```

#### 实现逻辑
1. **输入参数**：
   - 接收三个参数 `r`、`g` 和 `b`，分别表示红、绿、蓝的值，范围是 `0-255`。

2. **核心逻辑**：
   - 每个颜色通道的值（`r`、`g`、`b`）需要转换为 16 进制字符串。
   - 使用 `toString(16)` 方法将数字转换为 16 进制字符串。
   - 如果转换后的字符串长度为 1（例如 `0` 转换为 `0`），需要在前面补 `0`，确保每个通道的 16 进制值是两位。

3. **辅助函数**：
   - `convert` 是一个内部函数，用于处理单个颜色通道的转换和补零逻辑。

4. **拼接结果**：
   - 将三个通道的 16 进制值拼接在一起，并在前面加上 `#`，形成 HEX 格式的颜色字符串。

#### 示例
```typescript
rgbToHex(255, 0, 0) // 输出: "#ff0000"
rgbToHex(0, 255, 0) // 输出: "#00ff00"
rgbToHex(0, 0, 255) // 输出: "#0000ff"
rgbToHex(15, 15, 15) // 输出: "#0f0f0f"
```

---

### 2. **HEX 到 RGB 转换**

#### 函数定义
```typescript
export const hexToRgb = (hex: string): { r: number, g: number, b: number } => {
  hex = hex.replace(/^#/, '');

  let bigint = parseInt(hex, 16);
  let r = (bigint >> 16) & 255;
  let g = (bigint >> 8) & 255;
  let b = bigint & 255;

  return { r, g, b };
}
```

#### 实现逻辑
1. **输入参数**：
   - 接收一个参数 `hex`，表示 HEX 格式的颜色字符串，例如 `#ff0000` 或 `ff0000`。

2. **去掉 `#` 前缀**：
   - 如果输入的 HEX 字符串以 `#` 开头，使用 `replace(/^#/, '')` 去掉 `#`。

3. **将 HEX 转换为整数**：
   - 使用 `parseInt(hex, 16)` 将 16 进制字符串转换为一个整数值。
   - 例如，`ff0000` 转换为 `16711680`。

4. **提取 RGB 通道值**：
   - 使用位运算从整数中提取红、绿、蓝三个通道的值：
     - 红色通道：`(bigint >> 16) & 255`
       - 将整数右移 16 位，保留最高的 8 位（红色通道），然后与 `255` 进行按位与操作，确保只保留 8 位。
     - 绿色通道：`(bigint >> 8) & 255`
       - 将整数右移 8 位，保留中间的 8 位（绿色通道），然后与 `255` 进行按位与操作。
     - 蓝色通道：`bigint & 255`
       - 直接与 `255` 进行按位与操作，提取最低的 8 位（蓝色通道）。

5. **返回结果**：
   - 返回一个对象 `{ r, g, b }`，分别表示红、绿、蓝的值。

#### 示例
```typescript
hexToRgb("#ff0000") // 输出: { r: 255, g: 0, b: 0 }
hexToRgb("00ff00")  // 输出: { r: 0, g: 255, b: 0 }
hexToRgb("#0000ff") // 输出: { r: 0, g: 0, b: 255 }
hexToRgb("0f0f0f")  // 输出: { r: 15, g: 15, b: 15 }
```

---

### 3. **两种转换的核心原理**

#### 3.1 **RGB 到 HEX**
- RGB 是基于 10 进制的颜色表示法，每个通道的值范围是 `0-255`。
- HEX 是基于 16 进制的颜色表示法，每个通道的值范围是 `00-FF`。
- 转换的核心是将 10 进制的值转换为 16 进制，并确保每个通道的值是两位。

#### 3.2 **HEX 到 RGB**
- HEX 是一个 16 进制的字符串，表示一个整数值。
- 通过位运算，可以从整数中提取出红、绿、蓝三个通道的值。

---

### 4. **注意事项**
1. **输入验证**：
   - 代码中没有对输入进行严格验证，例如 HEX 字符串的长度是否为 6 或 3，是否包含非法字符等。
   - 可以添加输入验证逻辑，确保输入的格式正确。

2. **支持简写 HEX**：
   - 简写 HEX 颜色（例如 `#f00`）目前不支持，可以扩展逻辑将其转换为完整格式（例如 `#ff0000`）。

3. **透明度支持**：
   - 当前的实现不支持处理带透明度的颜色（例如 `rgba` 或 `#rrggbbaa` 格式）。
   - 如果需要支持透明度，可以扩展逻辑。

---

### 5. **扩展功能示例**

#### 支持简写 HEX
```typescript
export const hexToRgb = (hex: string): { r: number, g: number, b: number } => {
  hex = hex.replace(/^#/, '');

  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }

  let bigint = parseInt(hex, 16);
  let r = (bigint >> 16) & 255;
  let g = (bigint >> 8) & 255;
  let b = bigint & 255;

  return { r, g, b };
}
```

#### 支持透明度
```typescript
export const hexToRgba = (hex: string): { r: number, g: number, b: number, a: number } => {
  hex = hex.replace(/^#/, '');

  if (hex.length === 8) {
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 24) & 255;
    const g = (bigint >> 16) & 255;
    const b = (bigint >> 8) & 255;
    const a = (bigint & 255) / 255; // 透明度范围是 0-1
    return { r, g, b, a };
  }

  throw new Error("Invalid HEX format");
}
```

---

### 总结
- **RGB 到 HEX**：通过将每个通道的值转换为 16 进制字符串，并拼接成完整的 HEX 格式。
- **HEX 到 RGB**：通过位运算从 16 进制整数中提取红、绿、蓝三个通道的值。
- 代码简单高效，适合处理常见的颜色转换需求。
