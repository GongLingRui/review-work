// 创建一个用于获取3D浮雕颜色图像的私有方法
private get3dReliefColorImg(i: number, textureTypeTemp: TextureType | null, workspace: any, newImage: fabric.Object, objects: Object[], canvasWidth: number, canvasHeight: number): string {
    // 创建一个临时画布用于工作区的渲染
    const canvasWorkTemp = document.createElement('canvas');
    canvasWorkTemp.width = canvasWidth; // 设置画布宽度
    canvasWorkTemp.height = canvasHeight; // 设置画布高度
    // 获取临时工作画布的2D上下文
    const tempWorkCtx = canvasWorkTemp.getContext('2d');
    if (!tempWorkCtx) return ""; // 如果无法获取上下文，则返回空字符串
    tempWorkCtx.globalCompositeOperation = 'source-in'; // 设置全局合成操作
    workspace!.render(tempWorkCtx!); // 渲染工作区到临时画布

    // 创建另一个临时画布用于当前图片的渲染
    const canvasTemp = document.createElement('canvas');
    canvasTemp.width = canvasWidth; // 设置画布宽度
    canvasTemp.height = canvasHeight; // 设置画布高度
    // 获取当前图片的2D上下文
    const tempCtx = canvasTemp.getContext('2d');
    if (!tempCtx) return ""; // 如果无法获取上下文，则返回空字符串
    newImage.render(tempCtx!); // 渲染当前图片到临时画布

    // 如果存在后续对象，则处理它们
    if (i + 1 < objects.length) {
      // 创建用于字体渲染的临时画布
      const canvasTempFont = document.createElement('canvas');
      canvasTempFont.width = canvasWidth; // 设置画布宽度
      canvasTempFont.height = canvasHeight; // 设置画布高度
      // 获取字体渲染的2D上下文
      const tempFontCtx = canvasTempFont.getContext('2d');
      if (!tempFontCtx) return ""; // 如果无法获取上下文，则返回空字符串

      // 遍历后续对象进行渲染
      for (let j = i + 1; j < objects.length; j++) {
        const innerObj = objects[j] as any;
        // 渲染内部对象到字体临时画布
        innerObj.render(tempFontCtx!);
        tempCtx.globalCompositeOperation = 'source-atop'; // 设置全局合成操作
        // 将字体临时画布的内容绘制到当前图片的临时画布上
        tempCtx.drawImage(canvasTempFont, 0, 0, canvasTemp.width, canvasTemp.height);
        // 清除字体临时画布
        tempFontCtx.clearRect(0, 0, canvasTempFont.width, canvasTempFont.height);
      }
      // 重置字体临时画布的尺寸以释放资源
      canvasTempFont.width = 0;
      canvasTempFont.height = 0;
    }
    // 将当前图片的临时画布内容绘制到工作区的临时画布上
    tempWorkCtx.drawImage(canvasTemp, 0, 0, canvasTemp.width, canvasTemp.height);
    // 将工作区的临时画布转换为数据URL
    var colorImg = canvasWorkTemp.toDataURL();
    // 重置画布尺寸以释放资源
    canvasWorkTemp.width = 0;
    canvasWorkTemp.height = 0;
    canvasTemp.width = 0;
    canvasTemp.height = 0;
    // 返回生成的数据URL
    return colorImg;
  }
