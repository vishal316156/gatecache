class Node {
  constructor(key, value, ttl) {
    this.key = key;
    this.value = value;
    this.expiresAt = ttl ? Date.now() + ttl : null;

    this.prev = null;
    this.next = null;
  }
}


export class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();

    this.head = new Node(null, null);
    this.tail = new Node(null, null);

    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  _removeNode(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
    }

    _addToFront(node) {
    node.next = this.head.next;
    node.prev = this.head;

    this.head.next.prev = node;
    this.head.next = node;
    }

  get(key) {
  const node = this.cache.get(key);

  if (!node) {
    return null;
  }

  // Check expiration
  if (node.expiresAt && Date.now() >= node.expiresAt) {
    this._removeNode(node);
    this.cache.delete(key);

    return null;
  }

  // Mark as recently used
  this._removeNode(node);
  this._addToFront(node);

  return node.value;
}

 set(key, value, ttl = null) {
  // Case 1: key already exists
  if (this.cache.has(key)) {
  const node = this.cache.get(key);

  node.value = value;
  node.expiresAt = ttl ? Date.now() + ttl : null;

  this._removeNode(node);
  this._addToFront(node);

  return;
}

  // Case 2: new key
const node = new Node(key, value, ttl);

  this.cache.set(key, node);
  this._addToFront(node);

  // Cache exceeded capacity
  if (this.cache.size > this.capacity) {
  const leastRecentlyUsed = this.tail.prev;

  this._removeNode(leastRecentlyUsed);
  this.cache.delete(leastRecentlyUsed.key);

  return true;
}
return false;
}

  delete(key) {
  const node = this.cache.get(key);

  // Key doesn't exist
  if (!node) {
    return false;
  }

  this._removeNode(node);
  this.cache.delete(key);

  return true;
}

  has(key) {
    return this.cache.has(key);
  }

  size() {
    return this.cache.size;
  }

  clear() {
    this.cache.clear();

    this.head.next = this.tail;
    this.tail.prev = this.head;
  }
}