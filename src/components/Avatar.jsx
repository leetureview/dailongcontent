import React from 'react';

const Avatar = ({ name, color, size = 'md' }) => {
    const sizeClasses = {
        sm: 'w-6 h-6 text-xs',
        md: 'w-8 h-8 text-sm',
        lg: 'w-10 h-10 text-base'
    };

    const getInitials = (name) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div
            className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-medium shadow-sm`}
            style={{ backgroundColor: color }}
        >
            {getInitials(name)}
        </div>
    );
};

export default Avatar;
