{
    :post-date "2020-01-18 10:42"
}

下载Windows版的panda-api压缩包，解压搜到自己需要的目录

然后在命令行下进入`panda-api`文件夹目录

然后运行命令，就可以访问文档服务了。

```.language-shell
.\panda-api.exe
```

如果遇到报错：
```.language-shell
Error: Os {code: 10013, kind: PermissionDenied, message:"以一种访问权限不允许的方式做了一个访问套接字的尝试。"}
```

这个原因是默认端口`9000`被占用了

我们可以改动启动端口：

```.language-json
.\panda-api.exe -p 9001
```




