{
    :title "国内Rustcc 源 专属crates.io镜像"
    :post-date "2019-8-8 10:14"
    :slug "rust "
}


之前rust crates.io的官方源，国内访问特别忙，还经常超时。就换了中科大的源，但是不稳定，到了暑假就挂了。找到了国内阿里云的源，速度飞快。
`vim ~/.cargo/config`，打开后为

```.language-bash
[source.crates-io]
registry = "https://github.com/rust-lang/crates.io-index"
```

增加上阿里云的源，变为

```.language-bash
[source.crates-io]
registry = "https://github.com/rust-lang/crates.io-index"

replace-with = "rustcc"
[source.rustcc]
registry = "https://code.aliyun.com/rustcc/crates.io-index.git"
```