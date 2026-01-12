import { useEffect } from "react";
import { usePomodoroSocketContext } from "../contexts/PomodoroSocketContext";

export function usePomodoroSocket(onSessionUpdate) {
    const socketRef = usePomodoroSocketContext();

    useEffect(() => {
        if (!socketRef?.current) return;

        const ws = socketRef.current;

        const handleMessage = (e) => {
            const data = JSON.parse(e.data);
            if (data.type !== "SESSION_UPDATE") return;

            onSessionUpdate({
                fsmState: data.fsm_state,
                session: data,
            });
        };

        ws.addEventListener("message", handleMessage);
        return () => ws.removeEventListener("message", handleMessage);
    }, [onSessionUpdate, socketRef]);
}
