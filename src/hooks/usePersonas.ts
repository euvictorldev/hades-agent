import { useState, useEffect } from 'react';
import { Persona } from '../types';
import { electronService } from '../services/electron';

/**
 * Hook to manage AI personas for Susurro.
 * Handles loading, saving, and deleting personas from persistent storage.
 */
export const usePersonas = () => {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);

  const defaultPersona: Persona = {
    id: 'default',
    name: 'Assistente Geral',
    systemPrompt: 'Você é o Hades, um assistente de IA prestativo e inteligente. Analise a transcrição de voz fornecida e gere sugestões, respostas rápidas ou insights úteis baseados no contexto da conversa.'
  };

  useEffect(() => {
    const loadPersonas = async () => {
      const saved = await electronService.getPersonas();
      if (saved && saved.length > 0) {
        setPersonas(saved);
        // Find if 'default' or first saved
        setSelectedPersona(saved[0]);
      } else {
        await electronService.savePersona(defaultPersona);
        setPersonas([defaultPersona]);
        setSelectedPersona(defaultPersona);
      }
    };
    loadPersonas();
  }, []);

  const savePersona = async (name: string, prompt: string) => {
    if (!name || !prompt) return null;
    const persona: Persona = { id: Date.now().toString(), name, systemPrompt: prompt };
    await electronService.savePersona(persona);
    setPersonas(prev => [...prev, persona]);
    setSelectedPersona(persona);
    return persona;
  };

  const deletePersona = async (id: string) => {
    await electronService.deletePersona(id);
    const updated = personas.filter(p => p.id !== id);
    if (updated.length === 0) {
      await electronService.savePersona(defaultPersona);
      setPersonas([defaultPersona]);
      setSelectedPersona(defaultPersona);
    } else {
      setPersonas(updated);
      if (selectedPersona?.id === id) {
        setSelectedPersona(updated[0]);
      }
    }
  };

  return { personas, selectedPersona, setSelectedPersona, savePersona, deletePersona };
};
