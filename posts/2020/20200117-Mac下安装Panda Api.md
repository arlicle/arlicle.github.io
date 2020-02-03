{
    :post-date "2020-01-17 19:15"
}

下载Mac版的panda-api文件

创建文件夹`~/.panda/bin/`

把panda-api 复制到 `~/.panda/bin/` 文件夹中

```.language-shell
cp panda-api ~/.panda/bin/panda
```

修改`~/.bash_profile`文件，在文件开头增加

```.language-shell
export PATH=$HOME/.panda/bin:$PATH
```

然后执行
```.language-shell
source ~/.bash_profile
```

这样，我们就可以到接口文档文件夹下，直接执行命令 `panda` 就可以把接口文档服务运行起来，在线浏览接口文档，或者请求接口文档的相关接口数据了。


如果你使用的是`zsh`，那么应该编辑文件 `~/.zprofile` 或者 `~/.zshrc`， 然后增加

```.language-shell
export PATH=$HOME/.panda/bin:$PATH
```

