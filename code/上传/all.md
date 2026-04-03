好的，下面是对你之前提供的所有代码的业务逻辑和功能的梳理，并给出相应的伪代码。

### 业务逻辑和功能梳理

#### 1. 业务逻辑概述
`upload` 模块的主要功能是处理不同类型的文件（如 SVG、PSD、AI、PDF、JPEG、PNG 等）的上传和压缩，并将其上传到服务器。根据文件类型，模块会执行不同的处理逻辑，包括文件读取、格式转换、图像压缩和上传等操作。此外，还包括缓存管理、事件处理、文件选择和上传进度管理等功能。

#### 2. 功能列表
- **文件读取**：使用 `FileReader` 读取文件内容。
- **格式转换**：根据文件类型，执行相应的格式转换操作。
  - **SVG**：转换为 Base64 编码。
  - **PSD**：解析为 PNG 图像。
  - **AI/PDF**：解析为 `canvas` 图像。
  - **JPEG/PNG/WebP**：直接处理。
- **图像压缩**：使用 `canvas` 或 `compressorjs` 库进行图像压缩。
- **文件上传**：将处理后的文件上传到服务器。
- **事件触发**：上传成功后，触发相应的事件更新。
- **缓存管理**：管理上传文件的缓存。
- **文件选择**：选择文件进行上传。
- **上传进度管理**：管理文件上传的进度。

### 伪代码

```pseudo
// 主函数：处理不同类型的文件上传
function uploadImageForCavas(ops: CavasUpdateOps) {
  switch (ops.fileExtension) {
    case 'svg':
      handleSVGFile(ops);
      break;
    case 'psd':
      handlePSDFile(ops);
      break;
    case 'ai':
    case 'pdf':
      handleAIOrPDFFile(ops);
      break;
    case 'jpeg':
    case 'jpg':
    case 'png':
    case 'webp':
      handleImageFile(ops);
      break;
    default:
      console.error('Unsupported file type');
  }
}

// 处理 SVG 文件
function handleSVGFile(ops: CavasUpdateOps) {
  fileToBase64(ops.fileItem).then((fileRet) => {
    ops.updateStart();
    upload2dEditFile(ops.fileItem, ops.uploadFileType).then((resp) => {
      createUserMaterial({ file_name: resp.key_prefix }).then((ret) => {
        if (ret?.data) {
          if (!ops?.isApps) {
            ops.event?.emitEvent(EventNameCons.EventUpdateMaterial, ret.data);
            ops.canvasEditor?.addSvgFile(fileRet);
          }
          ops.updateEnd(true, 0);
        } else {
          ops.updateEnd(false, -1);
        }
      });
    }).catch((error) => {
      console.error(error);
      ops.updateEnd(false, -1, error);
    });
  });
}

// 处理 PSD 文件
function handlePSDFile(ops: CavasUpdateOps) {
  ops.updateStart();
  const reader = new FileReader();
  reader.onload = () => {
    const dataUrl = reader.result;
    const psd = PSD.fromURL(dataUrl);
    psd.parse();
    const img = psd.image.toPng();
    const newFile = base64ToFile(img.src, ops.fileItem.name + ".webp");
    getImgCompressAndUpload(newFile, ops);
  };
  reader.readAsDataURL(ops.fileItem);
}

// 处理 AI 或 PDF 文件
function handleAIOrPDFFile(ops: CavasUpdateOps) {
  ops.updateStart();
  const reader = new FileReader();
  reader.onload = (e) => {
    const pdfjs = import('pdfjs-dist');
    pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;
    const arrayBuffer = reader.result;
    const loadingTask = pdfjs.getDocument(arrayBuffer);
    loadingTask.promise.then((pdf) => {
      const numPages = 1;
      const canvases = [];
      let totalHeight = 0;
      let maxWidth = 0;
      for (let i = 1; i <= numPages; i++) {
        pdf.getPage(i).then((page) => {
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          const renderContext = { canvasContext: context, viewport: viewport };
          page.render(renderContext).promise.then(() => {
            canvases.push(canvas);
            totalHeight += canvas.height;
            maxWidth = Math.max(maxWidth, canvas.width);
            if (i === numPages) {
              combineCanvasesAndUpload(canvases, totalHeight, maxWidth, ops);
            }
          });
        });
      }
    });
  };
  reader.readAsArrayBuffer(ops.fileItem);
}

// 处理 JPEG、PNG、WebP 文件
function handleImageFile(ops: CavasUpdateOps) {
  ops.updateStart();
  getImgCompress(ops.fileItem, 1000, 0, 1).then((blob) => {
    const file = new File([blob], ops.fileItem.name, { type: blob.type, lastModified: Date.now() });
    upload2dEditFile(file, ops.uploadFileType, ops.projectId, ops.canvas_id).then((resp) => {
      if (resp && resp.key_prefix) {
        if (ops.uploadFileType === GetUpTokenFileTypeEnum.Edit2dLocal) {
          createUserMaterial({ file_name: resp.key_prefix }).then((ret) => {
            if (ret?.data) {
              ops.event?.emitEvent(EventNameCons.EventUpdateMaterial, ret.data);
            }
          });
        }
        fileToBase64(file).then((fileRet) => {
          if (!ops?.isApps) {
            ops.canvasEditor?.addImage(fileRet, {
              importSource: ops.uploadFileType,
              fileType: ops.fileExtension,
              key_prefix: resp.key_prefix
            });
          }
          ops.updateEnd(true, 0);
        });
      } else {
        ops.updateEnd(false, -1);
      }
    }).catch((error) => {
      console.error(error);
      ops.updateEnd(false, -1, error);
    });
  });
}

// 压缩并上传图像
function getImgCompressAndUpload(newFile: File, ops: CavasUpdateOps) {
  compressorImage1(newFile, 2000, 0, 1).then((blob) => {
    const file = new File([blob], ops.fileItem.name + ".webp", { type: blob.type, lastModified: Date.now() });
    upload2dEditFile(file, ops.uploadFileType, ops.projectId, ops.canvas_id).then((resp) => {
      if (resp && resp.key_prefix) {
        if (ops.uploadFileType === GetUpTokenFileTypeEnum.Edit2dLocal) {
          createUserMaterial({ file_name: resp.key_prefix }).then((ret) => {
            if (ret?.data) {
              ops.event?.emitEvent(EventNameCons.EventUpdateMaterial, ret.data);
            }
          });
        }
        fileToBase64(file).then((fileRet) => {
          if (!ops?.isApps) {
            ops.canvasEditor?.addImage(fileRet, {
              importSource: ops.uploadFileType,
              fileType: ops.fileExtension,
              key_prefix: resp.key_prefix
            });
          }
          ops.updateEnd(true, 0);
        });
      } else {
        ops.updateEnd(false, -1);
      }
    }).catch((error) => {
      console.error(error);
      ops.updateEnd(false, -1, error);
    });
  });
}

// 合并多个 canvas 并上传
function combineCanvasesAndUpload(canvases, totalHeight, maxWidth, ops) {
  const combinedCanvas = document.createElement('canvas');
  combinedCanvas.width = maxWidth;
  combinedCanvas.height = totalHeight;
  const combinedContext = combinedCanvas.getContext('2d');
  let yOffset = 0;
  for (const canvas of canvases) {
    combinedContext.drawImage(canvas, 0, yOffset);
    yOffset += canvas.height;
  }
  const combinedImage = combinedCanvas.toDataURL();
  const newFile = base64ToFile(combinedImage, ops.fileItem.name + ".webp");
  getImgCompressAndUpload(newFile, ops);
}

// 文件转换为 Base64 编码
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('FileReader error'));
    reader.readAsDataURL(file);
  });
}

// Base64 编码转换为文件
function base64ToFile(dataURI: string, fileName: string): File {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new File([ab], fileName, { type: mimeString });
}

// 图像压缩函数
function getImgCompress(file: File, maxWidth: number, maxHeight: number, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (!/\/(?:jpeg|jpg|png|webp)/i.test(file.type)) {
      return reject(new Error('Unsupported image type'));
    }
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const reader = new FileReader();
    reader.onload = function () {
      const img = new Image();
      img.src = this.result as string;
      img.onload = function () {
        let width = img.width;
        let height = img.height;
        let scale = Math.min(maxWidth / width, maxHeight / height);
        if (scale < 1) {
          width *= scale;
          height *= scale;
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        let dataURI;
        let blobObj;
        let maxSize = 10 * 1024 * 1024;
        do {
          dataURI = canvas.toDataURL('image/webp', quality);
          blobObj = dataURItoBlob(dataURI);
          quality -= 0.1;
        } while (blobObj.size > maxSize && quality > 0.1);
        resolve(blobObj);
      };
      img.onerror = () => reject(new Error('Image loading failed'));
    };
    reader.onerror = () => reject(new Error('FileReader failed'));
    reader.readAsDataURL(file);
  });
}

// Data URL 转换为 Blob
function dataURItoBlob(dataURI: string): Blob {
  const byteString = atob(dataURI.split(',')[1]);
  const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeString });
}

// 使用 compressorjs 库进行图像压缩
function compressorImage1(file: File, maxWidth: number, maxHeight: number, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    new Compressor(file, {
      quality: quality,
      maxWidth: maxWidth,
      maxHeight: maxHeight,
      mimeType: 'image/webp',
      success(result) {
        resolve(result);
      },
      error(err) {
        reject(err.message);
      },
    });
  });
}

// 上传文件到服务器
function upload2dEditFile(file: File, uploadFileType: GetUpTokenFileTypeEnum, projectId?: string, canvas_id?: string): Promise<UploadResultData> {
  return getUpToken2dEdit({ file_name: file.name, file_type: uploadFileType, project_id: projectId, canvas_id: canvas_id, content_type: file.type })
    .then(resp => {
      if (resp?.data?.up_token) {
        return upload(resp.data.up_token, file).then(() => {
          return { up_token: resp.data.up_token, key_prefix: resp.data.key_prefix };
        });
      } else {
        return Promise.reject('No up_token received');
      }
    })
    .catch(error => {
      console.error(error);
      return Promise.reject('No up_token received');
    });
}

// 创建用户素材
function createUserMaterial(data: { file_name: string }): Promise<any> {
  // 模拟创建用户素材的 API 调用
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ data: { id: 1, file_name: data.file_name } });
    }, 1000);
  });
}

// 上传文件
function upload(url: string, file: File): Promise<XMLHttpRequest> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        resolve(xhr);
      } else {
        reject({ type: 'error' });
      }
    });
    xhr.addEventListener('error', () => {
      reject({ type: 'network_error', status: xhr.status, url: url, file: file.name });
    });
    xhr.addEventListener('abort', () => {
      console.error('upload abort');
      reject({ type: 'abort' });
    });
    xhr.open('PUT', url, true);
    xhr.send(file);
  });
}

// 缓存管理类
class DataCache {
  private static instance: DataCache | null = null;
  private data: Record<string, any>;
  private event: CanvasEventEmitter | null = null;

  private constructor() {
    this.data = {};
  }

  public static getInstance(): DataCache {
    if (!DataCache.instance) {
      DataCache.instance = new DataCache();
    }
    return DataCache.instance;
  }

  public updateMaterialtEmitter(event: CanvasEventEmitter) {
    this.event = event;
    this.event?.on(EventNameCons.EventUpdateMaterial, this.updateMaterial);
  }

  public updateProjectCreateEmitter(event: CanvasEventEmitter) {
    this.event = event;
    this.event?.on(EventNameCons.EventUpdateDetailCreate, this.updateProjectCreate);
  }

  public removeUpdateMaterialtEmitter() {
    this.event?.off(EventNameCons.EventUpdateMaterial, this.updateMaterial);
  }

  public removeUpdateProjectCreateEmitter() {
    this.event?.off(EventNameCons.EventUpdateDetailCreate, this.updateProjectCreate);
  }

  private updateMaterial(params: any) {
    const origindata = DataCache.getInstance().cachePageData?.('upload') || [];
    const cachePageSize = DataCache.getInstance().cachePageSize('upload') || 1;
    const cacheHasMore = DataCache.getInstance().cacheHasMore('upload') || false;
    DataCache.getInstance().setCacheItem('upload', { 'pageData': [params, ...origindata], 'pageSize': cachePageSize, 'hasMore': cacheHasMore })
  }

  public updateProjectCreate(data: ProjectModel) {
    const cacheData = DataCache.getInstance().cachePageData?.('project') || [];
    const cachePageSize = DataCache.getInstance().cachePageSize('project') || 1;
    const cacheHasMore = DataCache.getInstance().cacheHasMore('project') || false;
    DataCache.getInstance().setCacheItem('project', { 'pageData': [data?.project_info, ...cacheData], "pageSize": cachePageSize, 'hasMore': cacheHasMore })
  }

  public setCacheItem(key: string, value: any): void {
    this.data[key] = value;
  }

  public getCacheItem(key: string): any {
    return this.data[key];
  }

  public removeItem(key: string): void {
    delete this.data[key];
  }

  public cachePageData(key: string): any {
    return this.data?.[key]?.['pageData'];
  }

  public cachePageSize(key: string): any {
    return this.data[key]?.['pageSize'];
  }

  public cacheHasMore(key: string): any {
    return this.data[key]?.['hasMore'];
  }

  public clear(): void {
    this.data = {};
  }
}

// 自定义 Hook：管理上传进度和状态
function useUpload(initState: UseUploadParams): UseUploadResult {
  if (typeof XMLHttpRequest !== "undefined") {
    const { onProcess, onDone, onAbort, onError } = initState;
    const xhrRef = useRef(new XMLHttpRequest());

    const action = (url: string, file: File): Promise<XMLHttpRequest> => {
      return new Promise((resolve, reject) => {
        xhrRef.current.upload.addEventListener('progress', event => {
          if (event.lengthComputable) {
            onProcess?.(event.loaded, event.total);
          }
        });

        xhrRef.current.addEventListener('load', () => {
          if (xhrRef.current.status === 200) {
            resolve(xhrRef.current);
          } else {
            onError?.('upload error');
            reject({ type: 'error' });
          }
        });
        xhrRef.current.addEventListener('error', () => {
          onError?.('upload error');
          reject({ type: 'error' });
        });
        xhrRef.current.addEventListener('abort', () => {
          console.error('upload abort');
          onAbort?.('abort');
          reject({ type: 'abort' });
        });

        xhrRef.current.open('PUT', url, true);
        xhrRef.current.send(file);
      });
    }
    return [action, xhrRef.current];
  }
  return [] as unknown as UseUploadResult;
}

// 文件选择和上传
function selectFiles(options: { accept: string, multiple: boolean }): Promise<FileList> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = options.accept;
    input.multiple = options.multiple;
    input.onchange = () => {
      resolve(input.files);
    };
    input.click();
  });
}

// 检查文件大小
function checkFileSize(file: File): boolean {
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    console.error('File size exceeds the
