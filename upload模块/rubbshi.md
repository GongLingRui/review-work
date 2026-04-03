# 答非所问
### **假设我是前端面试官，针对该模块的代码可能提出的技术难点问题及参考答案**

---

#### **问题 1：如何处理大文件（如 PSD/AI/PDF）的前端解析和上传？遇到内存泄漏如何排查？**
**考察点**：大文件处理能力、内存管理意识  
**参考答案**：
```typescript
// 关键实现步骤
1. **流式解析**：使用 `File.slice` 分片读取文件，避免一次性加载
   const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB分片
   for (let i=0; i<file.size; i+=CHUNK_SIZE) {
     const chunk = file.slice(i, i+CHUNK_SIZE);
     await processChunk(chunk);
   }

2. **Web Worker 隔离**：将解析逻辑放入 Worker 防止主线程阻塞
   // parser.worker.js
   self.onmessage = async (e) => {
     const pdf = await pdfjs.getDocument(e.data).promise;
     // ...处理逻辑
     self.postMessage(result);
   };

3. **内存回收**：手动释放 Canvas 内存
   function releaseCanvas(canvas) {
     canvas.width = 0;
     canvas.height = 0;
     canvas = null;
   }

// 内存泄漏排查方法
- Chrome DevTools Performance 录制分析内存变化曲线
- Memory 面板生成堆快照，对比未释放的 Detached Canvas 对象
- 使用 `performance.memory` API 监控 JS 堆大小
```

---

#### **问题 2：SVG 文件直接渲染可能存在 XSS 漏洞，如何防范？**
**考察点**：安全防护意识  
**参考答案**：
```typescript
// 防御方案
1. **内容消毒（Sanitize）**：
   const sanitizeSVG = (svgStr) => {
     // 移除脚本、外部资源、事件处理器
     return svgStr
       .replace(/<script.*?>.*?<\/script>/gi, '')
       .replace(/ xlink:href=/g, ' data-href=')
       .replace(/ on\w+="[^"]*"/g, '');
   };

2. **沙箱隔离**：使用 `<iframe sandbox>` 渲染 SVG
   const iframe = document.createElement('iframe');
   iframe.sandbox = 'allow-same-origin';
   iframe.srcdoc = sanitizedSVG;

3. **CSP 加固**：设置 Content-Security-Policy 头
   Content-Security-Policy: default-src 'self'; 
     img-src data:; 
     style-src 'unsafe-inline' // 允许内联样式但禁止外部
```

---

#### **问题 3：分页加载如何保证缓存数据与服务器一致性？**
**考察点**：状态同步机制设计  
**参考答案**：
```typescript
// 同步策略
1. **版本号控制**：
   interface CachedData {
     data: Material[];
     version: string; // 服务端返回的 ETag 或更新时间戳
   }

2. **混合更新策略**：
   const loadData = async () => {
     const localData = getCache('upload');
     const serverData = await fetch(`/materials?since=${localData.version}`);
     
     // 增量合并
     const newData = mergeData(localData, serverData);
     setCache('upload', newData);
   };

3. **事件驱动更新**：
   // 订阅上传/删除事件
   eventBus.on('material-updated', (event) => {
     const cache = getCache('upload');
     cache.data = applyChange(cache.data, event);
     setCache('upload', cache);
   });

// 合并算法示例
const mergeData = (local, remote) => {
  const localMap = new Map(local.data.map(item => [item.id, item]));
  remote.data.forEach(item => {
    if (!localMap.has(item.id) || item.version > localMap.get(item.id).version) {
      localMap.set(item.id, item);
    }
  });
  return Array.from(localMap.values());
};
```

---

#### **问题 4：多选删除如何优化批量请求性能？**
**考察点**：性能优化能力  
**参考答案**：
```typescript
// 优化方案
1. **批量接口设计**：
   // 服务端提供批量删除接口
   DELETE /materials?ids=1,2,3

2. **分批次处理**：
   const BATCH_SIZE = 100; // 单次最大删除数
   const deleteBatch = async (ids) => {
     for (let i=0; i<ids.length; i+=BATCH_SIZE) {
       await api.deleteMaterials(ids.slice(i, i+BATCH_SIZE));
     }
   };

3. **乐观更新策略**：
   // 先更新 UI 再发送请求
   setDataList(prev => prev.filter(item => !selected.has(item.id)));
   try {
     await deleteBatch(selectedIds);
   } catch (err) {
     // 回滚数据
     setDataList(prev => [...prev, ...rolledbackItems]);
   }

4. **IndexedDB 暂存**：
   // 网络失败时暂存操作
   const tx = db.transaction('pendingDeletes', 'readwrite');
   await tx.store.add({ ids: selectedIds, timestamp: Date.now() });
```

---

#### **问题 5：如何处理 PDF 多页合并渲染的性能问题？**
**考察点**：复杂场景优化能力  
**参考答案**：
```typescript
// 性能优化方案
1. **虚拟滚动渲染**：
   let renderedPages = 0;
   const renderPage = async (pageNum) => {
     if (pageNum > VISIBLE_PAGES) return; // 仅渲染可视区域
     const page = await pdf.getPage(pageNum);
     // ...渲染逻辑
   };

2. **Canvas 复用池**：
   class CanvasPool {
     static pool = [];
     static get() {
       return this.pool.pop() || document.createElement('canvas');
     }
     static release(canvas) {
       canvas.width = 0;
       this.pool.push(canvas);
     }
   }

3. **离屏渲染 + Web Worker**：
   // worker.js
   self.onmessage = async (e) => {
     const pdf = await pdfjs.getDocument(e.data).promise;
     const page = await pdf.getPage(1);
     const viewport = page.getViewport({ scale: 1 });
     const canvas = new OffscreenCanvas(viewport.width, viewport.height);
     // ...渲染到离屏 Canvas
     self.postMessage(canvas.transferToImageBitmap());
   };

4. **分页懒加载**：
   const observer = new IntersectionObserver(entries => {
     entries.forEach(entry => {
       if (entry.isIntersecting) {
         renderPage(entry.target.dataset.page);
       }
     });
   });
```

---

### **面试官追问方向建议**
1. **扩展性**：  
   “如果现在要支持视频文件上传，你会如何扩展当前架构？”

2. **异常处理**：  
   “上传过程中断网，如何实现断点续传？”

3. **安全深化**：  
   “如何防止用户上传伪造扩展名的恶意文件（如把 .exe 改为 .jpg）？”

4. **性能指标**：  
   “假设用户同时上传 100 个文件，如何控制并发避免浏览器崩溃？”

5. **架构设计**：  
   “如果将整个上传模块抽象为独立 SDK，你会如何设计 API 接口？”

---

通过这些问题，可以全面考察候选人对以下能力的掌握：
- **复杂场景处理**（大文件、多格式）
- **性能优化意识**（内存、渲染、网络）
- **安全防护思维**（XSS、文件校验）
- **架构设计能力**（状态管理、模块化）
- **工程化思维**（错误处理、日志监控）
