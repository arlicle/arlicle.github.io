{
    :title "Jupyter 资源占用过多然后挂掉的问题"
    :post-date "2019-5-2 15:54"
}


使用jupyter进行数据训练或者预处理的时候，经常弹出出现一个错误:

```.language-bash
服务似乎挂掉了,但是会立刻重启的.
```

查看docker logs后发现服务端的报错信息为：

```.language-bash
IOPub data rate exceeded.
    The notebook server will temporarily stop sending output
    to the client in order to avoid crashing it.
    To change this limit, set the config variable
    `--NotebookApp.iopub_data_rate_limit`.

    Current values:
    NotebookApp.iopub_data_rate_limit=1000000.0 (bytes/sec)
    NotebookApp.rate_limit_window=3.0 (secs)
```

需要修改相关配置
```.language-bash
vi /root/.jupyter/jupyter_notebook_config.py

# add

c.NotebookApp.iopub_data_rate_limit=999999999
c.NotebookApp.rate_limit_window=99999
``` 

保存后重启服务或者重启 docker 容器即可。

如果多次大内存任务执行后，还是会挂掉的话，那么就是需要增加docker的内存配置。把docker的内存从默认2G 增加到6G 或更大，swap 从1G 增加到4G 或更大。然后重启 docker。
