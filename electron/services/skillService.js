const fs = require('fs');
const path = require('path');
const os = require('os');
const { app } = require('electron');
const logger = require('./logger');

class SkillService {
  constructor() {
    // We get the path dynamically, assuming this runs in the main process
    const userDataPath = path.join(os.homedir(), '.Hades');
    this.skillsDir = path.join(userDataPath, 'skills');
    
    if (!fs.existsSync(this.skillsDir)) {
      fs.mkdirSync(this.skillsDir, { recursive: true });
    }
  }

  _getFilePath(name) {
    return path.join(this.skillsDir, `${name}.md`);
  }

  /**
   * Parses the YAML frontmatter and the content of a markdown skill file.
   */
  _parseSkillFile(content) {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);

    if (!match) {
      return { metadata: {}, content: content.trim() };
    }

    const metadataText = match[1];
    const markdownContent = match[2].trim();
    
    const metadata = {};
    metadataText.split('\n').forEach(line => {
      const [key, ...values] = line.split(':');
      if (key && values.length > 0) {
        metadata[key.trim()] = values.join(':').trim();
      }
    });

    return { metadata, content: markdownContent };
  }

  /**
   * Serializes metadata and content into a markdown string with frontmatter.
   */
  _serializeSkillFile(metadata, content) {
    let output = '---\n';
    for (const [key, value] of Object.entries(metadata)) {
      output += `${key}: ${value}\n`;
    }
    output += '---\n\n' + content;
    return output;
  }

  async saveSkill({ name, description, procedure }) {
    try {
      const filePath = this._getFilePath(name);
      const now = new Date().toISOString();
      let metadata = {
        name,
        description,
        version: 1,
        created: now,
        last_used: now,
        use_count: 0,
        success_rate: 1.0
      };

      if (fs.existsSync(filePath)) {
        const existingFile = fs.readFileSync(filePath, 'utf-8');
        const existingData = this._parseSkillFile(existingFile);
        metadata = {
          ...existingData.metadata,
          description, // update description
          version: parseInt(existingData.metadata.version || 0) + 1,
          last_used: now,
        };
      }

      const fileContent = this._serializeSkillFile(metadata, procedure);
      fs.writeFileSync(filePath, fileContent, 'utf-8');
      
      logger.info('SkillService', `Skill saved: ${name}`);
      return { success: true, message: `Skill '${name}' salva com sucesso.` };
    } catch (error) {
      logger.error('SkillService', 'Error saving skill', error);
      return { success: false, error: error.message };
    }
  }

  async listSkills() {
    try {
      const files = fs.readdirSync(this.skillsDir).filter(f => f.endsWith('.md'));
      const skills = [];

      for (const file of files) {
        const content = fs.readFileSync(path.join(this.skillsDir, file), 'utf-8');
        const { metadata } = this._parseSkillFile(content);
        if (metadata.name) {
           skills.push({
             name: metadata.name,
             description: metadata.description || 'Sem descrição.'
           });
        }
      }

      return { success: true, data: skills };
    } catch (error) {
      logger.error('SkillService', 'Error listing skills', error);
      return { success: false, error: error.message };
    }
  }

  async loadSkill(name) {
    try {
      const filePath = this._getFilePath(name);
      if (!fs.existsSync(filePath)) {
        return { success: false, error: `Skill '${name}' não encontrada.` };
      }

      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const { metadata, content } = this._parseSkillFile(fileContent);

      // Update use metadata
      metadata.last_used = new Date().toISOString();
      metadata.use_count = parseInt(metadata.use_count || 0) + 1;
      
      fs.writeFileSync(filePath, this._serializeSkillFile(metadata, content), 'utf-8');

      logger.info('SkillService', `Skill loaded: ${name}`);
      return { success: true, data: content };
    } catch (error) {
      logger.error('SkillService', 'Error loading skill', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new SkillService();
