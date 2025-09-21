# Dart Input, Output, and Loops

This simple Dart program demonstrates how to:
- Take **user input** from the console
- Display **output**
- Use different types of **loops** (`for`, `while`, `do-while`)

---

## Features
- Ask for user’s name and print a greeting
- Ask for a number (`n`)
- Print numbers from `1` to `n` using a **for loop**
- Print numbers from `n` down to `1` using a **while loop**
- Print numbers from `1` to `n` using a **do-while loop**

---

## Code Example

```dart
import 'dart:io';

void main() {
  // Input: Ask user for their name
  stdout.write("Enter your name: ");
  String? name = stdin.readLineSync();
  print("Hello, $name!");

  // Input: Ask for a number
  stdout.write("Enter a number: ");
  int n = int.parse(stdin.readLineSync()!);

  // FOR loop
  print("\nUsing FOR loop (printing 1 to $n):");
  for (int i = 1; i <= n; i++) {
    print(i);
  }

  // WHILE loop
  print("\nUsing WHILE loop (printing $n down to 1):");
  int j = n;
  while (j >= 1) {
    print(j);
    j--;
  }

  // DO-WHILE loop
  print("\nUsing DO-WHILE loop (printing 1 to $n):");
  int k = 1;
  do {
    print(k);
    k++;
  } while (k <= n);
}
