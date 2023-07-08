/// <reference types="vite/client" />
/// <reference types="../../main/node_modules/electron" />

type ipcFunction = (channel: string, args: any) => void;

declare namespace electronAPI {
    function toIpcMain<T>(channel: string, ...args: Array[]): Promise<T>
    function onIpcRenderer<T>(callback: ipcFunction): Promise<T>
    var mock: string
    var preload: string
}
declare namespace tab {
    function getBrowserWindow<T>(id: any)
}

interface SearchEngine {
    url: string
    image: string
    name: string
    field: string
    show: boolean = false
}

interface WindowTabs {
    id: string
    url: string
    title?: string
    show?: boolean = false
}