//This file creates some basic window properties and initializes electron. It also indicates the main html file.

const {app, BrowserWindow} = require('electron')
let win

//The rest of this code is default and comes with electron. Idk what most of it means but there are a few important lines.
function createWindow(){
	win = new BrowserWindow({width: 800, height: 600, minHeight: 500, minWidth: 400})

//The line below tells the window to maximize on startup	
	win.maximize();

//This line indicates the html file
	win.loadURL(`file://${__dirname}/startup.html`);

	win.on('closed', () => {
		win=null
	});
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})

app.on('activate', () => {
	if (win === null) {
		createWindow()
	}
})

const {ipcMain} = require('electron')

ipcMain.on('main_comunications', (event, arg) => {
	event.returnValue = arg;
})