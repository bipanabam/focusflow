import API from "./axiosInstance";

export const registerUser = async (email, firstName, lastName, password) => {
    const response = await API.post('/auth/register/', 
        {
            email: email,
            first_name: firstName,
            last_name: lastName,
            password: password
        }
    );
    return response.data;
}

export const login = async (email, password) => {
    const response = await API.post('/auth/login/',
        {
            email:email,
            password:password
        }
    );
    return response.data;

}

export const authenticated = async () => {
    const response = await API.get('/auth/authenticated/')
    return response.data;
}

export const refresh_token = async () => {
    try {
        const res = await API.post("/auth/token/refresh/");
        return res.data;
    } catch (err) {
        console.error("Refresh failed:", err.response?.data);
        throw err;
    }
};

export const logout = async () => {
    const response = await API.post('/auth/logout/')
    return response
}

export const getUserProfile = async () => {
    const response = await API.get('/auth/profile/');
    return response.data
}

export const getTimezones = async () => {
    const response = await API.get('/auth/timezones/');
    return response.data;
}

// Settings: Account
export const updateUserProfile = async (data) => {
    const response = await API.patch('/auth/profile/', data);
    return response.data
}

export const changePassword = async (current_password, password, confirm_password) => {
    const response = await API.put('/auth/settings/password/',
        {
            current_password : current_password,
            password: password,
            confirm_password: confirm_password
        }
    );
    return response.data
}

// Settings: Pomodoro
export const getPomodoroSettings = async () => {
    const response = await API.get('/auth/settings/pomodoro/');
    return response.data;

}

export const updatePomodoroSettings = async (data) => {
    const response = await API.patch('/auth/settings/pomodoro/', data);
    return response.data;
}

// Task's Endpoints
export const getTodaysTask = async (num, today) => {
    const response = await API.get(`/tasks/?page=${num}&created_at=${today}`);
    return response.data
}

export const getTodaysUncompletedTask = async (num, today) => {
    const response = await API.get(`/tasks/?page=${num}&created_at=${today}&status=pending`);
    return response.data
}

export const createTask = async (title, description, category, priority, status) => {
    const response = await API.post('/tasks/',
        {
            title: title,
            description: description,
            category: category,
            priority: priority,
            status: status
        }
    );
    return response.data
}

export const getTask = async (id) => {
    const response = await API.get(`/tasks/${id}`);
    return response.data;
}

export const updateTask = async (id, updates) => {
    const response = await API.patch(`/tasks/${id}/`, updates);
    return response.data;
};

export const deleteTask = async (id) => {
    const response = await API.delete(`/tasks/${id}/`);
    return response.data;
}

export const getFilteredTasks = async (filters) => {
    const response = await API.get(`/tasks/`, { params: filters });
    return response.data;
};

// Task and Pomodoro Session
export const startTask = async (id) => {
    const response = await API.post(`/tasks/${id}/start/`);
    console.log(response.data)
    return response.data;
}

export const pauseTask = (id) =>
    API.post(`/tasks/${id}/pause/`);

export const resumeTask = (id) =>
    API.post(`/tasks/${id}/resume/`);

export const completeTask = (id) => 
    API.post(`/tasks/${id}/complete/`);

export const getActiveSession = async (taskId = null) => {
    const url = taskId
        ? `/pomodoro/active-session/${taskId}/`
        : `/pomodoro/active-session/`;
    const response = await API.get(url);
    // console.log("[ActiveSession]", response.data);
    return response.data;
};

export const getTaskSessions = async (taskId) => {
    const response = await API.get(`/pomodoro/sessions/${taskId}/`);
    return response.data.results || response.data;
};

// Analytics
export const getDailySummary = async (date) => {
    const response = await API.get(`/analytics/daily/?date=${date}`)
    return response.data;
}

export const getWeeklySummary = async (weekStart = null, weekEnd = null) => {
    const url = weekStart && weekEnd ? 
        `/analytics/weekly/?start_date=${weekStart}&end_date=${weekEnd}` :
        `/analytics/weekly/`
    const response = await API.get(url);
    return response.data;
}

export const getStreaks = async () => {
    const response = await API.get('/analytics/streaks/');
    return response.data;
}

export const getMonthlyActivity = async (year, month) => {
    const res = await API.get(
        `/analytics/activity-heatmap/monthly/?year=${year}&month=${month}`
    );
    return res.data;
};
