import React from "react";
import { refresh_token } from "../api/apiEndpoints";

const Home = () => {
    const handleTestRefresh = async () => {
        try {
            const res = await refresh_token();
            console.log("Refresh OK", res.data);
        } catch (err) {
            console.error("Refresh failed", err.response?.data);
        }
    };
    return (
        <div className="w-full flex flex-col items-center pt-12 gap-4">
            <h3 className="font-semibold text-2xl">Tasks</h3>
            <button onClick={handleTestRefresh}>Test Refresh</button>
            <ul>
                
            </ul>
        </div>
    );
};

export default Home;
