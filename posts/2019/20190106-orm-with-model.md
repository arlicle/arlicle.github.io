{
    :title "一个更好用的Clojure ORM库"
}

如果你使用过 Django，你会享受在Django model ORM中。

通过model 层分离了数据库，可以让我们把时间花在更高层次的抽象上，更多的时间用来思考如何解决复杂业务场景，几乎不用花费时间和心力去关注底层运作。

随着时间的推移，我们能够专注于更重要的问题，使得开发变得更为高效和容易维护。

简单列举几点使用 Model的优点：

1. **简单** 因为简单，所以可以让你快速的开发，而且代码变得更干净
2. **数据库创建** 使用代码来定义数据库，更容易阅读和维护，用过代码自动来进行数据的创建
3. **Migration** 数据库变动的时候，通过代码自动的进行Migration，无需关心实现细节。
4. **多种数据库支持** 可以灵活切换各种数据库，无需再去修改程序
5. **多个数据库支持** 可以很方便的支持读写分离，同时增加多个读库与多个写库
6. **操作更容易** 非常简单的进行数据的操作：插入，更新，查找，删除
7. **自动数据验证** 在进行数据插入和更新到时候，可以自动对数据进行验证
8. **关联字段查询** 对数据查询可以自动进行 ORM， 自动关联Foreignkey相关字段的表进行查询，非常方便
9. **默认值字段** 可以对定义字段的默认值，这样像创建时间，等的字段就可以自动默认有值，无需在插入数据时手动维护
10. **支持连接池**

互联网项目，开发速度非常关键，需要快速的出最低可用版本，无需性能，只需要专注于业务。这时候 model 就能大显身手了。

但是我们可爱的Clojure居然没有ORM的库，最像orm的一个库是Korma，我在两个项目中使用了Korma, 说实话，使用起来很不方便。
好多地方不够人性化，经常出问题一调试就是好几个小时，真实脑阔疼。

没办法了，自己造轮子吧。

## Laniu

我开发的最初目的就只有一个：为了快速的开发, 快速快速的开发。

我为他设计了非常漂亮的操作语法，很多地方反复的打磨。

[https://github.com/arlicle/laniu](https://github.com/arlicle/laniu)

Laniu can help you rapid development and clean.

It’s django model for clojure

A Clojure library designed to normal human that don't like SQL, well, if you don't like SQL , that part is up to you.

PS. It's provide connection pooling by `c3p0` library

## Leiningen/Boot
[![Clojars Project](https://clojars.org/laniu/latest-version.svg)](https://clojars.org/laniu)

## Dependency Information
Requires Clojure 1.9 or later!

## Usage
```language-clojure
(require '[laniu.core :refer :all])
```

### config the database connection

```language-clojure
(defdb
  {:default {
             :classname   "com.mysql.jdbc.Driver"
             :subprotocol "mysql"
             :subname     "//127.0.0.1:3306/projectx2"
             :user        "root"
             :password    "123"
             :useSSL      false
             }})
```

### Multiple databases
This setting maps database aliases, which are a way to refer to a specific database throughout query, to a dictionary of settings for that specific connection. 

```language-clojure
(defdb
  {:default {
             :classname   "com.mysql.jdbc.Driver"
             :subprotocol "mysql"
             :subname     "//127.0.0.1:3306/projectx2"
             :user        "root"
             :password    "123"
             :useSSL      false
             :operation   :read_and_write ; :operation types: :read :write :read_and_write
             }
   :read-db {:classname   "com.mysql.jdbc.Driver"
             :subprotocol "mysql"
             :subname     "//127.0.0.1:3306/projectx3"
             :user        "root"
             :password    "123"
             :useSSL      false
             :operation   :read
             }
   })
; the default :poeratin is :read_and_write
```

### define a model
```language-clojure

(defmodel reporter
          :fields {:full_name {:type :char-field :max-length 70}}
          :meta {:db_table "ceshi_reporter"})

(defmodel category
          :fields {:name       {:type :char-field :max-length 30}
                   :sort_order {:type :int-field :default 0}}
          :meta {:db_table "ceshi_category"})

(defmodel article
          :fields {:headline   {:type :char-field :max-length 200}
                   :content    {:type :text-field}
                   :view_count {:type :int-field :default 0}
                   :reporter   {:type :foreignkey :model reporter :on-delete :cascade}
                   :category   {:type :foreignkey :model category :on-delete :set-null :blank true}
                   :created    {:type :int-field :default #(quot (System/currentTimeMillis) 1000)}}
          :meta {:db_table "ceshi_article"})

```

when you define a model , It's automatic create the data spec.

### insert data
If the field has :default config, It will auto fill the default value to the field.

```language-clojure
(insert! reporter :values {:full_name "edison"})
;=> ({:generated_key 45})

(insert! reporter :values {:full_name "chris"})
;=> ({:generated_key 46})

(insert! category :values {:name "IT" :sort_order 1})
;=> ({:generated_key 9})

(insert! category :values {:name "Movie" :sort_order 2})
;=> ({:generated_key 10})

(insert! category :values {:name "Fun" :sort_order 3})
;=> ({:generated_key 11})
```



### insert with default value
:created field and :view_count field will auto fill the default value

```language-clojure
(insert! article
         :values {:headline "just a test"
                  :content  "hello world"
                  :reporter 45
                  :category 11})
; => ({:generated_key 6})
```

### insert wrong data with spec error
When you define a model, the defmodel will auto define a data spec, when you insert data or update data, the spec will valid the data.

```language-clojure
(insert! reporter :values {:full_name2 "chris"})
;=>
#:clojure.spec.alpha{:problems ({:path [],
                                 :pred (clojure.core/fn [%] (clojure.core/contains? % :full_name)),
                                 :val {:full_name2 "chris"},
                                 :via [:laniu.core/reporter],
                                 :in []}),
                     :spec :laniu.core/reporter,
                     :value {:full_name2 "chris"}}


(insert! category :values {:name "Flower" :sort_order "a"})
=>
#:clojure.spec.alpha{:problems ({:path [:sort_order],
                                 :pred clojure.core/int?,
                                 :val "a",
                                 :via [:laniu.core/category :laniu.core.category/sort_order],
                                 :in [:sort_order]}),
                     :spec :laniu.core/category,
                     :value {:name "Flower", :sort_order "a"}}
```

### field with choices valid

```language-clojure
(defmodel user
          :fields {
                   :first-name {:type :char-field :verbose-name "First name" :max-length 30}
                   :last-name  {:type :char-field :verbose-name "Last name" :max-length 30}
                   :gender     {:type :tiny-int-field :verbose-name "Gender" :choices [[0, "uninput"], [1, "Male"], [2, "Female"]] :default 0}
                   :created    {:type :int-field :verbose-name "Created" :default #(quot (System/currentTimeMillis) 1000)}
                   })

(insert! user
         :values {:first-name "Edison"
                  :last-name  "Rao"
                  :gender     4})
=>
#:clojure.spec.alpha{:problems ({:path [:gender],
                                 :pred (clojure.core/fn
                                        [%]
                                        (clojure.core/contains? {0 "uninput", 1 "Male", 2 "Female"} %)),
                                 :val 4,
                                 :via [:laniu.core/user :laniu.core.user/gender],
                                 :in [:gender]}),
                     :spec :laniu.core/user,
                     :value {:first-name "Edison", :last-name "Rao", :gender 4}}

```
### insert multi rows

```language-clojure
(insert-multi! article
               :values [{:headline "Apple make a phone"
                         :content  "bala babla ...."
                         :reporter 46
                         :category 9}
                        {:headline "A good movie recommend"
                         :content  "bala babla ...."
                         :reporter 45
                         :category 10}
                        {:headline "A funny joke"
                         :content  "bala babla ...."
                         :reporter 46
                         :category 11}
                        ])
;=> ({:generated_key 7} {:generated_key 8} {:generated_key 9})

```

### update data

```language-clojure
; update
(update! reporter
         :values {:full_name "Edison Rao"}
         :where [:id 45])
; => (1)

; update with multi conditions
(update! reporter
         :values {:full_name "Chris Zheng"}
         :where [:id 46 :full_name "chris"])
; => (1)

; update value , search with foreignkey model
(update! article
         :values {:reporter 1}
         :where [:category.name "IT"])
; => (1)

(update! article
         :values {:category 9 :reporter 45}
         :where [:id 7])
; => (1)
```

### select data
```language-clojure

; select
(select category)
; =>
({:id 1, :name "aaa", :sort_order 0}
 {:id 2, :name "bbb", :sort_order 0}
 {:id 3, :name "ccc", :sort_order 0}
 {:id 4, :name "ccc", :sort_order 0}
 {:id 5, :name "aaa", :sort_order 0}
 {:id 6, :name "bbb", :sort_order 0}
 {:id 7, :name "ccc", :sort_order 0}
 {:id 8, :name "IT news", :sort_order 1}
 {:id 9, :name "IT", :sort_order 1}
 {:id 10, :name "Movie", :sort_order 2}
 {:id 11, :name "Fun", :sort_order 3}
 {:id 12, :name "IT", :sort_order 1}
 {:id 13, :name "Fun", :sort_order 3})

;select with condition
(select category 
        :fields [:id :name]
        :where [:name "IT"]
        )
;=> 
({:id 9, :name "IT"} {:id 12, :name "IT"})

```

### select with field alias

``` clojure
(select category
        :fields [:id [:name :category_name]]
        :where [:name "IT"]
        )
;=> 
({:id 9, :category_name "IT"} {:id 12, :category_name "IT"})
```


### select with or/and 

The default is and
``` clojure
(select article
        :fields [:id :headline :category.name :reporter.full_name]
        :where [:category.name "IT" :reporter.full_name "Edison Rao"]
        :debug? true
        )
["select ceshi_article.id, ceshi_article.headline, ceshi_category.name, ceshi_reporter.full_name from ceshi_article  INNER JOIN ceshi_reporter ON (ceshi_article.reporter_id = ceshi_reporter.id) INNER JOIN ceshi_category ON (ceshi_article.category_id = ceshi_category.id) where ceshi_category.name= ? and ceshi_reporter.full_name= ?" "IT" "Edison Rao"]
=> 
({:id 7, :headline "Apple make a phone", :name "IT", :full_name "Edison Rao"})

;It's the same to 
(select article
        :fields [:id :headline :category.name :reporter.full_name]
        :where (and :category.name "IT" :reporter.full_name "Edison Rao")
        :debug? true
        )
["select ceshi_article.id, ceshi_article.headline, ceshi_category.name, ceshi_reporter.full_name from ceshi_article  INNER JOIN ceshi_reporter ON (ceshi_article.reporter_id = ceshi_reporter.id) INNER JOIN ceshi_category ON (ceshi_article.category_id = ceshi_category.id) where (ceshi_category.name= ? and ceshi_reporter.full_name= ?)" "IT" "Edison Rao"]
=> 
({:id 7, :headline "Apple make a phone", :name "IT", :full_name "Edison Rao"})
```

with or

``` clojure
(select article
        :fields [:id :headline :category.name :reporter.full_name]
        :where (or :category.name "IT" :reporter.full_name "Edison Rao")
        :debug? true
        )
["select ceshi_article.id, ceshi_article.headline, ceshi_category.name, ceshi_reporter.full_name from ceshi_article  INNER JOIN ceshi_reporter ON (ceshi_article.reporter_id = ceshi_reporter.id) INNER JOIN ceshi_category ON (ceshi_article.category_id = ceshi_category.id) where (ceshi_category.name= ? or ceshi_reporter.full_name= ?)" "IT" "Edison Rao"]
=>
({:id 7, :headline "Apple make a phone", :name "IT", :full_name "Edison Rao"}
 {:id 13, :headline "just a test", :name "Fun", :full_name "Edison Rao"}
 {:id 14, :headline "Apple make a phone", :name "IT", :full_name "aaa"}
 {:id 15, :headline "A good movie recommend", :name "Movie", :full_name "Edison Rao"})
```

with and & or

``` clojure
(select article
        :fields [:id :headline :category.name :reporter.full_name]
        :where (or [:category.name "IT" :reporter.full_name "Edison Rao"] [:category.name "Fun" :reporter.full_name "Chris Zheng"])
        :debug? true
        )
["select ceshi_article.id, ceshi_article.headline, ceshi_category.name, ceshi_reporter.full_name from ceshi_article  INNER JOIN ceshi_reporter ON (ceshi_article.reporter_id = ceshi_reporter.id) INNER JOIN ceshi_category ON (ceshi_article.category_id = ceshi_category.id) where (ceshi_category.name= ? and ceshi_reporter.full_name= ?) or (ceshi_category.name= ? and ceshi_reporter.full_name= ?)" "IT" "Edison Rao" "Fun" "Chris Zheng"]
=>
({:id 7, :headline "Apple make a phone", :name "IT", :full_name "Edison Rao"}
 {:id 16, :headline "A funny joke", :name "Fun", :full_name "Chris Zheng"})

;It's the same to 
(select article
        :fields [:id :headline :category.name :reporter.full_name]
        :where (or (and :category.name "IT" :reporter.full_name "Edison Rao") (and :category.name "Fun" :reporter.full_name "Chris Zheng"))
        :debug? true
        )


; another and/or select
(select article
        :fields [:id :headline :category.name :reporter.full_name]
        :where (and (or :category.name "IT" :reporter.full_name "Edison Rao") (or :category.name "Fun" :reporter.full_name "Chris Zheng"))
        :debug? true
        )
["select ceshi_article.id, ceshi_article.headline, ceshi_category.name, ceshi_reporter.full_name from ceshi_article  INNER JOIN ceshi_reporter ON (ceshi_article.reporter_id = ceshi_reporter.id) INNER JOIN ceshi_category ON (ceshi_article.category_id = ceshi_category.id) where (ceshi_category.name= ? or ceshi_reporter.full_name= ?) and (ceshi_category.name= ? or ceshi_reporter.full_name= ?)" "IT" "Edison Rao" "Fun" "Chris Zheng"]
=> ({:id 13, :headline "just a test", :name "Fun", :full_name "Edison Rao"})

It's same to 

(select article
        :fields [:id :headline :category.name :reporter.full_name]
        :where [(or :category.name "IT" :reporter.full_name "Edison Rao") (or :category.name "Fun" :reporter.full_name "Chris Zheng")]
        :debug? true
        )
```

### select foreignkey field

```language-clojure
(select article
        :fields [:id :headline :category.name]
        :where [:id 7])
; => 
({:id 7, :headline "Apple make a phone", :name "IT"})

; select with multi foeinkey field
(select article
        :fields [:id :headline :category.name [:reporter.full_name :reporter_full_name]]
        :where [:id 7])
;=> 
({:id 7, :headline "Apple make a phone", :name "IT", :reporter_full_name "Edison Rao"})
```

### select foreignkey condition

```language-clojure
; select with foreignkey condition
(select article
        :fields [:id :headline :content :category.name [:reporter.full_name :reporter_full_name]]
        :where [:category.name "IT"])
;=>
({:id 7, :headline "Apple make a phone", :content "bala babla ....", :name "IT", :reporter_full_name "Edison Rao"}
 {:id 14, :headline "Apple make a phone", :content "bala babla ....", :name "IT", :reporter_full_name "aaa"})


(select article
        :fields [:id :headline :content :category.name :reporter.full_name]
        :where [:category.name "IT" :reporter.full_name "Edison Rao"])
; => 
({:id 7, :headline "Apple make a phone", :content "bala babla ....", :name "IT", :full_name "Edison Rao"})

```

### select with function

```language-clojure
; select with function
(select article
        :where [:id [> 7]])

(select article
        :where [:headline [startswith "a"]])
```



### update with function

```language-clojure
(update! article
         :values {:view_count (+ :view_count 10)})

(def a 30)
(update! article
         :values {:view_count (* :view_count a)}
         :where [:id 7])
```


###  delete data

```language-clojure
(delete! article :where [:id 3])
```


### aggregate

Returns the aggregate values (avg, sum, count, min, max), the aggregate field will return count__id, max__view_count.

```language-clojure
(aggregate article
           :fields [(count :id) (max :view_count) (min :view_count) (avg :view_count) (sum :view_count)])
=> 
({:count__id 13, :max__view_count 600, :min__view_count 20, :avg__view_count 67.6923M, :sum__view_count 880M})

```

### run raw sql

If you need a more complex form of sql, you can use `raw-query` and `raw-execute!`

`raw-query` for select

```language-sql
(raw-query ["SELECT * FROM ceshi_article where id=?" 15])

(raw-query ["SELECT * FROM ceshi_reporter where id=?" 15] {:as-arrays? true})
```

`raw-execute!` for insert, update, delete ...
```language-sql
(raw-execute! ["update ceshi_article set content='jjjjj' where id=?" 15])

(raw-execute! ["update ceshi_article set view_count = ( 2 * view_count ) where view_count < ?" 50])
```

## To do list
#### Document
#### Create table
#### Migration
#### Insert or update
#### Interacting with multiple databases