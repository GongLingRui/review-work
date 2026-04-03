

---

### **Q1：如何处理Three.js中的内存泄漏？**
**面试官意图**：考察资源管理意识和实际经验  
**代码现状**：  
```typescript
removeScene() {
  // 显式dispose几何体/材质/纹理
  object.geometry.dispose()
  texture.dispose()
  renderer.dispose()
}
```
**答**：  
"当前代码在removeScene方法中进行了较好的资源释放，但仍有优化空间：  
1. **WeakMap缓存**：建议使用WeakMap替代数组存储纹理，防止内存驻留  
2. **事件监听清理**：OrbitControls需要调用dispose()方法  
3. **渲染循环停止**：应清除setAnimationLoop  
优化方案：  
```typescript
removeScene() {
  this.renderer?.setAnimationLoop(null) // 停止渲染循环
  this.cameraControls?.dispose() // 清理控制器
  
  // 使用递归清理子对象
  this.scene?.traverse(obj => {
    if (obj instanceof THREE.Mesh) {
      obj.geometry.dispose()
      if(Array.isArray(obj.material)){
        obj.material.forEach(m => this.disposeMaterial(m))
      }else{
        this.disposeMaterial(obj.material)
      }
    }
  })
}

private disposeMaterial(mat: THREE.Material) {
  Object.keys(mat).forEach(prop => {
    if (mat[prop] instanceof THREE.Texture) {
      mat[prop].dispose()
    }
  })
  mat.dispose()
}
```"

---

### **Q2：为什么使用CylinderGeometry和TorusGeometry？**
**面试官意图**：考察三维建模基础能力  
**代码现状**：  
```typescript
createCylinder(upperRadius, lowerRadius, height)
createTorus(torusRadius, sectionRadius)
```
**答**：  
"选择这些几何体是基于旋转体（如杯子）的形态特征：  
1. **CylinderGeometry**：  
   - 上下半径不同的圆柱体正好对应杯口和杯底的直径差异  
   - `height`参数精确控制杯身高度  
   - 通过设置`radialSegments`(当前为60)平衡性能与曲面质量  

2. **TorusGeometry**：  
   - 圆环几何体完美呈现杯口/杯底的环形结构  
   - `torusRadius`控制环直径，`tubeRadius`控制环粗细  
   - 旋转-90度后水平放置，符合现实中的杯口形态  

3. **组合优势**：  
   - 参数化建模方便尺寸调整  
   - 内置UV映射简化纹理贴图  
   - 相比自定义BufferGeometry开发效率更高"

---

### **Q3：如何处理高分辨率纹理的内存问题？**
**面试官意图**：考察性能优化意识  
**代码现状**：  
```typescript
textureLoader.load(data.colorBase64)
```
**答**：  
"当前直接加载原始纹理，建议采用分级策略：  
1. **Mipmapping**：  
```typescript
texture.generateMipmaps = true
texture.minFilter = THREE.LinearMipmapLinearFilter
```  
2. **压缩纹理**：  
   - 使用Basis Universal或KTX2格式  
   - 通过`BasisTextureLoader`加载  
3. **分辨率适配**：  
```typescript
const maxTextureSize = renderer.capabilities.maxTextureSize
const scale = Math.min(1, maxTextureSize / image.width)
```  
4. **LRU缓存**：  
```typescript
const textureCache = new LRU({max: 100}) // 最近最少使用缓存
```"

---

### **Q4：如何实现平滑的几何体变形？**
**面试官意图**：考察动画实现能力  
**代码现状**：  
```typescript
mesh.geometry = getTextureGeometry(...) // 直接替换
```
**答**：  
"当前方案会导致突变，建议：  
1. **顶点插值动画**：  
```typescript
const morphAttributes = {
  position: [originalVertices, targetVertices]
}
geometry.morphAttributes.position = morphAttributes
mesh.morphTargetInfluences = [0] 
// 在动画循环中渐变
mesh.morphTargetInfluences[0] += delta
```  
2. **Shader动画**：  
```glsl
uniform float mixRatio;
void main() {
  vec3 pos = mix(originalPosition, targetPosition, mixRatio)
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos,1.0);
}
```  
3. **物理模拟**：  
   - 使用Cannon.js实现弹性变形效果"

---

### **Q5：如何优化多材质对象的渲染性能？**
**面试官意图**：考察渲染优化知识  
**代码现状**：  
```typescript
textureData.grayData.forEach(data => {
  createColorCylinder(...) // 多个独立Mesh
})
```
**答**：  
"当前每个颜色区域都是独立Mesh，建议：  
1. **材质合并**：  
```typescript
const mergedGeometry = new THREE.BufferGeometry()
textureData.forEach(data => {
  const geometry = getTextureGeometry(...)
  mergedGeometry.merge(geometry)
})
const megaMesh = new THREE.Mesh(mergedGeometry, material)
```  
2. **InstancedMesh**：  
```typescript
const instanceMesh = new THREE.InstancedMesh(geometry, material, count)
instanceMesh.setMatrixAt(i, transformMatrix) 
```  
3. **Texture Atlas**：  
   - 将多个纹理合并到一张大图  
   - 通过UV偏移访问不同区域"

---

### **Q6：如何处理透明材质的渲染顺序？**
**面试官意图**：考察图形学基础  
**代码现状**：  
```typescript
new THREE.MeshPhysicalMaterial({
  transparent: true,
  opacity: 1
})
```
**答**：  
"透明材质需要特殊处理：  
1. **手动排序**：  
```typescript
transparentMesh.renderOrder = 1 // 后渲染
opaqueMesh.renderOrder = 0 // 先渲染
```  
2. **深度写入控制**：  
```typescript
material.depthWrite = false // 透明材质关闭深度写入
```  
3. **混合模式优化**：  
```typescript
material.blending = THREE.CustomBlending
material.blendEquation = THREE.AddEquation
material.blendSrc = THREE.SrcAlphaFactor
material.blendDst = THREE.OneMinusSrcAlphaFactor
```  
4. **分通道渲染**：  
   - 先渲染所有不透明物体  
   - 再按从后到前顺序渲染透明物体"

---

### **Q7：如何实现跨设备兼容？**
**面试官意图**：考察工程化能力  
**代码现状**：  
```typescript
renderer = new THREE.WebGLRenderer({ antialias: true })
```
**答**：  
"当前配置较为基础，完整兼容方案包括：  
1. **特性检测**：  
```typescript
const isWebGL2 = renderer.capabilities.isWebGL2
const maxAnisotropy = renderer.capabilities.getMaxAnisotropy()
```  
2. **渐进增强**：  
```typescript
const pixelRatio = Math.min(2, devicePixelRatio) // 防止移动端内存溢出
```  
3. **Fallback机制**：  
```typescript
try {
  initWebGL()
} catch (e) {
  showCanvas2DFallback()
}
```  
4. **触摸事件支持**：  
```typescript
controls.enablePan = isDesktop
controls.enableZoom = !isMobile
```"

---

### **Q8：如何实现服务端渲染（SSR）？**
**面试官意图**：考察架构设计能力  
**答**：  
"Three.js的SSR需要特殊处理：  
1. **Headless GL**：  
```bash
npm install headless-gl
```  
2. **Node.js环境初始化**：  
```typescript
const gl = require('gl')(width, height)
const renderer = new THREE.WebGLRenderer({ 
  canvas: { width, height },
  context: gl 
})
```  
3. **资源加载适配**：  
   - 替换ImageLoader为node-canvas  
   - 文件系统路径处理  
4. **输出处理**：  
```typescript
const pixels = new Uint8Array(width * height * 4)
gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
```  
5. **缓存策略**：  
   - 预渲染常用角度  
   - 使用Redis缓存渲染结果"

---

通过这些问题，可以全面考察候选人在三维可视化开发中的技术深度和工程化能力。建议准备时结合Three.js文档和计算机图形学原理进行深化理解。
