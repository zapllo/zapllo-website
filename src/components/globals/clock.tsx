'use client'

import React, { useState, useEffect } from 'react';

const degreesPerHour = 30;
const degreesPerMinute = 6;

const CustomClock = ({ time, onTimeChange }) => {
    const [dragging, setDragging] = useState(false);
    const [angle, setAngle] = useState({
        hour: (time.getHours() % 12) * degreesPerHour,
        minute: time.getMinutes() * degreesPerMinute,
    });

    useEffect(() => {
        setAngle({
            hour: (time.getHours() % 12) * degreesPerHour,
            minute: time.getMinutes() * degreesPerMinute,
        });
    }, [time]);

    const handleDrag = (e) => {
        if (dragging) {
            const rect = e.target.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const radians = Math.atan2(e.clientY - centerY, e.clientX - centerX);
            const degrees = (radians * (180 / Math.PI) + 90) % 360;

            const hour = Math.floor(degrees / degreesPerHour);
            const minute = Math.floor(degrees % degreesPerHour / degreesPerMinute) * 5;

            const newTime = new Date();
            newTime.setHours(hour);
            newTime.setMinutes(minute);
            onTimeChange(newTime);
        }
    };

    return (
        <div
            className="relative w-64 h-64 border-2 border-gray-300 rounded-full flex items-center justify-center"
            onMouseDown={() => setDragging(true)}
            onMouseUp={() => setDragging(false)}
            onMouseMove={handleDrag}
        >
            <div
                className="absolute w-1 h-24 bg-gray-700 rounded"
                style={{ transform: `rotate(${angle.hour}deg)` }}
            ></div>
            <div
                className="absolute w-1 h-40 bg-gray-700 rounded"
                style={{ transform: `rotate(${angle.minute}deg)` }}
            ></div>
            <div className="absolute w-6 h-6 bg-red-600 rounded-full"></div>
        </div>
    );
};

export default CustomClock;
