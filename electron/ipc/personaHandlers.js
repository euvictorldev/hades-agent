const { ipcMain } = require('electron');
const store = require('../store/jsonStore');
const logger = require('../services/logger');

/**
 * Registers IPC handlers for managing user personas and system instructions.
 */
function registerPersonaHandlers() {
  /**
   * Returns all stored personas.
   */
  ipcMain.handle('get-personas', () => ({ success: true, data: store.getPersonas() }));

  /**
   * Saves or updates a specific persona.
   */
  ipcMain.handle('save-persona', (event, persona) => {
    if (persona?.id) {
      const personas = store.getPersonas();
      const index = personas.findIndex(p => p.id === persona.id);
      
      if (index === -1) {
        personas.push(persona);
      } else {
        personas[index] = persona;
      }
      
      store.savePersonas(personas);
      return { success: true };
    }

    return { success: false, error: "Invalid persona data" };
  });

  /**
   * Deletes a persona by ID.
   */
  ipcMain.handle('delete-persona', (event, id) => {
    if (id) {
      const personas = store.getPersonas().filter(p => p.id !== id);
      store.savePersonas(personas);
      return { success: true };
    }
    return { success: false, error: "Missing ID" };
  });
}

module.exports = registerPersonaHandlers;
