import toast from "react-hot-toast";

export const showApiError = (error) => {
    const data = error?.response?.data;

    if (!data) {
        toast.error("Unexpected error");
        return;
    }

    Object.values(data).forEach((messages) => {
        if (Array.isArray(messages)) {
            messages.forEach(msg => toast.error(msg));
        }
    });
};
