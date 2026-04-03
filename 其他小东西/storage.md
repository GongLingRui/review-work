import store2, { type Reviver, type Replacer, type StoredData, type StoreBase } from 'store2'

import type { UserInfo } from 'src/services'
import { isInNativeApp, getNativeInfo } from './jsbridge'
import { count } from 'console'
import { AESDecode, AESEncode } from './utils'
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


const getOpenUdidKey = async (email: string) => {
  const md5 = await import('js-md5').then((md5) => md5.default)
  const salt = 'renton'
  // 不要直接在浏览器中存储用户的邮箱地址
  return prefix`openudid-${md5(`${salt}:${email}`)}`
}

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

/**
* 取local数据
*/
export function getLocalStorage<T extends unknown>(key: string, alt?: unknown | Reviver, option?: { isSecret?: boolean }): T {
  let res = store2.get(key, alt)
  if (option?.isSecret && res) {
    try {
      res = JSON.parse(localDecrypt(res, STORAGE_SECRET_KEY))
    } catch (e) {
      ConsoleUtil.error('======getLocalStorage==e', e)
    }
  } else if (res) {
    try {
      res = JSON.parse(res);
    } catch (e) {
      ConsoleUtil.error('======getLocalStorage==e', e);
    }
  }
  return res
}

/**
* 存session数据
*/
export function setLocalStorage(key: string, data: string, option?: { isSecret?: boolean, isLocalApi?: boolean }): unknown {
  var value = data;
  if (option?.isSecret) {
    value = localEncrypt(JSON.stringify(data), STORAGE_SECRET_KEY);
  }
  if (option?.isLocalApi) {
    return localStorage.setItem(key, JSON.stringify(value))
  } else {
    // return store2.local.set(key, value)
    return localStorage.setItem(key, JSON.stringify(value))
  }
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

export function setALPCDomain(domain: string): void {
  removeLocalStorage(ALPC_DOMAIN)
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

async function generateKeyByEmail(email: string) {
  const u8a = new TextEncoder().encode(email) // encode as (utf-8) Uint8Array
  const hashBuf = await crypto?.subtle?.digest('SHA-256', u8a) // hash the message
  const hashArr = Array.from(new Uint8Array(hashBuf)) // convert buffer to byte array
  return hashArr.map(b => b.toString(16).padStart(2, '0')).join('') // convert bytes to hex string
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
  const key = emailKeyMap[email] || (await generateKeyByEmail(email))
  if (domain) {
    setLocalStorage(key, domain)
  }
}

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
        return storage[domain].src
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
