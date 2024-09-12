// Function to save data to clientStorage
async function saveData(key, data) {
    try {
      await figma.clientStorage.setAsync(key, data);
      console.log(`Data saved under key: ${key}`, data); // Check what data is being saved
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }
  
  
  // Function to load data from clientStorage
  async function loadData(key) {
    try {
      const data = await figma.clientStorage.getAsync(key);
      console.log(`Data loaded from key: ${key}`, data); // Check what data is loaded
      return data;
    } catch (error) {
      console.error('Error loading data:', error);
      return null;
    }
  }
  
  
  // Handle messages from the UI
  figma.ui.onmessage = async (msg) => {
    if (msg.type === 'saveFiles') {
      try {
        await saveData('uploadedFiles', msg.uploadedFiles);
        console.log("Files saved successfully!"); // Debugging save confirmation
      } catch (error) {
        console.error('Error saving files:', error);
      }
    }
  
    if (msg.type === 'loadFiles') {
      console.log('Received loadFiles message'); // Check if message is received
      try {
        const storedFiles = await loadData('uploadedFiles') || [];
        console.log('Loaded files from storage:', storedFiles); // Debug loaded files
        figma.ui.onmessage({ type: 'loadedFiles', storedFiles });
      } catch (error) {
        console.error('Error loading files:', error);
      }
    }
  
    if (msg.type === 'populateText') {
      const { dataList } = msg;
      const selectedTextLayers = figma.currentPage.selection.filter(node => node.type === 'TEXT');
  
      if (selectedTextLayers.length === 0) {
        figma.notify("Please select at least one text layer");
        return;
      }
  
      for (let i = 0; i < selectedTextLayers.length && i < dataList.length; i++) {
        const textNode = selectedTextLayers[i];
        if (textNode.type === 'TEXT') {
          await figma.loadFontAsync(textNode.fontName);  // Ensure the font is loaded
          textNode.characters = dataList[i];
        }
      }
  
      figma.notify("Text layers populated successfully!");
    }
  };
  
  // Show the UI
  figma.showUI(__html__, { width: 300, height: 400 });
  
  // Load stored files when the plugin opens
  console.log('Sending loadFiles message to UI'); // Debug message sending
  figma.ui.postMessage({ type: 'loadFiles' });
  