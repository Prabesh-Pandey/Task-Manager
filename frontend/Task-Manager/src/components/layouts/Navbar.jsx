import React, { useState, useContext } from 'react';
import { HiOutlineMenu, HiOutlineX } from 'react-icons/hi';
import SideMenu from './SideMenu';
import { UserContext } from '../../context/userContext';

const Navbar = ({ activeMenu }) => {
    const [openSideMenu, setOpenSideMenu] = useState(false);
    const { user } = useContext(UserContext);

    return (
        <div className="flex gap-5 items-center justify-between bg-white border border-b border-gray-200/50 backdrop-blur-[2px] py-4 px-7 sticky top-0 z-30">
            <div className="flex items-center gap-4">
                {/* Mobile menu toggle */}
                <button
                    className="block lg:hidden text-black"
                    onClick={() => setOpenSideMenu(!openSideMenu)}
                >
                    {openSideMenu ? (
                        <HiOutlineX className="text-2xl" />
                    ) : (
                        <HiOutlineMenu className="text-2xl" />
                    )}
                </button>

                {/* Title and Department */}
                <h2 className="text-lg font-medium text-black flex items-center gap-4">
                    Task Manager
                    {user?.department && (
                        <span className="text-sm text-gray-600 font-normal border-l border-gray-300 pl-4">
                            Dept: <span className="font-semibold">{user.department}</span>
                        </span>
                    )}
                </h2>
            </div>

            {/* Sidebar (mobile view) */}
            {openSideMenu && (
                <div className="fixed top-[61px] -ml-4 bg-white z-40">
                    <SideMenu activeMenu={activeMenu} />
                </div>
            )}
        </div>
    );
};

export default Navbar;
