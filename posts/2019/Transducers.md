{
    :post-date "2019-1-12 09:37"
}

Transducers是一些组合起来的算法转换，它是把数据的输入输出转换从数据结构解耦的一种方法。解耦之后这些数据就可以自由的重用和组合。可以用于不同的数据流处理：collections, streams,  channels, observables.

把数据从转换中解耦，将会更简单和更可重用代码。

Transducers就像一个筛子，输入一份数据，经过筛子组合，然后输出一份数据。

或者也可以把他比喻做食谱，食物只要经过这个食谱的烹饪，就可以变成一道菜。Transducers是如何处理数据序列的配方，而不知道数据是什么。

而且最重要的是，Transducers性能非常好，他在数据处理过程中，并不会创建中间变量。

Here’s a visualisation to show the difference between array built-ins and transducers.

1 chained built-in transformations create intermediate arrays
![](/static/2019/1/transducers.gif {:style "max-width:800px"})

2 transduced transformations process items one by one into output array
![](/static/2019/1/transducers2.gif {:style "max-width:800px"})

在代码层面：

## What's a Transducer?

Transducers are functions that accept a reducing function and return a reducing function.

A reducing function is just the kind of function you'd pass to reduce - it takes a result so far and a new input and returns the next result-so-far. In the context of transducers it's best to think about this most generally:

```.language-clojure
;;reducing function signature
whatever, input -> whatever
```

and a transducer is a function that takes one reducing function and returns another:

```.language-clojure
;;transducer signature
(whatever, input -> whatever) -> (whatever, input -> whatever)
```

## 使用transducers
transducers使用起来非常简单

`(transduce xform f coll)`   `(transduce xform f init coll)`
> 如果没有init, 会直接调用(f) 来创建init.
> f 必须是一个reducing函数，可以接收一个或者两个参数。如果f仅仅支持两个参数，那我们可以使用completing函数为f添加一个`arity-1`参数函数, completing默认添加的是([x] (identity x))的`arity-1`函数，
> 像 `reduce` 一样依次将`init`和coll里面的第一个元素，传入`xform`中进行处理，
> 处理结果会经过 f reducing函数进行连接。
> 如果coll是空的，就直接返回init值，(f函数不会被调用), 

```.language-clojure
(def xform
  (comp
    (map inc)
    (filter even?)
    ))

(transduce xform conj [] (range 10))
```
在transduce中, xform的执行顺序是从左到右,(原生comp是从右到左)。

```.language-clojure
(def xf
  (comp
    (filter odd?)
    (take 10)))

(transduce xf conj (range))
=> [1 3 5 7 9 11 13 15 17 19]

(transduce xf + (range))
=> 100

; ... with an ini
(transduce xf + 17 (range))
=> 117

(transduce xf str (range))
=> "135791113151719"

(transduce xf str "..." (range))
=> "...135791113151719"

```

可以看到transducers的使用非常的简单，但是transducers的原理是什么呢？

```.language-clojure
(def xf
  (comp
    (map inc)
    (filter even?)))

(transduce xf conj [] (range 10))
=> [2 4 6 8 10]
```

如果传统方式实现这个功能，有三种方式：

1 函数嵌套
```.language-clojure
(filter even? (map inc (range 10)))
=> (2 4 6 8 10)
```

2 使用`->>`
```.language-clojure
(->> (range 10)
     (map inc)
     (filter even?))
=> (2 4 6 8 10)
```

3 使用`comp` (comp执行的顺序是从右向左)
```.language-clojure
((comp
    (partial filter even?)
    (partial map inc)) 
  (range 10))
=> (2 4 6 8 10)
```






看上面`transduce`执行的例子，可以看到`transducers`很像`reduce`函数，我们试着来自己实现一个。

1 使用`reduce`实现一个`(map inc)`

```.language-clojure
(map inc (range 10))
=> (1 2 3 4 5 6 7 8 9 10)

(defn map-inc
  [result i]
  (conj result (inc i)))

(reduce map-inc [] (range 10))
=> [1 2 3 4 5 6 7 8 9 10]
```

2 使用`reduce`实现一个`(filter even?)`
```.language-clojure
(filter even? (range 10))
=> (0 2 4 6 8)

(defn filter-even?
  [result i]
  (if (even? i)
    (conj result i)
    result))

(reduce filter-even? [] (range 10))
=> [0 2 4 6 8]
```








