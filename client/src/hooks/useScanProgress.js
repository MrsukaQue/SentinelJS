import { useEffect } from 'react';
import { io } from 'socket.io-client';

export function useScanProgress(scanId, onUpdate) {
  useEffect(() => {
    if (!scanId) return undefined;
    const socket = io({ withCredentials: true });
    socket.emit('scan:watch', scanId);
    socket.on('scan:progress', onUpdate);
    socket.on('scan:completed', onUpdate);
    return () => socket.disconnect();
  }, [scanId, onUpdate]);
}
