<img width="1449" alt="image" src="https://github.com/user-attachments/assets/4ec28c68-9793-45f5-9d6e-e32e50cb7edc" />


当然可以，这段代码定义了一个名为 `MainUiLeftUpload` 的 React 组件，用于处理文件上传、显示上传的文件列表、以及实现无限滚动加载等功能。我们将逐步分析这段代码的每一部分，了解其工作原理和实现细节。

### 导入部分

```javascript
import { useTranslation } from '@volcengine/i18n';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useCanvasEditor, useEvent } from 'src/templates/2dEditor/hooks/context';
import * as BaseStyles from 'src/templates/2dEditor/common/styles/BaseStyles.module.scss';
import { deleteUserMateria, getUserMaterialList } from 'src/templates/2dEditor/service/2dEditService';
import { MaterialEditData } from '../../../SelectDialog/model/ProjectModel';
import * as classes from './MainUiLeftUpload.module.scss';
import { EventNameCons } from 'src/templates/2dEditor/cons/2dEditorCons';
import { CusPageRequestModel, isNetSuccess } from 'src/templates/2dEditor/common/netUtil';
import { openToast } from 'src/state/reducers/toast';
import Loading from 'src/components/Loading';
import { getImgStr, selectFiles } from 'src/templates/2dEditor/utils/utils';
import { GetUpTokenFileTypeEnum } from 'src/services';
import { ImportSource } from 'src/templates/2dEditor/core/plugin/ImagePlugin/types/common';
import { convertToBase64 } from 'src/common/utils';
import MainUiLeftFooterBar from '../../../MainUiLeftFooterBar/MainUiLeftFooterBar';
import DataList from './Data/DataList';
import return_icon from '/src/images/2dEditor/Apps_icon/appbar_back_icon.png';
import useDataCache from '../../../../utils/DataCache';
import { uploadImageForCavas } from 'src/templates/2dEditor/common/cavasUtil';
import empty_upload_icon from 'src/images/empty_upload.png';
import upload from '/src/assets/svg/upload.svg';
import { EditorToastType, editorToastHidden, editorToastShow } from '../../../Toast';
import ScrollMoreView2d from 'src/templates/2dEditor/components/ScrollMoreView2d/ScrollMoreView2d';
import DataCache from './cache';
import { checkFileSize } from 'src/templates/2dEditor/utils/checkFileSize';
import { useDispatch } from 'react-redux';
import useCustomTranslation from "src/hooks/useCustomTranslation";
import { TranslationsKeys } from "src/templates/2dEditor/utils/TranslationsKeys";
import { ConsoleUtil } from 'src/common/utils/ConsoleUtil';
```

这部分代码导入了所需的模块和资源，包括 React 库、样式文件、服务、工具函数、组件等。

### 组件定义

```javascript
function MainUiLeftUpload(props: any) {
```

定义了一个名为 `MainUiLeftUpload` 的函数组件，接收 `props` 作为参数。

### 使用的钩子和状态

```javascript
  const { setCacheItem, getCacheItem } = useDataCache();
  const { isApps, handleStep4Data, Petindex, prevStep, allRight_state, isPetPoratrait, handlePetPoraData } = props;
  const canvasEditor = useCanvasEditor();
  const { t } = useTranslation();
  const [isLoading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const pageIndex = useRef(1);
  const [dataList, setDataList] = useState<MaterialEditData[]>([]);
  const PAGE_SIZE = 20;
  const event = useEvent();
  const { getTranslation } = useCustomTranslation();
  const [isEditing, setEditing] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isNetLoading, setNetLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [isShowFooterbar, setIsShowFooterbar] = useState(false);
  const [isItemDeleteId, setIsItemDeleteId] = useState<any>(null);
  const dispatch = useDispatch();
```

- `useDataCache`：自定义钩子，用于缓存数据。
- `useCanvasEditor`：自定义钩子，用于获取画布编辑器实例。
- `useTranslation`：用于国际化翻译。
- `useState`：用于管理组件的状态。
- `useRef`：用于创建可变的 `ref` 对象。
- `useEvent`：自定义钩子，用于事件处理。
- `useDispatch`：用于 Redux 的 `dispatch`。

### 处理拖拽事件

```javascript
  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); // 阻止默认行为
  }, []);
```

- `handleDragOver`：处理拖拽事件，阻止默认行为。

### 初始化数据

```javascript
  useEffect(() => {
    if (DataCache.getInstance()?.cachePageData('upload')?.length > 0) {
      setDataList(DataCache.getInstance().cachePageData('upload'));
      setHasMore(DataCache.getInstance().cacheHasMore('upload'));
      pageIndex.current = DataCache.getInstance().cachePageSize('upload');
    } else {
      getListData();
    }
  }, [canvasEditor]);
```

- `useEffect`：在组件挂载时执行，检查缓存数据，如果有缓存数据则使用缓存数据，否则调用 `getListData` 获取数据。

### 事件监听

```javascript
  useEffect(() => {
    event?.on(EventNameCons.EventUpdateMaterial, updateDataAdd);
    if (event) {
      DataCache.getInstance().updateProjectCreateEmitter(event);
    }
    return () => {
      event?.off(EventNameCons.EventUpdateMaterial, updateDataAdd);
      DataCache.getInstance().removeUpdateProjectCreateEmitter();
    }
  }, []);
```

- `useEffect`：在组件挂载时添加事件监听器，在组件卸载时移除事件监听器。

### 选择项变化时更新全选状态

```javascript
  useEffect(() => {
    setSelectAll(selectedItems.length > 0 && selectedItems.length == dataList.length);
  }, [selectedItems]);
```

- `useEffect`：在 `selectedItems` 变化时执行，更新全选状态。

### 更新数据

```javascript
  const updateDataAdd = (data: MaterialEditData) => {
    setDataList(prevDataList => {
      const newDataList = [data, ...prevDataList];
      return newDataList;
    });
    const hasMore = DataCache.getInstance().getCacheItem('upload')?.['hasMore'];
    const pageIndex = DataCache.getInstance().getCacheItem('upload')?.['pageSize'];
    const originData = DataCache.getInstance().cachePageData?.('upload')?.length > 0 ? DataCache.getInstance().cachePageData?.('upload') : dataList;
    DataCache.getInstance().setCacheItem('upload', { 'pageData': [data, ...originData], "pageSize": pageIndex, 'hasMore': hasMore });
  }
```

- `updateDataAdd`：更新数据列表，并缓存数据。

### 获取数据列表

```javascript
  const getListData = () => {
    var request: CusPageRequestModel = {
      pagination: {
        page_size: PAGE_SIZE,
        page: pageIndex.current,
      }
    }
    setLoading(true);
    getUserMaterialList(request).then((res) => {
      setLoading(false);
      if (res?.data?.material_list?.length == 0 && res?.data?.total == 0) {
        setDataList([]);
        setHasMore(false);
        setCacheItem('upload', { 'pageData': [], "pageSize": 1, 'hasMore': false });
      } else {
        const reqDataList = res?.data?.material_list || [];
        pageIndex.current++;
        const data = [...dataList, ...reqDataList];
        setDataList(prevProjects => [...prevProjects, ...reqDataList]);
        const _hasMore = data.length < res?.data?.total;
        setHasMore(_hasMore);
        DataCache.getInstance().setCacheItem('upload', { 'pageData': data, 'pageSize': pageIndex.current, 'hasMore': _hasMore });

        if (selectAll || (selectedItems.length > 0 && (selectedItems.length == reqDataList.length))) {
          const allIds = data.map((project) => project.material_id);
          setSelectedItems(allIds);
        }
      }
    }).finally(() => {
      setLoading(false);
    });
  }
```

- `getListData`：获取数据列表，并更新状态和缓存。

### 点击项处理

```javascript
  const clickItem = async (data: MaterialEditData) => {
    if (isApps) {
      handleStep4Data({ ...Petindex.item, [Petindex.index]: { ...data } });
    } else if (isPetPoratrait) {
      handlePetPoraData(data);
    } else {
      let decodedUrl = data.download_url && data.download_url.indexOf('oss-cn-shenzhen') !== -1 ? data.download_url : data.download_url ? decodeURIComponent(data.download_url) : '';
      const fileExtension = data.file_name.split('.').pop();
      if (fileExtension === 'svg') {
        const response = await fetch(decodedUrl);
        const blob = await response.blob();
        getImgStr(blob).then((file) => {
          canvasEditor?.addSvgFile(file as string);
        });
      } else {
        setNetLoading(true);
        const base64 = await convertToBase64(decodedUrl);
        canvasEditor?.addImage(base64, {
          importSource: ImportSource.Cloud,
          fileType: fileExtension,
          key_prefix: data.file_name
        });
        setNetLoading(false);
      }
    }
  }
```

- `clickItem`：处理点击项的逻辑，根据不同的条件执行不同的操作。

### 选择项处理

```javascript
  const handleSelectItem = (id: number) => {
    const newSelectedItems = new Set(selectedItems);
    if (newSelectedItems.has(id)) {
      newSelectedItems.delete(id);
      setSelectAll(false);
    } else {
      newSelectedItems.add(id);
    }
    setSelectedItems(Array.from(newSelectedItems));
    if (Array.from(newSelectedItems).length > 0) {
      setEditing(true);
    } else {
      setEditing(false);
    }
  };
```

- `handleSelectItem`：处理选择项的逻辑，更新选中项和编辑状态。

### 全选处理

```javascript
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      const allIds = dataList.map((data) => data.material_id);
      setSelectedItems(allIds);
    }
    setSelectAll(!selectAll);
  };
```

- `handleSelectAll`：处理全选的逻辑，更新选中项和全选状态。

### 删除项处理

```javascript
  const deleteProject = (id: any) => {
    itemOperator(id);
    setOpenDialog(true);
  }
```

- `deleteProject`：处理删除项的逻辑，更新选中项并打开对话框。

### 删除选中项处理

```javascript
  const handleDeleteSelected = () => {
    setNetLoading(true);
    const ids = isItemDeleteId ? [isItemDeleteId] : selectedItems;
    if (ids.length > 100) {
      dispatch(openToast({
        message: getTranslation(TranslationsKeys.DELETE_UP_TO_100_IMAGES),
        severity: 'warning',
      }));
      setNetLoading(false);
      return;
    }
    deleteUserMateria({ material_ids: ids }).then((resp) => {
      setNetLoading(false);
      if (isNetSuccess(resp)) {
        const newProjectList = dataList.filter((data) => !ids.includes(data.material_id));
        setDataList(newProjectList);
        const hasMore = DataCache.getInstance().cacheHasMore('upload');
        const cachePageIndex = newProjectList.length > 0 ? DataCache.getInstance().cachePageSize('upload') : 1;
        DataCache.getInstance().setCacheItem('upload', { 'pageData': newProjectList, "pageSize": cachePageIndex, 'hasMore': hasMore });
        setSelectedItems([]);
        if (newProjectList.length == 0 && hasMore) {
          pageIndex.current = 1;
          getListData();
        }
        setOpenDialog(false);
        setEditing(false);
        setSelectAll(false);
        setIsItemDeleteId(null);
        setIsShowFooterbar(false);
      } else {
        dispatch(openToast({
          message: resp?.msg || getTranslation(TranslationsKeys.SOMETHING_WENT_WRONG_AGAIN),
          severity: 'error',
        }));
      }
    });
  };
```

- `handleDeleteSelected`：处理删除选中项的逻辑，更新数据列表和缓存，并显示相应的提示信息。

### 更新文件

```javascript
  const updateFile = () => {
    const supportImageTypes = '.jpeg,.png,.jpg,.webp,.svg,.psd,.ai,.pdf';
    selectFiles({ accept: supportImageTypes, multiple: true }).then((fileList) => {
      Array.from(fileList as FileList).forEach((item) => {
        if (!checkFileSize(item)) return;
        const fileExtension = item.name.split('.').pop()?.toLowerCase();
        const newName = 'uploadImage.' + fileExtension;
        const newFile = new File([item], newName, { type: item.type });
        uploadImageForCavas({
          updateStart: () => editorToastShow({
            tips: getTranslation(TranslationsKeys.Loading),
            type: EditorToastType.loading,
          }),
          updateEnd: (ret: boolean, error: number, message?: string) => {
            if (ret) {
              editorToastHidden();
            } else {
              editorToastShow({
                tips: getTranslation(TranslationsKeys.SOMETHING_WENT_WRONG_AGAIN),
                type: EditorToastType.error,
              });
            }
          },
          fileExtension: fileExtension as string,
          fileItem: newFile,
          event: event,
          canvasEditor: canvasEditor,
          uploadFileType: GetUpTokenFileTypeEnum.Edit2dLocal,
          isApps: isApps,
        });
      });
    });
    setSelectAll(false);
  };
```

- `updateFile`：处理文件上传的逻辑，选择文件并上传到服务器。

### 处理对话框关闭

```javascript
  const handleDialogClose = () => {
    setIsItemDeleteId(null);
    setOpenDialog(false);
    setIsShowFooterbar(false);
  }
```

- `handleDialogClose`：处理对话框关闭的逻辑，更新状态。

### 处理对话框打开

```javascript
  const handleDialogOpen = () => {
    setOpenDialog(true);
  }
```

- `handleDialogOpen`：处理对话框打开的逻辑，更新状态。

### 设置非编辑状态

```javascript
  const setIsNotEditing = () => {
    setEditing(false);
    setSelectedItems([]);
    setIsShowFooterbar(false);
  }
```

- `setIsNotEditing`：设置非编辑状态，更新状态。

### 设置编辑状态

```javascript
  const setIsEditing = () => {
    setEditing(true);
    setSelectAll(false);
    setIsShowFooterbar(true);
  }
```

- `setIsEditing`：设置编辑状态，更新状态。

### 处理拖放事件

```javascript
  const handleDrop = useCallback((action: React.DragEvent<HTMLDivElement>) => {
    action.stopPropagation();
    action.preventDefault();
    const files = action.dataTransfer.files;
    if (files.length > 0) {
      Array.from(files as FileList).forEach((item) => {
        if (!checkFileSize(item)) return;
        const fileExtension = item.name.split('.').pop()?.toLowerCase();
        const newName = 'uploadImage.' + fileExtension;
        const newFile = new File([item], newName, { type: item.type });
        uploadImageForCavas({
          updateStart: () => editorToastShow({
            tips: getTranslation(TranslationsKeys.Loading),
            type: EditorToastType.loading,
          }),
          updateEnd: (ret: boolean, error: number, message?: string) => {
            if (ret) {
              editorToastHidden();
            } else {
              editorToastShow({
                tips: getTranslation(TranslationsKeys.SOMETHING_WENT_WRONG_AGAIN),
                type: EditorToastType.error,
              });
            }
          },
          fileExtension: fileExtension as string,
          fileItem: newFile,
          event: event,
          canvasEditor: canvasEditor,
          uploadFileType: GetUpTokenFileTypeEnum.Edit2dLocal,
        });
      });
    } else {
      setNetLoading(false);
    }
  }, [canvasEditor]);
```

- `handleDrop`：处理拖放事件的逻辑，上传拖放的文件。

### 渲染组件

```javascript
  const selectedLength = selectedItems.length;
  return (
    <div className={classes.layout}>
      <div className={classes.layoutTitle}>
        <div style={{ display: 'flex', 'alignItems': 'center' }}>
          {isApps && <img src={return_icon} style={{ 'marginRight': '8px', 'width': '24px', 'height': '24px' }} onClick={() => { prevStep('', '') }} />}
          <div className={`${BaseStyles.txt24} ${classes.uploadTitle}`}>
            <span>{t('Upload')}</span>
          </div>
        </div>
      </div>

      <button className={`${BaseStyles.cusButtonWrap} ${classes.updateButton}`} onClick={updateFile}>
        <img src={upload} />
        {t('str_common_upload_image', 'Upload (PNG, JPEG, SVG, WebP)')}
      </button>

      <div
        className={classes.listWrap}
        style={{ paddingRight: allRight_state?.state ? 20 : 0 }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <ScrollMoreView2d
          onLoadMore={getListData}
          hasMore={hasMore}
          isLoading={isLoading}
        >
          {!isLoading && dataList.length === 0 && <div className={classes.emptyTip}>
            <img src={empty_upload_icon} />
            <div>{getTranslation(TranslationsKeys.NO_PHOTO_TIP)}</div>


          {!isLoading && dataList.length === 0 && <div className={classes.emptyTip}>
            <img src={empty_upload_icon} />
            <div>{getTranslation(TranslationsKeys.NO_PHOTO_TIP)}</div>
          </div>}
          {dataList.length > 0 && <DataList
            dataList={dataList}
            isEditing={isEditing}
            selectAll={selectAll}
            selectedItems={selectedItems}
            clickItem={clickItem}
            deleteProject={deleteProject}
            setIsEditing={setIsEditing}
            itemOperator={itemOperator}
            setIsShowFooterbar={setIsShowFooterbar}
            allRight_state={allRight_state?.state || false}
            setIsItemDeleteId={setIsItemDeleteId}
            setOpenDialog={setOpenDialog}
            isApps={isApps}
            handleSelectItem={handleSelectItem}
          />}
        </ScrollMoreView2d>
      </div>
      {
        ((isEditing) || isItemDeleteId) && <MainUiLeftFooterBar
          selectedItems={selectedItems}
          dataList={dataList}
          selectAll={selectAll}
          handleSelectAll={handleSelectAll}
          handleConfirm={handleDeleteSelected}
          isHandleConfirmSuccess={isNetLoading}
          setIsEditing={setIsNotEditing}
          openDialog={openDialog}
          setCloseDialog={handleDialogClose}
          setOpenDialog={handleDialogOpen}
          isShowFooterbar={isShowFooterbar}
          isItemDeleteId={isItemDeleteId}
          dialogDes={
            t('string_delete_upload_tip', `Are You Sure Want To Delete ${selectedLength > 1 ? "These" : "This"} ${selectedLength > 0 ? selectedLength : 1} ${selectedLength > 1 ? "Uploads" : "Upload"}?`)
          }
        />
      }
      <Loading loading={isNetLoading} />
    </div>
  )
}

export default MainUiLeftUpload
```

### 详细解释

#### 空数据提示

```javascript
{!isLoading && dataList.length === 0 && <div className={classes.emptyTip}>
  <img src={empty_upload_icon} />
  <div>{getTranslation(TranslationsKeys.NO_PHOTO_TIP)}</div>
</div>}
```

- 如果 `isLoading` 为 `false` 且 `dataList` 为空，则显示一个提示，告知用户没有上传的图片。
- `empty_upload_icon` 是一个图片资源，用于显示空数据的图标。
- `getTranslation(TranslationsKeys.NO_PHOTO_TIP)` 用于获取翻译后的提示文本。

#### 数据列表

```javascript
{dataList.length > 0 && <DataList
  dataList={dataList}
  isEditing={isEditing}
  selectAll={selectAll}
  selectedItems={selectedItems}
  clickItem={clickItem}
  deleteProject={deleteProject}
  setIsEditing={setIsEditing}
  itemOperator={itemOperator}
  setIsShowFooterbar={setIsShowFooterbar}
  allRight_state={allRight_state?.state || false}
  setIsItemDeleteId={setIsItemDeleteId}
  setOpenDialog={setOpenDialog}
  isApps={isApps}
  handleSelectItem={handleSelectItem}
/>}
```

- 如果 `dataList` 不为空，则渲染 `DataList` 组件。
- `DataList` 组件接收多个属性，包括 `dataList`、`isEditing`、`selectAll`、`selectedItems`、`clickItem`、`deleteProject`、`setIsEditing`、`itemOperator`、`setIsShowFooterbar`、`allRight_state`、`setIsItemDeleteId`、`setOpenDialog`、`isApps` 和 `handleSelectItem`。
- 这些属性用于控制 `DataList` 组件的行为和状态。

#### 底部工具栏

```javascript
{
  ((isEditing) || isItemDeleteId) && <MainUiLeftFooterBar
    selectedItems={selectedItems}
    dataList={dataList}
    selectAll={selectAll}
    handleSelectAll={handleSelectAll}
    handleConfirm={handleDeleteSelected}
    isHandleConfirmSuccess={isNetLoading}
    setIsEditing={setIsNotEditing}
    openDialog={openDialog}
    setCloseDialog={handleDialogClose}
    setOpenDialog={handleDialogOpen}
    isShowFooterbar={isShowFooterbar}
    isItemDeleteId={isItemDeleteId}
    dialogDes={
      t('string_delete_upload_tip', `Are You Sure Want To Delete ${selectedLength > 1 ? "These" : "This"} ${selectedLength > 0 ? selectedLength : 1} ${selectedLength > 1 ? "Uploads" : "Upload"}?`)
    }
  />
}
```

- 如果 `isEditing` 为 `true` 或 `isItemDeleteId` 不为空，则渲染 `MainUiLeftFooterBar` 组件。
- `MainUiLeftFooterBar` 组件接收多个属性，包括 `selectedItems`、`dataList`、`selectAll`、`handleSelectAll`、`handleConfirm`、`isHandleConfirmSuccess`、`setIsEditing`、`openDialog`、`setCloseDialog`、`setOpenDialog`、`isShowFooterbar`、`isItemDeleteId` 和 `dialogDes`。
- 这些属性用于控制 `MainUiLeftFooterBar` 组件的行为和状态。
- `dialogDes` 是一个动态生成的提示文本，用于确认删除操作。

#### 加载动画

```javascript
<Loading loading={isNetLoading} />
```

- 渲染 `Loading` 组件，用于显示加载动画。
- `loading` 属性接收 `isNetLoading` 状态，表示是否正在进行网络请求。

### 总结

`MainUiLeftUpload` 组件实现了文件上传、显示上传的文件列表、以及无限滚动加载等功能。其主要逻辑如下：

1. **初始化数据**：在组件挂载时检查缓存数据，如果有缓存数据则使用缓存数据，否则调用 `getListData` 获取数据。
2. **事件监听**：在组件挂载时添加事件监听器，在组件卸载时移除事件监听器。
3. **选择项处理**：处理选择项和全选的逻辑，更新选中项和编辑状态。
4. **删除项处理**：处理删除选中项的逻辑，更新数据列表和缓存，并显示相应的提示信息。
5. **文件上传**：处理文件上传的逻辑，选择文件并上传到服务器。
6. **拖放事件处理**：处理拖放事件的逻辑，上传拖放的文件。
7. **渲染组件**：根据不同的状态渲染相应的组件和内容，包括空数据提示、数据列表、底部工具栏和加载动画。

通过这种方式，`MainUiLeftUpload` 组件能够提供文件上传和管理的功能，为用户提供流畅的操作体验。
