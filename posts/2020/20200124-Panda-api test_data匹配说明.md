{
    :post-date "2020-01-27 10:18"
}


Panda api中， test_data是一个非常非常重要的设计，可以方便前端进行各种情况的测试。

test_data中，有这么几个字段可以进行数据匹配

```.language-json5
{
    url:"/post/10/", // 网址匹配
    query: {}, // query/GET 参数匹配
    body: {}, // post中body参数匹配
    response:{} // 匹配成功后返回的结果
}
```

`url`、`query`、`body` 这三者是可以同时存在或者只有其中一个存在，或者都不存在， 匹配成功后返回response中的结果

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

### 使用query 进行匹配

```.language-json5
{
    name:"user logout",
    method:"GET",
    url:"/logout/",
    query:{
        id:{name:"user id"},
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