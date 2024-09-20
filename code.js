figma.showUI(__html__, { width: 400, height: 560 });

// Initialize storage and state
let stringLists = [];
let selectedListId = null;

async function loadSavedData() {
    const savedLists = await figma.clientStorage.getAsync('stringLists');
    stringLists = savedLists || getDefaultStringLists();
    sendStringListsToUI();
}

function getDefaultStringLists() {
    return [
        { id: generateId(), name: 'Default List 1', items: ['Apple', 'Banana', 'Orange'] },
        { id: generateId(), name: 'Default List 2', items: ['Alpha', 'Beta', 'Gamma'] },
        { id: generateId(), name: 'Default List 3', items: ['Cat', 'Dog', 'Elephant'] }
    ];
}

function sendStringListsToUI() {
    figma.ui.postMessage({ type: 'loadLists', stringLists });
}

function generateId() {
    return Math.floor(Math.random() * 1000000).toString();
}

// Handle messages from UI
figma.ui.onmessage = async (msg) => {
    if (msg.type === 'populate') {
        const selectedList = stringLists.find(list => list.id === msg.selectedListId);
        if (selectedList) {
            const selectedTextLayers = figma.currentPage.selection.filter(node => node.type === 'TEXT');
            
            if (selectedTextLayers.length === 0) {
                figma.notify("Please select at least one text layer.");
                return;
            }

            for (const layer of selectedTextLayers) {
                const font = layer.fontName;

                // Load the font dynamically for each selected text layer
                await figma.loadFontAsync(font);

                const selectedListString = selectedList.items[selectedTextLayers.indexOf(layer) % selectedList.items.length];
                layer.characters = selectedListString;
            }

            figma.notify("Text layers populated successfully.");
        } else {
            figma.notify("No string list selected.");
        }
    } else if (msg.type === 'delete') {
        stringLists = stringLists.filter(list => list.id !== msg.listId);
        await figma.clientStorage.setAsync('stringLists', stringLists);
        sendStringListsToUI();
    } else if (msg.type === 'edit') {
        const list = stringLists.find(list => list.id === msg.listId);
        if (list) {
            list.name = msg.newName;
            list.items = msg.newItems;
            await figma.clientStorage.setAsync('stringLists', stringLists);
            sendStringListsToUI();
        }
    } else if (msg.type === 'upload') {
        const fileName = msg.fileName;
        const fileContents = msg.fileContents.split('\n').map(line => line.trim()).filter(Boolean);
        const newList = {
            id: generateId(),
            name: fileName,
            items: fileContents
        };
        stringLists.push(newList);
        await figma.clientStorage.setAsync('stringLists', stringLists);
        sendStringListsToUI();
    }
};

// Load saved data when the plugin is opened
loadSavedData();
