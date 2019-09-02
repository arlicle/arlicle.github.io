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

`题型归类: Linked-list, Recursive, HashMap`

### 首先构造做题环境
因为传入参数是链表，开发和测试都要反复用到，如果在开发或者测试直接徒手撸链表，代码量大又不容易维护，所以需要一个东西来方便的吧vec转换为链表。

```.lang-rust
fn vec2linked_list(mut arr: Vec<i32>) -> Option<Box<ListNode>> {
    arr.reverse();
    let mut node = ListNode {
        val: 0,
        next: None,
    };

    let mut index = 0;
    for i in arr {
        if index == 0 {
            node = ListNode::new(i);
        } else {
            node = node.prepend(i);
        }
        index += 1;
    }

    Some(Box::new(node))
}

// Definition for singly-linked list.
#[derive(PartialEq, Eq, Clone, Debug)]
pub struct ListNode {
    pub val: i32,
    pub next: Option<Box<ListNode>>,
}

impl ListNode {
    #[inline]
    fn new(val: i32) -> Self {
        ListNode {
            next: None,
            val,
        }
    }
}

impl ListNode {
    fn prepend(self, val: i32) -> Self {
        /// 从最末端开始，一个接一个的创建一个链表
        ListNode {
            val,
            next: Some(Box::new(self)),
        }
    }
}

#[cfg(test)]
mod test {
    use crate::{vec2linked_list, ListNode};

    pub fn vec2linked_list_test() {
        assert_eq!(
            Some(Box::new(ListNode {
                val: 1,
                next: Some(
                    Box::new(
                        ListNode {
                            val: 2,
                            next: Some(Box::new(ListNode {
                                val: 3,
                                next: None,
                            })),
                        })),
            })),
            vec2linked_list(vec![1, 2, 3]));
    }
}
```
 
### 思路一
使用循环，分别从第一位开始相加，会遇到3种情况：

1、相加之和大于10，那么就要记录进位；  
2、只有其中其中一个链表有值，另一个链表结束，那么相当于+0；  
3 两个链表都结束，如果有之前的进位，那么就为进位创建1位数字1，如果没有进位，返回结果。

```.lang-rust
// 代码实现
impl Solution {
    pub fn add_two_numbers(l1: Option<Box<ListNode>>, l2: Option<Box<ListNode>>) -> Option<Box<ListNode>> {
        let mut l1 = l1;
        let mut l2 = l2;

        let mut head = Some(Box::new(ListNode::new(0))); // 记录链表头
        let mut tail = &mut head; // 记录链表末端节点，好继续往末端追加节点

        let mut extra_add = 0; // 记录是否有进位
        loop {
            let mut r = extra_add; // 两个节点的求和，再加上进位

            let mut l1_none = true; // 记录链表1是否结束了
            let mut l2_none = true; // 记录链表2是否结束了
            if let Some(l1_node) = l1 {
                r += l1_node.val;
                l1 = l1_node.next;
                l1_none = false;
            }

            if let Some(l2_node) = l2 {
                r += l2_node.val;
                l2 = l2_node.next;
                l2_none = false;
            }

            if l1_none && l2_none && r == 0 {
                // 当两个链表都结束，并且没有进位，那么就返回结果链表
                break head.unwrap().next;
            }

            extra_add = r / 10;
            tail.as_mut().unwrap().next = Some(Box::new(ListNode::new(r % 10)));
            tail = &mut tail.as_mut().unwrap().next;
        }
    }
}

#[cfg(test)]
mod test {
    use crate::{vec2linked_list, Solution};

    pub fn add_two_numbers_test(){
        let l1 = vec2linked_list(vec![1,2,3]);
        let l2 = vec2linked_list(vec![2,3,4]);
        assert_eq!(vec2linked_list(vec![3,5,7]), Solution::add_two_numbers(l1,l2));
    }
}
```
#### leetcode执行结果

> 执行用时 : 0 ms , 在所有 Rust 提交中击败了 100.00% 的用户  
> 内存消耗 : 2.1 MB , 在所有 Rust 提交中击败了 100.00% 的用户

这个思路，循环是最长链表的长度n+1?(加1或不加1)，因此算法复杂度是$O(n)$，这个算法的特殊处理在于，我们记录了链表的尾节点的指针，然后把它变为mut，往next里面继续增加节点，然后再把新增加的节点地址更新尾指针，在改变尾指针的时候，需要as_mut来转换Option类型为可变，否则编译器会报错。

### 思路二
使用递归， 因为链表是从最里面开始，逐步向外一层一层的包上去的，那么我们就可以用递归的特点，计算最外层时，一层一层的往里面去取最里层。

```.lang-rust
// 代码实现
impl Solution {
    pub fn add_two_numbers(l1: Option<Box<ListNode>>, l2: Option<Box<ListNode>>) -> Option<Box<ListNode>> {
        add_two_numbers(l1, l2, 0)
    }
}


pub fn add_two_numbers(l1: Option<Box<ListNode>>, l2: Option<Box<ListNode>>, extra_add: i32) -> Option<Box<ListNode>> {
    // extra_add 表示节点相加的进位
    let mut r = extra_add;

    let mut n1 = None;
    let mut n2 = None;

    let mut is_l1_none = true;
    let mut is_l2_none = true;

    if let Some(l1_node) = l1 {
        r += l1_node.val;
        n1 = l1_node.next;
        is_l1_none = false;
    }

    if let Some(l2_node) = l2 {
        r += l2_node.val;
        n2 = l2_node.next;
        is_l2_none = false;
    }

    if is_l1_none && is_l2_none {
        if extra_add > 0 {
            // 如果两个链表都结束了，但是有进位，需要为进位增加一个节点
            return Some(Box::new(ListNode::new(extra_add)));
        } else {
            // 如果没有进位，直接返回None即可
            return None;
        }
    }

    Some(Box::new(ListNode {
        val: r % 10,
        next: add_two_numbers(n1, n2, r / 10),
    }))
}

#[cfg(test)]
mod test {
    use crate::{vec2linked_list, Solution};

    pub fn add_two_numbers_test(){
        let l1 = vec2linked_list(vec![1,2,3]);
        let l2 = vec2linked_list(vec![2,3,4]);
        assert_eq!(vec2linked_list(vec![3,5,7]), Solution::add_two_numbers(l1,l2));
    }
}
```

### leetcode执行结果
> 执行用时 : 4 ms , 在所有 Rust 提交中击败了 93.52% 的用户  
> 内存消耗 : 2 MB , 在所有 Rust 提交中击败了 100.00% 的用户

使用递归，执行效率和思路一是一样的，执行了n次(比思路少了1次)，算法复杂度同样为$O(n)$，递归过程可能有额外的一点点消耗，时间上和内存上稍微多了一点点。

### 做题中的困惑
1. 在Clojure中，除非使用尾递归调用或者惰性序列，才会使用递归，否则一般是不使用递归的，因为递归有额外的性能损耗，不知道Rust有没有对尾递归进行优化，或者Rust的惰性序列构造的方式。

2. 在构造vec的时候，我使用range 来构造vec, 比如  1..10, 但是输入 'let a:Vec<i32> = (1..10).'的时候，不会提示出collect方法，但实际是有这个方法的，因为`let a:Vec<i32> = (1..10).collect();`是可以执行的，这应该怎么解决呢？




### leetcode相似题型

[字符串相乘](https://leetcode-cn.com/problems/multiply-strings/)

[二进制求和](https://leetcode-cn.com/problems/add-binary/)

[两整数之和](https://leetcode-cn.com/problems/sum-of-two-integers/)


