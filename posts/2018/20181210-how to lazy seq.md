{
    ;:draft true
    ;:private false
}

递归定义由两个部分组成。
* 基础(basic)，明确地列举出序列的部分成员
* 归纳(induction)，提供一些规则，规定了如何通过组合序列的成员，来产生更多的成员。

递归的方式
1. 简单的递归，让函数以某种方式调用自身，从而进行递归
2. 尾递归，仅当函数执行道末尾时，才去调用其自身。尾递归使得一种非常重要的优化手段变得可行。
3. 惰性序列，实实在在地消除了递归，并且只有当需要时，才会去计算值。


**斐(fěi)波(bō)那(nà)契(qì)**

斐波那契数列的定义：
* 基础：F0，第0个斐波那契数是0。F1，第1个斐波那契数是1
* 归纳：对于n>1，Fn等于F(n-1)+F(n-2)

使用这个定义，前10个斐波那契数列举如下：

(0 1 1 2 3 5 8 13 21 34)

## 普通递归

用一个简单的递归来实现斐波那契数，实现一个递归函数，返回第n个斐波那契数。

```.language-clojure
(defn fibo
      [n]
      (case n
            0 0
            1 1
            (+
              (fibo (- n 1))
              (fibo (- n 2)))))
```

因为是递归，对于n>1的情况，每次调用fibo都会招致对其自身的两次调用(fibo (- n 1))和(fibo (- n 2))，在Java虚拟机层面，这些调用会被翻译为方法调用。而每次方法调用都会分配一个被称为栈帧(stack frame)的数据结构。

fibo会创建深度与n成正比的栈帧，这样就迅速的耗尽了Java虚拟机的空间，并引发了StackOverflowError的异常。而且它创建的栈帧总数是n的指数，因此即使栈没有溢出，其性能也极为糟糕。

Clojure函数调用被标明是消耗栈空间的，因为他们使用了栈空间来分配栈帧。在Clojure中，应该尽量避免采用fibo这样消耗栈空间型的递归。

## 尾递归

函数式程序可以借助尾递归技术解决栈空间的使用问题，尾递归函数依然被定义为是递归的，但递归点必须位于尾部，即函数中返回某个值的那个表达式。语言随后即可进行尾部调用优化(tail-call optimization, TCO), 把尾递归转换为迭代，于是不再消耗栈空间。

```.language-clojure
  (defn tail-fibo
        [n]
        (letfn [(fibo
                  [current next-num n]
                  (if (zero? n)
                    current
                    (fibo next-num (+ current next-num) (dec n))))]
               (fibo 0 1 n)))
```

## 自递归与recur
递归在Java虚拟机上有一种可以被优化的特殊情况，就是自递归。
在Clojure中，可以借助`recur`把那种在尾部调用其自身的函数，转换为显式自递归。

```.language-clojure
  (defn recur-fibo
        [n]
        (letfn [(fibo
                  [current next-num n]
                  (if (zero? n)
                    current
                    (recur next-num (+ current next-num) (dec n))))]
               (fibo 0 1 n)))
```

现在运行recur-fibo计算斐波那契数时，不再消耗栈空间，运行速度有非常大的提升，同时，可以计算很大的数值。

## 惰性序列

惰性序列是由`lazy-seq`宏创建出来的

(lazy-seq & body)

仅当需要时，lazy才会去调用它的 body，也就是说，当seq被直接或间接的调用时，lazy-seq会为后续的调用缓存结果。

```.language-clojure
  (defn lazy-fibo
        ([]
          (concat [0 1] (lazy-fibo 0 1)))
        ([a b]
          (let [n (+ a b)]
               (lazy-seq
                 (cons n (lazy-fibo b n))))))
```

为了用惰性化来代替递归，可以把函数体中的递归部分用 lazy-seq 包裹起来。

我们还可以重用已有的序列库函数，来返回惰性序列。

```.language-clojure
(map first (take 10 (iterate (fn [[a b]] [b (+ a b)]) [0 1])))
```

由于建立在返回惰性序列的map和iterate之上，fibo返回的仍然是一个惰性序列。

惰性化的定义会消耗一些栈空间和内存。但它们不会跟随序列的整体大小成比例地消耗资源。相反，当你遍历序列时，要消耗多少资源由你选择，如果你想要第100万个斐波那契数，从 fibo 中直接拿出来就行。无须为前面那100万值消耗栈空间。

在编写 Clojure 程序时，对于任何大小会变化的序列和任何大型的序列，都应该优先选择惰性序列而不是loop/recur

## realizing

惰性序列只有当它们被变现时才会显著的消耗资源，也就是座位序列的一部分在内存中被真正实例化。Clojure尽可能的让序列惰性化，并且极力避免变现序列，直至绝对必要的时候。例如，take 函数就更本就不去变现，它返回的仍然是一个惰性序列。我们可以创建一个拥有前十亿个斐波那契数的变量。

```.language-clojure
(def a (take 1000000000 (lazy-fibo)))
=> #'simple_comment.utils/a
```

a的创建几乎立刻就完成，因为它几乎没有做任何事情。如果调用了一个函数，而这个函数确实需要用到 a 里面的一些值，那么Clojure就会把这些值给计算出来。而且，Clojure仅会计算那些必须的。比如取第90个斐波那契数，而用不着取计算 a 承诺提供的其它无数个斐波那契数。

```.language-clojure
(nth a 90)
=> 2880067194370816120
```

大多数序列函数返回的都是惰性序列，如果不确定某个函数返回的是不是惰性序列，可以查看函数文档。

```.language-clojure
(doc take)
-------------------------
clojure.core/take
([n] [n coll])
  Returns a lazy sequence of the first n items in coll, or all items if
  there are fewer than n.  Returns a stateful transducer when
  no collection is provided.
=> nil
```

但是REPL不是惰性的，默认情况下，REPL的打印器会把整个 container 中的元素都打印出来。
比如，如果直接输入`(take 1000000000 (lazy-fibo))`, REPL将试图变现整个容器，并打印这十亿个斐波那契数，很可能会把内存耗尽或者消耗非常非常多的时间。

为了方便使用惰性序列，可以设置`*print-length*`对值，来配置打印器一次打印多少项。

```.language-clojure
(set! *print-length* 10)
```
对于超过10个选项的container，现在打印器只会打印前10个，后面的就是用省略号替代。这样，可以放心大胆的打印十亿个斐波那契数了。

```.language-clojure
(take 1000000000 (lazy-fibo))
=> (0 1 1 2 3 5 8 13 21 34 ...)
```

或者所有的斐波那契数

```.language-clojure
(lazy-fibo)
=> (0 1 1 2 3 5 8 13 21 34 ...)
```

惰性序列真是太美妙了，他们仅作必要的事情。

## 丢弃头元素

惰性序列可以定义一个很大的（可能是无限的）序列，并且在某一刻只有序列中很少的一部分会驻留在内存中。然而，如果你（或某些 API） 无意中持有了这个序列中的某个部分的引用，而忘记取消，惰性序列的特性将会失效。

最常发生的情况是，偶然持有了一个序列的头。

```.language-clojure
(def head-fibo (lazy-cat [0 1] (map + head-fibo (rest head-fibo))))

(take 10 head-fibo)
=> (0 1 1 2 3 5 8 13 21 34)
```

但是如果取比较大的值就会报错

```.language-clojure
(nth head-fibo 1000000)
java.lang.OutOfMemoryError:GC overhead limit excceded
```
这里的问题是，顶级变量head-fibo持有着容器的头元素。这样就阻止了垃圾收集器取回收序列中的元素，即便你其实早就已经越过了那些元素。因此，你曾经用到的那部分斐波那契数序列都会被缓存起来，这些被head-fibo饮用者的值得存活事件，很可能就和整个程序的生命一样长。

除非是自己就是希望遍历序列时对它进行缓存，否则，一定要格外小心，千万不要持有序列头元素的引用。

通常情况下，应该把惰性序列暴露为返回该序列的一个函数，而不是直接用变量来容纳这个序列。倘若这个函数的某个调用者想要显式的进行缓存，那么这个调用可以随时创建它自己的变量。在使用惰性序列时，丢弃头元素往往是一个好主意。

## lazy more lazy 懒上加懒

根据第五条规则，直接使用先用序列函数或者 API 来解决问题。


