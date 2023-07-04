import { app, BrowserWindow, Menu, nativeImage, Tray } from "electron";
import { Server } from "socket.io";

import path from "path";
// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

let mainWindow: BrowserWindow;
let tray: Tray = null;
let windowClosed: boolean = true;

function createTray() {
  const icon = path.join(__dirname, "/software-developer.png"); // required.
  const trayicon = nativeImage.createFromPath(icon);
  tray = new Tray(trayicon.resize({ width: 16 }));
  const contextMenu = Menu.buildFromTemplate([
    // {
    //   label: "Show App",
    //   click: () => {
    //     createWindow();
    //   },
    // },
    {
      label: "Quit",
      click: () => {
        app.quit(); // actually quit the app.
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
}

const createWindow = (): void => {
  // if (!tray) {
  //   // if tray hasn't been created already.
  //   createTray();
  // }
  // Create the browser window.
  if (!mainWindow) {
    mainWindow = new BrowserWindow({
      height: 600,
      width: 800,
      webPreferences: {
        preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      },
    });
    // and load the index.html of the app.
    mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
    // Open the DevTools.
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.show();
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// app.on("ready", createWindow);
app.on("ready", () => {
  if (!tray) {
    // if tray hasn't been created already.
    createTray();
  }
  const io = new Server({
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    // new Notification("socket connection", { body: "new socket connection!" });
    console.log("NEW CONNECTION!");

    socket.nsp.emit("statusDaJanela", { closed: windowClosed });

    socket.on("abrir", () => {
      console.log("ABRIR!");
      createWindow();

      windowClosed = false;

      socket.nsp.emit("statusDaJanela", { closed: windowClosed });
    });
    socket.on("fechar", () => {
      console.log("FECHAR!");
      mainWindow.hide();

      windowClosed = true;
      socket.nsp.emit("statusDaJanela", { closed: windowClosed });
    });
  });

  io.listen(4000);
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
// app.on("window-all-closed", () => {
//   if (process.platform !== "darwin") {
//     app.quit();
//   }
// });

app.on("window-all-closed", () => {
  // app.dock.hide();
  // any other logic
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
