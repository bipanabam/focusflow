import { createContext, useContext, useEffect, useRef } from "react";
import API from "../api/axiosInstance";
import { useAuth } from "./AuthContext";

const PomodoroSocketContext = createContext(null);

export function PomodoroSocketProvider({ children }) {
    const { auth } = useAuth();
    const socketRef = useRef(null);
    const heartbeatRef = useRef(null);

    useEffect(() => {
        if (!auth) {
            // Ensure everything is stopped when logged out
            socketRef.current?.close();
            socketRef.current = null;

            if (heartbeatRef.current) {
                clearInterval(heartbeatRef.current);
                heartbeatRef.current = null;
            }
            return;
        }
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
            socketRef.current = null;

            if (heartbeatRef.current) {
                clearInterval(heartbeatRef.current);
                heartbeatRef.current = null;
            }
        };
    }, [auth]);

    return (
        <PomodoroSocketContext.Provider value={socketRef}>
            {children}
        </PomodoroSocketContext.Provider>
    );
}

export function usePomodoroSocketContext() {
    return useContext(PomodoroSocketContext);
}
