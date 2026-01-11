import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { IoMdAddCircleOutline, IoMdSettings } from 'react-icons/io';
import { IoPersonOutline, IoSearch, IoNotifications } from 'react-icons/io5';
import { GoTasklist } from "react-icons/go";
import { FaHouse } from 'react-icons/fa6';
import { MdLogout } from 'react-icons/md';
import logo from "../assets/focusflow.svg";

const Navbar = () => {
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const { auth, user, authLogout } = useAuth();
    const navigate = useNavigate();
    
    const handleLogout = async () => {
        try {
            await authLogout();  
            toast.success("Logged out successfully!");
        } catch (err) {
            toast.error("Logout failed. Please try again.");
        }
    };

    return (
        <nav className='sticky top-0 z-50 w-full bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-md'>
            <div className='max-w-7xl mx-auto px-4 h-20 flex items-center justify-between'>
                {/* Logo & Brand */}
                <div 
                    onClick={() => navigate('/')}
                    className='flex items-center gap-2 cursor-pointer group'
                >
                    {/* <div className='w-8 h-8 bg-linear-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold'>
            -1h-14-w-14
                    </div> */}
                    {/* <h1 className='text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition'>
                        FocusFlow
                    </h1> */}
                    <img src={logo} alt='Logo' className='w-56'/>
                </div>

                {/* Center - Search Bar */}
                <div className='flex-1 max-w-md mx-8'>
                    {searchOpen ? (
                        <div className='relative'>
                            <input
                                type='text'
                                placeholder='Search tasks, projects...'
                                autoFocus
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                                className='w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
                            />
                        </div>
                    ) : (
                        <div
                            onClick={() => setSearchOpen(true)}
                            className='hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition'
                        >
                            <IoSearch size='18px' className='text-gray-500 dark:text-gray-400' />
                            <span className='text-sm text-gray-500 dark:text-gray-400'>Search...</span>
                        </div>
                    )}
                </div>

                {/* Right Side - Actions */}
                {auth && (
                    <div className='flex items-center gap-4'>
                        {/* Dashboard/Home */}
                        <button
                            onClick={() => navigate('/')}
                            className='p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition'
                            title='Dashboard'
                        >
                            <FaHouse size='22px' />
                        </button>
                        {/* Add Task */}
                        <button
                            onClick={() => navigate('/tasks/create')}
                            className='p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition'
                            title='Add new task'
                        >
                            <IoMdAddCircleOutline size='22px' />
                        </button>
                        {/* Tasks */}
                        <button
                            onClick={() => navigate('/tasks')}
                            className='p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition'
                            title='View tasks'
                        >
                            <GoTasklist size='22px' />
                        </button>

                        {/* Search Mobile */}
                        <button
                            onClick={() => setSearchOpen(!searchOpen)}
                            className='md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition'
                        >
                            <IoSearch size='22px' />
                        </button>

                        {/* Notifications */}
                        {/* <div className='relative'>
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className='p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition relative'
                                title='Notifications'
                            >
                                <IoNotifications size='22px' />
                                <span className='absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full'></span>
                            </button> */}

                            {/* Notifications Dropdown */}
                            {/* {showNotifications && (
                                <div className='absolute right-0 mt-2 w-80 bg-white dark:bg-gray-700 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600'>
                                    <div className='p-4 border-b border-gray-200 dark:border-gray-600'>
                                        <h3 className='font-semibold text-gray-900 dark:text-white'>Notifications</h3>
                                    </div>
                                    <div className='max-h-96 overflow-y-auto'>
                                        <div className='p-4 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer border-b dark:border-gray-600'>
                                            <p className='text-sm font-medium text-gray-900 dark:text-white'>Task reminder</p>
                                            <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>Complete "Writing Q2 Project Plan"</p>
                                            <p className='text-xs text-gray-400 mt-2'>5 minutes ago</p>
                                        </div>
                                        <div className='p-4 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer'>
                                            <p className='text-sm font-medium text-gray-900 dark:text-white'>Streak milestone!</p>
                                            <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>You&apos;ve reached a 7-day streak! 🔥</p>
                                            <p className='text-xs text-gray-400 mt-2'>1 hour ago</p>
                                        </div>
                                    </div>
                                    <div className='p-4 border-t border-gray-200 dark:border-gray-600 text-center'>
                                        <a href='#' className='text-sm text-blue-600 dark:text-blue-400 hover:underline'>
                                            View all notifications
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div> */}

                        {/* User Profile Dropdown */}
                        <div className='relative'>
                            <button
                                onMouseEnter={() => setShowUserMenu(!showUserMenu)}
                                className='flex items-center gap-2 px-3 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition'
                                title='User menu'
                            >
                                <div className='w-8 h-8 bg-linear-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold'>
                                    {user?.email ? user.email[0].toUpperCase() : 'U'}
                                </div>
                                <span className='hidden sm:block text-sm font-medium text-gray-900 dark:text-white'>
                                    {user?.first_name || 'User'}
                                </span>
                            </button>

                            {/* User Dropdown Menu */}
                            {showUserMenu && (
                                <div className='absolute right-0 mt-2 w-56 bg-white dark:bg-gray-700 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600' 
                                onMouseLeave={() => {setShowUserMenu(false)}}>
                                    {/* User Info */}
                                    <div className='p-4 border-b border-gray-200 dark:border-gray-600'>
                                        <p className='text-sm font-semibold text-gray-900 dark:text-white'>
                                            {user?.first_name} {user?.last_name}
                                        </p>
                                        <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>{user?.email}</p>
                                    </div>

                                    {/* Menu Items */}
                                    <div className='py-2'>
                                        <button
                                            onClick={() => {
                                                navigate('/profile');
                                                setShowUserMenu(false);
                                            }}
                                            className='w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2 transition'
                                        >
                                            <IoPersonOutline size='18px' />
                                            Profile
                                        </button>
                                        <button
                                            onClick={() => {
                                                navigate('/settings');
                                                setShowUserMenu(false);
                                            }}
                                            className='w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center gap-2 transition'
                                        >
                                            <IoMdSettings size='18px' />
                                            Settings
                                        </button>
                                    </div>

                                    {/* Logout */}
                                    <div className='border-t border-gray-200 dark:border-gray-600 p-2'>
                                        <button
                                            onClick={handleLogout}
                                            className='w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition rounded'
                                        >
                                            <MdLogout size='18px' />
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}

export default Navbar