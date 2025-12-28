import React from 'react'

import { IoMdAddCircleOutline, IoMdSettings } from 'react-icons/io';
import { IoPersonOutline, IoSearch } from 'react-icons/io5';
import { FaHouse, } from 'react-icons/fa6';

const Navbar = () => {
    return (
        <div className='w-full flex justify-center items-center h-22.5 bg-gray-900 shadow-2xl'>
            <div className='flex flex-row justify-between text-white w-11/12'>
                <p className='font-bold text-lg'>FocuFlow</p>
                <div className='flex gap-4'>
                    <span><IoMdAddCircleOutline size='22px' /></span>
                    {/* <span><FaHouse size='22px' /></span> */}
                    <span><IoSearch size='22px' /></span>
                    <span><IoPersonOutline size='20px' /></span>
                    <span><IoMdSettings size='22px' /></span>
                </div>
            </div>
        </div>
    )
}

export default Navbar