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
    console.log(response)
    return response.data;
}

export const refresh_token = async () => {
    const response = await API.post('/auth/token/refresh/')
    console.log(response.data)
    return response.data;
}

export const logout = async () => {
    const response = await API.post('/auth/logout/')
    return response
}