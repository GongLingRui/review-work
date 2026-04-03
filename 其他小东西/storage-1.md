好的，我将用中文详细解释这段代码，并指出其中的关键改进点和安全问题。

**代码概述**

这段代码提供了一套完整的 Web 应用本地存储和会话存储管理方案，具有加密、用户信息管理、密钥生成、会话清理等功能。它利用了 `store2` 库来简化存储操作。

**1. 导入模块和常量定义**

```typescript
import store2, { type Reviver, type Replacer, type StoredData, type StoreBase } from 'store2'

import type { UserInfo } from 'src/services'
import { isInNativeApp, getNativeInfo } from './jsbridge'
import { count } from 'console' // 这个导入似乎没用到，可以移除
import { AESDecode, AESEncode } from './utils' // 自定义的 AES 函数，但实际上并未使用，被 CryptoJS 取代了
import CryptoJS from 'crypto-js';
import { ConsoleUtil } from './utils/ConsoleUtil'

const PREFIX = 'mk-'
const prefix = (...key: (TemplateStringsArray | string)[]) => `${PREFIX}${key}`
/** 需要持久化的前缀, 方便登出时进行过滤清理 */
export const PERSIST_PREFIX = prefix`persist`
export const USERINFO_KEY = prefix`userinfo`
// 本地存储公私钥对, 但 Key 名字不要写得太直白
export const CLIENT_PUBLIC_KEY = prefix`client`
export const ALPC_DOMAIN = prefix`alpc-domain`
export const USER_LANGUAGE = prefix`user-language`
export const VMSUSERINFO_KEY = 'vms-userinfo'
export const VMSCLIENT_PUBLIC_KEY = 'vms-client'
const STORAGE_SECRET_KEY = 'anker-make-secret-key';
```

*   **`store2`:**：一个流行的库，用于以一致且功能更丰富的方式处理本地存储和会话存储，优于原生的浏览器 API。它提供了命名空间、过期和其他实用功能。
*   **`UserInfo`:**：从 `src/services` 导入的类型定义。这可能定义了用户信息对象的结构。
*   **`isInNativeApp`, `getNativeInfo`:**：与原生应用环境交互的函数（可能通过 JavaScript 桥接）。
*   **`AESDecode`, `AESEncode`:**：导入了，但*未使用*。代码直接使用 `CryptoJS`。这是多余的，应该删除导入。
*   **`CryptoJS`:**：一个强大的加密操作库，这里用于 AES 加密和解密。
*   **`ConsoleUtil`**: 用于控制台日志记录的工具类。
*   **`PREFIX`, `prefix`:**：所有存储键都使用前缀 (`mk-`)，以避免与其他应用或库发生命名冲突。`prefix` 函数可以轻松创建带有此前缀的键。这是很好的做法。
*   **`PERSIST_PREFIX`:**：用于持久存储键的前缀，便于在注销时清除它们。
*   **键常量:**：为各种存储键定义了常量，提高一致性并避免硬编码字符串。这是很好的做法。
*   **`STORAGE_SECRET_KEY`:**：用于 AES 加密的*硬编码*密钥。**这是一个重大的安全漏洞。** 硬编码密钥意味着任何能够访问你的代码的人（例如，通过受损的依赖项、XSS 或甚至只是在浏览器中查看源代码）都可以解密你存储的数据。

**2. `getOpenUdidKey`**

```typescript
const getOpenUdidKey = async (email: string) => {
  const md5 = await import('js-md5').then((md5) => md5.default)
  const salt = 'renton'
  // 不要直接在浏览器中存储用户的邮箱地址
  return prefix`openudid-${md5(`${salt}:${email}`)}`
}
```

*   **用途:**：根据用户的电子邮件生成一个唯一的键，使用 MD5 哈希和盐值。此键用于存储唯一的设备标识符 (OpenUDID)。
*   **`js-md5`:**：对 MD5 库使用动态导入 (`await import(...)`)。这有利于代码分割，因为它只在需要时加载 MD5 库。
*   **加盐:**：在对电子邮件进行哈希处理之前使用盐值 (`renton`)。加盐对于安全至关重要：它阻止攻击者使用预先计算的“彩虹表”来反转哈希并恢复电子邮件地址。**但是，盐值是硬编码的，这是一个安全问题。**
*   **键格式:**：键带有前缀，并包含加盐电子邮件的 MD5 哈希值。
*   **安全注意事项**：MD5 现在被认为在密码学上已破解。它容易受到碰撞攻击（两个不同的输入产生相同的哈希值）。**你应该使用更强的哈希算法，如 SHA-256（代码后面使用了 SHA-256，但不一致）。**

**3. `localEncrypt` 和 `localDecrypt`**

```typescript
/**
 * AES 加密
 */
export function localEncrypt(data: string, key?: string): string {
  return CryptoJS.AES.encrypt(data, key ? key : STORAGE_SECRET_KEY).toString();
}

/**
 * AES 解密
 */
export function localDecrypt(data: string, key?: string): string {
  const bytes = CryptoJS.AES.decrypt(data, key ? key : STORAGE_SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}
```

*   **用途:**：使用 `CryptoJS` 提供 AES 加密和解密。
*   **密钥处理:**：允许传递可选的 `key`。如果没有提供密钥，则使用 `STORAGE_SECRET_KEY`。**这种对硬编码的 `STORAGE_SECRET_KEY` 的依赖是代码中最大的安全漏洞。**
*   **加密:**：使用 `CryptoJS.AES.encrypt()` 加密数据。
*   **解密:**：使用 `CryptoJS.AES.decrypt()` 解密数据。结果将转换为 UTF-8 字符串。

**4. `getLocalStorage`, `setLocalStorage`, `hasLocalStorage`, `removeLocalStorage`, `getAllLocalStorage`, `clearLocalStorage`**

这些函数封装了 `store2.local` 的本地存储方法, 并增加了加密和 JSON 序列化/反序列化的功能。

   - JSON.stringify/parse 是必须的，因为 localStorage 只能存储字符串。
   - `getLocalStorage` 增加了对解密处理和异常捕获.
   - `setLocalStorage` 直接使用了 localStorage 的 api, 为了统一,应该使用 `store2.local.set`

**5. `getSessionStorage`, `setSessionStorage`, `hasSessionSrorage`, `removeSessionStorage`, `getAllSessionSrorage`, `clearSessionSrorage`**

这些函数封装了 `store2.session` 的会话存储方法。

**6. 用户信息管理 (`setUserInfo`, `getUserInfo`, `isLogined`, `removeUserInfo`)**

```typescript
/**
 * 设置用户信息
 */
export function setUserInfo(params: UserInfo, keepSigned: boolean): void {
  clearUserInfoFromAllLocalStorage() // 兼容老版本过渡
  removeLocalStorage(USERINFO_KEY)
  // 不使用setLocalStorage，因为切片端重写了store2（会转化为base64格式）
  const userInfoString = JSON.stringify(params);
  setLocalStorage(USERINFO_KEY, userInfoString);
}


/**
 * 获取用户信息
 */
export function getUserInfo(): UserInfo | null {
  let ret = getLocalStorage<UserInfo>(USERINFO_KEY)
  return ret;
}

// 是否已登录逻辑判断
export function isLogined(): boolean {
  return Boolean(getUserInfo()?.auth_token) || isInNativeApp()
}

/**
 * 清除用户信息
 */
export function removeUserInfo(): void {
  removeLocalStorage(USERINFO_KEY)
  removeLocalStorage(ALPC_DOMAIN)
  removeLocalStorage(VMSUSERINFO_KEY)
  removeLocalStorage(VMSCLIENT_PUBLIC_KEY)
  clearUserInfoFromAllLocalStorage() // 兼容老版本过渡
}
```

*   **`setUserInfo`:**：将用户信息存储在本地存储中。
    *   清除现有的用户信息（包括旧版本的键）。
    *   在存储之前将 `UserInfo` 对象字符串化。
*   **`getUserInfo`:**：从本地存储中检索用户信息并将其解析回对象。
*   **`isLogined`:**：根据用户信息中是否存在 `auth_token` 或应用是否在原生环境中运行来检查用户是否已登录。
*   **`removeUserInfo`:**：从本地存储中清除用户信息和相关数据。
*   **问题:**：`setUserInfo` 使用了 `setLocalStorage`，而 `setLocalStorage` 内部直接使用了 `localStorage.setItem`，而不是像其他函数那样使用 `store2.local.set`。这不一致。应该使用 `store2.local.set(USERINFO_KEY, userInfoString)`。关于“切片端重写了 store2”的注释不清楚，可能没有必要。

**7. ALPC 域名管理 (`setALPCDomain`, `getALPCDomain`)**

存储和检索域名值。

**8. 用户语言管理 (`getLocalUserLanguage`, `setLocalUserLanguage`)**

存储和检索用户的首选语言。

**9. 客户端密钥管理 (`setClientKey`, `getClientKey`, `clearClientKey`)**

```typescript
// 存储本地公私钥
export function setClientKey(public_key: string, private_key: string): void {
  const obj = [window.btoa(public_key), window.btoa(private_key)]
  const keyString = JSON.stringify(obj);
  setLocalStorage(CLIENT_PUBLIC_KEY, keyString)
}

// 取出公私匙
export function getClientKey(): [string, string] | undefined {
  const val = getLocalStorage<string[]>(CLIENT_PUBLIC_KEY)
  const isString = typeof val === "string"
  if (val && !isString) {
    return [
      // publicKey
      window.atob(val[0]),
      // privateKey
      window.atob(val[1]),
    ]
  }
}

/**
 * 清除公私钥
 */
export function clearClientKey(): void {
  removeLocalStorage(CLIENT_PUBLIC_KEY)
}
```

*   **用途:**：在本地存储中存储和检索公钥/私钥对。密钥在存储之前进行 base64 编码。
*   **`window.btoa` 和 `window.atob`:**：这些函数分别用于 base64 编码和解码。
*   **安全问题:**：虽然密钥已编码，但它们*未加密*。即使是 base64 编码，将私钥存储在本地存储中也是**非常不安全的**。本地存储可由在同一域上运行的任何 JavaScript 访问。**绝对不应该对真实的私钥这样做。** 更好的方法是使用 Web Crypto API 进行密钥生成和存储，并且只在本地存储中存储加密数据。

**10. `getOpenUdid`**

```typescript
export async function getOpenUdid(email?: string): Promise<string> {
  if (!email) {
    const userInfo = getUserInfo()
    if (!userInfo) throw new Error('You must login to get user info.')
    email = userInfo?.email
  }
  if (!email) {
    email = 'anonymous'
  }
  const key = await getOpenUdidKey(email)
  let openUdid: string = getLocalStorage(key, '')
  // 后端限制最长 64
  if (openUdid?.length > 64) openUdid = ''
  if (!openUdid) {
    openUdid = textSummary(email + Date.now() + Math.random())
    setLocalStorage(key, openUdid)
  }
  return openUdid
}
```

*   **用途:**：检索或生成唯一的设备标识符 (OpenUDID)。
*   **电子邮件处理:**：如果未提供电子邮件，则从存储的用户信息中获取用户的电子邮件。如果无法获取电子邮件，则回退到“anonymous”。
*   **缓存:**：使用生成的键从本地存储中检索 OpenUDID。
*   **生成:**：如果未找到 OpenUDID，则使用 `textSummary` 函数生成一个并存储它。
*   **长度检查:**：将 OpenUDID 截断为 64 个字符，可能是为了符合后端限制。
*   **改进**: `if (!userInfo) throw new Error('You must login to get user info.')` 抛出异常并不理想，考虑返回一个默认的匿名 ID，而不是抛出异常，这可能会中断应用程序流程。

**11. `clearUserInfoFromAllLocalStorage`**

```typescript
/**
 * 从所有LocalStorage中清除用户信息
 * @returns
 */
function clearUserInfoFromAllLocalStorage() {
  const allLocalStore = getAllLocalStorage()
  for (const key in allLocalStore) {
    if (new RegExp(`^${USERINFO_KEY}`).test(key) || new RegExp(`^${ALPC_DOMAIN}`).test(key)) {
      removeLocalStorage(key)
    }
  }
}
```

*   **用途:**：从所有本地存储命名空间中清除用户信息（可能用于向后兼容）。
*   **迭代:**：遍历本地存储中的所有键。
*   **正则表达式:**：使用正则表达式匹配与用户信息或 ALPC 域相关的键。
*   **改进**: 此函数遍历*所有*本地存储键，如果存在许多不相关的键，则效率可能较低。最好更有效地使用 `store2` 的命名空间功能来隔离用户数据并避免这种全局扫描。

**12. `textSummary`**

```typescript
/** 简单的文本摘要 */
function textSummary(text = '', salt = '_933427', caesar = 5, opts = { blockLength: 16, maxLength: 64 }) {
  const { blockLength, maxLength } = opts

  if (blockLength >= 36 || blockLength < 16) {
    throw new Error('blockLength options prop is wrong value, it is value in range:16~36')
  }

  // 加盐
  const textArr = `${text};salt=${salt}`.split('')

  const _0bTextArr = textArr
    .map(str => (str.codePointAt(0) || 0) + caesar) // 凯撒字符偏移
    .map(num => num.toString(2)) // 转化为二进制

  // 分块
  const _0bTextStr = _0bTextArr.join('')
  const blockAmount = Math.ceil(_0bTextStr.length / blockLength)
  const _0bTextBlockArr = Array(blockAmount)

  for (let i = 0; i < blockAmount; i++) {
    let subStr = _0bTextStr.slice(i * blockLength, (i + 1) * blockLength)

    // 最后一块字符长度不足，补0
    if (subStr.length !== blockLength) {
      subStr = subStr.padEnd(blockLength, '0')
    }

    _0bTextBlockArr[i] = subStr
  }

  // 将二进制块转化为16进制块
  const _0xTextBlockArr = _0bTextBlockArr.map(str => parseInt(str, 2).toString(blockLength))
  const result = _0xTextBlockArr.join('')

  const len = result.length
  if (len > maxLength) {
    const count = len - maxLength
    const steps = Math.floor(len / count)
    let step = 0
    return result
      .split('')
      .filter((v, idx) => !(idx === step * steps && step++ < count))
      .join('')
  }

  return result
}
```

*   **用途:**：创建一个简单的、固定长度的文本摘要（一种弱哈希）。这用于生成 OpenUDID。
*   **加盐:**：向输入文本添加盐值。**同样，盐值是硬编码的，这削弱了安全性。**
*   **凯撒密码:**：对每个字符执行凯撒密码移位（将字符代码加 5）。这是一种非常弱的混淆形式。
*   **二进制转换:**：将字符转换为二进制表示形式。
*   **分块:**：将二进制字符串拆分为指定长度的块。
*   **十六进制转换:**：将每个二进制块转换为十六进制表示形式。
*   **长度缩减:**：如果生成的字符串长于 `maxLength`，则以固定间隔删除字符以缩短它。
*   **安全问题**：此函数*不*具有密码学安全性。它很容易被逆转。它适用于生成简单的、不敏感的标识符，但*不*应用于任何需要安全性的地方。应该使用 SHA-256 替换它来生成 OpenUDID。

**13. `generateKeyByEmail`**

```typescript
async function generateKeyByEmail(email: string) {
  const u8a = new TextEncoder().encode(email) // encode as (utf-8) Uint8Array
  const hashBuf = await crypto?.subtle?.digest('SHA-256', u8a) // hash the message
  const hashArr = Array.from(new Uint8Array(hashBuf)) // convert buffer to byte array
  return hashArr.map(b => b.toString(16).padStart(2, '0')).join('') // convert bytes to hex string
}
```

*   **用途:**：生成电子邮件地址的 SHA-256 哈希值。这是一种比 MD5 或 `textSummary` 函数*好得多*的生成唯一键的方法。
*   **`TextEncoder`:**：将电子邮件字符串编码为 UTF-8 `Uint8Array`。
*   **`crypto.subtle.digest`:**：使用 Web Crypto API (`crypto.subtle`) 计算 SHA-256 哈希值。这是在浏览器中执行密码学哈希的推荐方法。
*   **十六进制转换:**：将生成的哈希值（`Uint8Array`）转换为十六进制字符串。
*   **安全问题:**：SHA-256 是一种强大的密码学哈希函数。这是根据电子邮件地址生成密钥的好方法，*前提是你还要对输入加盐*。此函数缺少盐值。

**14. `emailKeyMap`、`getDomainInfoByEmail`、`setDomainInfo`**

```typescript
const emailKeyMap: Record<string, string> = {}

/**
 * 根据邮箱地址获取本地服务 Domain，不需要每次都重新请求
 */
export async function getDomainInfoByEmail(email: string): Promise<string> {
  const key = [PREFIX, 'domain-', await generateKeyByEmail(email)].join('')
  emailKeyMap[email] = key
  return getLocalStorage(key) as string
}

export async function setDomainInfo(email: string, domain: string): Promise<void> {
  const key = emailKeyMap[email] || (await generateKeyByEmail(email))
  if (domain) {
    setLocalStorage(key, domain)
  }
}
```

*   **用途:**：提供根据电子邮件地址存储和检索域名信息的功能，使用电子邮件的 SHA-256 哈希值作为键的一部分。
*   **`emailKeyMap`:**：一个简单的内存缓存，以避免为同一电子邮件重新计算键。这是一个小优化。
*   **`getDomainInfoByEmail`:**：检索给定电子邮件的域名信息。
*   **`setDomainInfo`:**：存储给定电子邮件的域名信息。

**15. `SessionManagment`**

```typescript
/**
 * 退出登录后清除会话信息
 */
export class SessionManagment {
  static clearFns = new Map<string, () => void>()
  static addClearFn(key: string, fn: () => void) {
    if (SessionManagment.clearFns.has(key)) return
    SessionManagment.clearFns.set(key, fn)
  }

  static runClearFn() {
    removeUserInfo()
    clearClientKey()
    clearSessionSrorage()
    for (const fn of SessionManagment.clearFns.values()) {
      fn()
    }
  }
}
```

*   **用途:**：提供一种机制来注册和执行在用户注销时应运行的函数（以清除会话数据）。
*   **`clearFns`:**：一个 `Map`，用于存储应在注销时执行的函数。使用 `Map` 可防止重复注册。
*   **`addClearFn`:**：注册一个在注销时调用的函数。
*   **`runClearFn`:**：执行所有已注册的注销函数，清除用户信息、客户端密钥和会话存储。这是集中会话清理逻辑的好方法。

**16. `getImageUrlOrUpdateImageStorage` 和 `updateCdnImageStorage`**

```typescript
const CDN_IMAGE_STORAGE = 'cdn_image_storage'

/**
 * 获取缓存的图片地址
 * @param src 新的图片地址
 * @param maxAge 最大缓存时长，单位：秒。默认 3600 秒
 * @returns
 */
export const getImageUrlOrUpdateImageStorage = (src: string, maxAge = 3600): string => {

  const storage: any = getLocalStorage(CDN_IMAGE_STORAGE) || {}
  const arr = src.split('?')
  const domain = arr[0]
  const query = arr[1]
  const now = +Date.now()

  if (query) {
    if (!storage[domain]) {
      storage[domain] = {
        src: src,
        cacheTime: now,
        count: 1,
      }
      setLocalStorage(CDN_IMAGE_STORAGE, JSON.stringify(storage))
      return src
    } else {
      if (now - storage[domain].cacheTime > 1000 * maxAge) {
        storage[domain] = {
          src: src,
          cacheTime: now,
          count: 1,
        }
        setLocalStorage(CDN_IMAGE_STORAGE, JSON.stringify(storage))
        return src
      } else {
        storage[domain].count++
        setLocalStorage(CDN_IMAGE_STORAGE, JSON.stringify(storage))
        return storage[domain].src //这里应该是返回 src
      }
    }
  }
  return src
}

/**
 * 更新图片缓存某项记录
 * @param url
 * @returns
 */
export const updateCdnImageStorage = (url: string) => {
  const storage: any = getLocalStorage(CDN_IMAGE_STORAGE) || {}
  const arr = url.split('?')
  const domain = arr[0]
  const now = +Date.now()
  storage[domain] = {
    src: url,
    cacheTime: now,
    count: 1,
  }
  setLocalStorage(CDN_IMAGE_STORAGE, JSON.stringify(storage))
  return url
}
```

*   **用途:**：在本地存储中实现一个简单的图片缓存机制，以避免冗余的图片请求。
*   **`CDN_IMAGE_STORAGE`:**：用于存储图片缓存的键。
*   **`getImageUrlOrUpdateImageStorage`:**：
    *   从本地存储中检索图片缓存。
    *   将图片 URL 拆分为基本 URL (`domain`) 和查询参数。
    *   如果有查询参数：
        *   如果图片 URL 不在缓存中，或者缓存的条目早于 `maxAge`，则使用新的 URL、当前时间和计数 1 更新缓存。
        *   如果图片 URL 在缓存中且未过期，则递增计数并返回*缓存的* URL。**这部分似乎不正确。它应该返回原始的 'src'，而不是可能过时的缓存 URL。**
    *   如果没有查询参数，则返回原始 URL（这意味着它不会缓存没有查询参数的图片）。
*   **`updateCdnImageStorage`:**：强制更新缓存中特定图片 URL 的记录。
*   **问题:**：
    *   缓存逻辑有缺陷。它应该始终返回原始的 `src` URL，而不是可能过时的缓存 URL。此缓存的目的可能是阻止浏览器多次请求同一图片，而不是提供过时的图片。`count` 属性似乎没有明确的用途。
    *   它只缓存带有查询参数的图片。这可能是故意的，但应该记录下来。
    *   对存储对象使用 `any`。应该为图片缓存定义一个正确的类型。
    *   依赖字符串操作来提取域名。更可靠的方法是使用 `new URL(src).origin`。

**关键改进和修复（摘要）**

1.  **安全:**
    *   **移除硬编码的 `STORAGE_SECRET_KEY`:**：这是*最重要*的更改。你*必须*使用安全生成的随机密钥进行加密。最好的方法是使用 Web Crypto API 生成密钥并安全地存储它（不在本地存储中）。如果必须存储密钥，请考虑使用 IndexedDB 并采取适当的安全措施。
    *   **使用 SHA-256 替代 MD5:**：将 `js-md5` 替换为 SHA-256（使用 Web Crypto API）进行哈希处理。
    *   **在 `generateKeyByEmail` 中添加盐值:**：在对电子邮件地址进行哈希处理时，使用安全生成的随机盐值。
    *   **不要将私钥存储在本地存储中:**：移除 `setClientKey`、`getClientKey` 和 `clearClientKey` 函数，或者彻底改变它们的工作方式。
    * **移除硬编码盐值:**：为 `textSummary` 和 `getOpenUdidKey` 函数使用随机盐值。
2.  **一致性:**
    *   在 `setUserInfo` 中始终使用 `store2.local.set`。
    *   移除冗余导入 (`AESDecode`, `AESEncode`)。

3.  **效率:**
    *   改进 `clearUserInfoFromAllLocalStorage` 以避免遍历所有本地存储键。

4.  **缓存逻辑:**
    *   修复 `getImageUrlOrUpdateImageStorage` 中的缓存逻辑，始终返回原始的 `src` URL。
    *   为图片缓存定义一个正确的类型。
    *   使用 `new URL` 进行可靠的 URL 解析。

5.  **错误处理:**
    *   考虑在 `getOpenUdid` 中返回默认值而不是抛出异常。

6.  **文档:**
    *   为所有函数和类添加 JSDoc 注释，以解释其用途、参数和返回值。
    *   记录图片缓存函数的预期行为。

7.  **替换 `textSummary`:**：使用带有 SHA-256 的 `crypto.subtle.digest` 生成 OpenUDID，并添加随机盐值。

**修订后的代码示例（进行了关键改进，但仍未完全解决密钥管理问题）：**

```typescript
// storage.ts
import store2, { type Reviver, type Replacer, type StoredData, type StoreBase } from 'store2'
import type { UserInfo } from 'src/services'
import { isInNativeApp } from './jsbridge'
import CryptoJS from 'crypto-js';
import { ConsoleUtil } from './utils/ConsoleUtil'

const PREFIX = 'mk-'
const prefix = (...key: (TemplateStringsArray | string)[]) => `${PREFIX}${key}`

export const PERSIST_PREFIX = prefix`persist`
export const USERINFO_KEY = prefix`userinfo`
export const ALPC_DOMAIN = prefix`alpc-domain`
export const USER_LANGUAGE = prefix`user-language`
export const VMSUSERINFO_KEY = 'vms-userinfo' //考虑是否真的需要,如果不需要可以移除

const STORAGE_SECRET_KEY = 'anker-make-secret-key'; //TODO: 必须替换成安全生成的密钥

/**
 * 使用 SHA-256 和盐值生成输入字符串的哈希值。
 */
async function generateSecureHash(input: string, salt: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(input + salt);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

async function generateRandomSalt(length = 16): Promise<string> {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * AES 加密
 */
export function localEncrypt(data: string, key: string): string {
    return CryptoJS.AES.encrypt(data, key).toString();
}

/**
 * AES 解密
 */
export function localDecrypt(data: string, key: string): string {
    const bytes = CryptoJS.AES.decrypt(data, key);
    return bytes.toString(CryptoJS.enc.Utf8);
}


/**
 * 从本地存储中获取数据，可以选择解密。
 */
export function getLocalStorage<T extends unknown>(key: string, alt?: unknown | Reviver, option?: { isSecret?: boolean }): T {
    let res = store2.get(key, alt)
    if (option?.isSecret && res) {
        try {
            res = JSON.parse(localDecrypt(res, STORAGE_SECRET_KEY))
        } catch (e) {
            ConsoleUtil.error('======getLocalStorage==e', e)
             // 考虑在发生错误时返回 null 或默认值
            return alt as T;
        }
    } else if (res) {
        try {
            res = JSON.parse(res);
        } catch (e) {
            ConsoleUtil.error('======getLocalStorage==e', e);
            // 考虑在发生错误时返回 null 或默认值
             return alt as T;
        }
    }
    return res
}

/**
 * 将数据存储在本地存储中，可以选择加密。
 */
export function setLocalStorage(key: string, data: string, option?: { isSecret?: boolean }): unknown {
    let value = data;
    if (option?.isSecret) {
        value = localEncrypt(JSON.stringify(data), STORAGE_SECRET_KEY);
    }
    return store2.local.set(key, value) // 一致地使用 store2

}

export function hasLocalSrorage(key: string): boolean {
    return store2.has(key)
}

/**
* 移除local数据
*/
export function removeLocalStorage(key: string, alt?: unknown | Reviver): unknown {
    return store2.remove(key, alt)
}

/**
* 取全部local数据
*/
export function getAllLocalStorage(): StoredData {
    return store2.getAll()
}

/**
* 清空全部local数据
*/
export function clearLocalSrorage(): StoreBase {
    return store2.clear()
}

/**
* 存session数据
*/
export function setSessionStorage(
    key: string,
    data: unknown,
    overwrite?: boolean | Replacer | undefined,
): unknown {
    return store2.session.set(key, data, overwrite)
}

/**
* 取 session 数据
*/
export function getSessionStorage<T extends unknown>(key: string, alt?: unknown | Reviver): T {
    let res = store2.session.get(key, alt)
    if (res === 'expired') {
        res = null
    }
    return res
}

export function hasSessionSrorage(key: string): boolean {
    return store2.session.has(key)
}

/**
* 移除session数据
*/
export function removeSessionStorage(key: string, alt?: unknown | Reviver): unknown {
    return store2.session.remove(key, alt)
}

/**
* @description 取全部session数据
*/
export function getAllSessionSrorage(): StoredData {
    return store2.session.getAll()
}

/**
*@description 清空全部session数据
* @returns
*/

export function clearSessionSrorage(): StoreBase {
    return store2.session.clear()
}


/**
 * 将用户信息存储在本地存储中。
 */
export function setUserInfo(params: UserInfo): void {
    const userInfoString = JSON.stringify(params);
    setLocalStorage(USERINFO_KEY, userInfoString, { isSecret: true }); // 加密用户信息
}

/**
 * 从本地存储中获取用户信息。
 */
export function getUserInfo(): UserInfo | null {
    return getLocalStorage<UserInfo>(USERINFO_KEY, null, { isSecret: true });
}

// 是否已登录逻辑判断
export function isLogined(): boolean {
    return Boolean(getUserInfo()?.auth_token) || isInNativeApp()
}

/**
 * 从本地存储中清除用户信息。
 */
export function removeUserInfo(): void {
    removeLocalStorage(USERINFO_KEY)
    removeLocalStorage(ALPC_DOMAIN)
    removeLocalStorage(VMSUSERINFO_KEY) //考虑是否真的需要,不需要的话就移除
}

export function setALPCDomain(domain: string): void {
    setLocalStorage(ALPC_DOMAIN, domain)
}

export function getALPCDomain(): string | undefined {
    return getLocalStorage(ALPC_DOMAIN)
}

/**
 * 获取用户语言
 */
export function getLocalUserLanguage(): string | undefined {
    return getLocalStorage(USER_LANGUAGE)
}

/**
 * 设置用户语言
 */
export function setLocalUserLanguage(language: string): void {
    setLocalStorage(USER_LANGUAGE, language)
}

export async function getOpenUdid(email?: string): Promise<string> {
    if (!email) {
        const userInfo = getUserInfo();
        if (!userInfo) {
            // 返回默认的匿名 ID，而不是抛出异常
            email = 'anonymous';
        } else {
            email = userInfo.email;
        }
    }

    const salt = await generateRandomSalt();  // 使用随机盐值
    const key = await generateSecureHash(email, salt);
    const prefixedKey = prefix`openudid-${key}`;

    let openUdid: string = getLocalStorage(prefixedKey, '');
    if (!openUdid) {
        const newSalt = await generateRandomSalt();//为OpenUdid生成盐值
        openUdid = await generateSecureHash(email + Date.now() + Math.random(), newSalt); // 使用 SHA-256
         //限制长度为64
        openUdid = openUdid.slice(0, 64);
        setLocalStorage(prefixedKey, openUdid);
    }
    return openUdid;
}

/**
 * 根据电子邮件生成基于 SHA-256 和盐值的键。
 */
async function generateKeyByEmail(email: string) {
    const salt = await generateRandomSalt(); // 使用随机盐值
    return generateSecureHash(email, salt);  // 使用安全的哈希函数
}

const emailKeyMap: Record<string, string> = {}
/**
 * 根据邮箱地址获取本地服务 Domain，不需要每次都重新请求
 */
export async function getDomainInfoByEmail(email: string): Promise<string> {
    const key = [PREFIX, 'domain-', await generateKeyByEmail(email)].join('')
    emailKeyMap[email] = key
    return getLocalStorage(key) as string
}

export async function setDomainInfo(email: string, domain: string): Promise<void> {
    const key = emailKeyMap[email] || (await generateKeyByEmail(email
