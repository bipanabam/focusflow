import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import { Card } from "../components/Card";
import FormInput from "../components/FormInput";
import FormSelect from "../components/FormSelect";
import Spinner from "../components/Spinner";

import { createTask } from "../api/apiEndpoints";

const CreateTask = () => {
    const [form, setForm] = useState({
        title: "",
        description: "",
        category: "",
        priority: "",
        status: "",
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleCreateTask = async () => {
        setLoading(true);
        try {
            await createTask(
                form.title,
                form.description,
                form.category,
                form.priority,
                form.status
            );
            toast.success("Task created successfully");
            setForm({
                title: "",
                description: "",
                category: "",
                priority: "",
                status: "",
            });
            navigate('/tasks')
        } catch (err) {
            toast.error("Failed to create task");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-[calc(100vh-90px)] flex items-center justify-center">
            <Card title="Create Task">
                <div className="flex flex-col gap-3">
                    <form
                        className="flex flex-col gap-3"
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleCreateTask();
                        }}
                    >
                        <FormInput
                            label="Title"
                            name="title"
                            type="text"
                            value={form.title}
                            onChange={handleChange}
                            required
                        />
                        <FormInput
                            label="Description"
                            name="description"
                            multiline
                            rows={4}
                            value={form.description}
                            onChange={handleChange}
                            required
                        />
                        <FormSelect
                            label="Category"
                            name="category"
                            value={form.category}
                            onChange={handleChange}
                            required
                            options={[
                                { label: "Personal", value: "personal" },
                                { label: "Work", value: "work" },
                            ]}
                        />
                        <FormSelect
                            label="Priority"
                            name="priority"
                            value={form.priority}
                            onChange={handleChange}
                            required
                            options={[
                                { label: "Low", value: "low" },
                                { label: "Medium", value: "medium" },
                                { label: "High", value: "high" },
                            ]}
                        />

                        <FormSelect
                            label="Status"
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            required
                            options={[
                                { label: "Pending", value: "pending" },
                                { label: "In Progress", value: "in_progress" },
                                { label: "Completed", value: "completed" },
                            ]}
                        />
                        {/* <FormInput
                            label="description"
                            name="description"
                            type="text"
                            value={form.description}
                            onChange={handleChange}
                            required
                        /> */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white rounded-md py-2 mt-2 flex justify-center items-center gap-2"
                        >
                            {loading && <Spinner />}
                            {loading ? "Saving..." : "Save"}
                        </button>
                    </form>
                </div>

            </Card>
        </div>
    )

}

export default CreateTask;