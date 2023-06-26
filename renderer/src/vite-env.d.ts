/// <reference types="vite/client" />

type ipcFunction = (args: { url: string, channel: string, title: string }) => void;

declare namespace electronAPI {
    function toIpcMain<T>(channel: string, ...args: Array[]): Promise<T>
    function onIpcRenderer<T>(callback: ipcFunction): Promise<T>
}

interface SearchEngine {
    url: string
    image: string
    name: string
    field: string
    show: boolean = false
}

interface WindowIframe {
    url: string
    title?: string
    show: boolean = false
}