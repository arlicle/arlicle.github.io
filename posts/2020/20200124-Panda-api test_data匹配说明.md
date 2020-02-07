{
    :post-date "2020-01-27 10:18"
}


Panda api中， test_data是一个非常非常重要的设计，可以方便前端进行各种情况的测试。

test_data中，有这么几个字段可以进行数据匹配

```.language-json5
{
    method: "GET", // 请求方法匹配
    url:"/post/10/", // 网址匹配
    query: {}, // query/GET 参数匹配
    body: {}, // post中body参数匹配
    form_data: {}, // post中请求数据在form_data中的参数匹配

    response:{} // 匹配成功后返回的结果
}
```

`method`, `url`、`query`、`body` 或 `form_data` 这四者是可以同时存在或者只有其中一个存在，或者都不存在， 匹配成功后返回response中的结果

### 使用url匹配的test_data
```.language-json5
{
    name:"Article view",
    method:"GET",
    url:"/post/{id:\\d+}/", // the url support regex match
    response:{
        code:{name:"response result code", type:"int", desc:"success is 1"},
        msg:{name:"response result message", type:"string", desc:""},
        data: {
            "-name":"data field name",
            "-desc":"data field description",
            "-required":false,
            id:{name:"article id", type:"number"},
            title:{name:"article title"},
            summary:{name:"article summary"},
            content:{name:"article content"},
            category_name:{name:"article category name"},
            author_name:{name:"article author name"},
            source:{name:"article source"},
            tag:{name:"article tag"},
            read_count:{name:"article read count", type:"number"},
            created:{name:"article created time", type:"number"},
            }
    },
    test_data:[
        {
            url:"/post/1/", // use url match
            response:{
                code:1,
                msg:"",
                data: {
                    id:1,
                    title:"Hello World",
                    summary:"This is the first post",
                    content:"This is the first post, and it is a test case data",
                    category_name:"Other Category",
                    author_name:"Edison",
                    source:"Panda api",
                    tag:"test",
                    read_count:1,
                    created:1580048711
                }
            },
        },
        {
            url:"/post/3000/",
            response:{
                code:-1,
                msg:"article not found"
            },
        }
    ]
},

```

首先，我们的url是一个正则匹配`/post/{id:\\d+}/`，`/post/(数字)/`的都满足匹配条件，

test_data中的第一个元素，`url:"/post/1/"`， 必须请求url是`/post/1/`, 才会返回其对应的 `response`；

test_data中的第二个元素，`url:"/post/3000/"`, 必须请求url是 `/post/3000/`，才会返回其对应的`response`；

test_data中`url`的匹配有一点特殊，如果设置test_data中的`url`，表示忽略`url`匹配，也就是默认`url`是匹配的。

其它字段不一样，就是没有设置，也会拿着空去匹配

### 使用query 进行匹配

```.language-json5
{
    name:"user logout",
    method:"GET",
    url:"/logout/",
    query:{
        id:{name:"user id", type:"int"},
        username:{}
    },
    response:{
        code:{name:"response result code", type:"int", desc:"success is 1"},
        msg:{name:"response result message", type:"string", desc:""}
    },
    test_data:[
        {
            query:{id:1, username:"root"},
            response:{code:1, msg:"logout success"}
        },
        {
            response:{code:-1, msg:"error"}
        },
        {
            query:{id:3, username:"lily"},
            response:{code:-1, msg:"username and id not match"}
        }
    ]
}

```
注意，这里接口中定义域`query`的`id`为`id:{name:"user id", type:"int"}`，`id`是一个整数，那么`test_data`中`query`里`id`的值也必须是整数，否则不会匹配。也就是

```.language-json5
// 接口中query定义
query:{
    id:{name:"user id", type:"int"}
    ....
}
// 请求 /logout/?id=1&username=root
query:{id:1, username:"root"}, // 会匹配
query:{id:"1", username:"root"}, // 不会匹配
```

如果我们把接口`query`的定义改为：`id:{name:"user id", type:"string"}`，`id`是一个字符串，那么`test_data`中`query`里`id`的值也必须为整数，否则不会匹配。也就是

```.language-json5
// 接口中query定义
query:{
    id:{name:"user id", type:"string"}
    ....
}
// 请求 /logout/?id=1&username=root
query:{id:1, username:"root"}, // 不会匹配
query:{id:"1", username:"root"}, // 会匹配
```
如果没有定义接口的`response`或者`query`，那么请求的所有query中的整数都是当做字符串处理，写在`test_data`中也必须全部写为字符串

### 使用body进行匹配

```.language-json5
{
    name:"user login",
    desc:"if user login success, will get a token",
    method: "POST",
    url:"/login/",
    body_mode:"json", // form-data, text, json, html, xml, javascript, binary
    body:{
        username:{name: "username"},
        password:{name: "password"}
    },
    response:{
        code:{name:"response result code", type:"int", desc:"success is 1"},
        msg:{name:"response result message", type:"string", desc:""},
        token:{name:"login success, get a user token; login failed, no token", type:"string", required:false}
    },
    test_data:[
        {
            body:{username:"edison", password:"123"},
            response:{code:-1, msg:"password incorrect"}
        },
        {
            body:{username:"lily", password:"123"},
            response:{code:-2, msg:"username not exist"}
        },
        {
            body:{username:"root", password:"123"},
            response:{code:1, msg:"login success", token:"fjdlkfjlafjdlaj3jk2l4j"}
        },
        {
            body:{username:"lily"},
            response:{code:-1, msg:"password is required"}
        },
        {
            body:{password:"123"},
            response:{code:-1, msg:"username is required"}
        }
    ]
},
```

### form_data匹配
把上个例子中`body`字段名改为`form_data`即可。


### 使用method进行匹配
`method`可以直接写字符串`method:"GET"`，单个方法匹配，也可以写数组，一次匹配多种方法，`method:["GET", "POST"]`，也可以匹配全部方法：`method:"*"`

如果不在test_data中设置`method`，表示`method`请求方法默认都是匹配的。

```.language-json
{
    // 假设在这个接口中，编辑获取数据和提交保存是一个接口，真实开发中，不建议这么做
    name:"Article add",
    desc:"Article add or edit",
    method:["GET", "POST"],
    url:"/post/add/",
    body_mode:"json", // form-data, text, json, html, xml, javascript, binary
    body:{
        id:{name: "article id"},
        title:{name: "article title", required:false},
        content:{name: "article content", required:false}
    },
    response:{
        id: {name: "Article id", type:"PosInt"},
        title:{name: "article title"},
        content:{name: "article content"}
    },
    test_data:[
        {
            method:"GET",
            body:{
                id:1
            },
            response: {
                id:1,
                title:"Hello World",
                content:"Article Content"
            }
        },
        {
            method:"POST",
            body:{
                id:1,
                title:"Hello World",
                content:"Article Content"
            },
            response: {
                id:1,
                title:"Hello World",
                content:"Article Content"
            }
        },
    ]
}

```

如果请求的method不匹配，那么将会返回错误
```.language-json5
{
  "code": -1,
  "msg": "this api address /logout/ not defined method POST"
}
```

## 增加test_data数据的描述说明
可以在`test_data`的数据列表的元素中，增加`name`字段和`desc`字段，进行测试用例数据的描述，`name`字段和`desc`字段与`method`、`body`这些字段是同级的。增加了`name`和`desc`不会影响`test_data`的匹配，两个字段都是可选的。

```.language-json5
test_data:[
    {
        name:"编辑文章时获取文章内容",
        method:"GET",
        body:{
            id:1
        },
        response: {
            id:1,
            title:"Hello World",
            content:"Article Content"
        }
    },
    {
        name:"提交文章编辑内容",
        desc:"提价文章编辑内容后，数据立即更新内容",
        method:"POST",
        body:{
            id:1,
            title:"Hello World",
            content:"Article Content"
        },
        response: {
            id:1,
            title:"Hello World",
            content:"Article Content"
        }
    },
]
```


如果请求的url不匹配，那么将会返回错误
```.language-json5
{
  "code": -1,
  "msg": "this api address /logout/aaa/ not defined method POST"
}
```

### 其它

虽然不推荐，但是其实你可以这么做，就是不定义`response`，直接写`test_data`里面的数据就开始前端访问。

这么做可以快速的提供接口服务，不好的是，没有了`response`文档，同时也不会自动生成`mock`数据。

