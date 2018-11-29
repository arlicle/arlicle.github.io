## cookie

cookie 本质上完全是由浏览器客户端来管理的一种数据，这种方式的发明最开始主要是为了记录客户端的用户信息，做用户身份识别，为了让服务器端知道现在的请求和昨天的请求是不是同一个人，他是那一个人。由浏览器创建，保存于浏览器，由浏览器管理他的生命周期。只要在合法的域下面，有相关的 cookie 设置，浏览器会自动把 cookie 带上 Request Headers 提交到服务器端。

用户在同一个域下访问网站，客户端浏览器会始终 通过Requet Headers 带着 cookie到服务器端，用户在同一个浏览器上打开多个 tab 访问同一个网址，也会这样做，浏览器会带着样 cookie 到后端。

![](/static/2018/11/img/094333.png)

虽然cookie是由浏览器端生成，但也可以由服务器端通过Respoinse Headers传给浏览器操作cookie的命令来生成，这样后端也可以通过Response Headers来创建、修改、删除客户端的cookie，然后保存于客户端浏览器。

![](/static/2018/11/img/095641.png)


### cookie域限制

由于cookie有很强大域限制，因此不管是客户端 js 操作 cookie 还是服务器端通过Respoinse Headers来操作cookie，cookie的生成必须符合域的合法范围，否则会生成失败。同时如果跨域获取 cookie 也会失败。

比如，在域名www.b.com和www.a.com下：

b.com  
hello.b.com  
cool.b.com  

在b.com下，可以设置b.com下的 cookie，不可以设置二级域名的cookie，设置了也是失败。

**子域名共享顶级域名的cookie**

在hello.b.com下，可以设置hello.b.com下的cookie，也可以设置b.com下的cookie。同时也可以获取hello.b.com下的cookie和b.com下的cookie。

**path限制**  
同一个域名下www.b.com(path为/), www.b.com/hello(path为/hello), www.b.com/cool(path为/cool), 和域名限制类似，/hello下可以访问/hello 下的cookie和/下的cookie，访问不到/cool下的cookie。


```.language-javascript

// 在www.b.com下
document.cookie="root=123;";
// 在Application/Storage/Cookies中，可以看到cookie root创建成功，它path是/
document.cookie
"root=123"

// 在www.b.com/hello下
document.cookie
"root=123"
// 证明path /hello下可以拿到 path / 中的 cookie

document.cookie="hello=345;";
// 在Application/Storage/Cookies中，可以看到cookie root创建成功，它path是/hello
document.cookie
"root=123;hello=345"

// 在www.b.com下
document.cookie
"root=123"
// 证明path / 下拿不到 path /hello 中的 cookie

document.cookie="base=567;";
document.cookie
"root=123;base=567"

// 在www.b.com/hello下
document.cookie
"root=123;base=567;hello=345"

// 在www.b.com/cool下
document.cookie
"root=123;base=567"
// 证明path /cool下可以拿到 path / 中的 cookie

document.cookie="coll=789;"
document.cookie
"root=123;base=567;cool=789"

// 在www.b.com/hello下
document.cookie
"root=123;base=567;hello=345"
// 证明path /hello中拿不到path /cool 下的 cookie

document.cookie="hello3=bbb;path=/"
document.cookie
"root=123;base=567;hello=345;hello3=bbb"

// 在www.b.com下
document.cookie
"root=123;base=567;hello3=bbb"
// 证明 /hello 下可以设置 / 下的 cookie

// 在www.b.com/cool下
document.cookie
"root=123;base=567;cool=789;hello3=bbb"
// 证明 /hello 下可以设置 / 下的 cookie，也可以在/cool中拿到

```
<br>

## session

