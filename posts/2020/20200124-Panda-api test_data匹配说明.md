{
    :post-date "2020-01-27 10:18"
}


Panda api中， test_data是一个非常非常重要的设计，可以方便前端进行各种情况的测试。

test_data中，有这么几个字段可以进行数据匹配

{
    url:"/post/10/", // 网址匹配
    query: {}, // query/GET 参数匹配
    body: {}, // post中body参数匹配
    response:{} // 匹配成功后返回的结果
}


`url`、`query`、`body` 这三者是可以同时存在或者只有其中一个存在，或者都不存在， 匹配成功后返回response中的结果


