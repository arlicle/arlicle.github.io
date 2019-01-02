{
    :title "数据库连接的left join, right join, inner join"
}

说来很惭愧，一直在用数据库，用各种数据库，但是一直用的是 orm，却几乎从不了解具体的 sql 语句 😂。

直到自己需要造一个 orm 的轮子，才开始具体来看这些 sql 语句怎么写。

不过这样也好，因为用了很多年 orm，所以知道所有的查询需求，可以通过这样的需求来反查 sql 语句怎么写，这样学起来更快。

比如在Django中，查询orm对应的sql语句
```.language-python
a = User.objects.filter(id=1).query
print(a)
'SELECT "auth_user"."id", "auth_user"."nickname", "auth_user"."avatar" FROM "auth_user" WHERE "auth_user"."id" = 1 ORDER BY "auth_user"."id" DESC'
```


## inner join 
Inner Join 逻辑运算符返回满足第一个（顶端）输入与第二个（底端）输入联接的每一行。

## outer join
Outer Join则会返回每个满足第一个（顶端）输入与第二个（底端）输入的联接的行。它还返回任何在第二个输入中没有匹配行的第一个输入中的行。

## left join
left join 是left outer join的简写，left join默认是outer属性的。 它会返回满足第一个条件和第二个条件的每一行，同时它还返回任何在第二个输入中没有匹配行的第一个输入中的行。

## 简单例子

Table A
| id | aname |
| ------ | ------ |
| 1 | A记录1 |
| 2 | A记录2 |
| 3 | A记录3 |

Table B
| id | aid | bname |
| ------ | ------ | ------ |
| 1 | 1 | B记录1 |
| 2 | 2 | B记录2 |
| 4 | 0 | B记录3 |


**查询1** Table A 和 Table B以Table A的id和Table B的aid为关联，进行`inner join`查询
```.language-sql
select * from a inner join b on a.id = b.aid
1 A记录1 B记录1 1
2 A记录2 B记录2 2
```

**查询2** Table A 和 Table B以Table A的id和Table B的aid为关联，进行`left join`查询

```.language-sql
select * from a left join b on a.id = b.aid
1 A记录1 B记录1 1
2 A记录2 B记录2 2
3 A记录3 null   null
```
它比查询1中还返回任何在第二个输入中没有匹配行的第一个输入中的行。

同样right join也是一样的，不同的是right join 额外返回第一个没有匹配，第二个匹配的数据

## 查询性能及优化

continuing...
