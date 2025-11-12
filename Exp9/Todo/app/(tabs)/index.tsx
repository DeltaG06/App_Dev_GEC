import React, { useEffect, useState } from 'react';
import { Button, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getDB, initDatabase } from '../../src/db';

type Task = {
  id: number;
  title: string;
  completed: number;
};

export default function TodoApp() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskText, setTaskText] = useState('');

  useEffect(() => {
    const load = async () => {
      const db = await initDatabase();
      const rows = await db.getAllAsync<Task>('SELECT * FROM tasks');
      setTasks(rows);
    };
    load();
  }, []);

  const addTask = async () => {
    if (!taskText.trim()) return;
    const db = getDB();
    await db.runAsync('INSERT INTO tasks (title, completed) VALUES (?, ?)', [taskText, 0]);
    const rows = await db.getAllAsync<Task>('SELECT * FROM tasks');
    setTasks(rows);
    setTaskText('');
  };

  const toggleTask = async (id: number, completed: number) => {
    const db = getDB();
    await db.runAsync('UPDATE tasks SET completed = ? WHERE id = ?', [completed ? 0 : 1, id]);
    const rows = await db.getAllAsync<Task>('SELECT * FROM tasks');
    setTasks(rows);
  };

  const deleteTask = async (id: number) => {
    const db = getDB();
    await db.runAsync('DELETE FROM tasks WHERE id = ?', [id]);
    const rows = await db.getAllAsync<Task>('SELECT * FROM tasks');
    setTasks(rows);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>SQLite Todo App</Text>

      <View style={styles.inputRow}>
        <TextInput
          placeholder="Enter task"
          value={taskText}
          onChangeText={setTaskText}
          style={styles.input}
        />
        <Button title="Add" onPress={addTask} />
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.taskItem}
            onPress={() => toggleTask(item.id, item.completed)}
            onLongPress={() => deleteTask(item.id)}
          >
            <Text style={[styles.taskText, item.completed ? styles.completed : null]}>
              {item.title}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  inputRow: { flexDirection: 'row', marginBottom: 10, alignItems: 'center' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', padding: 8, borderRadius: 5, marginRight: 8 },
  taskItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ddd' },
  taskText: { fontSize: 16 },
  completed: { textDecorationLine: 'line-through', color: 'gray' },
});
