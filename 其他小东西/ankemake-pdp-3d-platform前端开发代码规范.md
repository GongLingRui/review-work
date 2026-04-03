# git规范
## 2.1命名规范
- git分支命名
- 版本分支：release/xxx提测分支
- 个人分析feaure/xxx：新的feature开发分支
- fix/xxxbug修复分支
- 紧急修复分支：hotfix/xxx
- 不要使用错误的单词，vscode下载对应的插件可以及时检测到的
- git commit提交的规范：type：（《scope》）——description
- type必填的
- fix修复bug
- feature新增的功能
- hotfix紧急修复
- revert版本会退
- style仅仅涉及ui修改，不涉及功能逻辑
- refactor仅仅涉及代码重构
- chore新增依赖库和插件等等
- scope非必填的，填写对应的bug提单号吗或者相关的组建名
- desciprtion非必填的，如果没有对应的scipre最好填写不超过50个字符的简单的描述
- 使用规范
- 间隔福为——
- 合并前先讲版本分支merge到本地检验有无冲突，再合并到版本分支并且进行code review
- 版本发布以后另外起一个新的分支
- 不同的项目可能对应不同的node版本，下载nvm切换
## 图片规范
- 3.1使用规范
- 全局或者组建内的svg，icon等等放置在同一个文件统一管理
- 尽量不要引入图片使用
- 以优化用户体验为基准选择合适格式的图片


# 4.ui规范
## 4.1css/scss使用规范
- 命名采用驼峰，不实用间隔符
- 和ts/js文件名一一对应
- 嵌套不超过3层的
- 对引入组建的css的修改使用global，需要在使用的时候写在当前组建的父元素下，否则会影响到全局的其他使用了这个组建的样式的
- 自适应目前breakPoint：1920-》1440-〉1280后续会加入app端的适配
- 当前项目使用tailwindcss进行简化书写，尽量减少原声写法的保持一致的，


## 4.2ui控件使用规范
- 复用组建需要进行抽取并且写好代码注释，不要重复书写，tab/select/switch等等
- 复杂控件可以按需引入，来轻便维护性高，满足需求开发为选取基准，需要同步其他的开发人员

## react规范
- 1.命名规范
- 组建名使用大驼峰，属性，变量等使用小驼峰，都不实用间隔福
- props命名避免使用dom组建的属性名，做到语义化明确
- 2.使用规范
- 对齐tsx风格，给数据设定默认值和预检测
- 较复杂的状态管理使用redux或者contect
- 链条前和后端对齐api文档。明确参数的一致性和正确性
- 书写风格对齐，可以下载编辑器对应的插件实时监控
- 及时去除log，无用引用等代码行，保持代码的简洁
- 5.2字符串开发的规范
- 1.定义文案key，可以的定义str_模块名_具体功能，代码当中使用key和配置默认的文案
- eg：title:t('str_common_notification','Notification');
- 开发完成，在提测前，统一添加到多语言文案记录当中
- 产品导入火山以后，及时通知测试，校对文案，验证多语言
## 5.3文案定义转化步骤
- 1.在src/templates/2dEditor/utils/TranslationsKeys.ts文件下定义文案的key值，例如——CHOOSE_DESIGN：‘string——tes'
- 2.src/hooks/useCutsomTranslation.ts文件下引入定义的key值补充上对应的具体的文案，例如
- [TranslationsKeys。CHOOSE_DESIGN]:'Choose A Design,
- 3.在代码当中引入
- import{TranlsationsKeys} from "src/templates/2dEdiror/utils/translationKeys";
- import useCustomTransition from "src/hooks/useCustomTranslation";
- const {getTranslation}=useCustomTranslation():
- <P>{getTranslation(tranlsationKeys.CHOOSE_DESIGN})</P>
- 最后把我们自己的文案key（'string_tes'）和相应的文案（“Choose A Design”）填写在该文件当中
  
