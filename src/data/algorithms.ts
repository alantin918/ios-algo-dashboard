export interface AlgorithmData {
  id: string;
  title: string;
  category: '資料結構' | '演算法';
  tags: string[];
  timeComplexity: string;
  spaceComplexity: string;
  mindset: string[];
  iosApplication: string[];
  codeSnippet?: string;
  geminiTips?: {
    metaphor?: string;
    mnemonic?: string;
    note?: string;
  };
}

export const initialAlgorithms: AlgorithmData[] = [
  {
    id: 'lru-cache',
    title: 'LRU Cache (Least Recently Used)',
    category: '資料結構',
    tags: ['Cache', 'Linked List', 'Hash Map'],
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(n)',
    mindset: [
      '結合 Hash Map 與雙向鏈結串列 (Doubly Linked List)。',
      'Hash Map 提供 O(1) 的快速查詢，雙向鏈結串列提供 O(1) 的新增與刪除節點。',
      '當快取空間滿了時，優先淘汰最久未被訪問（最靠近 Tail 節點）的資料。',
      '每次讀取 (get) 或寫入 (set) 資料時，都需要將該節點移至最前端（靠近 Head 節點），代表最新被使用。'
    ],
    iosApplication: [
      'Kingfisher 圖片快取：底層的記憶體與磁碟快取，核心邏輯就是基於 LRU 策略進行圖片汰換。',
      'NSCache 對比：NSCache 是 Apple 提供的官方快取工具。兩者對比如下：',
      '  - 執行緒安全：NSCache 是執行緒安全的，而標準的 LRU Cache 需要開發者自行加鎖（如 pthread_mutex 或 DispatchSemaphore）。',
      '  - 清理策略：NSCache 當記憶體吃緊時會自動清理，但清理順序由系統決定，並不保證是嚴格的 LRU 淘汰。',
      '  - 鍵值拷貝：NSCache 不會拷貝 Key（要求 Key 必須符合 NSCopying 協議），而一般 Dictionary 會拷貝 Key。'
    ],
    geminiTips: {
      metaphor: '雜湊就是你是否跟我碰撞到？每個人都有一個櫃子，你偏偏跟我同一櫃子？ (Hash Collision)',
      mnemonic: '到底我是不是獨一無二 (LeetCode 217. Contains Duplicate) | 我跟你到底有沒有同一個櫃子？ (LeetCode 242. Valid Anagram)',
      note: '在 LRU Cache 中，Hash Map 用來指向雙向鏈結串列中的節點，如果多個 Key 雜湊到同一個櫃子（碰撞），通常會使用拉鏈法（Chaining）處理，但讀取仍趨近 O(1)。'
    },
    codeSnippet: `import Foundation

// 雙向鏈結串列的節點
class LRUNode<Key: Hashable, Value> {
    let key: Key
    var value: Value
    var prev: LRUNode?
    var next: LRUNode?
    
    init(key: Key, value: Value) {
        self.key = key
        self.value = value
    }
}

// LRU Cache 實作
public class LRUCache<Key: Hashable, Value> {
    private let capacity: Int
    private var cache: [Key: LRUNode<Key, Value>] = [:]
    
    // 虛擬頭尾節點，簡化雙向鏈結串列操作
    private var head: LRUNode<Key, Value>?
    private var tail: LRUNode<Key, Value>?
    
    // 用於保證執行緒安全
    private let lock = NSRecursiveLock()
    
    public init(capacity: Int) {
        self.capacity = max(1, capacity)
    }
    
    // 取得資料
    public func getValue(forKey key: Key) -> Value? {
        lock.lock()
        defer { lock.unlock() }
        
        guard let node = cache[key] else { return nil }
        
        // 將被訪問的節點移到最前面
        moveToHead(node)
        return node.value
    }
    
    // 寫入資料
    public func setValue(_ value: Value, forKey key: Key) {
        lock.lock()
        defer { lock.unlock() }
        
        if let node = cache[key] {
            // 更新舊值，並移至最前
            node.value = value
            moveToHead(node)
        } else {
            let newNode = LRUNode(key: key, value: value)
            cache[key] = newNode
            addToHead(newNode)
            
            // 超出容量，淘汰最久未使用 (Tail)
            if cache.count > capacity {
                if let tailNode = tail {
                    cache.removeValue(forKey: tailNode.key)
                    removeNode(tailNode)
                }
            }
        }
    }
    
    // MARK: - 鏈結串列輔助操作
    
    private func addToHead(_ node: LRUNode<Key, Value>) {
        if head == nil {
            head = node
            tail = node
        } else {
            node.next = head
            head?.prev = node
            head = node
        }
    }
    
    private func removeNode(_ node: LRUNode<Key, Value>) {
        if node === head {
            head = node.next
        }
        if node === tail {
            tail = node.prev
        }
        node.prev?.next = node.next
        node.next?.prev = node.prev
        
        node.prev = nil
        node.next = nil
    }
    
    private func moveToHead(_ node: LRUNode<Key, Value>) {
        guard node !== head else { return }
        removeNode(node)
        addToHead(node)
    }
}`
  },
  {
    id: 'trie-tree',
    title: 'Trie 樹 (前綴樹 / Prefix Tree)',
    category: '資料結構',
    tags: ['Tree', 'String'],
    timeComplexity: 'O(m)',
    spaceComplexity: 'O(n * m)',
    mindset: [
      '以空間換取時間的典型資料結構。每個節點代表一個字元，從根節點到某一節點的路徑代表一個字串。',
      '搜尋、插入的時間複雜度僅與字串長度 m 相關，與資料庫中的字串總量 n 無關。',
      '節點通常包含一個字典或陣列來指向子節點，以及一個標記 `isEndOfWord` 代表是否為完整單字。',
      '極適合用來處理公共前綴字元的問題。'
    ],
    iosApplication: [
      '搜尋框自動補全 (Autocomplete)：在 Spotlight 搜尋或 App 內搜尋欄，當使用者輸入部分字元時，能極速從字典樹中抓取所有符合前綴的聯想詞。',
      '鍵盤輸入預測 (QuickType) 與自動修正：iOS 鍵盤底層透過 Trie 儲存高頻詞庫，用來快速匹配與修正拼字錯誤。',
      '通訊錄聯絡人搜尋：針對姓名英文拼音或注音前綴進行極速定位。'
    ],
    geminiTips: {
      metaphor: '沿著樹枝尋找痕跡，每一次踏步都是一個字母，走到盡頭就是一個單字。',
      mnemonic: '「伸縮自如的橡皮筋」常用於滑動視窗，而 Trie 則是「沿路開枝散葉的搜尋網」，一步到位。',
      note: '在 Swift 實作中，為了效能與靈活度，子節點通常會使用 `[Character: TrieNode]` 的字典結構。'
    },
    codeSnippet: `import Foundation

// Trie 節點
public class TrieNode<Value: Hashable> {
    public var value: Value?
    public var children: [Value: TrieNode] = [:]
    public var isEndOfWord: Bool = false
    public weak var parent: TrieNode?
    
    public init(value: Value? = nil, parent: TrieNode? = nil) {
        self.value = value
        self.parent = parent
    }
}

// Trie 樹實作
public class Trie {
    private let root: TrieNode<Character>
    
    public init() {
        root = TrieNode<Character>()
    }
    
    // 插入一個單字
    public func insert(_ word: String) {
        guard !word.isEmpty else { return }
        
        var currentNode = root
        for char in word {
            if let child = currentNode.children[char] {
                currentNode = child
            } else {
                let newNode = TrieNode(value: char, parent: currentNode)
                currentNode.children[char] = newNode
                currentNode = newNode
            }
        }
        currentNode.isEndOfWord = true
    }
    
    // 搜尋單字是否存在
    public func search(_ word: String) -> Bool {
        guard !word.isEmpty else { return false }
        
        var currentNode = root
        for char in word {
            guard let child = currentNode.children[char] else {
                return false
            }
            currentNode = child
        }
        return currentNode.isEndOfWord
    }
    
    // 檢查是否有以該前綴開頭的單字
    public func startsWith(_ prefix: String) -> Bool {
        guard !prefix.isEmpty else { return false }
        
        var currentNode = root
        for char in prefix {
            guard let child = currentNode.children[char] else {
                return false
            }
            currentNode = child
        }
        return true
    }
}`
  },
  {
    id: 'two-pointers',
    title: '雙指標與滑動視窗 (Two Pointers / Sliding Window)',
    category: '演算法',
    tags: ['Two Pointers', 'Sliding Window', 'Array'],
    timeComplexity: '通常為 O(n)',
    spaceComplexity: 'O(1)',
    mindset: [
      '透過設定兩個指標（通常是 left 與 right），來避免巢狀迴圈（Brute Force），將 O(n²) 降維至 O(n)。',
      '兩種類型：',
      '  - 雙指標 (左右夾擊)：通常用於已排序的陣列（例如 Two Sum II），或反轉數組。一個指標在頭，一個在尾，往中間靠攏。',
      '  - 滑動視窗 (快慢指標)：指標同向移動，維護一個「視窗」，當視窗內條件不滿足時，收縮左邊邊界；滿足時，擴張右邊邊界。'
    ],
    iosApplication: [
      '原地修改陣列 (In-place Operations)：在記憶體極度受限的場景，直接在原本的記憶體空間進行元素去重或排序，避免分配額外的 Array 空間。',
      '處理連續子序列數據：如音訊串流緩衝區 (Audio Stream Buffer) 的滑動處理、或是滾動視圖 (UIScrollView) 的可見區域元素動態載入計算。'
    ],
    geminiTips: {
      mnemonic: `• LeetCode 3. Longest Substring Without Repeating Characters:
  「伸縮自如的橡皮筋，遇到重複就左邊縮」
• LeetCode 11. Container With Most Water:
  「尋求 換成接到最多的水」
• LeetCode 15. 3Sum:
  「另一半 升級版 升級一個維度」
• LeetCode 167. Two Sum II:
  「合適的另一半 往左走 往右走」`,
      note: '滑動視窗非常適合用來解決「最長子字串」、「最小覆蓋子陣列」等題目。口訣「遇到重複就左邊縮」指的就是當快指標遇到重複字元時，慢指標（視窗左界）向右收縮，直到不重複為止。'
    },
    codeSnippet: `import Foundation

class Solutions {
    // 1. Two Sum II - 左右雙指標夾擊 (O(n) / O(1))
    func twoSumII(_ numbers: [Int], _ target: Int) -> [Int] {
        var left = 0
        var right = numbers.count - 1
        
        while left < right {
            let sum = numbers[left] + numbers[right]
            if sum == target {
                return [left + 1, right + 1] // 題目要求 1-indexed
            } else if sum < target {
                left += 1 // 和太小，左指標右移（數值變大）
            } else {
                right -= 1 // 和太大，右指標左移（數值變小）
            }
        }
        return []
    }
    
    // 2. Longest Substring Without Repeating Characters - 滑動視窗 (O(n) / O(min(m, n)))
    func lengthOfLongestSubstring(_ s: String) -> Int {
        let chars = Array(s)
        var charIndexMap: [Character: Int] = [:] // 記錄字元最後出現的位置
        var maxLength = 0
        var left = 0 // 視窗左界 (橡皮筋左邊)
        
        for right in 0..<chars.count {
            let char = chars[right]
            // 「遇到重複就左邊縮」
            if let lastSeenIndex = charIndexMap[char], lastSeenIndex >= left {
                left = lastSeenIndex + 1
            }
            charIndexMap[char] = right
            maxLength = max(maxLength, right - left + 1)
        }
        return maxLength
    }
}`
  },
  {
    id: 'binary-search',
    title: '二分搜尋法 (Binary Search)',
    category: '演算法',
    tags: ['Binary Search', 'Array'],
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    mindset: [
      '不只用於尋找特定值，更常用於「尋找第一個滿足條件的真假邊界」（對答案進行二分）。',
      '前提：搜尋空間必須具有單調性（Monotonicity），例如已排序的陣列。',
      '核心思維：每次取中間值 (mid)，根據條件判斷目標在 mid 的左側或右側，從而將搜尋範圍砍半。',
      '關鍵邊界處理：注意 \`left <= right\` 還是 \`left < right\`，以及 \`mid = left + (right - left) / 2\` 避免整數溢位 (Overflow)。'
    ],
    iosApplication: [
      '大數據陣列中的極速定位：在從本地 SQLite 數據庫、CoreData 或雲端快取載入大量排序好的對象陣列（如股票價格歷史、大聊天記錄）時，用二分搜尋來極速找到對應的時間戳節點。',
      '佈局計算最佳化 (Layout Calculations)：在自定義的 UICollectionViewLayout 中，若有成千上萬個 Cell 的 Frame，在計算螢幕可見區域內有哪些 Cell 時，通常會使用二分搜尋法來尋找 Frame 的交集起點。'
    ],
    geminiTips: {
      mnemonic: '二分搜尋：「尋找真假邊界，每次砍半，注意 mid 溢位，左閉右開想清楚。」',
      note: '在 Swift 中，求 mid 若直接使用 `(left + right) / 2`，在 left 與 right 極大時可能導致整數溢位。因此 `left + (right - left) / 2` 是最安全且 Senior 必須展現的寫法。'
    },
    codeSnippet: `import Foundation

class BinarySearchSolution {
    // 尋找目標值在排序陣列中的索引
    func search(_ nums: [Int], _ target: Int) -> Int {
        var left = 0
        var right = nums.count - 1
        
        while left <= right {
            // 避免整數溢位 (Overflow)
            let mid = left + (right - left) / 2
            
            if nums[mid] == target {
                return mid
            } else if nums[mid] < target {
                left = mid + 1
            } else {
                right = mid - 1
            }
        }
        return -1
    }
    
    // 尋找第一個大於等於目標值的元素索引 (Lower Bound)
    func lowerBound(_ nums: [Int], _ target: Int) -> Int {
        var left = 0
        var right = nums.count
        
        while left < right {
            let mid = left + (right - left) / 2
            if nums[mid] >= target {
                right = mid // 繼續往左找邊界
            } else {
                left = mid + 1
            }
        }
        return left // 回傳第一個符合條件的索引
    }
}`
  },
  {
    id: 'leetcode-mnemonics',
    title: 'LeetCode Senior 核心口訣集錦',
    category: '演算法',
    tags: ['Cheat Sheet', 'Interview Mnemonic'],
    timeComplexity: 'N/A',
    spaceComplexity: 'N/A',
    mindset: [
      '本卡片收錄 Gemini 面試複習口訣，幫助您快速連結經典題目與核心解法思維。',
      '點擊左側分類，或使用此速查表在面試前 5 分鐘進行心智快速熱身。'
    ],
    iosApplication: [
      '1. Two Sum ➔ 「找到合適的另一半」',
      '3. Longest Substring Without Repeating Characters ➔ 「伸縮自如的橡皮筋，遇到重複就左邊縮」',
      '11. Container With Most Water ➔ 「尋求 換成接到最多的水」',
      '15. 3Sum ➔ 「另一半 升級版 升級一個維度」',
      '21. Merge Two Sorted Lists ➔ 「派個假班長，兩邊比身高，剩下的全包」',
      '49. Group Anagrams ➔ 「分組吧，讓同一櫃子的一組」',
      '121. Best Time to Buy and Sell Stock ➔ 「想知道最便宜的是哪天 只要算出 最大利潤是哪天就好」',
      '125. Valid Palindrome ➔ 「正著念 反著念 是否一樣」',
      '167. Two Sum II ➔ 「合適的另一半 往左走 往右走」',
      '206. Reverse Linked List ➔ 「記住下一個，轉身牽前面，大家往右挪」',
      '217. Contains Duplicate ➔ 「到底我是不是獨一無二」',
      '242. Valid Anagram ➔ 「我跟你到底有沒有同一個櫃子？」'
    ],
    geminiTips: {
      metaphor: '雜湊就是你是否跟我碰撞到？每個人都有一個櫃子，你偏偏跟我同一櫃子？ (Hash Collision)',
      mnemonic: '把每一個口訣當作是一段經典的 Swift 程式結構去聯想。例如「派個假班長」就是 dummy head 節點。'
    },
    codeSnippet: `// 1. Two Sum - 「找到合適的另一半」 (O(n) / O(n))
func twoSum(_ nums: [Int], _ target: Int) -> [Int] {
    var dict = [Int: Int]() // Key: 另一半的數值, Value: 索引
    for (i, num) in nums.enumerated() {
        let complement = target - num
        if let partnerIndex = dict[complement] {
            return [partnerIndex, i]
        }
        dict[num] = i
    }
    return []
}

// 21. Merge Two Sorted Lists - 「派個假班長，兩邊比身高，剩下的全包」 (O(n) / O(1))
func mergeTwoLists(_ list1: ListNode?, _ list2: ListNode?) -> ListNode? {
    let dummy = ListNode(0) // 假班長
    var tail: ListNode? = dummy
    var l1 = list1
    var l2 = list2
    
    while l1 != nil && l2 != nil {
        // 兩邊比身高
        if l1!.val <= l2!.val {
            tail?.next = l1
            l1 = l1?.next
        } else {
            tail?.next = l2
            l2 = l2?.next
        }
        tail = tail?.next
    }
    
    // 剩下的全包
    tail?.next = l1 ?? l2
    return dummy.next
}

// 206. Reverse Linked List - 「記住下一個，轉身牽前面，大家往右挪」 (O(n) / O(1))
func reverseList(_ head: ListNode?) -> ListNode? {
    var prev: ListNode? = nil
    var current = head
    
    while current != nil {
        let nextNode = current?.next // 記住下一個
        current?.next = prev        // 轉身牽前面
        prev = current              // 大家往右挪
        current = nextNode
    }
    return prev
}`
  }
];
