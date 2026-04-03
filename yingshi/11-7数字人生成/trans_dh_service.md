## 问题分析

您遇到的是 `trans_dh_service` 模块在多进程环境下的导入问题<cite></cite>。根据代码库上下文,这个问题涉及到编译后的 `.so` 文件在子进程中无法被正确导入<cite></cite>。

## 核心问题

从代码来看,`service.trans_dh_service` 是一个编译后的模块,在 `run.py` 和 `app.py` 中被导入和使用 [1](#0-0) [2](#0-1) 。该模块内部使用了多进程来处理视频生成任务<cite></cite>。

## 解决方案

### 1. 在应用启动时设置多进程启动方法

在 `app.py` 或 `run.py` 的最开始(在导入 `trans_dh_service` 之前)添加:

```python
import multiprocessing
multiprocessing.set_start_method('spawn', force=True)
```

这会强制所有子进程使用 `spawn` 方法启动,而不是 `fork`<cite></cite>。`spawn` 方法会重新导入所有模块,避免了 fork 导致的模块导入问题<cite></cite>。

### 2. 设置 PYTHONPATH 环境变量

确保子进程能找到模块路径。在启动应用前设置:

```python
import os
import sys

# 将当前目录添加到 Python 路径
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)
```

### 3. 检查打包配置

从 `pack/packaging_script.py` 可以看到,项目使用 Cython 将 Python 文件编译为 `.so` 文件 [3](#0-2) 。确保 `trans_dh_service` 相关的模块在打包时被正确处理<cite></cite>。

### 4. 修改后的启动代码示例

对于 `app.py`:

```python
import multiprocessing
multiprocessing.set_start_method('spawn', force=True)

import os
import sys
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

# 然后再导入其他模块
import service.trans_dh_service
# ... 其他导入
```

## 为什么会出现这个问题

1. **Fork vs Spawn**: 默认情况下,Linux 使用 `fork` 方法创建子进程,它会复制父进程的内存空间,但编译后的 `.so` 文件可能无法正确处理这种复制<cite></cite>
2. **模块路径**: 子进程启动时可能无法访问父进程的模块搜索路径<cite></cite>
3. **编译模块特性**: `.so` 文件是编译后的二进制文件,在多进程环境下的行为与普通 Python 模块不同 [3](#0-2) 

## Notes

从日志文件 `log/dh.log` 可以看到系统在正常情况下的运行流程 [4](#0-3) ,任务处理涉及多个进程间的通信和队列操作<cite></cite>。您提到的 `_queue.Empty` 异常很可能是因为子进程启动失败导致队列没有数据<cite></cite>。

如果上述方案仍无法解决问题,可能需要考虑重新编译 `trans_dh_service` 模块,或者检查是否有其他依赖的 `.so` 文件也存在类似问题<cite></cite>。

Wiki pages you might want to explore:
- [System Architecture (Holasyb918/HeyGem-Linux-Python-Hack)](/wiki/Holasyb918/HeyGem-Linux-Python-Hack#4)
- [Models and Resources (Holasyb918/HeyGem-Linux-Python-Hack)](/wiki/Holasyb918/HeyGem-Linux-Python-Hack#4.3)

### Citations

**File:** run.py (L17-17)
```python
import service.trans_dh_service
```

**File:** app.py (L21-21)
```python
import service.trans_dh_service
```

**File:** pack/packaging_script.py (L53-77)
```python
def pack_to_so_and_del_src(path):
    '''
    将需要打包的.py脚本进行打包
    :param path:
    :return:
    '''
    if '.py' in path and '.pyc' not in path and '__init__.py' not in path:
        setup(
            ext_modules=cythonize(Extension(path.rsplit('/', 1)[1].rsplit('.', 1)[0], [path])),
            compiler_directives={'language_level': 3}
        )
        # path_os = os.getcwd().rsplit('/', 1)[0] + '/pack/build/lib.linux-x86_64-3.6'  # TODO
        path_os = os.getcwd().rsplit('/', 1)[0] + '/pack/build/lib.linux-x86_64-3.8'
        for j in os.listdir(path_os):
            # 将打好的包放入原文件夹下
            shutil.move(os.path.join(path_os, j), os.path.join(path.rsplit('/', 1)[0], j))
            # 删除.py文件
            # if path.rsplit('/', 1)[1] not in ['packaging_script.py', 'manage.py', 'client.py']:
            if path.rsplit('/', 1)[1] not in ['packaging_script.py', 'app.py', 'app_local.py', 'tts_config.py']:
                os.remove(path)
        # shutil.rmtree('./build')
    # 删除.c文件
    elif len(path.rsplit('.', 1)) == 2:
        if path.rsplit('.', 1)[1] == 'c':
            os.remove(path)
```

**File:** log/dh.log (L61-186)
```text
[2025-03-18 12:52:33,028] [process.py[line:108]] [INFO] [drivered_video >>>>>>>>>>>>>>>>>>>> 发送数据大小:[4], current_idx:64]
[2025-03-18 12:52:33,229] [process.py[line:108]] [INFO] [[24] -> chaofen  cost:0.21344351768493652s]
[2025-03-18 12:52:33,457] [process.py[line:108]] [INFO] [audio_transfer >>>>>>>>>>> 发送完成数据大小:4, frameId:24, cost:0.44205546379089355s]
[2025-03-18 12:52:33,479] [process.py[line:108]] [INFO] [>>> audio_transfer get message:28]
[2025-03-18 12:52:33,493] [process.py[line:108]] [INFO] [drivered_video >>>>>>>>>>>>>>>>>>>> 发送数据大小:[4], current_idx:68]
[2025-03-18 12:52:33,697] [process.py[line:108]] [INFO] [[28] -> chaofen  cost:0.21679949760437012s]
[2025-03-18 12:52:33,924] [process.py[line:108]] [INFO] [audio_transfer >>>>>>>>>>> 发送完成数据大小:4, frameId:28, cost:0.4448537826538086s]
[2025-03-18 12:52:33,946] [process.py[line:108]] [INFO] [>>> audio_transfer get message:32]
[2025-03-18 12:52:33,960] [process.py[line:108]] [INFO] [drivered_video >>>>>>>>>>>>>>>>>>>> 发送数据大小:[4], current_idx:72]
[2025-03-18 12:52:34,159] [process.py[line:108]] [INFO] [[32] -> chaofen  cost:0.21156740188598633s]
[2025-03-18 12:52:34,381] [process.py[line:108]] [INFO] [audio_transfer >>>>>>>>>>> 发送完成数据大小:4, frameId:32, cost:0.43474769592285156s]
[2025-03-18 12:52:34,403] [process.py[line:108]] [INFO] [>>> audio_transfer get message:36]
[2025-03-18 12:52:34,417] [process.py[line:108]] [INFO] [drivered_video >>>>>>>>>>>>>>>>>>>> 发送数据大小:[4], current_idx:76]
[2025-03-18 12:52:34,618] [process.py[line:108]] [INFO] [[36] -> chaofen  cost:0.21408891677856445s]
[2025-03-18 12:52:34,844] [process.py[line:108]] [INFO] [audio_transfer >>>>>>>>>>> 发送完成数据大小:4, frameId:36, cost:0.4406392574310303s]
[2025-03-18 12:52:34,867] [process.py[line:108]] [INFO] [>>> audio_transfer get message:40]
[2025-03-18 12:52:34,881] [process.py[line:108]] [INFO] [drivered_video >>>>>>>>>>>>>>>>>>>> 发送数据大小:[4], current_idx:80]
[2025-03-18 12:52:35,099] [process.py[line:108]] [INFO] [[40] -> chaofen  cost:0.23105645179748535s]
[2025-03-18 12:52:35,328] [process.py[line:108]] [INFO] [audio_transfer >>>>>>>>>>> 发送完成数据大小:4, frameId:40, cost:0.46161866188049316s]
[2025-03-18 12:52:35,350] [process.py[line:108]] [INFO] [>>> audio_transfer get message:44]
[2025-03-18 12:52:35,363] [process.py[line:108]] [INFO] [drivered_video >>>>>>>>>>>>>>>>>>>> 发送数据大小:[4], current_idx:84]
[2025-03-18 12:52:35,577] [process.py[line:108]] [INFO] [[44] -> chaofen  cost:0.22576594352722168s]
[2025-03-18 12:52:35,808] [process.py[line:108]] [INFO] [audio_transfer >>>>>>>>>>> 发送完成数据大小:4, frameId:44, cost:0.4577639102935791s]
[2025-03-18 12:52:35,832] [process.py[line:108]] [INFO] [>>> audio_transfer get message:48]
[2025-03-18 12:52:35,846] [process.py[line:108]] [INFO] [drivered_video >>>>>>>>>>>>>>>>>>>> 发送数据大小:[4], current_idx:88]
[2025-03-18 12:52:36,047] [process.py[line:108]] [INFO] [[48] -> chaofen  cost:0.21441864967346191s]
[2025-03-18 12:52:36,278] [process.py[line:108]] [INFO] [audio_transfer >>>>>>>>>>> 发送完成数据大小:4, frameId:48, cost:0.4459846019744873s]
[2025-03-18 12:52:36,301] [process.py[line:108]] [INFO] [>>> audio_transfer get message:52]
[2025-03-18 12:52:36,315] [process.py[line:108]] [INFO] [drivered_video >>>>>>>>>>>>>>>>>>>> 发送数据大小:[4], current_idx:92]
[2025-03-18 12:52:36,521] [process.py[line:108]] [INFO] [[52] -> chaofen  cost:0.2181704044342041s]
[2025-03-18 12:52:36,777] [process.py[line:108]] [INFO] [audio_transfer >>>>>>>>>>> 发送完成数据大小:4, frameId:52, cost:0.47586750984191895s]
[2025-03-18 12:52:36,798] [process.py[line:108]] [INFO] [>>> audio_transfer get message:56]
[2025-03-18 12:52:36,817] [process.py[line:108]] [INFO] [drivered_video >>>>>>>>>>>>>>>>>>>> 发送数据大小:[4], current_idx:96]
[2025-03-18 12:52:37,014] [process.py[line:108]] [INFO] [[56] -> chaofen  cost:0.2147221565246582s]
[2025-03-18 12:52:37,247] [process.py[line:108]] [INFO] [audio_transfer >>>>>>>>>>> 发送完成数据大小:4, frameId:56, cost:0.4486660957336426s]
[2025-03-18 12:52:37,266] [process.py[line:108]] [INFO] [>>> audio_transfer get message:60]
[2025-03-18 12:52:37,281] [process.py[line:108]] [INFO] [drivered_video >>>>>>>>>>>>>>>>>>>> 发送数据大小:[4], current_idx:100]
[2025-03-18 12:52:37,483] [process.py[line:108]] [INFO] [[60] -> chaofen  cost:0.21598410606384277s]
[2025-03-18 12:52:37,703] [process.py[line:108]] [INFO] [audio_transfer >>>>>>>>>>> 发送完成数据大小:4, frameId:60, cost:0.43683695793151855s]
[2025-03-18 12:52:37,722] [process.py[line:108]] [INFO] [>>> audio_transfer get message:64]
[2025-03-18 12:52:37,736] [process.py[line:108]] [INFO] [drivered_video >>>>>>>>>>>>>>>>>>>> 发送数据大小:[4], current_idx:104]
[2025-03-18 12:52:37,941] [process.py[line:108]] [INFO] [[64] -> chaofen  cost:0.2180624008178711s]
[2025-03-18 12:52:38,163] [process.py[line:108]] [INFO] [audio_transfer >>>>>>>>>>> 发送完成数据大小:4, frameId:64, cost:0.4412345886230469s]
[2025-03-18 12:52:38,183] [process.py[line:108]] [INFO] [>>> audio_transfer get message:68]
[2025-03-18 12:52:38,197] [process.py[line:108]] [INFO] [drivered_video >>>>>>>>>>>>>>>>>>>> 发送数据大小:[4], current_idx:108]
[2025-03-18 12:52:38,397] [process.py[line:108]] [INFO] [[68] -> chaofen  cost:0.21321654319763184s]
[2025-03-18 12:52:38,637] [process.py[line:108]] [INFO] [audio_transfer >>>>>>>>>>> 发送完成数据大小:4, frameId:68, cost:0.45404863357543945s]
[2025-03-18 12:52:38,656] [process.py[line:108]] [INFO] [>>> audio_transfer get message:72]
[2025-03-18 12:52:38,670] [process.py[line:108]] [INFO] [drivered_video >>>>>>>>>>>>>>>>>>>> 发送数据大小:[4], current_idx:112]
[2025-03-18 12:52:38,877] [process.py[line:108]] [INFO] [[72] -> chaofen  cost:0.21999263763427734s]
[2025-03-18 12:52:39,100] [process.py[line:108]] [INFO] [audio_transfer >>>>>>>>>>> 发送完成数据大小:4, frameId:72, cost:0.4440436363220215s]
[2025-03-18 12:52:39,119] [process.py[line:108]] [INFO] [>>> audio_transfer get message:76]
[2025-03-18 12:52:39,133] [process.py[line:108]] [INFO] [drivered_video >>>>>>>>>>>>>>>>>>>> 发送数据大小:[4], current_idx:116]
[2025-03-18 12:52:39,347] [process.py[line:108]] [INFO] [[76] -> chaofen  cost:0.22693967819213867s]
[2025-03-18 12:52:39,568] [process.py[line:108]] [INFO] [audio_transfer >>>>>>>>>>> 发送完成数据大小:4, frameId:76, cost:0.4492220878601074s]
[2025-03-18 12:52:39,586] [process.py[line:108]] [INFO] [>>> audio_transfer get message:80]
[2025-03-18 12:52:39,601] [process.py[line:108]] [INFO] [drivered_video >>>>>>>>>>>>>>>>>>>> 发送数据大小:[4], current_idx:120]
[2025-03-18 12:52:39,801] [process.py[line:108]] [INFO] [[80] -> chaofen  cost:0.21407222747802734s]
[2025-03-18 12:52:40,024] [process.py[line:108]] [INFO] [audio_transfer >>>>>>>>>>> 发送完成数据大小:4, frameId:80, cost:0.4377562999725342s]
[2025-03-18 12:52:40,052] [process.py[line:108]] [INFO] [>>> audio_transfer get message:84]
[2025-03-18 12:52:40,068] [process.py[line:108]] [INFO] [drivered_video >>>>>>>>>>>>>>>>>>>> 发送数据大小:[4], current_idx:124]
[2025-03-18 12:52:40,270] [process.py[line:108]] [INFO] [[84] -> chaofen  cost:0.21637320518493652s]
[2025-03-18 12:52:40,494] [process.py[line:108]] [INFO] [audio_transfer >>>>>>>>>>> 发送完成数据大小:4, frameId:84, cost:0.44118523597717285s]
[2025-03-18 12:52:40,513] [process.py[line:108]] [INFO] [>>> audio_transfer get message:88]
[2025-03-18 12:52:40,527] [process.py[line:108]] [INFO] [drivered_video >>>>>>>>>>>>>>>>>>>> 发送数据大小:[4], current_idx:128]
[2025-03-18 12:52:40,731] [process.py[line:108]] [INFO] [[88] -> chaofen  cost:0.2170412540435791s]
[2025-03-18 12:52:40,951] [process.py[line:108]] [INFO] [audio_transfer >>>>>>>>>>> 发送完成数据大小:4, frameId:88, cost:0.4383111000061035s]
[2025-03-18 12:52:40,971] [process.py[line:108]] [INFO] [>>> audio_transfer get message:92]
[2025-03-18 12:52:40,984] [process.py[line:108]] [INFO] [drivered_video >>>>>>>>>>>>>>>>>>>> 发送数据大小:[4], current_idx:132]
[2025-03-18 12:52:41,187] [process.py[line:108]] [INFO] [[92] -> chaofen  cost:0.2148122787475586s]
[2025-03-18 12:52:41,416] [process.py[line:108]] [INFO] [audio_transfer >>>>>>>>>>> 发送完成数据大小:4, frameId:92, cost:0.4454326629638672s]
[2025-03-18 12:52:41,439] [process.py[line:108]] [INFO] [>>> audio_transfer get message:96]
[2025-03-18 12:52:41,451] [process.py[line:108]] [INFO] [drivered_video >>>>>>>>>>>>>>>>>>>> 发送数据大小:[4], current_idx:136]
[2025-03-18 12:52:41,663] [process.py[line:108]] [INFO] [[96] -> chaofen  cost:0.222761869430542s]
[2025-03-18 12:52:41,887] [process.py[line:108]] [INFO] [audio_transfer >>>>>>>>>>> 发送完成数据大小:4, frameId:96, cost:0.4477369785308838s]
[2025-03-18 12:52:41,906] [process.py[line:108]] [INFO] [>>> audio_transfer get message:100]
[2025-03-18 12:52:41,920] [process.py[line:108]] [INFO] [drivered_video >>>>>>>>>>>>>>>>>>>> 发送数据大小:[4], current_idx:140]
[2025-03-18 12:52:42,123] [process.py[line:108]] [INFO] [[100] -> chaofen  cost:0.21576929092407227s]
[2025-03-18 12:52:42,359] [process.py[line:108]] [INFO] [audio_transfer >>>>>>>>>>> 发送完成数据大小:4, frameId:100, cost:0.4525878429412842s]
[2025-03-18 12:52:42,379] [process.py[line:108]] [INFO] [>>> audio_transfer get message:104]
[2025-03-18 12:52:42,394] [process.py[line:108]] [INFO] [drivered_video >>>>>>>>>>>>>>>>>>>> 发送数据大小:[4], current_idx:144]
[2025-03-18 12:52:42,596] [process.py[line:108]] [INFO] [[104] -> chaofen  cost:0.21553897857666016s]
[2025-03-18 12:52:42,836] [process.py[line:108]] [INFO] [audio_transfer >>>>>>>>>>> 发送完成数据大小:4, frameId:104, cost:0.45633435249328613s]
[2025-03-18 12:52:42,855] [process.py[line:108]] [INFO] [>>> audio_transfer get message:108]
[2025-03-18 12:52:42,870] [process.py[line:108]] [INFO] [drivered_video >>>>>>>>>>>>>>>>>>>> 发送数据大小:[4], current_idx:148]
[2025-03-18 12:52:42,873] [process.py[line:108]] [INFO] [append imgs over]
[2025-03-18 12:52:42,879] [process.py[line:108]] [INFO] [drivered_video >>>>>>>>>>>>>>>>>>>> 发送数据结束]
[2025-03-18 12:52:43,073] [process.py[line:108]] [INFO] [[108] -> chaofen  cost:0.21662592887878418s]
[2025-03-18 12:52:43,297] [process.py[line:108]] [INFO] [audio_transfer >>>>>>>>>>> 发送完成数据大小:4, frameId:108, cost:0.4421381950378418s]
[2025-03-18 12:52:43,318] [process.py[line:108]] [INFO] [>>> audio_transfer get message:112]
[2025-03-18 12:52:43,332] [process.py[line:108]] [INFO] [[1002]任务预处理进程结束]
[2025-03-18 12:52:43,531] [process.py[line:108]] [INFO] [[112] -> chaofen  cost:0.21228814125061035s]
[2025-03-18 12:52:43,791] [process.py[line:108]] [INFO] [audio_transfer >>>>>>>>>>> 发送完成数据大小:4, frameId:112, cost:0.47336626052856445s]
[2025-03-18 12:52:43,811] [process.py[line:108]] [INFO] [>>> audio_transfer get message:116]
[2025-03-18 12:52:44,034] [process.py[line:108]] [INFO] [[116] -> chaofen  cost:0.2223985195159912s]
[2025-03-18 12:52:44,262] [process.py[line:108]] [INFO] [audio_transfer >>>>>>>>>>> 发送完成数据大小:4, frameId:116, cost:0.4509873390197754s]
[2025-03-18 12:52:44,281] [process.py[line:108]] [INFO] [>>> audio_transfer get message:120]
[2025-03-18 12:52:44,499] [process.py[line:108]] [INFO] [[120] -> chaofen  cost:0.21637916564941406s]
[2025-03-18 12:52:44,742] [process.py[line:108]] [INFO] [audio_transfer >>>>>>>>>>> 发送完成数据大小:4, frameId:120, cost:0.46120476722717285s]
[2025-03-18 12:52:44,762] [process.py[line:108]] [INFO] [>>> audio_transfer get message:124]
[2025-03-18 12:52:44,981] [process.py[line:108]] [INFO] [[124] -> chaofen  cost:0.21886157989501953s]
[2025-03-18 12:52:45,240] [process.py[line:108]] [INFO] [audio_transfer >>>>>>>>>>> 发送完成数据大小:4, frameId:124, cost:0.4781684875488281s]
[2025-03-18 12:52:45,258] [process.py[line:108]] [INFO] [>>> audio_transfer get message:128]
[2025-03-18 12:52:45,474] [process.py[line:108]] [INFO] [[128] -> chaofen  cost:0.21480226516723633s]
[2025-03-18 12:52:45,708] [process.py[line:108]] [INFO] [audio_transfer >>>>>>>>>>> 发送完成数据大小:4, frameId:128, cost:0.44920992851257324s]
[2025-03-18 12:52:45,726] [process.py[line:108]] [INFO] [>>> audio_transfer get message:132]
[2025-03-18 12:52:45,943] [process.py[line:108]] [INFO] [[132] -> chaofen  cost:0.21567535400390625s]
[2025-03-18 12:52:46,181] [process.py[line:108]] [INFO] [audio_transfer >>>>>>>>>>> 发送完成数据大小:4, frameId:132, cost:0.45519399642944336s]
[2025-03-18 12:52:46,200] [process.py[line:108]] [INFO] [>>> audio_transfer get message:136]
[2025-03-18 12:52:46,418] [process.py[line:108]] [INFO] [[136] -> chaofen  cost:0.21763992309570312s]
[2025-03-18 12:52:46,662] [process.py[line:108]] [INFO] [audio_transfer >>>>>>>>>>> 发送完成数据大小:4, frameId:136, cost:0.4619452953338623s]
[2025-03-18 12:52:46,681] [process.py[line:108]] [INFO] [>>> audio_transfer get message:140]
[2025-03-18 12:52:46,900] [process.py[line:108]] [INFO] [[140] -> chaofen  cost:0.21794748306274414s]
[2025-03-18 12:52:47,146] [process.py[line:108]] [INFO] [audio_transfer >>>>>>>>>>> 发送完成数据大小:4, frameId:140, cost:0.4646177291870117s]
[2025-03-18 12:52:47,166] [process.py[line:108]] [INFO] [>>> audio_transfer get message:144]
[2025-03-18 12:52:47,382] [process.py[line:108]] [INFO] [[144] -> chaofen  cost:0.21491503715515137s]
[2025-03-18 12:52:47,619] [process.py[line:108]] [INFO] [audio_transfer >>>>>>>>>>> 发送完成数据大小:4, frameId:144, cost:0.4536001682281494s]
[2025-03-18 12:52:47,639] [process.py[line:108]] [INFO] [>>> audio_transfer get message:148]
[2025-03-18 12:52:47,857] [process.py[line:108]] [INFO] [[148] -> chaofen  cost:0.21780657768249512s]
[2025-03-18 12:52:48,098] [process.py[line:108]] [INFO] [audio_transfer >>>>>>>>>>> 发送完成数据大小:4, frameId:148, cost:0.459348201751709s]
[2025-03-18 12:52:48,104] [process.py[line:108]] [INFO] [>>> audio_transfer get exception msg:-1]
[2025-03-18 12:52:48,105] [process.py[line:108]] [INFO] [[1002]任务数字人图片处理已完成]
[2025-03-18 12:52:48,146] [run.py[line:43]] [INFO] [Custom VideoWriter [1002]视频帧队列处理已结束]
[2025-03-18 12:52:48,151] [run.py[line:46]] [INFO] [Custom VideoWriter Silence Video saved in /mnt/nfs/bj4-v100-23/data1/yubosun/git_proj/heygem/heygem_ori_so/1002-t.mp4]
[2025-03-18 12:52:48,155] [run.py[line:118]] [INFO] [Custom command:ffmpeg -loglevel warning -y -i ./example/audio.wav -i ./1002-t.mp4 -c:a aac -c:v libx264 -crf 15 -strict -2 ./1002-r.mp4]
```
