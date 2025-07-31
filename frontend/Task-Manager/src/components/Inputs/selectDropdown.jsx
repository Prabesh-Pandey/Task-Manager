import React, { useState } from "react";
import { LuChevronDown } from "react-icons/lu";

const SelectDropdown = ({ options, value, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (option) => {
        onChange(option);
        setIsOpen(false);
    };

    return <div className="relative w-full">
        {/* Dropdown Button */}
        <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full text-sm text-black outline-none bg-white border border-slate-100 px-2.5 py-3 rounded-md mt-2 flex  justify-between items-center"
        >
            {value ? options.find((opt) => opt.value === value)?.label : placeholder}
            <span className="ml-2">{isOpen ? <LuChevronDown className="" /> : <LuChevronDown />}</span>

        </button>
        {/* Dropdown Menu */}
        {isOpen && (
            <div className="absolute bg-white border border-gray-200 rounded-md shadow-lg mt-1 w-full">
                {options.map((option) => (
                    <div
                        key={option.value}
                        onClick={() => handleSelect(option.value)}
                        className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${value === option.value ? "bg-gray-200" : ""}`}
                    >
                        {option.label}
                    </div>
                ))}
            </div>
        )}
    </div>;
};

export default SelectDropdown;
