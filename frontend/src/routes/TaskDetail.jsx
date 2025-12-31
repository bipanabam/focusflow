import React, { useEffect, useState, useRef } from "react";
import { useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
    CiCalendarDate, CiHashtag, CiFlag1, CiViewList,
    CiCircleCheck, CiClock1, CiEdit
} from "react-icons/ci";
import { BiSolidEdit } from "react-icons/bi";
import { RiDeleteBin6Fill } from "react-icons/ri";

import Spinner from "../components/Spinner";
import FormInput from "../components/FormInput";
import FormSelect from "../components/FormSelect";
import { getTask, updateTask, deleteTask } from "../api/apiEndpoints";

import { TASK_STATUS } from "../constants/taskUI";

const ModernInfoCard = React.memo(({ label, value, icon: Icon, color = "blue" }) => (
    <div className="bg-gray-800 p-4 rounded-2xl border border-gray-700 shadow-sm flex gap-3">
        <div className={`p-2 rounded-xl bg-${color}-50 text-${color}-600`}>
            <Icon size={20} />
        </div>
        <div>
            <p className="text-[10px] uppercase text-gray-400 font-bold">{label}</p>
            <p className="text-sm font-semibold capitalize">{value || "—"}</p>
        </div>
    </div>
));


const TaskDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    
    // State for Delete Modal
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    
    const originalTaskRef = useRef(null);

    useEffect(() => {
        const loadTask = async () => {
            try {
                setLoading(true);
                const data = await getTask(id);
                setTask(data);
            } catch {
                toast.error("Failed to load task");
            } finally {
                setLoading(false);
            }
        };
        loadTask();
    }, [id]);

    useEffect(() => {
        if (task && !originalTaskRef.current) {
            originalTaskRef.current = task;
        }
    }, [task]);


    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setTask(t => ({ ...t, [name]: value }));
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (JSON.stringify(task) === JSON.stringify(originalTaskRef.current)) {
            toast("No changes made");
            return;
        }

        try {
            setSaving(true);
            await updateTask(id, {
                title: task.title,
                description: task.description,
                priority: task.priority,
                category: task.category,
                status: task.status,
            });
            originalTaskRef.current = task;
            toast.success("Task updated successfully");
            setIsEditing(false);
        } catch {
            toast.error("Failed to update task");
        } finally {
            setSaving(false);
        }
    }, [id, task]);

    const handleStatusToggle = useCallback(async () => {
        if (saving) return;
        const prevTask = task;
        const nextStatus = task.status === "completed" ? "pending" : "completed";

        setTask({ ...task, status: nextStatus });

        try {
            await updateTask(id, { status: nextStatus });
            toast.success(`Task ${nextStatus}`);
        } catch {
            toast.error("Failed to update status");
            setTask(prevTask);
        }
    }, [id, task]);

    const handleDelete = useCallback(async () => {
        try {
            setIsDeleting(true);
            await deleteTask(id);
            toast.success("Task deleted successfully");
            navigate("/tasks");
        } catch (error) {
            toast.error("Failed to delete task");
        } finally {
            setIsDeleting(false);
            setShowDeleteModal(false);
        }
    }, [id, navigate]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Spinner />
            </div>
        );
    }

    if (!task) {
        return <div className="p-6">Task not found.</div>;
    }
    const status = TASK_STATUS[task.status] ?? TASK_STATUS.pending;
    const StatusIcon = status.icon;

    return (
        <div className="w-full bg-gray-50 dark:bg-gray-900 min-h-screen">
            <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-sm text-blue-600 hover:underline"
                    >
                        ← Back
                    </button>

                    <div className="flex justify-end gap-2">
                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className='p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition'
                                title='Edit task'
                            >
                                <BiSolidEdit size={22} />
                            </button>
                        )}
                        {!isEditing && (
                            <button
                                onClick={() => setShowDeleteModal(true)} // Trigger Modal
                                className='p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition'
                                title='Delete task'
                            >
                                <RiDeleteBin6Fill size={22} />
                            </button>
                        )}
                    </div>
                </div>

                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    Task Details
                </h1>

                {!isEditing && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 md:p-8 border border-gray-100 dark:border-gray-700 shadow-sm">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                        <span className={`flex items-center gap-1.5 ${status.bg} ${status.text} rounded-sm px-2`}>
                                            {StatusIcon && <StatusIcon size={14} />}
                                            {status.label}
                                        </span>
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                                        {task.title}
                                    </h2>
                                </div>

                                <button
                                    onClick={handleStatusToggle}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors active:scale-95"
                                >
                                    <CiCircleCheck
                                        className={task.status === 'completed' ? "text-green-500" : "text-gray-400"}
                                        size="20px"
                                    />
                                    {task.status === 'completed' ? "Reopen Task" : "Mark Completed"}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 space-y-6">
                                <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm min-h-75 flex flex-col">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                        <CiViewList size={18} /> Detailed Description
                                    </h3>
                                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg whitespace-pre-wrap">
                                        {task.description || "No detailed description provided for this task."}
                                    </p>

                                    <div className="mt-auto pt-8 flex items-center gap-6 text-[11px] text-gray-400 border-t border-gray-50 dark:border-gray-700/50">
                                        <span className="flex items-center gap-1"><CiClock1 size={14} /> Created {new Date(task.created_at).toLocaleDateString()}</span>
                                        <span className="flex items-center gap-1"><CiEdit size={14} /> Edited {new Date(task.updated_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <ModernInfoCard
                                    label="Priority"
                                    value={task.priority}
                                    icon={CiFlag1}
                                    color={task.priority === 'high' ? 'red' : task.priority === 'medium' ? 'orange' : 'green'}
                                />
                                <ModernInfoCard
                                    label="Task Category"
                                    value={task.category}
                                    icon={CiHashtag}
                                    color="purple"
                                />
                                <ModernInfoCard
                                    label="Deadline"
                                    value={task.due_date?.split("T")[0]}
                                    icon={CiCalendarDate}
                                    color="blue"
                                />

                                {/* <div className="p-5 rounded-3xl bg-linear-to-br from-blue-500 to-indigo-600 text-white shadow-md">
                                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Current Flow</p>
                                    <p className="text-lg font-bold mt-1">
                                        {task.status === 'completed' ? "Mission Accomplished!" : "Keep Pushing forward!"}
                                    </p>
                                    <div className="mt-4 h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-white transition-all duration-1000"
                                            style={{ width: task.status === 'completed' ? '100%' : task.status === 'in_progress' ? '50%' : '10%' }}
                                        />
                                    </div>
                                </div> */}
                            </div>
                        </div>
                    </div>
                )}

                {isEditing && (
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-xl shadow"
                    >
                        <FormInput
                            label="Title"
                            name="title"
                            type="text"
                            value={task.title || ""}
                            onChange={handleChange}
                            required
                        />
                        <FormInput
                            label="Description"
                            name="description"
                            multiline
                            rows={4}
                            value={task.description || ""}
                            onChange={handleChange}
                            required
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormSelect
                                label="Category"
                                name="category"
                                value={task.category}
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
                                value={task.priority || ""}
                                onChange={handleChange}
                                required
                                options={[
                                    { label: "Low", value: "low" },
                                    { label: "Medium", value: "medium" },
                                    { label: "High", value: "high" },
                                ]}
                            />
                        </div>

                        <FormSelect
                            label="Status"
                            name="status"
                            value={task.status || ""}
                            onChange={handleChange}
                            required
                            options={[
                                { label: "Pending", value: "pending" },
                                { label: "In Progress", value: "in_progress" },
                                { label: "Completed", value: "completed" },
                            ]}
                        />
                        <div className="flex items-center pt-6 mt-6 border-t border-gray-100 dark:border-gray-700">
                            <div className="ml-auto flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-6 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all active:scale-95 border border-gray-200 dark:border-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all active:scale-95 shadow-md shadow-blue-500/20 flex items-center gap-2"
                                >
                                    {saving ? (
                                        <>
                                            <Spinner size="sm" />
                                            <span>Saving...</span>
                                        </>
                                    ) : (
                                        "Save Changes"
                                    )}
                                </button>
                            </div>
                        </div>
                        
                    </form>
                )}
            </div>
            {/* DELETE CONFIRMATION MODAL */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-sm w-full p-6 shadow-xl border border-gray-200 dark:border-gray-700">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Delete Task</h3>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Are you sure you want to delete <span className="font-semibold text-gray-900 dark:text-white">"{task.title}"</span>? This action cannot be undone.
                        </p>

                        <div className="mt-6 flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isDeleting ? <Spinner /> : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskDetail;
