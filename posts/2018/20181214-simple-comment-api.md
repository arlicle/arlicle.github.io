{
    :title "评论系统接口文档"
    :draft false
}

## 接口地址
https://comment.debugmyself.com

## 微信API接口

### 获取微信登录的二维码

GET /login/qrcode  `无需登录`

返回结果为：
```.language-html
<img class="qrcode lightBorder" src="/connect/qrcode/`qrcode`" />
```
需要用正则把`qrcode`拿出来

### 检查用户是否扫码或者是否点击确认登录

GET /login/qrcode/check  `无需登录`

返回结果为：
```.language-html
window.wx_errcode=`408`;window.wx_code=`wx_code`;
```
`408` 这里表示返回扫码结果的状态嘛，`wx_code`表示获取到的权限code

返回结果格式为




<table class="table">
<thead><tr>
<th>状态码</th>
<th>说明</th>
</tr>
</thead>
<tbody>
<tr>
<td>404</td>
<td>用户扫码成功，等待用户点击确认登录</td>
</tr>
<tr>
<td>405</td>
<td>用户点击确认登录了，获取到wx_code</td>
</tr>
<tr>
<td>403</td>
<td>用户点击取消登录</td>
</tr>
<tr>
<td>402 或 500</td>
<td>超时或获取失败，需要重新获取二维码，然后继续获取二维码状态</td>
</tr>
<tr>
<td>408</td>
<td>表示用户一直没有扫码，一直未获取到用户扫码信息，需要重新发起请求</td>
</tr>
</tbody>
</table>


## 根据微信 wx_code获取用户微信信息

GET /user/data/wechat  `无需登录`

参数           
```.language-javascript
{
    "code" : wx_code // wx_code为从微信获得的code
} 
```
返回结果
{:nickname "xx" :avatar "xxx" :token "xxx}

获取到用户 token 信息，需要存储到cookies和localStorage中，取的时候，先从cookie中取，如果没有再从localStorage中取。

获取到用户 token 还要再做一件事情，就是把token信息请求回js服务器，实现跨域支持cookie，这样用户在多个使用该评论系统的网站都无需再登录就可以进行评论。

```.language-javascript
    var hm = document.createElement("script");
    hm.src = "https://comment.debugmyself.com/sc.js?t=token";
    var s = document.body.appendChild(hm);
```

## 需要登录时，需要在 Request Headers 中提交用户 token 信息

```.language-javascript
Authorization: Bearer 917529d866c23f3053a68be78f59925c4b9570g9
```
如果使用需要登录的端口，没有在Request Headers 带着用户token信息，会返回未登录或没有权限错误

## 提交评论到服务器

POST /comment/post `需要登录`

参数
```.language-javascript
{
    "content":"", // 评论内容
    "appid":"", // 网站的appid
    "post_id", // 文章的post id, 用户会在外部AL_configs中进行配置
    "parent":"", //评论的上级ID, parent id
    "reply":"" // 回复对象的id
}
```

## 提交点赞到服务器

GET /comment/like `需要登录`

参数

```.language-javascript
{
    "id":"", // 评论id
    "appid":"", // 网站的appid
    "post_id", // 文章的post id, 用户会在外部AL_configs中进行配置
}
```

如果该用户没有点赞过，那么系统会自动记录点赞，并返回1， 如果该用户已经点赞过，那么系统会自动取消点赞，返回-1


## 第一次打开页面进行数据请求

GET /init/data `如果用户已登录，请携带token信息，如果没有登录则不用带`

参数

```.language-javascript
{
    "appid":"", // 网站的appid
    "post_id", // 文章的post id, 用户会在外部AL_configs中进行配置
}
```

如果请求带着token 信息，会返回用户信息和评论列表，评论列表数据会携带用户是否点赞过的状态

如果请求没有带着 token 信息，只会返回评论列表

每次请求会返回15条评论

## 请求更多评论数据
GET /init/data `如果用户已登录，请携带token信息，如果没有登录则不用带`

参数

```.language-javascript
{
    "appid":"", // 网站的appid
    "post_id", // 文章的post id, 用户会在外部AL_configs中进行配置
    "last_comment_id":"", // 最后一条评论的id
}
```

如果请求带着token 信息，会返回用户信息和评论列表

如果请求没有带着 token 信息，只会返回评论列表

每次请求会返回15条评论

