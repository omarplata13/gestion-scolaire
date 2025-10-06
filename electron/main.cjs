const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
    title: 'TCC',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
    });

    // في وضع التطوير، شغل Vite على localhost
    if (process.env.NODE_ENV === 'development') {
        win.loadURL('http://localhost:5173');
        win.webContents.openDevTools();
    } else {
        // في وضع الإنتاج، استخدم المسار المطلق للملف
        win.loadFile(path.join(__dirname, '../dist/index.html'));
    }

    // منع reload الافتراضي في Electron وحل مشكلة الشاشة البيضاء
    win.webContents.on('before-input-event', (event, input) => {
        if (input.type === 'keyDown' && (input.key === 'F5' || (input.control && input.key.toLowerCase() === 'r'))) {
            event.preventDefault();
            win.loadFile(path.join(__dirname, '../dist/index.html'));
            win.setTitle('TCC');
        }
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});