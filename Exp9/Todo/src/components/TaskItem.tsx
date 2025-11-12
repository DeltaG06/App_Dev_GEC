import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface TaskItemProps {
  id: number;
  title: string;
  completed: number;
  onToggle: (id: number, completed: number) => void;
  onDelete: (id: number) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ id, title, completed, onToggle, onDelete }) => {
  return (
    <Pressable onPress={() => onToggle(id, completed)}>
      <View style={styles.taskItem}>
        <Text
          style={[
            styles.taskText,
            { textDecorationLine: completed ? 'line-through' : 'none' },
          ]}
        >
          {title}
        </Text>
        <Pressable onPress={() => onDelete(id)}>
          <Text style={styles.delete}>❌</Text>
        </Pressable>
      </View>
    </Pressable>
  );
};

export default TaskItem;

const styles = StyleSheet.create({
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  taskText: {
    flex: 1,
    fontSize: 16,
  },
  delete: {
    fontSize: 18,
    color: 'red',
    marginLeft: 10,
  },
});
