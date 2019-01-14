{
    :post-date "2019-1-12 09:37"
}

Transducers是一些组合起来的算法转换，它是把数据的输入输出转换从数据结构解耦的一种方法。解耦之后这些数据就可以自由的重用和组合。可以用于不同的数据流处理：collections, streams,  channels, observables.

把数据从转换中解耦，将会更简单和更可重用代码。

Transducers就像一个筛子，输入一份数据，经过筛子组合，然后输出一份数据。

或者也可以把他比喻做食谱，食物只要经过这个食谱的烹饪，就可以变成一道菜。Transducers是如何处理数据序列的配方，而不知道数据是什么。

而且最重要的是，Transducers性能非常好，他在数据处理过程中，并不会创建中间集合。

Here’s a visualisation to show the difference between array built-ins and transducers.

1 chained built-in transformations create intermediate arrays
![](/static/2019/1/transducers.gif)

2 transduced transformations process items one by one into output array
![](/static/2019/1/transducers2.gif)

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

我们常见的reducing function有：`conj`, `+` reducing function就是可以用在reduce上的函数 (reduce conj )

传统，我们有三种方法来实现数据流的处理：

1 nested calls
```.language-clojure
(reduce + (filter odd? (map #(+ 2 %) (range 0 10))))
```

2 functional composition
```.language-clojure
(def xform
    (comp
    (partial filter odd?)
    (partial map #(+ 2 %))))
(reduce + (xform (range 0 10)))
```
3 threading macro
```.language-clojure
(defn xform [xs]
    (->> xs
        (map #(+ 2 %))
        (filter odd?)))
(reduce + (xform (range 0 10)))
```

With transducers you will write it like:
```.language-clojure
(def xform
  (comp
    (map #(+ 2 %))
    (filter odd?)))
(transduce xform + (range 0 10))
```
They all do the same. The difference is that you never call Transducers directly, you pass them to another function. Transducers know what to do, the function that gets transducer knows how. The order of combinators is like you write it with threading macro (natural order). Now you can reuse xform with channel:
```.language-clojure
(chan 1 xform)
```

## Terminology

A reducing function is the kind of function you’d pass to reduce - it is a function that takes an accumulated result and a new input and returns a new accumulated result:

```.language-clojure
;; reducing function signature  
whatever, input -> whatever
```

A transducer (sometimes referred to as xform or xf) is a transformation from one reducing function to another:

```.language-clojure
;; transducer signature
(whatever, input -> whatever) -> (whatever, input -> whatever)
```

## Defining Transformations With Transducers
```.language-clojure
(filter odd?) ;; returns a transducer that filters odd
(map inc)     ;; returns a mapping transducer for incrementing
(take 5)      ;; returns a transducer that will take the first 5 values
```

 The recommended way to compose transducers is with the existing comp function:

 ```.language-clojure
 (def xf
  (comp
    (filter odd?)
    (map inc)
    (take 5)))
 ```

 The transducer xf is a transformation stack that will be applied by a process to a series of input elements. Each function in the stack is performed before the operation it wraps. Composition of the transformer runs right-to-left but builds a transformation stack that runs left-to-right (filtering happens before mapping in this example).

 ## transduce
One of the most common ways to apply transducers is with the transduce function, which is analogous to the standard reduce function:

```.language-clojure
(transduce xform f coll)
(transduce xform f init coll)
```

transduce will immediately (not lazily) reduce over coll with the transducer xform applied to the reducing function f, using init as the initial value if supplied or (f) otherwise. f supplies the knowledge of how to accumulate the result, which occurs in the (potentially stateful) context of the reduce.
```.language-clojure
(def xf (comp (filter odd?) (map inc)))
(transduce xf + (range 5))
;; => 6
(transduce xf + 100 (range 5))
;; => 106
```

The composed xf transducer will be invoked left-to-right with a final call to the reducing function f. In the last example, input values will be filtered, then incremented, and finally summed.

