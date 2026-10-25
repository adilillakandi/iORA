import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';

export default function SupabaseTodosExample() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function getTodos() {
      try {
        setLoading(true);
        const { data, error } = await supabase.from('todos').select();
        if (error) throw error;
        if (data) setTodos(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    getTodos();
  }, []);

  if (loading) return <div>Loading todos from Supabase...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>{todo.name}</li>
      ))}
    </ul>
  );
}
