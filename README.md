# Thư viện Fuzzy Search

## Cách sử dụng

```javascript
import GemFuzzySearch from '../src/core';

/**
 * @param arr dữ liệu đầu vào
 * @param useLevenshtein Whether or not to use the levenshtein distance to determine the match scoring. Default: True
 * @param gramSizeLower The lower bound of gram sizes to use, inclusive (see Theory of operation). Default 2
 * @param gramSizeUpper The upper bound of gram sizes to use, inclusive (see Theory of operation). Default: 3
 */
let gfs = new GemFuzzySearch();
```

## Một số hàm

Thêm dữ liệu

```javascript
/**
 * @param value Từ khóa thêm vào kho dữ liệu
 */
gfs.add("Minh")
```

Lấy ra dữ liệu hiện tại

```javascript
gfs.values();
```

Check dữ liệu rỗng

```javascript
gfs.isEmpty();
```

Lấy ra length

```javascript
gfs.length();
```

Tìm kiếm kết quả

```javascript
/**
 * @param value Từ khóa muốn tìm kiếm
 * @param defaultValue Nếu không tìm thấy dữ liệu thì sẽ fallback về default value
 * @param minMatchScore tỉ lệ độ chính xác, mặc định 0.33 
 */
gfs.get();
```
