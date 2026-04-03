# DeepWiki Q&A with Code Context for Repository: Holasyb918/HeyGem-Linux-Python-Hack
## Q1
问题分析总结
1. 任务 1483 的请求状态
13:46:24 开始调用数字人生成服务
服务日志中没有看到 13:46 之后的新请求
可能原因：
请求未到达服务（网络问题）
服务未记录日志（日志级别问题）
请求被阻塞（服务处理能力问题）
2. 多进程模块导入问题
根本原因：多进程使用 fork 方法启动子进程时，子进程无法找到 trans_dh_service 模块
问题表现：
ModuleNotFoundError: No module named 'trans_dh_service'
子进程启动失败，产生僵尸进程
队列为空异常：_queue.Empty
所有任务因此失败
3. 修复建议
由于 trans_dh_service 是编译后的 .so 文件，无法直接修改其多进程启动逻辑。建议：
在 fastapi_app.py 中设置多进程启动方法为 spawn，并确保子进程可以正确导入模块
在 fastapi_app.py 中设置环境变量，确保子进程可以找到模块
检查并修复 trans_dh_service 的多进程启动逻辑（需要源代码或重新编译）
4. 当前状态
服务运行中，但所有任务都失败
多进程模块导入问题导致子进程启动失败
需要修复多进程启动逻辑才能恢复正常，这个如何解决？
### Answer
## 问题分析

您遇到的是 `trans_dh_service` 模块在多进程环境下的导入问题<cite></cite>。根据代码库上下文,这个问题涉及到编译后的 `.so` 文件在子进程中无法被正确导入<cite></cite>。

## 核心问题

从代码来看,`service.trans_dh_service` 是一个编译后的模块,在 `run.py` 和 `app.py` 中被导入和使用 HeyGem-Linux-Python-Hack:17-17 HeyGem-Linux-Python-Hack:21-21 。该模块内部使用了多进程来处理视频生成任务<cite></cite>。

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

从 `pack/packaging_script.py` 可以看到,项目使用 Cython 将 Python 文件编译为 `.so` 文件 HeyGem-Linux-Python-Hack:53-77 。确保 `trans_dh_service` 相关的模块在打包时被正确处理<cite></cite>。

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
3. **编译模块特性**: `.so` 文件是编译后的二进制文件,在多进程环境下的行为与普通 Python 模块不同 HeyGem-Linux-Python-Hack:53-77 

## Notes

从日志文件 `log/dh.log` 可以看到系统在正常情况下的运行流程 HeyGem-Linux-Python-Hack:61-186 ,任务处理涉及多个进程间的通信和队列操作<cite></cite>。您提到的 `_queue.Empty` 异常很可能是因为子进程启动失败导致队列没有数据<cite></cite>。

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
## Q2
数字人生成服务处理中（14:01:05 开始）
数字人生成服务收到请求（任务ID: dfa9c34a-7e47-4c54-9f78-6d79e3c7700b）
开始执行 work 方法
预处理完成（14:01:06）
状态：正在等待数字人生成服务完成
问题分析
缺少 human_pack_new_with_transition 的详细日志
日志显示调用了 human_pack_new_with_transition，但没有该函数内部的日志
可能原因：
函数未执行到日志输出位置
日志未刷新
函数执行异常但未记录
数字人生成服务处理中
服务已收到请求并开始处理
预处理已完成
但之后没有新的日志，可能卡在 work 方法中
多进程模块导入问题
从之前的错误日志看，仍有 _queue.Empty 异常
说明多进程模块导入问题可能未完全解决
视频截取文件异常
combined_cut.mp4 只有 262 字节，时长为 0
说明视频截取可能失败
### Answer
## 问题分析

根据您提供的日志信息,系统在预处理完成后卡住,没有后续日志输出<cite></cite>。这涉及到 `run.py` 和 `app.py` 中的 `TransDhTask.work()` 方法的执行流程 HeyGem-Linux-Python-Hack:180-184 。

## 核心问题定位

### 1. 视频截取失败

`combined_cut.mp4` 只有 262 字节且时长为 0,说明视频预处理阶段的 FFmpeg 命令执行失败<cite></cite>。从正常日志可以看到,预处理阶段会执行两个 FFmpeg 命令 HeyGem-Linux-Python-Hack:15-17 :

1. 视频格式化: `ffmpeg -loglevel warning -i {video} -crf 15 -vcodec copy -an -y {output}`
2. 音频格式化: `ffmpeg -loglevel warning -i {audio} -ac 1 -ar 16000 -acodec pcm_s16le -y {output}`

如果视频文件损坏或格式不支持,FFmpeg 会失败但可能不会抛出异常<cite></cite>。

### 2. 多进程队列问题未解决

`_queue.Empty` 异常表明子进程没有向队列写入数据<cite></cite>。从日志可以看到正常流程中,多个进程会通过队列通信 HeyGem-Linux-Python-Hack:22-30 :

- `init_wh_process` 进程
- `drivered_video` 进程  
- `audio_transfer` 进程

如果这些进程因为模块导入问题启动失败,队列就会一直为空<cite></cite>。

### 3. 日志缺失原因

`human_pack_new_with_transition` 函数内部没有日志,可能是因为<cite></cite>:
- 该函数在编译后的 `.so` 文件中,日志配置可能不同
- 函数执行时发生了未捕获的异常
- 进程在日志刷新前就崩溃了

## 解决方案

### 立即检查项

1. **验证输入文件**:
```bash
# 检查视频文件是否完整
ffmpeg -i your_video.mp4 -f null -
# 检查音频文件
ffmpeg -i your_audio.wav -f null -
```

2. **检查多进程启动方法设置**:

确认在 `app.py` 或 `run.py` 开头已添加 HeyGem-Linux-Python-Hack:1-17 :
```python
import multiprocessing
multiprocessing.set_start_method('spawn', force=True)
```

注意:这必须在导入 `service.trans_dh_service` **之前**设置<cite></cite>。

3. **增加调试日志**:

在 `write_video` 函数中添加更多日志 HeyGem-Linux-Python-Hack:45-62 :
```python
def write_video(...):
    logger.info(f"VideoWriter starting for work_id: {work_id}")
    logger.info(f"Queue object: {output_imgs_queue}")
    # ... 原有代码
```

### 根本解决方案

基于 `run.py` 中的实现 HeyGem-Linux-Python-Hack:165-184 ,系统使用自定义的 `write_video` 函数替换了 `trans_dh_service` 中的默认实现。如果多进程问题持续存在,建议:

1. **检查 Python 路径**:
```python
import sys
import os
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)
logger.info(f"Python path: {sys.path}")
```

2. **验证子进程启动**:
在 `write_video` 函数开始处添加 HeyGem-Linux-Python-Hack:63-76 :
```python
logger.info(f"Current process PID: {os.getpid()}")
logger.info(f"Parent process PID: {os.getppid()}")
```

3. **临时禁用 exit(0)**:

注意到 `run.py` 中有一个 `exit(0)` 调用 HeyGem-Linux-Python-Hack:144-147 ,这会导致进程提前退出。这可能是问题所在,应该移除或注释掉这行。

## 紧急排查步骤

1. 检查是否有僵尸进程: `ps aux | grep python | grep defunct`
2. 查看系统日志: `dmesg | tail -50` (查找 OOM 或段错误)
3. 验证 FFmpeg 可用性: `which ffmpeg && ffmpeg -version`
4. 检查磁盘空间: `df -h`

## Notes

从 `app.py` 的实现可以看到 HeyGem-Linux-Python-Hack:151-157 ,系统在初始化时会等待 5 秒。如果您的服务刚启动不久,可能还在初始化阶段。另外,`run.py` 中也有一个 10 秒的 sleep HeyGem-Linux-Python-Hack:181-181 ,这是为了确保模块完全加载。

如果问题仍未解决,建议检查 `trans_dh_service.so` 文件的编译配置 HeyGem-Linux-Python-Hack:1-29 ,可能需要重新编译以支持 `spawn` 启动方式。

Wiki pages you might want to explore:
- [Direct Audio-Video Processing (Holasyb918/HeyGem-Linux-Python-Hack)](/wiki/Holasyb918/HeyGem-Linux-Python-Hack#3.1)
### Citations
**File:** run.py (L1-17)
```python
import argparse
import gc
import json
import os
import subprocess
import sys
import threading
import time
import traceback
import uuid
from enum import Enum

import queue
import cv2
from flask import Flask, request

import service.trans_dh_service
```
**File:** run.py (L45-62)
```python
def write_video(
    output_imgs_queue,
    temp_dir,
    result_dir,
    work_id,
    audio_path,
    result_queue,
    width,
    height,
    fps,
    watermark_switch=0,
    digital_auth=0,
):
    output_mp4 = os.path.join(temp_dir, "{}-t.mp4".format(work_id))
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    result_path = os.path.join(result_dir, "{}-r.mp4".format(work_id))
    video_write = cv2.VideoWriter(output_mp4, fourcc, fps, (width, height))
    print("Custom VideoWriter init done")
```
**File:** run.py (L63-76)
```python
    try:
        while True:
            state, reason, value_ = output_imgs_queue.get()
            if type(state) == bool and state == True:
                logger.info(
                    "Custom VideoWriter [{}]视频帧队列处理已结束".format(work_id)
                )
                logger.info(
                    "Custom VideoWriter Silence Video saved in {}".format(
                        os.path.realpath(output_mp4)
                    )
                )
                video_write.release()
                break
```
**File:** run.py (L144-147)
```python
        print("###### Custom Video Writer write over")
        print(f"###### Video result saved in {os.path.realpath(result_path)}")
        exit(0)
        result_queue.put([True, result_path])
```
**File:** run.py (L165-184)
```python
service.trans_dh_service.write_video = write_video


def main():
    opt = get_args()
    if not os.path.exists(opt.audio_path):
        audio_url = "example/audio.wav"
    else:
        audio_url = opt.audio_path

    if not os.path.exists(opt.video_path):
        video_url = "example/video.mp4"
    else:
        video_url = opt.video_path
    sys.argv = [sys.argv[0]]
    task = service.trans_dh_service.TransDhTask()
    time.sleep(10) # somehow, this works...

    code = "1004"
    task.work(audio_url, video_url, code, 0, 0, 0, 0)
```
**File:** log/dh.log (L15-17)
```text
[2025-03-18 12:52:07,646] [run.py[line:147]] [INFO] [[1002] -> ffmpeg video: ffmpeg -loglevel warning -i ./example/video.mp4 -crf 15 -vcodec copy -an -y ./1002_format.mp4]
[2025-03-18 12:52:07,801] [run.py[line:147]] [INFO] [[1002] -> ffmpeg audio: ffmpeg -loglevel warning -i ./example/audio.wav -ac 1 -ar 16000 -acodec pcm_s16le -y  ./1002_format.wav]
[2025-03-18 12:52:07,922] [run.py[line:147]] [INFO] [[1002] -> 预处理耗时:0.35927414894104004s]
```
**File:** log/dh.log (L22-30)
```text
[2025-03-18 12:52:21,453] [process.py[line:108]] [INFO] [>>> 数字人图片处理进程启动]
[2025-03-18 12:52:24,015] [process.py[line:108]] [INFO] [[1002]任务视频驱动队列启动 batch_size:4, len:150]
[2025-03-18 12:52:24,050] [process.py[line:108]] [INFO] [drivered_video >>>>>>>>>>>>>>>>>>>> 开始循环]
[2025-03-18 12:52:24,085] [process.py[line:108]] [INFO] [drivered_video >>>>>>>>>>>>>>>>>>>> 发送数据大小:[4], current_idx:4]
[2025-03-18 12:52:24,112] [process.py[line:108]] [INFO] [drivered_video >>>>>>>>>>>>>>>>>>>> 发送数据大小:[4], current_idx:8]
[2025-03-18 12:52:24,122] [process.py[line:108]] [INFO] [>>> audio_transfer get message:4]
[2025-03-18 12:52:24,139] [process.py[line:108]] [INFO] [drivered_video >>>>>>>>>>>>>>>>>>>> 发送数据大小:[4], current_idx:12]
[2025-03-18 12:52:24,148] [process.py[line:108]] [INFO] [drivered_video >>>>>>>>>>>>>>>>>>>> 发送数据大小:[4], current_idx:16]
[2025-03-18 12:52:24,161] [process.py[line:108]] [INFO] [drivered_video >>>>>>>>>>>>>>>>>>>> 发送数据大小:[4], current_idx:20]
```
**File:** app.py (L151-157)
```python
class VideoProcessor:
    def __init__(self):
        self.task = service.trans_dh_service.TransDhTask()
        self.basedir = GlobalConfig.instance().result_dir
        self.is_initialized = False
        self._initialize_service()
        print("VideoProcessor init done")
```
**File:** pack/packaging_script.py (L1-29)
```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from distutils.core import setup
from Cython.Build import cythonize
from distutils.extension import Extension
import shutil
import os
from multiprocessing import Pool




def packaged_search(path, directory_file=None):
    '''
    遍历当前目录下文件及文件夹
    :param path:
    :param directory_file:
    :return:
    '''
    if directory_file:
        for i in os.listdir(path):
            if i == directory_file:
                path = os.path.join(path, directory_file)
                pack_so(path)
            elif os.path.isdir(os.path.join(path, i)):
                packaged_search(os.path.join(path, i), directory_file)
    else:
        pack_so(path)
```
## Q3
从之前的错误日志看，仍有 _queue.Empty 异常
说明多进程模块导入问题可能未完全解决
### Answer
## 问题分析

您提到的 `_queue.Empty` 异常表明多进程间的队列通信仍然存在问题<cite></cite>。这个问题的根源在于 `trans_dh_service` 模块内部创建的子进程无法正常启动或通信<cite></cite>。

## 核心问题

从代码来看,`run.py` 和 `app.py` 都导入了 `service.trans_dh_service` 模块 HeyGem-Linux-Python-Hack:17-17 HeyGem-Linux-Python-Hack:21-21 。这个模块是编译后的 `.so` 文件,内部使用多进程处理视频生成任务<cite></cite>。

从正常的日志流程可以看到,系统会启动多个进程通过队列通信 HeyGem-Linux-Python-Hack:19-29 :
- `init_wh_process` 进程
- `drivered_video` 进程  
- `audio_transfer` 进程

当这些进程无法正常启动时,队列就会一直为空,导致 `_queue.Empty` 异常<cite></cite>。

## 为什么之前的解决方案可能不够

您之前可能已经尝试在 `run.py` 或 `app.py` 开头添加了 `multiprocessing.set_start_method('spawn', force=True)`<cite></cite>。但这个设置**必须在导入 `service.trans_dh_service` 之前**执行才有效<cite></cite>。

查看当前代码结构 HeyGem-Linux-Python-Hack:1-17 :

```python
import argparse
import gc
import json
import os
import subprocess
import sys
import threading
import time
import traceback
import uuid
from enum import Enum

import queue
import cv2
from flask import Flask, request

import service.trans_dh_service  # 这里导入了模块
```

如果在这之后才设置 `multiprocessing.set_start_method()`,就已经太晚了<cite></cite>。

## 正确的解决方案

### 1. 修改导入顺序

在 `run.py` 的**最开头**添加多进程设置 HeyGem-Linux-Python-Hack:1-1 :

```python
import multiprocessing
multiprocessing.set_start_method('spawn', force=True)

import argparse
import gc
# ... 其他导入
import service.trans_dh_service
```

同样在 `app.py` 中也要这样做 HeyGem-Linux-Python-Hack:1-21 。

### 2. 确保模块路径可访问

在设置多进程方法后,立即添加路径配置:

```python
import multiprocessing
multiprocessing.set_start_method('spawn', force=True)

import os
import sys
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

# 然后再导入其他模块
import service.trans_dh_service
```

### 3. 验证子进程是否正常启动

在 `write_video` 函数中添加诊断日志 HeyGem-Linux-Python-Hack:45-62 :

```python
def write_video(
    output_imgs_queue,
    temp_dir,
    result_dir,
    work_id,
    audio_path,
    result_queue,
    width,
    height,
    fps,
    watermark_switch=0,
    digital_auth=0,
):
    import os
    logger.info(f"write_video 进程启动 - PID: {os.getpid()}, 父进程: {os.getppid()}")
    logger.info(f"队列对象: {output_imgs_queue}")
    
    # ... 原有代码
```

## 额外排查步骤

1. **检查是否有僵尸进程**:
```bash
ps aux | grep python | grep defunct
```

2. **查看进程树**:
```bash
pstree -p $(pgrep -f "python.*run.py")
```

3. **监控队列状态**:
在 `write_video` 函数的 while 循环中添加超时机制 HeyGem-Linux-Python-Hack:64-76 :

```python
try:
    state, reason, value_ = output_imgs_queue.get(timeout=30)  # 添加30秒超时
    # ... 处理逻辑
except queue.Empty:
    logger.error(f"队列超时 - 30秒内没有收到数据")
    raise
```

## Notes

注意 `run.py` 中有一个 `exit(0)` 调用 HeyGem-Linux-Python-Hack:146-146 ,这会导致进程提前退出<cite></cite>。这可能会干扰正常的进程清理流程,建议将其移除或改为 `return`<cite></cite>。

如果上述方案仍无法解决问题,可能需要检查 `trans_dh_service.so` 的编译配置 HeyGem-Linux-Python-Hack:53-77 ,确保它支持 `spawn` 启动方式<cite></cite>。

Wiki pages you might want to explore:
- [Direct Audio-Video Processing (Holasyb918/HeyGem-Linux-Python-Hack)](/wiki/Holasyb918/HeyGem-Linux-Python-Hack#3.1)
### Citations
**File:** run.py (L1-17)
```python
import argparse
import gc
import json
import os
import subprocess
import sys
import threading
import time
import traceback
import uuid
from enum import Enum

import queue
import cv2
from flask import Flask, request

import service.trans_dh_service
```
**File:** run.py (L45-62)
```python
def write_video(
    output_imgs_queue,
    temp_dir,
    result_dir,
    work_id,
    audio_path,
    result_queue,
    width,
    height,
    fps,
    watermark_switch=0,
    digital_auth=0,
):
    output_mp4 = os.path.join(temp_dir, "{}-t.mp4".format(work_id))
    fourcc = cv2.VideoWriter_fourcc(*"mp4v")
    result_path = os.path.join(result_dir, "{}-r.mp4".format(work_id))
    video_write = cv2.VideoWriter(output_mp4, fourcc, fps, (width, height))
    print("Custom VideoWriter init done")
```
**File:** run.py (L64-76)
```python
        while True:
            state, reason, value_ = output_imgs_queue.get()
            if type(state) == bool and state == True:
                logger.info(
                    "Custom VideoWriter [{}]视频帧队列处理已结束".format(work_id)
                )
                logger.info(
                    "Custom VideoWriter Silence Video saved in {}".format(
                        os.path.realpath(output_mp4)
                    )
                )
                video_write.release()
                break
```
**File:** run.py (L146-146)
```python
        exit(0)
```
**File:** app.py (L1-21)
```python
import argparse
import gc
import json
import os

os.environ["GRADIO_SERVER_NAME"] = "0.0.0.0"
import subprocess
import threading
import time
import traceback
import uuid
from enum import Enum
import queue
import shutil
from functools import partial

import cv2
import gradio as gr
from flask import Flask, request

import service.trans_dh_service
```
**File:** log/dh.log (L19-29)
```text
[2025-03-18 12:52:11,702] [process.py[line:108]] [INFO] [>>> init_wh_process进程启动]
[2025-03-18 12:52:20,087] [process.py[line:108]] [INFO] [[1002]init_wh result :[0.8809176216714891]， cost: 8.382684469223022 s]
[2025-03-18 12:52:20,090] [run.py[line:147]] [INFO] [[1002] -> wh: [0.8809176216714891]]
[2025-03-18 12:52:21,453] [process.py[line:108]] [INFO] [>>> 数字人图片处理进程启动]
[2025-03-18 12:52:24,015] [process.py[line:108]] [INFO] [[1002]任务视频驱动队列启动 batch_size:4, len:150]
[2025-03-18 12:52:24,050] [process.py[line:108]] [INFO] [drivered_video >>>>>>>>>>>>>>>>>>>> 开始循环]
[2025-03-18 12:52:24,085] [process.py[line:108]] [INFO] [drivered_video >>>>>>>>>>>>>>>>>>>> 发送数据大小:[4], current_idx:4]
[2025-03-18 12:52:24,112] [process.py[line:108]] [INFO] [drivered_video >>>>>>>>>>>>>>>>>>>> 发送数据大小:[4], current_idx:8]
[2025-03-18 12:52:24,122] [process.py[line:108]] [INFO] [>>> audio_transfer get message:4]
[2025-03-18 12:52:24,139] [process.py[line:108]] [INFO] [drivered_video >>>>>>>>>>>>>>>>>>>> 发送数据大小:[4], current_idx:12]
[2025-03-18 12:52:24,148] [process.py[line:108]] [INFO] [drivered_video >>>>>>>>>>>>>>>>>>>> 发送数据大小:[4], current_idx:16]
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
