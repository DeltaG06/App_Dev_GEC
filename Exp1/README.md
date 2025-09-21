# CRUD Operations on Array (JavaScript)

This is a simple JavaScript program that demonstrates basic **CRUD** (Create, Read, Update, Delete) operations on an array.

---

## Features
- **Create**: Add new items to the array  
- **Read**: Display all items in the array  
- **Update**: Modify an existing item by its index  
- **Delete**: Remove an item by its index  

---

## Code Example

```javascript
// Start with an empty array
let items = [];

// CREATE - add elements
function createItem(item) {
  items.push(item);
  console.log(`${item} added!`);
}

// READ - show all elements
function readItems() {
  console.log("Current items:", items);
}

// UPDATE - change an element by index
function updateItem(index, newValue) {
  if (index >= 0 && index < items.length) {
    console.log(`${items[index]} updated to ${newValue}`);
    items[index] = newValue;
  } else {
    console.log("Invalid index!");
  }
}

// DELETE - remove an element by index
function deleteItem(index) {
  if (index >= 0 && index < items.length) {
    console.log(`${items[index]} deleted!`);
    items.splice(index, 1);
  } else {
    console.log("Invalid index!");
  }
}

// Example usage
createItem("Apple");
createItem("Banana");
readItems();

updateItem(1, "Mango");
readItems();

deleteItem(0);
readItems();
