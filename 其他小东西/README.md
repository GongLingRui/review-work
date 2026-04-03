# project-show
- 待更新
- text模块
- src/templates/2dEditor/components/MainUi/MainUiTopTool/MainUiTopTool.tsx
- src/templates/2dEditor/components/MainUi/MainUiTopTool/MainUiTopToolFont.tsx
- src/templates/2dEditor/components/MainUi/MainUiTopTool/MainUiTopToolImage.tsx
- src/templates/2dEditor/components/MainUi/MainUiTopTool/MainUiTopToolMultiSelection.tsx
- 编辑器当中可以编辑的文字都是textbox，变形的文字是text
- jpeg没有透明通道的
- key_prefix位图判断，抠图，超分，文生图，人物换脸，风格话，上传图片
- 使用 MutationObserver 监听 DOM 变化，以兼容 Safari 浏览器中 OpenCV.js 加载可能出现的 Promise 状态一直为 pending 的问题。
observer.observe(document, { childList: true, subtree: true });: 监听整个文档的子节点列表和子树变化。
- 键盘hooksconst handleIOSFocus = () => {
      // IOS 键盘弹起后操作
      param.onIOSFocus?.()
    }
    const handleIOSBlur = () => {
      // IOS 键盘收起后操作
      param.onIOSBlur?.()
    }
    const handleAndroidResize = () => {
      var resizeHeight = document.documentElement.clientHeight || document.body.clientHeight;
      if (originHeight < resizeHeight) {
        // Android 键盘收起后操作
        param.onAndroidBlur?.()
      } else {
        // Android 键盘弹起后操作
        param.onAndroidFocus?.()
      }
  - Safari 特殊处理方案
const observer = new MutationObserver(() => {
    if ((window as any).cv) {
        observer.disconnect();
        // ...兼容逻辑
    }
});
问题背景：Safari 浏览器早期版本对 script.onload 的支持不稳定
创新解法：
用 MutationObserver 监听DOM变化间接判断脚本加载状态
检测逻辑：
脚本注入后全局 window.cv 属性变化即为加载成功
// 隐藏滚动条并保持可滚动
  scrollbar-width: none;
  /* Firefox */
  -ms-overflow-style: none;

  /* IE 10+ */
  &::-webkit-scrollbar {
    display: none;
    /* Chrome, Safari, Opera */
  }
