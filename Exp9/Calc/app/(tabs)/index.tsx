import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { initCalculatorDB, getCalculatorDB } from '../../src/db';

type HistoryItem = {
  id: number;
  expression: string;
  result: string;
};

export default function Calculator() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const load = async () => {
      const db = await initCalculatorDB();
      const rows = await db.getAllAsync<HistoryItem>('SELECT * FROM history ORDER BY id DESC');
      setHistory(rows);
    };
    load();
  }, []);

  const handlePress = (val: string) => setInput(prev => prev + val);

  const calculate = async () => {
    try {
      const result = eval(input).toString();
      const db = getCalculatorDB();
      await db.runAsync('INSERT INTO history (expression, result) VALUES (?, ?)', [input, result]);
      const rows = await db.getAllAsync<HistoryItem>('SELECT * FROM history ORDER BY id DESC');
      setHistory(rows);
      setInput(result);
    } catch {
      setInput('Error');
    }
  };

  const clear = () => setInput('');

  const clearHistory = async () => {
    const db = getCalculatorDB();
    await db.execAsync('DELETE FROM history');
    setHistory([]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.display}>{input || '0'}</Text>

      <View style={styles.buttons}>
        {['7','8','9','/','4','5','6','*','1','2','3','-','0','.','=','+'].map(btn => (
          <TouchableOpacity
            key={btn}
            style={styles.btn}
            onPress={() => (btn === '=' ? calculate() : handlePress(btn))}
          >
            <Text style={styles.btnText}>{btn}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.clearBtn} onPress={clear}>
        <Text>Clear</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.clearBtn} onPress={clearHistory}>
        <Text>Clear History</Text>
      </TouchableOpacity>

      <FlatList
        data={history}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <Text style={styles.historyItem}>{item.expression} = {item.result}</Text>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  display: { fontSize: 32, textAlign: 'right', marginBottom: 10 },
  buttons: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  btn: { width: '22%', margin: '1%', padding: 20, backgroundColor: '#eee', alignItems: 'center', borderRadius: 8 },
  btnText: { fontSize: 20 },
  clearBtn: { backgroundColor: '#ddd', padding: 10, marginTop: 10, borderRadius: 6, alignItems: 'center' },
  historyItem: { fontSize: 16, marginVertical: 2 },
});
