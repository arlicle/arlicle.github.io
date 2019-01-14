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
; 会创建中间的collection, 并且有两次循环
```

2 使用`->>`
```.language-clojure
(->> (range 10)
     (map inc)
     (filter even?))
=> (2 4 6 8 10)
; 会创建中间的collection, 并且有两次循环
```

3 使用`comp` (comp执行的顺序是从右向左)
```.language-clojure
((comp
    (partial filter even?)
    (partial map inc)) 
  (range 10))
=> (2 4 6 8 10)
; 会创建中间的collection，并且有两次循环
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

我们像`(map inc)` `(filter even?)` 一样，单独实现`map`和`filter`，然后把`inc`和`even?`按需要传入进去。
我们可以这么写
```.language-clojure
(defn map-func
  [f result i]
  (conj result (f i)))
```
但是这么写有个问题，就是不符合`reducing function`,无法配合`reduce`进行使用`reducing function`智能接收一个或者两个参数。
所以只能这么写
```.language-clojure
(defn map-func
  [f]
  (fn [result i]
    (conj result (f i))))

((map-func inc) [] 2)
=> [3]

(reduce (map-func inc) [] (range 10))
=> [1 2 3 4 5 6 7 8 9 10]

; 切换自己想要的函数
(reduce (map-func -) [] (range 10))
=> [0 -1 -2 -3 -4 -5 -6 -7 -8 -9]
```

同样的来实现`(filter even?)`
```.language-clojure
(defn filter-func
  [pred]
  (fn [result i]
    (if (pred i)
      (conj result i)
      result)))

((filter-func even?) [] 2)
=> 2

(reduce (filter-func even?) [] (range 10))
=> [0 2 4 6 8]

; 切换自己想要的pred函数
(reduce (filter-func odd?) [] (range 10))
=> [1 3 5 7 9]
```

现在我们的`map-func`和`filter-func`都是用`conj`来做`reducing function`, 那么如果我们想变为可切换`reducing function`，可以把`conj`切换`+`或者别的`reducing function`，这样我们就需要把`conj`作为一个参数传入进去，变成：`((map-func inc) conj)`
```.language-clojure
(defn map-func
  [f]
  (fn [reducing]
    (fn [result i]
      (reducing result (f i))
      )))

(((map-func inc) conj) [] 1)
=> [2]
; 换为不同的reducing function
(((map-func inc) +) 0 1)
=> 2
(((map-func inc) +) 1 1)
=> 3
(((map-func inc) str) "0" 1)
=> "02"
```

把`filter-func`也改为`((filter-func even?) conj)`

```.language-clojure
(defn filter-func
  [pred]
  (fn [reducing]
    (fn [result i]
      (if (pred i)
        (reducing result i)
        result))))

(((filter-func even?) conj) [] 1)
=> []
(((filter-func even?) conj) [] 2)
=> [2]
(((filter-func even?) +) 10 2)
=> 12
(((filter-func even?) str) "0" 2)
=> "02"
```

现在我们可以使用`map-func`和`filter-func`，同时随心所欲指定自己想要的数据处理函数和自己的`reducing function`，而且通过上面对`((map-func inc) conj)`函数和`((filter-func even?) conj)`函数顶使用可以发现，他们两个也是`reducing function`，接收两个参数，然后返回一个结果。所以我们可以把它们都当做`reducing function`来使用。
```.language-clojure
(reduce ((map-func inc) conj) [] (range 10))
=> [1 2 3 4 5 6 7 8 9 10]

(reduce ((map-func inc) str) "" (range 10))
=> "12345678910"

(reduce ((filter-func even?) conj) [] (range 10))
=> [0 2 4 6 8]

(reduce ((filter-func even?) str) "" (range 10))
=> "02468"
```
而`(map-func inc)`和`(filter-func even?)` 就是 transducer 函数，它们接收一个`reducing`函数，然后返回一个`reducing`函数。

如果我们这么用会发生什么事情呢？`((map-func inc) ((filter-func even?) conj))`， 把`((filter-func even?) conj)`当做`reducing function`来使用，并且用在`((map-func inc) conj)`函数中，替换`conj`函数。

```.language-clojure
(((map-func inc) ((filter-func even?) conj)) [] 0)
=> []
(((map-func inc) ((filter-func even?) conj)) [] 1)
=> [2]
(((map-func inc) ((filter-func even?) conj)) [2] 2)
=> [2]
(((map-func inc) ((filter-func even?) conj)) [2] 3)
=> [2 4]
```
`((map-func inc) ((filter-func even?) conj))`同样还是一个`reducing function`，所以我们可以这么用
```.language-clojure
(reduce ((map-func inc) ((filter-func even?) conj)) [] (range 10))
=> [2 4 6 8 10]
(reduce ((map-func inc) ((filter-func even?) str)) "" (range 10))
=> "246810"
(reduce ((map-func inc) ((filter-func even?) +)) 0 (range 10))
=> 30
```
这么看着有点复杂，我们来改写一下写法。让它看起来更清晰和简单
```.language-clojure
(defn xform
  (comp
    (map-func inc)
    (filter-func even?)))

((xform conj) [] 1)
=> [2]
((xform conj) [2] 2)
=> [2]
((xform conj) [2] 3)
=> [2 4]

(reduce (xform conj) [] (range 10))
=> [2 4 6 8 10]

(reduce (xform str) "" (range 10))
=> "246810"

(reduce (xform +) 0 (range 10))
=> 30
```
当`conj`传入`xform`中时，是从右向左执行的，`conj`先作为函数`(filter-func even?)`和参数执行，执行结果为`((filter-func even?) conj)`，然后这个执行结果传入`(map-func inc)`函数作为参数，执行结果为`((map-func inc) ((filter-func even?) conj))`，因为`((filter-func even?) conj)`是作为`reducing function`作为函数`(map-func inc)`的参数，内部为`(conj result (inc i))`所以会先执行`(inc i)`，然后才执行`(filter-func even?)`，最后才执行最初指定的`reducing function`函数`conj`。所以最终数据处理的顺序变为从左到右的执行了，先进行了`map-func`的`inc`，然后进行了`filter-func`的`even?`，如果每一步都执行，那么就返回结果collection，如果`even?`这里判断不通过，就返回原collection。这个执行过程没有中间变量产生，并且只有`reduce`一次循环。

这就是`transducers`的整个过程。









