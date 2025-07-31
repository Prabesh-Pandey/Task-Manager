import React from "react";

const AuthLayout = ({ children }) => {
    return (
        <div className="flex h-screen">
            {/* Left - Form */}
            <div className="w-full md:w-[60%] px-8 pt-8 pb-12 flex flex-col">
                <h2 className="text-lg font-medium text-black mb-4">Task Manager</h2>
                {children}
            </div>

            {/* Right - Background Image */}
            <div className="hidden md:flex w-[40%] h-full items-center justify-center bg-blue-50 bg-[url('/bg-img.png')] bg-cover bg-no-repeat bg-center overflow-hidden p-6">
                {/* Background image already applied */}
            </div>
        </div>
    );
};

export default AuthLayout;
