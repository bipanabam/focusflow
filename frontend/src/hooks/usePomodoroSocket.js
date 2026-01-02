import { useEffect, useRef } from "react";

export function usePomodoroSocket(handlers) {
    const socketRef = useRef(null);
    const handlersRef = useRef(handlers);

    // Update ref whenever handlers change
    useEffect(() => {
        handlersRef.current = handlers;
    }, [handlers]);

    useEffect(() => {
        const ws = new WebSocket("ws://localhost:8000/ws/pomodoro/");
        socketRef.current = ws;

        ws.onopen = () => {
            console.log("WS connected - waiting for initial state...");
        };

        ws.onmessage = (e) => {
            const data = JSON.parse(e.data);
            console.log("WS EVENT:", data);

            const handler = handlersRef.current[data.type];
            if (handler) {
                handler(data);
            } else {
                console.warn("No handler for event type:", data.type);
            }
        };

        ws.onerror = (error) => {
            console.error("WS error:", error);
        };

        ws.onclose = () => {
            console.log("WS disconnected");
        };

        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, []);

    return socketRef;
}