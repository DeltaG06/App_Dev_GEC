// lib/main.dart
import 'package:flutter/material.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Dummy Todo',
      home: const TodoHomePage(),
    );
  }
}

class TodoHomePage extends StatefulWidget {
  const TodoHomePage({super.key});

  @override
  State<TodoHomePage> createState() => _TodoHomePageState();
}

class _TodoHomePageState extends State<TodoHomePage> {
  final List<String> _todos = [];

  void _addTodo() {
    setState(() {
      _todos.add('Todo ${_todos.length + 1}');
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Dummy Todo'),
      ),
      body: _todos.isEmpty
          ? const Center(child: Text('No todos yet', key: Key('empty_text')))
          : ListView.builder(
              key: const Key('todo_list'),
              itemCount: _todos.length,
              itemBuilder: (context, index) {
                return ListTile(
                  title: Text(_todos[index]),
                );
              },
            ),
      floatingActionButton: FloatingActionButton(
        key: const Key('add_fab'),
        tooltip: 'Add', // used by the widget test
        onPressed: _addTodo,
        child: const Icon(Icons.add),
      ),
    );
  }
}
