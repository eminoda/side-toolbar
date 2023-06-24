/// <reference types="vite/client" />

declare namespace electronAPI {
    function toIpcMain<T>(channel: string, ...args: Array[]): Promise<T>
}