import { createContext, useContext, useEffect, useRef } from "react";

const PomodoroSocketContext = createContext(null);

export function PomodoroSocketProvider({ children }) {
    const socketRef = useRef(null);

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

        return () => {
            socketRef.current?.close();
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
