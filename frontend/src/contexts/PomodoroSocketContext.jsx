import { createContext, useContext, useEffect, useRef } from "react";
import API from "../api/axiosInstance";

const PomodoroSocketContext = createContext(null);

export function PomodoroSocketProvider({ children }) {
    const socketRef = useRef(null);
    const heartbeatRef = useRef(null);

    useEffect(() => {
        socketRef.current = new WebSocket("ws://localhost:8000/ws/pomodoro/");

        socketRef.current.onopen = () => {
            console.log("Pomodoro WS connected");
        };

        socketRef.current.onclose = () => {
            console.log("Pomodoro WS disconnected");
        };

        socketRef.current.onerror = (err) => {
            console.error("WS error:", err);
        };

        // Heartbeat (every 10s)
        heartbeatRef.current = setInterval(() => {
            API.post("/pomodoro/heartbeat/")
                .catch(() => {
                    // Silent fail: backend is source of truth
                });
        }, 10_000);

        return () => {
            socketRef.current?.close();

            if (heartbeatRef.current) {
                clearInterval(heartbeatRef.current);
                heartbeatRef.current = null;
            }
        };
    }, []);

    return (
        <PomodoroSocketContext.Provider value={socketRef}>
            {children}
        </PomodoroSocketContext.Provider>
    );
}

export function usePomodoroSocketContext() {
    return useContext(PomodoroSocketContext);
}
