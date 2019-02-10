{
    :title "写一个Lein的command/plugin"
    :post-date "2019-2-10 17:49"
}

[Laniu](https://github.com/arlicle/laniu)需要用到一个lein下的命令，用来执行`makemigrations`和`migrate`命令，没有找到相关的中文教程，那么就自己学会了写一个，可以帮助到更多人。


我希望执行的命令是：
```.language-bash
➜ lein makemigrations
Hello makemigrations!
➜ lein migrate
Hello migrate
```

新建一个project命名为lein-laniu-task

```.language-bash
lein new plugin lein-laniu-task
```

项目结构为：
```.language-bash
lein-laniu-task
├── CHANGELOG.md
├── LICENSE
├── README.md
├── lein-laniu-task.iml
├── project.clj
├── src
│   └── leiningen
│       └── laniu_task.clj
└── target
    └── classes
```


改写src/leiningen/laniu_task.clj的代码为
```.language-clojure
(ns leiningen.laniu-task)

(defn laniu-task
  "I don't do a lot."
  [project & args]
  (println "Hi! laniu-task"))
```

创建文件 src/leiningen/makemigrations.clj，代码为：
```.language-clojure
(ns leiningen.laniu-task)

(defn laniu-task
  "I don't do a lot."
  [project & args]
  (println "Hi! laniu-task"))
```

创建文件 src/leiningen/migrate.clj，代码为：
```.language-clojure
(ns leiningen.migrate)

(defn migrate
  "I don't do a lot."
  [project & args]
  (println "Hello migrate!"))
```

把项目版本从`0.1.0-SNAPSHOT` 改为 `0.1.0`, project.clj代码为:
```.language-clojure
(defproject lein-laniu-task "0.1.0"
  :description "FIXME: write description"
  :url "http://example.com/FIXME"
  :license {:name "Eclipse Public License"
            :url "http://www.eclipse.org/legal/epl-v10.html"}
  :eval-in-leiningen true)
```

把项目打包并部署到本地库

```.language-bash
➜ lein install
Created /<path-to-dir>/lein-laniu-task/target/lein-laniu-task-0.1.0.jar
Wrote /<path-to-dir>/lein-laniu-task/pom.xml
Installed jar and pom into local repo.
```

把[lein-laniu-task "0.1.0"]加入plugins配置
```.language-clojure
(defproject lein-laniu-task "0.1.0"
  :description "FIXME: write description"
  :url "http://example.com/FIXME"
  :license {:name "Eclipse Public License"
            :url "http://www.eclipse.org/legal/epl-v10.html"}
  :eval-in-leiningen true
  :plugins [[lein-laniu-task "0.1.0"]])
```

好了，现在可以试一试相关命令了。

```.language-bash
➜ lein makemigrations
Hello makemigrations!
➜ lein migrate
Hello migrate!
```

完美！接下来继续完成命令的细节任务就好啦。

如果插件要发布给所有人用的话，就和常规clojure项目一样，发布到clojars就可以了。