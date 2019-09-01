{
    :title "2. 两数相加"
    :post-date "2019-09-01 21:20"
}


###题目

给出两个 非空 的链表用来表示两个非负的整数。其中，它们各自的位数是按照 逆序 的方式存储的，并且它们的每个节点只能存储 一位 数字。

如果，我们将这两个数相加起来，则会返回一个新的链表来表示它们的和。

您可以假设除了数字 0 之外，这两个数都不会以 0 开头。



###示例

输入：(2 -> 4 -> 3) + (5 -> 6 -> 4)

输出：7 -> 0 -> 8

原因：342 + 465 = 807

 
### 思路一

使用循环，拿第一个数，然后开始分别与第二个数，第三个数相加...第n个相加，如果和等于target，那么就返回结果。如果不等，那么开始第二次循环，第二个数，分别与第三，第四个数...第n个相加，依次类推。

```.lang-rust
// 代码实现
impl Solution {
    pub fn two_sum3(mut nums: Vec<i32>, target: i32) -> Vec<i32> {
        let mut index = 0;
        let length = nums.len() as i32;
        // 使用nums.pop()，这样nums就缩短了，查找的时候就少了一次循环
        while let Some(i) = nums.pop() {
            for (index2, i2) in nums.iter().enumerate() {
                if (i+*i2) == target {
                    return vec![index2 as i32, length-index-1];
                }
            }
            index += 1;
        }
        vec![0]
    }
}
```
#### leetcode执行结果
> 执行用时 : 28 ms , 在所有 Rust 提交中击败了 44.75% 的用户  
> 内存消耗 : 2 MB , 在所有 Rust 提交中击败了 100.00% 的用户

这么做思路简单清晰，内存消耗低，但是不好就是会进行很多次循环，效率不是那么高。需要像一个优化思路，只用一次循环。

### 优化后的思路二

只用一次循环，用target与每次的数字相减得到结果A，然后查找剩余数字里面有没有A这个数字, 引入HashMap来查找有没有相减结果A，没有找到的时候，就把数字放入HashMap然后继续找，如果找到了就返回结果。

```.lang-rust
// 代码实现
use std::collections::HashMap;
impl Solution {
    pub fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {
        let mut data = HashMap::new();
        let mut i:i32 = 0;
        let length = nums.len() as i32;
        for (index, n) in nums.iter().enumerate() {
            match data.get(&(target - *n)) {
                None => data.insert(n, index),
                Some(index2) => return vec![*index2 as i32, index as i32]
            };
        }
        vec![]
    }
}
```
#### leetcode执行结果

> 执行用时 : 0 ms , 在所有 Rust 提交中击败了 100.00% 的用户  
> 内存消耗 : 2.7 MB , 在所有 Rust 提交中击败了 61.14% 的用户  

这个思路，只使用一次循环，执行用时缩短为约等于0ms，由于引入了HashMap，内存稍微增加了一点。这是划算的，越短的执行时间，就可以支撑越多的用户并发。


### leetcode相似题型

[两数之和 II - 输入有序数组](https://leetcode-cn.com/problems/two-sum-ii-input-array-is-sorted/)

[两数之和 III - 数据结构设计](https://leetcode-cn.com/problems/two-sum-iii-data-structure-design/)

[两数之和 IV - 输入 BST](https://leetcode-cn.com/problems/two-sum-iv-input-is-a-bst/)




