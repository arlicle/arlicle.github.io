{
    :title "Clojure惰性序列的头保持问题"
    :authors ["转载自: 徐明明"]
}

```.language-clojure
(let[[t d](split-with #(< % 12) (range 1e8))]
  [(count d) (count t)])
;= OutOfMemoryError Java heap space  clojure.lang.ChunkBuffer.<init>  (ChunkBuffer.java:20);
 
(let[[t d](split-with #(< % 12) (range 1e8))]
  [(count t) (count d)])
;=[12 99999988]
```

只是(count t) (count d)的顺序不同，前一段代码会抛OutOfMemoryError错误，后一个则完全没有问题，这是为什么呢？这里面涉及到Clojure里面集合的数据结构共享机制。

## Clojure数据结构共享

我们知道Clojure里面强调的是不可变数据结构，几乎任何操作都不会改变现有值，而是会产生新值，比如我们有这么一个惰性序列：

```.language-clojure
(let [h (range 1 6)])
```

它在内存中的表示大概是这样的:

![](/static/2018/12/img/h1.png)

头指针h指向第一个元素(还没有被实例化的元素), 这些格子是虚线的，表示这些格子还没有实例化。现在我们执行下列代码:

```.language-clojure
(let [h (range 1 6) h1 (next h)])
```

(next h)并不会改变h本身，而是会产生一个新的h1序列，那么Clojure会把h里面所有的内存元素都拷贝一遍以产生这个新的h1么？当然不会，Clojure没那么傻，内存结构会变成下面这样:

![](/static/2018/12/img/h2.png)

一个元素都没有复制，只是产生了一个新的h1头指针，指向了h序列的第二个元素，原来的h头指针还是指向第一个元素，这样虽然从程序员的角度来看有两个独立的序列h和h1, 但是内存里面只有一份数据。这就是Clojure里面的数据结构共享机制。

## count的执行过程

要解释我们前面提到的问题，我们先看看count一个惰性序列是怎么样的一个过程，这个过程中的内存占用是怎么样的。
```.language-clojure
(let[t (range 1 6)]
  (count t))
```
我们来看看上面的代码是怎么执行的。(range 1 6)在内存里面的结构在上面介绍数据结构共享机制的时候已经展示过了，会有一个头指针指向这个数据结构的头，我们看看在count执行过程中，内存结构会发生怎样的变化。

Clojure里面的count函数最终是调用clojure.lang.RT.countFrom(Object obj)来实现的，下列代码是当要count的集合是惰性序列的时候执行的逻辑:

![](/static/2018/12/img/h3.png)

可以看出对于惰性序列(以及其它持久性的数据结构)，count是通过for循环遍历集合里面的每个元素(从而实例化每个元素)来计算出惰性序列的数量的。遍历的时候调用的是s.next()方法，s.next()方法相当于调用(next s), 因此产生的也是一个新的持久性集合。遍历完第一个元素之后的内存结构是这样的:

![](/static/2018/12/img/h4.png)

上面的第一个元素(1)会被JVM回收掉的。也许有人会问了，上面(count t)在执行的时候，t还在有效作用域内，它下面的元素怎么会被垃圾回收呢？不是应该等(count t)全部都执行完等程序控制流出了这个作用域才能回收t所占用的内存吗？在Java里面是也许是这样的，但是Clojure里面对这方面做了优化，Clojure的编译器发现t在当前作用域后面没有再被用到了((count t)后面已经没有再用到t了, 或者引用 t 所指向值的前面的元素)，因此可以放心地把不再被引用的元素1回收掉，这种技术叫做locals clearing

以此类推，不管要count的惰性序列所含数据量有多大，count所占用的内存都是恒定的，因此下面的代码是不会导致OutOfMemoryError的：

```.language-clojure
(count(range 1e8))
```

从这里我们可以得出：我们讨论的这个头保持问题不是count本身导致的。

## 头保持(head retention)

我们再来看看下面代码求头尾两个count的时候内存中的数据结构会怎么样：

```.language-clojure
(let[[t d](split-with #(< % 4) (range 1 6))]
  [(count d) (count t)])
```
在[(count d) (count t)]执行之前，整个序列是这样的:

![](/static/2018/12/img/h5.png)

t的头指向第一个元素，d的头指向第四个元素。现在先执行(count d)(Clojure代码是从左向右执行的), count过第一个元素之后整个序列是这样的:

![](/static/2018/12/img/h6.png)

注意，这里4这个元素是无法被垃圾回收掉的，因为系统知道整个数据的头还被t引用，因此整个数据结构上的任意节点都是不能被垃圾回收。想想如果d后面有很多数据，那么都得存在内存里面不能被回收，最后的结果就是OutOfMemoryError。

如果我们稍微调换下两个count的顺序呢:

```.language-clojure
(let[[t d](split-with #(< % 4) (range 1 6))]
  [(count t) (count d)])
```

那么这样Clojure会先执行(count t), count到第二个元素的时候内存结构是这样的:

![](/static/2018/12/img/h7.png)

这里已经实例化的元素1是可以被垃圾回收的，因为两个头指针t，d都在元素1的后面，已经没有人需要这个元素1了，因此它是可以被垃圾回收的。因此不管d后面有多少数据，只要我们先执行的是(count t), 整个序列的头不被保持，那么在我们count过程中内存会被不断的回收，不会有所有元素保持在内存的问题，因此也就不会有OutOfMemoryError的问题了。

同理一下代码也是一样的问题
```.language-clojure
(let [r (range 1e9)]
[(first r) (last r)]
)

(let [r (range 1e9)]
[ (last r) (first r)]
)
;= OutOfMemoryError Java heap space  clojure.lang.ChunkBuffer.<init>  (ChunkBuffer.java:20);

```
