import React from 'react'

import Navbar from './Navbar';

const Layout = ({ children }) => {
    return (
        <div className='flex flex-col w-full min-h-screen bg-white dark:bg-gray-900'>
            <Navbar />
            <div className='w-full flex-1 pt-20'>
                {children}
            </div>
        </div>
    )
}

export default Layout