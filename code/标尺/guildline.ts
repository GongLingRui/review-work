initialize(points, options) {
  // 判断是否为水平线
  const isHorizontal = options.axis === 'horizontal';
  
  // 设置鼠标悬停时的光标样式
  this.hoverCursor = isHorizontal ? 'ns-resize' : 'ew-resize';
  //如果是水平线，光标样式为 ns-resize（上下箭头）；如果是垂直线，光标样式为 ew-resize（左右箭头）。
  // 设置新的点，根据是否为水平线来确定坐标
  const newPoints = isHorizontal
    ? [-999999, points, 999999, points] // 水平线
    : [points, -999999, points, 999999]; // 垂直线
  
  // 锁定移动方向，水平线锁定 X 轴，垂直线锁定 Y 轴
  options[isHorizontal ? 'lockMovementX' : 'lockMovementY'] = true;
  //水平线锁定 X 轴移动，垂直线锁定 Y 轴移动。
  // 调用父类的初始化方法
  this.callSuper('initialize', newPoints, options);
  
  // 绑定鼠标按下事件
  this.on('mousedown:before', (e) => {
    if (this.activeOn === 'down') {
      // 设置 selectable: false 后，激活对象才能进行移动
      this.canvas.setActiveObject(this, e.e);
    }
  });
  
  // 绑定移动事件
  this.on('moving', (e) => {
    // 如果标尺启用且点在标尺上，设置光标为 "not-allowed"
    if (this.canvas.ruler.options.enabled && this.isPointOnRuler(e.e)) {
      this.moveCursor = 'not-allowed';
    } else {
      // 否则根据是否为水平线设置光标样式
      this.moveCursor = this.isHorizontal() ? 'ns-resize' : 'ew-resize';
    }
    // 触发 "guideline:moving" 事件
    this.canvas.fire('guideline:moving', {
      target: this,
      e: e.e,
    });
  });
  
  // 绑定鼠标松开事件
  this.on('mouseup', (e) => {
    // 如果标尺启用且点在标尺上，移除辅助线
    if (this.canvas.ruler.options.enabled && this.isPointOnRuler(e.e)) {
      this.canvas.remove(this);
      return;
    }
    // 否则根据是否为水平线设置光标样式
    this.moveCursor = this.isHorizontal() ? 'ns-resize' : 'ew-resize';
    // 触发 "guideline:mouseup" 事件
    this.canvas.fire('guideline:mouseup', {
      target: this,
      e: e.e,
    });
  });
  
  // 绑定移除事件
  this.on('removed', () => {
    // 解除所有绑定的事件
    this.off('removed');
    this.off('mousedown:before');
    this.off('moving');
    this.off('mouseup');
  });
}
