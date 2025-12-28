import React from 'react'

import Navbar from './Navbar';

const Layout = ({ children }) => {
    return (
        <div className='flex flex-col w-full min-h-screen bg-gray-800'>
            <Navbar />
            <div className='w-full'>
                {children}
            </div>
        </div>
    )
}

export default Layout