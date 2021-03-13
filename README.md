# Thư viện Fuzzy Search

## Cách sử dụng

```javascript
import GemFuzzySearch from '../src/core';

let gfs = new GemFuzzySearch();
```

## Một số hàm

Thêm dữ liệu

```javascript
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
gfs.get();
```
