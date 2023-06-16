function myFunction() {
    const scriptProperties = PropertiesService.getScriptProperties();
    scriptProperties.setProperty('line_bot_memory', JSON.stringify([]));
    scriptProperties.setProperty('role_bot_content', JSON.stringify([]));
  }
  