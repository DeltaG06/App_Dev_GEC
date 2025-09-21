let items = [];

// CREATE 
function createItem(item) {
  items.push(item);
  console.log(`${item} added!`);
}

// READ
function readItems() {
  console.log("Current items:", items);
}

// UPDATE 
function updateItem(index, newValue) {
  if (index >= 0 && index < items.length) {
    items[index] = newValue;
    console.log(`${items[index]} updated to ${newValue}`);
  } else {
    console.log("Invalid index!");
  }
}

// DELETE 
function deleteItem(index) {
  if (index >= 0 && index < items.length) {
    console.log(`${items[index]} deleted!`);
    items.splice(index, 1);
  } else {
    console.log("Invalid index!");
  }
}

// Example usage:
createItem("Apple");
createItem("Banana");
readItems();

updateItem(1, "Mango");
readItems();

deleteItem(0);
readItems();
