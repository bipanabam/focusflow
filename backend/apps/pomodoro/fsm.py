class PomodoroFSM:
    STATES = {
        "IDLE",
        "FOCUS_RUNNING",
        "FOCUS_PAUSED",
        "BREAK_RUNNING",
        "BREAK_PAUSED",
        "TERMINATED",
    }

    TRANSITIONS = {
        "IDLE": {"START_FOCUS"},
        "FOCUS_RUNNING": {"PAUSE", "COMPLETE"},
        "FOCUS_PAUSED": {"RESUME", "COMPLETE"},
        "BREAK_RUNNING": {"PAUSE", "COMPLETE"},
        "BREAK_PAUSED": {"RESUME"},
    }

    @staticmethod
    def can_transition(current_state, event):
        return event in PomodoroFSM.TRANSITIONS.get(current_state, set())
