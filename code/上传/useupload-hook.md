这段代码定义了一些函数和类型，用于处理文件上传操作。我们将逐步分析每个函数的作用和实现细节。

### 1. `UseUploadParams` 接口和 `UseUploadResult` 类型

#### 作用

- `UseUploadParams` 接口定义了文件上传过程中的回调函数。
- `UseUploadResult` 类型定义了文件上传函数的返回值，包括上传函数和 `XMLHttpRequest` 对象。

#### 代码

```javascript
export interface UseUploadParams {
  onProcess?: (loaded: number, total: number) => void; // 上传进度回调
  onDone?: () => void; // 上传完成回调
  onAbort?: (error: any) => void; // 请求取消回调
  onError?: (error: any) => void; // 上传错误回调
}

export type UseUploadResult = [
  (url: string, file: File) => Promise<XMLHttpRequest>, // 上传函数
  XMLHttpRequest // XHR对象
];

export type UploadResultData = {
  up_token: string;
  key_prefix: string;
};
```

### 2. `useUpload` 自定义 Hook

#### 作用

`useUpload` 自定义 Hook 提供了一个文件上传函数和 `XMLHttpRequest` 对象，用于中断上传请求。

#### 代码

```javascript
export default function (initState: UseUploadParams): UseUploadResult {
  if (typeof XMLHttpRequest !== "undefined") { // 修复 gatsby ssr 构建报错问题
    const { onProcess, onDone, onAbort, onError } = initState;
    const xhrRef = useRef(new XMLHttpRequest());

    const action = (url: string, file: File): Promise<XMLHttpRequest> => {
      return new Promise((resolve, reject) => {
        xhrRef.current.upload.addEventListener('progress', event => {
          if (event.lengthComputable) {
            onProcess?.(event.loaded, event.total);
          }
        });

        // 监听上传完成事件
        xhrRef.current.addEventListener('load', () => {
          if (xhrRef.current.status === 200) {
            resolve(xhrRef.current);
          } else {
            onError?.('upload error');
            reject({
              type: 'error'
            });
          }
        });
        xhrRef.current.addEventListener('error', () => {
          onError?.('upload error');
          reject({
            type: 'error'
          });
        });
        xhrRef.current.addEventListener('abort', () => {
          ConsoleUtil.error('upload abort');
          onAbort?.('abort');
          reject({
            type: 'abort'
          });
        });

        // 开始上传
        xhrRef.current.open('PUT', url, true);
        xhrRef.current.send(file);
      });
    };
    return [action, xhrRef.current];
  }
  return [] as unknown as UseUploadResult;
}
```

#### 详细解释

1. **检查 `XMLHttpRequest` 是否可用**

```javascript
if (typeof XMLHttpRequest !== "undefined") {
```

- 检查 `XMLHttpRequest` 是否在当前环境中可用，避免在服务器端渲染时出现错误。

2. **解构回调函数**

```javascript
const { onProcess, onDone, onAbort, onError } = initState;
```

- 从 `initState` 中解构出回调函数。

3. **创建 `XMLHttpRequest` 对象**

```javascript
const xhrRef = useRef(new XMLHttpRequest());
```

- 使用 `useRef` 创建一个 `XMLHttpRequest` 对象的引用。

4. **定义上传函数**

```javascript
const action = (url: string, file: File): Promise<XMLHttpRequest> => {
  return new Promise((resolve, reject) => {
    xhrRef.current.upload.addEventListener('progress', event => {
      if (event.lengthComputable) {
        onProcess?.(event.loaded, event.total);
      }
    });

    // 监听上传完成事件
    xhrRef.current.addEventListener('load', () => {
      if (xhrRef.current.status === 200) {
        resolve(xhrRef.current);
      } else {
        onError?.('upload error');
        reject({
          type: 'error'
        });
      }
    });
    xhrRef.current.addEventListener('error', () => {
      onError?.('upload error');
      reject({
        type: 'error'
      });
    });
    xhrRef.current.addEventListener('abort', () => {
      ConsoleUtil.error('upload abort');
      onAbort?.('abort');
      reject({
        type: 'abort'
      });
    });

    // 开始上传
    xhrRef.current.open('PUT', url, true);
    xhrRef.current.send(file);
  });
};
```

- 定义上传函数 `action`，接收上传地址 `url` 和待上传文件 `file`。
- 返回一个 `Promise`，在上传完成、出错或取消时解析或拒绝。
- 监听上传进度、完成、错误和取消事件，并调用相应的回调函数。

5. **返回上传函数和 `XMLHttpRequest` 对象**

```javascript
return [action, xhrRef.current];
```

- 返回上传函数 `action` 和 `XMLHttpRequest` 对象 `xhrRef.current`。

### 3. `upload` 函数

#### 作用

`upload` 函数用于上传文件，返回一个 `Promise`，在上传完成、出错或取消时解析或拒绝。

#### 代码

```javascript
export const upload = (url: string, file: File): Promise<XMLHttpRequest> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // 监听上传完成事件
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        resolve(xhr);
      } else {
        reject({
          type: 'error'
        });
      }
    });
    xhr.addEventListener('error', () => {
      reject({
        type: 'network_error',
        status: xhr.status,
        url: url,
        file: file.name,
      });
    });
    xhr.addEventListener('abort', () => {
      ConsoleUtil.error('upload abort');
      reject({
        type: 'abort'
      });
    });

    // 开始上传
    xhr.open('PUT', url, true);
    xhr.send(file);
  });
}
```

#### 详细解释

1. **创建 `XMLHttpRequest` 对象**

```javascript
const xhr = new XMLHttpRequest();
```

- 创建一个新的 `XMLHttpRequest` 对象。

2. **监听上传完成事件**

```javascript
xhr.addEventListener('load', () => {
  if (xhr.status === 200) {
    resolve(xhr);
  } else {
    reject({
      type: 'error'
    });
  }
});
```

- 监听上传完成事件，如果状态码为 200，解析 `Promise`，否则拒绝 `Promise`。

3. **监听上传错误事件**

```javascript
xhr.addEventListener('error', () => {
  reject({
    type: 'network_error',
    status: xhr.status,
    url: url,
    file: file.name,
  });
});
```

- 监听上传错误事件，拒绝 `Promise`，并传递错误信息。

4. **监听上传取消事件**

```javascript
xhr.addEventListener('abort', () => {
  ConsoleUtil.error('upload abort');
  reject({
    type: 'abort'
  });
});
```

- 监听上传取消事件，拒绝 `Promise`，并传递取消信息。

5. **开始上传**

```javascript
xhr.open('PUT', url, true);
xhr.send(file);
```

- 打开上传连接，并发送文件。

### 4. `uploadFile` 函数

#### 作用

`uploadFile` 函数用于获取上传令牌并上传文件，返回上传结果数据。

#### 代码

```javascript
export const uploadFile = async (file: File, uploadFileType: GetUpTokenFileTypeEnum) => {
  let resp;
  try {
    resp = await getUpToken({ file_name: file.name, file_type: uploadFileType, content_type: file?.type });
  } catch (error) {
    ConsoleUtil.error(error);
  }
  try {
    if (resp?.data?.up_token) {
      await upload?.(resp?.data?.up_token, file);
      return {
        up_token: resp?.data?.up_token,
        key_prefix: resp?.data?.key_prefix,
      };
    } else {
      return null;
    }
  } catch (error) {
    ConsoleUtil.error(error);
    return null;
  }
}
```

#### 详细解释

1. **获取上传令牌**

```javascript
let resp;
try {
  resp = await getUpToken({ file_name: file.name, file_type: uploadFileType, content_type: file?.type });
} catch (error) {
  ConsoleUtil.error(error);
}
```

- 调用 `getUpToken` 函数获取上传令牌，并捕获错误。

2. **上传文件**

```javascript
try {
  if (resp?.data?.up_token) {
    await upload?.(resp?.data?.up_token, file);
    return {
      up_token: resp?.data?.up_token,
      key_prefix: resp?.data?.key_prefix,
    };
  } else {
    return null;
  }
} catch (error) {
  ConsoleUtil.error(error);
  return null;
}
```

- 如果获取到上传令牌，调用 `upload` 函数上传文件，并返回上传结果数据。
- 如果未获取到上传令牌或上传失败，返回 `null`。

### 5. `upload2dEditFile` 函数

#### 作用

`upload2dEditFile` 函数用于获取上传令牌并上传文件，返回上传结果数据。

#### 代码

```javascript
export const upload2dEditFile = (file: File, uploadFileType: GetUpTokenFileTypeEnum, projectId?: string, canvas_id?: string): Promise<UploadResultData> => {
  return getUpToken2dEdit({ file_name: file.name, file_type: uploadFileType, project_id: projectId, canvas_id: canvas_id, content_type: file?.type })
    .then(resp => {
      if (resp?.data?.up_token) {
        return upload(resp.data.up_token, file).then(() => {
          return {
            up_token: resp.data.up_token,
            key_prefix: resp.data.key_prefix,
          };
        });
      } else {
        return Promise.reject('No up_token received');
      }
    })
    .catch(error => {
      ConsoleUtil.error(error);
      return Promise.reject('No up_token received');
    });
};
```

#### 详细解释

1. **获取上传令牌**

```javascript
return getUpToken2dEdit({ file_name: file.name, file_type: uploadFileType, project_id: projectId, canvas_id: canvas_id, content_type: file?.type })
  .then(resp => {
    if (resp?.data?.up_token) {
      return upload(resp.data.up_token, file).then(() => {
        return {
          up_token: resp.data.up_token,
          key_prefix: resp.data.key_prefix,
        };
      });
    } else {
      return Promise.reject('No up_token received');
    }
  })
  .catch(error => {
    ConsoleUtil.error(error);
    return Promise.reject('No up_token received');
  });
```

- 调用 `getUpToken2dEdit` 函数获取上传令牌，并捕获错误。
- 如果获取到上传令牌，调用 `upload` 函数上传文件，并返回上传结果数据。
- 如果未获取到上传令牌或上传失败，返回一个拒绝的 `Promise`。

### 总结

这段代码定义了一些函数和类型，用于处理文件上传操作：

1. **`UseUploadParams` 接口和 `UseUploadResult` 类型**：定义了文件上传过程中的回调函数和上传函数的返回值。
2. **`useUpload` 自定义 Hook**：提供了一个文件上传函数和 `XMLHttpRequest` 对象，用于中断上传请求。
3. **`upload` 函数**：用于上传文件，返回一个 `Promise`，在上传完成、出错或取消时解析或拒绝。
4. **`uploadFile` 函数**：用于获取上传令牌并上传文件，返回上传结果数据。
5. **`upload2dEditFile` 函数**：用于获取上传令牌并上传文件，返回上传结果数据。

通过这些函数，可以高效地处理文件上传操作，支持上传进度、完成、取消和错误的回调处理，为用户提供流畅的上传体验。
