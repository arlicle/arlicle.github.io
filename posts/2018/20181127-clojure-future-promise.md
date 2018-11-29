{
  :title "future and promise in clojure"
}

## future

future函数可以接受一段代码，并在一段单独的线程中执行这段代码，最后返回一个future对象。

使用future创建一个线程，然后相关的执行就都放到这个线程中去执行

```.language-clojure
(def a (future (+ 1 2 3 4)))
```

这个时候future返回的不是执行结果，只是一个future对象。使用(deref a) 或者 @a 来获取其代表的值。

```.language-clojure
user=> (deref a)
10

user=> @a
10
```

对future对象解引用会阻塞当前线程，直到future 收到的代码在另外的线程中执行结束获得结果。

我们可以使用future来进行数据流式编程(dataflow programming)

![](/static/2018/11/img/100806.png)

```.language-clojure
(let [a (future (+ 1 2))
      b (future (+ 3 4))]
      (+ @a @b)
      )
```

这段代码先将(future (+ 1 2))赋值给a, 然后将(future (+ 3 4))赋值给b, 然后分别在不同的线程中并行的去执行(+ 1 2)和(+ 3 4)，当前线程(+ @a @b)将一直阻塞，直到两个线程中的加法完成。


## promise

promise和future一样，也是在一个线程中去跑，异步求值。通过deref或@求值，获得值前也会阻塞线程。但是不一样的是，promise不会立即执行，直到 deliver为promise对象赋值后他才会执行。

```.language-clojure
(def b (promise)) ; 如果这个时候@b，那么会发生阻塞，直到 b 获得值

(future (println "hello a value is: " @b)) ; 把@b放到另外一个线程中去，这样阻塞不会影响当前线程

(deliver b "cool");
Hello b value is: cool

```

当promise对象被赋值后，再次调用deliver进行赋值将不会触发任何动作。

```.language-clojure
(deliver b "hey")
nil
```


