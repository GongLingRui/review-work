# 上传入口
<img width="398" alt="image" src="https://github.com/user-attachments/assets/ce14d635-2c5f-48c8-a3da-d06092246d16" />

### Publish入口
- **位置**：位于一级tab，固定在主框架的每个页面顶部
- **点击publish**：展开选择发布project/design
  - +new project，文案调整成+New Design
  - My projects，文案调整成My Creation
# 2.发布project
<img width="508" alt="image" src="https://github.com/user-attachments/assets/6b35531d-610a-49e3-bb0d-7db594debb51" />

<img width="711" alt="image" src="https://github.com/user-attachments/assets/c4499233-3f3a-4c5c-837b-0ccfdc2d78e3" />

<img width="725" alt="image" src="https://github.com/user-attachments/assets/21b8d99a-ccf0-47f5-9d88-55aa6998bcd9" />
<img width="327" alt="image" src="https://github.com/user-attachments/assets/96fd57da-6e6f-4547-a2a7-652ec4490f6e" />



### 添加封面
1. **上传封面图**
   - 拖拽图片，或点击按钮选择本地图片上传
   - 格式支持jpg、png、webp、gif
   - 单张图片大小限制在50MB以内
2. **编辑封面图**
   - 添加图片后唤起编辑窗口
   - 默认900*900正方形裁剪框，用户可放大、缩小、移动裁剪框
   - 点击cancel关闭弹框
   - 点击确认，裁剪图片，关闭弹框
3. **替换封面图**
   - 封面图上传后右上角浮窗显示替换按钮
   - 点击替换按钮，唤起选择本地文件弹框
   - 确认后，替换为新的封面图

### 添加项目图片
- **封面图默认为第1张图**，点击加号添加图片，最多添加10张
- 图片右上角删除按钮，点击后可以删除图片
- 图片可以左右拖拽，调整展示顺序
- 单张图片大小限制在50MB以内

### 项目名称
- 限制50字符，支持多语言、数字，不支持特殊符号！@#¥%等

### 设计文件
1. **添加设计link唤起选择弹框**
   - 用户创建过的设计
     1. 拉取“我创建的design”列表，顶部新增tab栏，分别为My Designs、Printed Designs
        - **My designs**：显示用户原创上传或二创他人的设计，不出现用户未改动的别人的设计，也不出现空白画布设计
        - **Printed Designs**：显示用户非原创上传的所有他人设计，如果选中的设计为不可商用设计，左下角提示：Please note that the design you select is for non-commercial use only and should not be used for profit.
        - **remix定义**：改动一点点就算remix
     2. 两个Design列表的作品都按编辑时间由新到老排序，显示作品画布图、作品标题、最新编辑时间（xx minutes/hours/days ago）
     3. 若设计为magic craft设计，左上角显示应用的标签：Light Panting、Brushstroke Maker、Relief Magnet，以后还会新增。封面图为应用点击生成后的画布底图，标题默认为应用名+序号
     4. 用户选择的是未发布的设计link，点击next后，唤起弹窗，提示用户还没发布过，允许允许系统帮助自动发布，自动填写必填默认字段包括：
        - 设计名，同项目名
        - 设计缩略图
        - 设计主题、设计分类、同项目主题、分类
        - style默认other
        - 版权，默认CC-BY
        - 是否设为独家，默认Yes
   - 用户没创建过设计
     1. 页面为空，提示用户去上传个设计，按钮跳转设计发布页
   - 用户创建过设计，但都没改动，非原创/二创
     1. 页面为空，提示用户去上传原创设计，按钮跳转设计发布页

### 取消/继续按钮
- 点击取消，关闭选择弹框
- 点击继续，关联选择的设计link，加号消失，显示设计缩略图

### 项目分类（单选）
- 下拉框选择，全部分类标签见标签文档

### 项目主题（多选）
- 下拉框选择，全部主题标签见标签文档

### 项目材料分类（多选）
- 下拉框选择，全部材料标签见标签文档：https://anker-in.feishu.cn/sheets/MwWzs9SWkhSjGatAugucXXwlnGb

### 新增项目材料SKU链接选项（多选）
- 选完材料分类后，唤起材料SKU链接下拉填写框
- 下拉框选择项，拉取用户选择的材料分类下的所有sku链接，全部SKU链接见文档（DTC确认后更新）：https://anker-in.feishu.cn/wiki/FOutwWoyoiuDQEkjhutcNEDAnHg
- 如果用户删除了上面的材料分类，下面的材料分类下对应的SKU一起删除
- 如果用户删除了下面的SKU，上面的材料分类不变

### 项目描述
- **description**输入框，输入前默认显示提示语：Share the story of your project! Describe the process, challenges, and successes. Your detailed description will help others understand and appreciate your work.
- **工具栏**：支持富文本编辑，无序序号、顺序序号、左对齐、右对齐、居中对齐、加粗、斜体、下划线、字体颜色、字体背景高光、增加缩进、减少缩进、添加图片、添加视频（支持youtube、tiktok、ins、vimeo视频，填写url后自动提取视频缩略图展示）
- **限制**：限制3000字符，支持多语言、数字、特殊符号

### 项目标签
- 用户自定义打标签，限制20个标签，空格、回车输入，支持多语言、数字，不支持特殊符号！@#¥%等，单个标签限制30字符，不支持空白标签。

### 保存/发布
- **点击save**
  - 保存填写内容草稿但并不发布，内容同步至个人主页草稿箱
- **点击发布**
  - 需要必填项都完成后点击publish，内容同步至社区的projects库和个人主页my projects页
  - 上传项目所用的设计link时，用户选择的设计文件为创建过但未发布过的设计，需要用户自动发布设计到社区，系统自动填写必填默认字段包括：
    - 设计名，同项目名
    - 设计缩略图
    - 设计主题、设计分类、同项目主题、分类
    - style默认other
    - 版权，默认CC-BY
    - 是否设为独家，默认Yes

### 异常情况
- 必填项没有全部完成就点击publish，必填区域提示“This field cannot be blank.”，未完成的部分标红显示
- 没有保存和发布就离开页面，提示弹窗二次确认：Do you really want to leave this page? Your unpublished model will be lost. 选择取消留在当前页面，点击离开关闭发布页
- 发布失败：在发布页出现toast提示“Publish Failed. Please try again.”，5s自动消失，停留在发布页，可重新发布
