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

// Task's Endpoints
export const getTodaysTask = async (num, today) => {
    const response = await API.get(`/tasks/?page=${num}&created_at=${today}`);
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
